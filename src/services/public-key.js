/**
 * Inspired by https://github.com/mailvelope/keyserver public-keys.js
 *
 * Modified to use NeDB https://github.com/louischatriot/nedb
 *   instead of Mongo database
 * Modified by https://github.com/PotOfCoffee2Go
 *
 * Original public-key.js license:
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2016 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';
const log = require('./logger');
//const config = require('./config');
const util = require('./util');

/**
 * Database documents have the format:
 * {
 *   _id: ObjectId, // a randomly generated MongoDB document ID
 *   keyId: 'b8e4105cc9dedc77', // the 16 char key id in lowercase hex
 *   fingerprint: 'e3317db04d3958fd5f662c37b8e4105cc9dedc77', // the 40 char key fingerprint in lowercase hex
 *   userIds: [
 *     {
 *       name:'Jon Smith',
 *       email:'jon@smith.com',
 *       nonce: "6a314915c09368224b11df0feedbc53c", // random 32 char verifier used to prove ownership
 *       verified: true // if the user ID has been verified
 *     }
 *   ],
 *   created: Sat Oct 17 2015 12:17:03 GMT+0200 (CEST), // key creation time as JavaScript Date
 *   uploaded: Sat Oct 17 2015 12:17:03 GMT+0200 (CEST), // time of key upload as JavaScript Date
 *   algorithm: 'rsa_encrypt_sign', // primary key alogrithm
 *   keySize: 4096, // key length in bits
 *   publicKeyArmored: '-----BEGIN PGP PUBLIC KEY BLOCK----- ... -----END PGP PUBLIC KEY BLOCK-----'
 * }
 */
const KEY_STATUS_VALID = 3;

/**
 * A service that handles PGP public keys queries to the database
 */
class PublicKey {
  /**
   * Create an instance of the service
   * @param {Object} pgp       An instance of the OpenPGP.js wrapper
   * @param {Object} nedb     An instance of the MongoDB client
   */
  constructor(cfg, pgp, nedb) {
    this._cfg = cfg;
    this._pgp = pgp;
    this._nedb = nedb;
  }

  /**
   * Compact public keys database
   * @yield {undefined}
   */
  compactDb() {
    log.debug('Public Keys compacted!');
    this._nedb.compact();
  }

  /**
   * Persist a new public key
   * @param {Array} emails              (optional) The emails to upload/update
   * @param {String} publicKeyArmored   The ascii armored pgp key block
   * @return {Promise}
   */
  async put({emails = [], publicKeyArmored}) {
    emails = emails.map(util.normalizeEmail);
    // lazily purge old/unverified keys on every key upload
    await this._purgeOldUnverified();
    // parse key block
    const key = await this._pgp.parseKey(publicKeyArmored);
    // if emails array is empty, all userIds of the key will be submitted
    if (emails.length) {
      // keep submitted user IDs only
      key.userIds = key.userIds.filter(({email}) => emails.includes(email));
      if (key.userIds.length !== emails.length) {
        util.throw(400, 'Provided email address does not match a valid user ID of the key');
      }
    }
    // check for existing verified key with same id
    const verified = await this.getVerified({keyId: key.keyId});
    if (verified) {
      key.userIds = await this._mergeUsers(verified.userIds, key.userIds, key.publicKeyArmored);
      // reduce new key to verified user IDs
      const filteredPublicKeyArmored = await this._pgp.filterKeyByUserIds(key.userIds.filter(({verified}) => verified), key.publicKeyArmored);
      // update verified key with new key
      key.publicKeyArmored = await this._pgp.updateKey(verified.publicKeyArmored, filteredPublicKeyArmored);
    } else {
      key.userIds = key.userIds.filter(userId => userId.status === KEY_STATUS_VALID);
      if (!key.userIds.length) {
        util.throw(400, 'Invalid PGP key: no valid user IDs found');
      }
      await this._addKeyArmored(key.userIds, key.publicKeyArmored);
      // new key, set armored to null
      key.publicKeyArmored = null;
    }
    // send mails to verify user ids
    await this._genVerificationNonce(key);
    // store key in database
    await this._persistKey(key);
    // if not verified - verify the primary user
    if (!verified) {
      await this.verify({keyId: key.keyId, nonce: key.userIds[0].nonce});
    }
  }

  /**
   * Delete all keys where no user id has been verified after x days.
   * @return {Promise}
   */
  async _purgeOldUnverified() {
    // create date in the past to compare with
    const xDaysAgo = new Date();
    xDaysAgo.setDate(xDaysAgo.getDate() - this._cfg.publicKey.purgeTimeInDays);
    // remove unverified keys older than x days (or no 'uploaded' attribute)
    return this._nedb.remove({
      'userIds.verified': {$ne: true},
      uploaded: {$lt: xDaysAgo}
    });
  }

  /**
   * Merge existing and new user IDs
   * @param  {Array} existingUsers     source user IDs
   * @param  {Array} newUsers          new user IDs
   * @param  {String} publicKeyArmored armored key block of new user IDs
   * @return {Array}                   merged user IDs
   */
  async _mergeUsers(existingUsers, newUsers, publicKeyArmored) {
    const result = [];
    // existing verified valid or revoked users
    const verifiedUsers = existingUsers.filter(userId => userId.verified);
    // valid new users which are not yet verified
    const validUsers = newUsers.filter(userId => userId.status === KEY_STATUS_VALID && !this._includeEmail(verifiedUsers, userId));
    // pending users are not verified, not newly submitted
    const pendingUsers = existingUsers.filter(userId => !userId.verified && !this._includeEmail(validUsers, userId));
    await this._addKeyArmored(validUsers, publicKeyArmored);
    result.push(...validUsers, ...pendingUsers, ...verifiedUsers);
    return result;
  }

  /**
   * Create amored key block which contains the corresponding user ID only and add it to the user ID object
   * @param {Array} userIds           user IDs to be extended
   * @param {String} PublicKeyArmored armored key block to be filtered
   * @return {Promise}
   */
  async _addKeyArmored(userIds, publicKeyArmored) {
    for (const userId of userIds) {
      userId.publicKeyArmored = await this._pgp.filterKeyByUserIds([userId], publicKeyArmored);
      userId.notify = true;
    }
  }

  _includeEmail(users, user) {
    return users.find(({email}) => email === user.email);
  }

  /**
   * Generate nonce to the public keys user ids for verification.
   * If a primary email address is provided only one email will be sent.
   * @param {Array}  userIds            user id documents containg the verification nonces
   * @return {Promise}
   */
  async _genVerificationNonce({userIds}) {
    for (const userId of userIds) {
      if (userId.notify && userId.notify === true) {
        userId.nonce = util.random();
      }
    }
  }

  /**
   * Persist the public key and its user ids in the database.
   * @param {Object} key   public key parameters
   * @return {Promise}
   */
  async _persistKey(key) {
    // delete old/unverified key
    await this._nedb.remove({keyId: key.keyId});
    // generate nonces for verification
    for (const userId of key.userIds) {
      // remove status from user
      delete userId.status;
      // remove notify flag from user
      delete userId.notify;
    }
    // persist new key
    const r = await this._nedb.create(key);
    if (!(r && r._id )) {
      util.throw(500, 'Failed to persist key');
    }
  }

  /**
   * Verify a user id by proving knowledge of the nonce.
   * @param {string} keyId   Correspronding public key id
   * @param {string} nonce   The verification nonce proving email address ownership
   * @return {Promise}       The email that has been verified
   */
  async verify({keyId, nonce}) {
    // look for verification nonce in database
    //const query = {keyId, 'userIds.nonce': nonce};
    const query = {keyId, userIds: { $elemMatch: { nonce } } };
    const key = await this._nedb.get(query);
    if (!key) {
      util.throw(404, 'User ID not found');
    }
    await this._removeKeysWithSameEmail(key, nonce);
    let {publicKeyArmored, email} = key.userIds.find(userId => userId.nonce === nonce);
    // update armored key
    if (key.publicKeyArmored) {
      publicKeyArmored = await this._pgp.updateKey(key.publicKeyArmored, publicKeyArmored);
    }
    // flag the user id as verified
    await this._nedb.update(query, {
      publicKeyArmored,
      'userIds.0.verified': true,
      'userIds.0.nonce': null,
      'userIds.0.publicKeyArmored': null
    });
    return {email};
  }

  /**
   * Removes keys with the same email address
   * @param  {String} options.keyId   source key ID
   * @param  {Array} options.userIds  user IDs of source key
   * @param  {Array} nonce            relevant nonce
   * @return {Promise}
   */
  async _removeKeysWithSameEmail({keyId, userIds}, nonce) {
    return this._nedb.remove({
      keyId: {$ne: keyId},
      'userIds.email': userIds.find(u => u.nonce === nonce).email
    });
  }

  /**
   * Check if a verified key already exists either by fingerprint, 16 char key id,
   * or email address. There can only be one verified user ID for an email address
   * at any given time.
   * @param {Array}  userIds       A list of user ids to check
   * @param {string} fingerprint   The public key fingerprint
   * @param {string} keyId         (optional) The public key id
   * @return {Object}               The verified key document
   */
  async getVerified({userIds, fingerprint, keyId}) {
    let queries = [];
    // query by fingerprint
    if (fingerprint) {
      queries.push({
        fingerprint: fingerprint.toLowerCase(),
        'userIds.verified': true
      });
    }
    // query by key id (to prevent key id collision)
    if (keyId) {
      queries.push({
        keyId: keyId.toLowerCase(),
        'userIds.verified': true
      });
    }
    // query by user id
    if (userIds) {
      queries = queries.concat(userIds.map(uid => ({
        userIds: {
          $elemMatch: {
            'email': util.normalizeEmail(uid.email),
            'verified': true
          }
        }
      })));
    }
    return this._nedb.get({$or: queries});
  }

  /**
   * Fetch a verified public key from the database. Either the key id or the
   * email address muss be provided.
   * @param {string} fingerprint   (optional) The public key fingerprint
   * @param {string} keyId         (optional) The public key id
   * @param {String} email         (optional) The user's email address
   * @param {Object} ctx           Context
   * @return {Object}               The public key document
   */
  async get({fingerprint, keyId, email}, ctx) {
    // look for verified key
    const userIds = email ? [{email}] : undefined;
    const key = await this.getVerified({keyId, fingerprint, userIds});
    if (!key) {
      util.throw(404, ctx.__('key_not_found'));
    }
    // clean json return value (_id, nonce)
    /*
    delete key._id;
    key.userIds = key.userIds.map(uid => ({
      name: uid.name,
      email: uid.email,
      verified: uid.verified
    }));
    */
    return key;
  }

  /**
   * Request removal of the public key by flagging all user ids and sending
   * a verification email to the primary email address. Only one email
   * needs to sent to a single user id to authenticate removal of all user ids
   * that belong the a certain key id.
   * @param {String} keyId    (optional) The public key id
   * @param {String} email    (optional) The user's email address
   * @param {Object} origin   Required for links to the keyserver e.g. { protocol:'https', host:'openpgpkeys@example.com' }
   * @param {Object} ctx      Context
   * @return {Promise}
   */
  async requestRemove({keyId, email, origin}, ctx) {
    // flag user ids for removal
    const key = await this._flagForRemove(keyId, email);
    if (!key) {
      util.throw(404, 'User ID not found');
    }
    // send verification mails
    keyId = key.keyId; // get keyId in case request was by email
//    for (const userId of key.userIds) {
//      await this._email.send({template: tpl.verifyRemove.bind(null, ctx), userId, keyId, origin});
//    }
  }

  /**
   * Flag all user IDs of a key for removal by generating a new nonce and
   * saving it. Either a key id or email address must be provided
   * @param {String} keyId   (optional) The public key id
   * @param {String} email   (optional) The user's email address
   * @return {Array}          A list of user ids with nonces
   */
  async _flagForRemove(keyId, email) {
    email = util.normalizeEmail(email);
    const query = email ? {'userIds.email': email} : {keyId};
    const key = await this._nedb.get(query);
    if (!key) {
      return;
    }
    // flag only the provided user id
    if (email) {
      const nonce = util.random();
      await this._nedb.update(query, {'userIds.$.nonce': nonce});
      const uid = key.userIds.find(u => u.email === email);
      uid.nonce = nonce;
      return {userIds: [uid], keyId: key.keyId};
    }
    // flag all key user ids
    if (keyId) {
      for (const uid of key.userIds) {
        const nonce = util.random();
        await this._nedb.update({'userIds.email': uid.email}, {'userIds.$.nonce': nonce});
        uid.nonce = nonce;
      }
      return key;
    }
  }

  /**
   * Verify the removal of the user's key id by proving knowledge of the nonce.
   * Also deletes all user id documents of that key id.
   * @param {string} keyId   public key id
   * @param {string} nonce   The verification nonce proving email address ownership
   * @return {Promise}
   */
  async verifyRemove({keyId, nonce}) {
    // check if key exists in database
    const flagged = await this._nedb.get({keyId, 'userIds.nonce': nonce});
    if (!flagged) {
      util.throw(404, 'User ID not found');
    }
    if (flagged.userIds.length === 1) {
      // delete the key
      await this._nedb.remove({keyId});
      return flagged.userIds[0];
    }
    // update the key
    const rmIdx = flagged.userIds.findIndex(userId => userId.nonce === nonce);
    const rmUserId = flagged.userIds[rmIdx];
    if (rmUserId.verified) {
      if (flagged.userIds.filter(({verified}) => verified).length > 1) {
        flagged.publicKeyArmored = await this._pgp.removeUserId(rmUserId.email, flagged.publicKeyArmored);
      } else {
        flagged.publicKeyArmored = null;
      }
    }
    flagged.userIds.splice(rmIdx, 1);
    await this._nedb.update({keyId}, flagged);
    return rmUserId;
  }
}

module.exports = PublicKey;

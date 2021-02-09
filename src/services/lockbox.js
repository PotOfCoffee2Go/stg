/**
 * Inspired by https://github.com/mailvelope/keyserver public-keys.js
 *
 */
'use strict';
const log = require('./logger');
// const config = require('./config');
const util = require('./util');

/**
 * Database documents have the format:
 * {
 *   _id: ObjectId, // a randomly generated MongoDB document ID
 *   boxId: 'b8e4105cc9dedc77', // the 16 char box id in lowercase hex
 *   keys: [
 *     {
 *       name:'Jon Smith',
 *       email:'jon@smith.com',
 *       keyId: "b8e4105cc9dedc77", // 16 char public key id in lowercase hex
 *     }
 *   ],
 *   created: Sat Oct 17 2015 12:17:03 GMT+0200 (CEST), // box creation time as JavaScript Date
 *   uploaded: Sat Oct 17 2015 12:17:03 GMT+0200 (CEST), // time of box upload as JavaScript Date
 * }
 */

/**
 * A service that handles lockbox queries to the database
 */
class LockBox {
  /**
   * Create an instance of the service
   * @param {Object} pgp       An instance of the OpenPGP.js wrapper
   * @param {Object} nedb     An instance of the MongoDB client
   */
  constructor(nedb, publicKey, ownerkeyId = '') {
    this._nedb = nedb;
    this._pubs = publicKey;
    this.box = {};
    this.boxes = [];
  }

  /**
   * Compact public keys database
   * @yield {undefined}
   */
  compactDb() {
    log.debug('Lockboxes compacted!');
    this._nedb.compact();
  }

  /**
   * Create a new lockbox
   * @param {String} ownerkeyid Owerers public key id assigned to locbox
   * @param {String} name       Name to assign to locbox
   * @param {String} keyring    Key ids to encrypt messages
   * @param {String} boxkey     Passphrase to decrypt from image
   * @return {Object}         Lockbox object
   */
  init(ownerkeyid, name = '', keyring = [], boxkey = '') {
    if (!ownerkeyid) util.throw('Owner keyId is required to create a lockbox');
    const decrypted = {
       boxkey: boxkey ? boxkey : util.random(16),
       keyring: keyring,
     };
    this.box = {
       boxId: util.random(8), // the 16 char box id in lowercase hex
       name: name,
       ownerkeyid: ownerkeyid,
       decrypted: decrypted,
       encrypted: this._encrypt(decrypted),
       created: new Date(), // box creation time
       uploaded: new Date(), // time of box upload
      }
    this.boxes = [];
    return this.box;
    }

  /**
   * Get lockbox from database
   * @param {Object}    boxqry  Querry - normally { boxId, '...' } or { name: '...' }
   * @yield {Object}            Lockbox, or null if not found, or throw db error
   * @return {Promise}
   */
  async get(boxqry) {
    console.dir(boxqry);
    this.box = await this._nedb.get(boxqry);
    if (!this.box.boxId) return null;
    this.box.decrypted = this._decrypt(box.encrypted);
    return this.box;
  }

  /**
   * Get multiple lockboxes from database
   * @param {Object}    boxqry  Query - { name: '...' }
   * @yield {Object}            Lockboxes, or empty array if not found, or throw db error
   * @return {Promise}
   */
  async list(boxqry) {
    this.boxes = await this._nedb.list(boxqry);
    this.boxes.forEach(box => {box.decrypted = this._decrypt(box.encrypted)});
    return this.boxes;
  }

  /**
   * Put lockbox into database
   * @param {Object} box  The lockbox
   * @yield {Object}      Lockbox, or null if not found, or throw db error
   * @return {Promise}
   */
  async put() {
    this.box.encrypted = this._encrypt(this.box.decrypted);
    await this._persistBox(this.box);
    return this.box;
  }

  /**
   * Persist the lockbox and its encrypted values in the database.
   * @param {Object} box  The lockbox
   * @return {Promise}
   */
  async _persistBox() {
    // delete old lockbox
    await this._nedb.remove({boxId: this.box.boxId});
    // Remove decrypted values
    delete this.box.decrypted;
    // Create/persist new box
    const box = await this._nedb.create(this.box);
    if (!(box && box._id )) {
      util.throw(500, 'Failed to persist box');
    }
    this.box = box;
    // Put the decrypted values back
    this.box.decrypted = this._decrypt(this.box.encrypted);
  }

  /**
   * Get public key of lockbox owner
   * @yield {Object}      Owner Public Key
   * @return {Promise}
   */
  async getOwnerKey() {
    return await this._pubs.getVerified({ keyId: this.box.ownerkeyid })
  }

  /**
   * Get public keys in the keyring
   * @yield {Array}      Owner Public Key followed by public keys in keyring
   * @return {Promise}
   */
  async getPublicKeys() {
    const owner = await this.getOwnerKey();
    var keylist = [owner];
    for (let keyId of this.box.decrypted.keyring) {
      if (keyId !== owner.keyId) {
        keylist.push(await this._pubs.getVerified({ keyId: keyId }));
      }
    }
    return keylist;
  }

  /**
   * Encrypt the lockbox decripted values
   * @param {Object} decrypted  The lockbox decrypted boxkey and public key ids
   * @return {Object}           The encrypted boxkey and public key ids
   */
  _encrypt(decrypted) {
    return {
      boxkey: util.encrypt(decrypted.boxkey, cfg.serverSecret),
      keyring: util.encrypt(decrypted.keyring.toString(), decrypted.boxkey)
    }
  }

  /**
   * Decrypt the lockbox encrypted values
   * @param {Object} encrypted  The lockbox encrypted boxkey and public key ids
   * @return {Object}           The decrypted boxkey and public key ids
   */
  _decrypt(encrypted) {
    const boxkey = util.decrypt(encrypted.boxkey, cfg.serverSecret);
    return {
      boxkey: boxkey,
      keyring: util.decrypt(encrypted.keyring, boxkey).split(',')
    }
  }

}

module.exports = LockBox;

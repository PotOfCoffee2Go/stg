/**
 * Inspired by https://github.com/mailvelope/keyserver mongo.js
 */

'use strict';
const _projectdir = require('path').resolve(__dirname, '../..');
const log = require('./logger');

const { datastore } = require('nedb-promise');

/**
 * A simple wrapper around the NeDB database.
 */
class NeDB {
  /**
   * Initializes the database
   * @param {String} dbpath The path to JSON database
   * @yield {undefined}
   */
  async init(dbpath) {
    this._db = await datastore({ filename: dbpath, autoload: true })
  }

  /**
   * Cleanup by compacting the database.
   * @yield {undefined}
   */
  compact() {
    this._db.nedb.persistence.compactDatafile();
  }

  /**
   * Inserts a single document.
   * @param {Object} document   Inserts a single document
   * @yield {Object}            The operation result
   */
  async create(document) {
    return await this._db.insert(document)//One(document);
  }

  /**
   * Inserts a list of documents.
   * @param {Array}  documents   Inserts a list of documents
   * @yield {Object}             The operation result
   */
  async batch(documents) {
    return await this._db.insert(documents); //Many(documents);
  }

  /**
   * Update a single document.
   * @param {Object} query   The query e.g. { _id:'0' }
   * @param {Object} diff    The attributes to change/set e.g. { foo:'bar' }
   * @yield {Object}         The operation result
   */
  async update(query, diff) {
    return this._db.update(query, {$set: diff}); // One(query, {$set: diff});
  }

  /**
   * Read a single document.
   * @param {Object} query   The query e.g. { _id:'0' }
   * @param {String} type    The collection to use e.g. 'publickey'
   * @yield {Object}         The document object
   */
  async get(query) {
    return await this._db.findOne(query);
  }

  /**
   * Read multiple documents at once.
   * @param {Object} query   The query e.g. { foo:'bar' }
   * @yield {Array}          An array of document objects
   */
  async list(query) {
    return await this._db.find(query); // .toArray();
  }

  /**
   * Delete all documents matching a query.
   * @param {Object} query   The query e.g. { _id:'0' }
   * @yield {Object}         The operation result
   */
  async remove(query) {
    return await this._db.remove(query); // Many(query);
  }

  /**
   * Clear all documents of a collection.
   * @yield {Object}        The operation result
   */
  async clear() {
    return await _db.remove({}) // Many({});
  }
}

module.exports = NeDB;

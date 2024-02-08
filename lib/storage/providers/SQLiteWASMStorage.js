import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import _ from 'underscore';

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

const DB_NAME = 'OnyxDB';

let db = null;
const start = function (sqlite3) {
  log('Running SQLite3 version', sqlite3.version.libVersion);
  db = new sqlite3.oo1.DB(`/${DB_NAME}.sqlite3`, 'ct');
  // Your SQLite code here.
  db.exec(['CREATE TABLE IF NOT EXISTS keyvaluepairs (record_key TEXT NOT NULL PRIMARY KEY , valueJSON JSON NOT NULL) WITHOUT ROWID;']);
};

sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite3) => {
  try {
    log('Done initializing. Running demo...');
    start(sqlite3);
  } catch (err) {
    error(err.name, err.message);
  }
});

// TODO: implement 4 methods
// - multiMerge
// - mergeItem
// - multiSet
// - getDatabaseSize
const provider = {
    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     * @param {String} key
     * @param {*} value
     * @return {Promise<void>}
     */
    setItem: (key, value) => Promise.resolve(db.exec({sql:'REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, ?);', bind: [key, JSON.stringify(value)]})),

    /**
     * Get multiple key-value pairs for the give array of keys in a batch.
     * This is optimized to use only one database transaction.
     * @param {String[]} keys
     * @return {Promise<Array<[key, value]>>}
     */
    multiGet: (keys) => new Promise((resolve) => {
        const placeholders = _.map(keys, () => '?').join(',');
        const query = `SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key IN (${placeholders});`;
        return db.exec({sql: query, bind: keys, callback: (rows) => {
          log(454545, rows);
          resolve(rows);
        }});
      }),

    /**
     * Multiple merging of existing and new values in a batch
     * @param {Array<[key, value]>} pairs
     * This function also removes all nested null values from an object.
     * @return {Promise<void>}
     */
    multiMerge: (pairs) => Promise.resolve(),

    /**
     * Merging an existing value with a new one
     * @param {String} key
     * @param {any} _changes - not used, as we rely on the pre-merged data from the `modifiedData`
     * @param {any} modifiedData - the pre-merged data from `Onyx.applyMerge`
     * @return {Promise<void>}
     */
    mergeItem(key, _changes, modifiedData) {
        return Promise.resolve();
    },

    /**
     * Stores multiple key-value pairs in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiSet: (pairs) => Promise.resolve(),

    /**
     * Clear everything from storage and also stops the SyncQueue from adding anything more to storage
     * @returns {Promise<void>}
     */
    clear: () => Promise.resolve(db.exec({sql: 'DELETE FROM keyvaluepairs;'})),

    // This is a noop for now in order to keep clients from crashing see https://github.com/Expensify/Expensify/issues/312438
    setMemoryOnlyKeys: () => {},

    /**
     * Returns all keys available in storage
     * @returns {Promise<String[]>}
     */
    getAllKeys: () => new Promise((resolve) => {
      db.exec({
        sql: 'SELECT record_key FROM keyvaluepairs;',
        callback: (rows) => {
          log(11111, rows);
          resolve(rows);
        }
      })
    }),

    /**
     * Get the value of a given key or return `null` if it's not available in storage
     * @param {String} key
     * @return {Promise<*>}
     */
    getItem: (key) => new Promise((resolve) => db.exec({sql: 'SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key = ?;', bind: [key], callback: (row) => {
      log(222333, row);
      resolve();
    }})),

    /**
     * Remove given key and it's value from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    removeItem: (key) => Promise.resolve(db.exec({sql: 'DELETE FROM keyvaluepairs WHERE record_key = ?;', bind: [key]})),

    /**
     * Remove given keys and their values from storage
     *
     * @param {Array} keys
     * @returns {Promise}
     */
    removeItems: (keys) => {
      const placeholders = _.map(keys, () => '?').join(',');
      const query = `DELETE FROM keyvaluepairs WHERE record_key IN (${placeholders});`;

      return Promise.resolve(db.exec({sql: query, bind: keys }));
  },

    /**
     * Gets the total bytes of the database file
     * @returns {Promise<number>}
     */
    // TODO: implement
    getDatabaseSize() {
        if (!window.navigator || !window.navigator.storage) {
            throw new Error('StorageManager browser API unavailable');
        }

        return window.navigator.storage
            .estimate()
            .then((value) => ({
                bytesUsed: value.usage,
                bytesRemaining: value.quota - value.usage,
            }))
            .catch((error) => {
                throw new Error(`Unable to estimate web storage quota. Original error: ${error}`);
            });
    },
};

export default provider;
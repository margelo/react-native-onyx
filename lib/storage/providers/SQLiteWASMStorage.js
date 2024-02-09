import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import _ from 'underscore';

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

const DB_NAME = 'OnyxDB';

const worker = new Worker(new URL('./worker.js', import.meta.url));

// Sending a message to the worker
worker.postMessage('Hello');

function b() {
const start = function (sqlite3) {
  log('Running SQLite3 version', sqlite3.version.libVersion);
  const db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
  log('Created transient database', db.filename);

  try {
    log('Creating a table...');
    db.exec('CREATE TABLE IF NOT EXISTS t(a,b)');
    log('Insert some data using exec()...');
    for (let i = 20; i <= 25; ++i) {
      db.exec({
        sql: 'INSERT INTO t(a,b) VALUES (?,?)',
        bind: [i, i * 2],
      });
    }
    log('Query data with exec()...');
    const stmt = db.selectValues('SELECT a FROM t;');
    log(999, stmt)
  } finally {
    db.close();
  }
};

log('Loading and initializing SQLite3 module...');
sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite3) => {
  log('Done initializing. Running demo...');
  try {
    start(sqlite3);
  } catch (err) {
    error(err.name, err.message);
  }
});
}

// b();

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

// TODO: implement these methods
// - getDatabaseSize
const provider = {
    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     * @param {String} key
     * @param {*} value
     * @return {Promise<void>}
     */
    setItem(key, value) {
      log("setItem", key, value);
      db.exec({sql:'REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, ?);', bind: [key, JSON.stringify(value)]});
      const keys = db.selectValues('SELECT record_key FROM keyvaluepairs;');

      log('keys', keys);

      return Promise.resolve();
    },

    /**
     * Get multiple key-value pairs for the give array of keys in a batch.
     * This is optimized to use only one database transaction.
     * @param {String[]} keys
     * @return {Promise<Array<[key, value]>>}
     */
    multiGet(keys) {
      return new Promise((resolve) => {
        log('multiGet', {keys});
        const placeholders = _.map(keys, () => '?').join(',');
        const query = `SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key IN (${placeholders});`;
        const values = db.selectArrays(query);
        
        log("multiGet", values)

        resolve(_.map(values, ([key, value]) => [key, JSON.parse(value)]))
      });
    },

    /**
     * Multiple merging of existing and new values in a batch
     * @param {Array<[key, value]>} pairs
     * This function also removes all nested null values from an object.
     * @return {Promise<void>}
     */
    multiMerge(pairs) {
      log("multiMerge", pairs);

      // Note: We use `ON CONFLICT DO UPDATE` here instead of `INSERT OR REPLACE INTO`
      // so the new JSON value is merged into the old one if there's an existing value
      const query = `INSERT INTO keyvaluepairs (record_key, valueJSON)
            VALUES (:key, JSON(:value))
            ON CONFLICT DO UPDATE
            SET valueJSON = JSON_PATCH(valueJSON, JSON(:value));
      `;

      const nonNullishPairs = _.filter(pairs, (pair) => !_.isUndefined(pair[1]));
      const queryArguments = _.map(nonNullishPairs, (pair) => {
          const value = JSON.stringify(pair[1]);
          return [pair[0], value];
      });

      db.exec("BEGIN TRANSACTION;");
      const stmt = db.prepare(query);
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, valueJSON] of queryArguments) {
        stmt.bind([key, valueJSON]);
        stmt.step();
        stmt.reset(); // Reset the statement to be used again
      }
      db.exec("COMMIT;");

      return Promise.resolve()
    },

    /**
     * Merging an existing value with a new one
     * @param {String} key
     * @param {any} changes - not used, as we rely on the pre-merged data from the `modifiedData`
     * @return {Promise<void>}
     */
    mergeItem(key, changes) {
        log("mergeItem", key, changes);
        return this.multiMerge([[key, changes]]);
    },

    /**
     * Stores multiple key-value pairs in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiSet(pairs) {
      // TODO: try catch
      const stringifiedPairs = _.map(pairs, (pair) => [pair[0], JSON.stringify(_.isUndefined(pair[1]) ? null : pair[1])]);
      if (_.isEmpty(stringifiedPairs)) {
          return Promise.resolve();
      }
      db.exec("BEGIN TRANSACTION;");
      const stmt = db.prepare("REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, json(?));");
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, valueJSON] of stringifiedPairs) {
        stmt.bind([key, valueJSON]);
        stmt.step();
        stmt.reset(); // Reset the statement to be used again
      }
      db.exec("COMMIT;");
      log("multiSet", {pairs});
      return Promise.resolve();
    },

    /**
     * Clear everything from storage and also stops the SyncQueue from adding anything more to storage
     * @returns {Promise<void>}
     */
    clear() {
      log("clear");
      
      return Promise.resolve(db.exec({sql: 'DELETE FROM keyvaluepairs;'}));
    },

    // This is a noop for now in order to keep clients from crashing see https://github.com/Expensify/Expensify/issues/312438
    setMemoryOnlyKeys: () => {},

    /**
     * Returns all keys available in storage
     * @returns {Promise<String[]>}
     */
    getAllKeys() {
      return new Promise((resolve) => {
        log("getAllKeys");
        const keys = db.selectValues('SELECT record_key FROM keyvaluepairs;');

        log('keys', keys);

        resolve(keys)
      });
    },

    /**
     * Get the value of a given key or return `null` if it's not available in storage
     * @param {String} key
     * @return {Promise<*>}
     */
    getItem(key) {
      const query = 'SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key = ?;';
      const value = db.selectValue(query, [key]);

      log("getItem - value", value)

      return Promise.resolve({});
    },

    /**
     * Remove given key and it's value from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    removeItem(key) {
      log("removeItem", key);
      
      return Promise.resolve(db.exec({sql: 'DELETE FROM keyvaluepairs WHERE record_key = ?;', bind: [key]}));
    },

    /**
     * Remove given keys and their values from storage
     *
     * @param {Array} keys
     * @returns {Promise}
     */
    removeItems(keys) {
      log("removeItems", keys);
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
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import _ from 'underscore';

const log = (...args) => console.log(1, ...args);
const error = (...args) => console.error(...args);

const DB_NAME = 'OnyxDB_1';
let db;

const start = function (sqlite3) {
  // log('Running SQLite3 version', sqlite3.version.libVersion);

  if ('opfs' in sqlite3) {
    db = new sqlite3.oo1.OpfsDb(`/${DB_NAME}.sqlite3`);
    // log('OPFS is available, created persisted database at', db.filename);
  } else {
    db = new sqlite3.oo1.DB(`/${DB_NAME}.sqlite3`, 'c');
    // log('OPFS is not available, created transient database', db.filename);
  }

  db.exec(['CREATE TABLE IF NOT EXISTS keyvaluepairs (record_key TEXT NOT NULL PRIMARY KEY , valueJSON JSON NOT NULL) WITHOUT ROWID;']);
};

// log('Loading and initializing SQLite3 module...');
sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite3) => {
  // log('Done initializing. Running demo...');
  try {
    start(sqlite3);
  } catch (err) {
    error(err.name, err.message);
  }
});

onmessage = function ({data}) {
  const {operation, key, params} = data;
  // log('Worker: Message received from main script', data);

  switch (operation) {
    case "setItem": {
      db.exec({sql:'REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, ?);', bind: [params.key, JSON.stringify(params.value)]});

      return postMessage({key});
    }
    case "clear": {
      db.exec({sql: 'DELETE FROM keyvaluepairs;'});

      return postMessage({key});
    }
    case "getAllKeys": {
      const keys = db.selectValues('SELECT record_key FROM keyvaluepairs;');

      // log("getAllKeys", keys)

      return postMessage({key, data: keys});
    }
    case "getItem": {
      const query = 'SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key = ?;';
      const value = db.selectValue(query, [params.key]);

      // log("getItem - value", value)

      return postMessage({key, data: value});
    }
    case "removeItem": {
      db.exec({sql: 'DELETE FROM keyvaluepairs WHERE record_key = ?;', bind: [params.key]});

      return postMessage({key});
    }
    case "removeItems": {
      const placeholders = _.map(params.keys, () => '?').join(',');
      const query = `DELETE FROM keyvaluepairs WHERE record_key IN (${placeholders});`;

      db.exec({sql: query, bind: params.keys });

      return postMessage({key});
    }
    case "multiGet": {
      const placeholders = _.map(params.keys, () => '?').join(',');
      const query = `SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key IN (${placeholders});`;
      const values = db.selectArrays(query);
      
      // log("multiGet", values)

      return postMessage({key, data: _.map(values, ([_key, value]) => [_key, JSON.parse(value)])});
    }
    case "multiSet": {
      // log("multiSet- 1", {pairs: params.pairs});
      const stringifiedPairs = _.map(params.pairs, (pair) => [pair[0], JSON.stringify(_.isUndefined(pair[1]) ? null : pair[1])]);

      if (_.isEmpty(stringifiedPairs)) {
        return postMessage({key});
      }

      db.exec("BEGIN TRANSACTION;");

      const stmt = db.prepare("REPLACE INTO keyvaluepairs (record_key, valueJSON) VALUES (?, json(?));");
      // eslint-disable-next-line no-restricted-syntax
      for (const [_key, valueJSON] of stringifiedPairs) {
        stmt.bind([_key, valueJSON]);
        stmt.step();
        stmt.reset(); // Reset the statement to be used again
      }

      db.exec("COMMIT;");

      // log("multiSet", {pairs: params.pairs});

      return postMessage({key});
    }
    case "multiMerge": {
      // log("multiMerge", params.pairs);

      // Note: We use `ON CONFLICT DO UPDATE` here instead of `INSERT OR REPLACE INTO`
      // so the new JSON value is merged into the old one if there's an existing value
      const query = `INSERT INTO keyvaluepairs (record_key, valueJSON)
            VALUES (:key, JSON(:value))
            ON CONFLICT DO UPDATE
            SET valueJSON = JSON_PATCH(valueJSON, JSON(:value));
      `;

      const nonNullishPairs = _.filter(params.pairs, (pair) => !_.isUndefined(pair[1]));
      const queryArguments = _.map(nonNullishPairs, (pair) => {
          const value = JSON.stringify(pair[1]);
          return [pair[0], value];
      });

      db.exec("BEGIN TRANSACTION;");
      const stmt = db.prepare(query);
      // eslint-disable-next-line no-restricted-syntax
      for (const [_key, valueJSON] of queryArguments) {
        stmt.bind([_key, valueJSON]);
        stmt.step();
        stmt.reset(); // Reset the statement to be used again
      }
      db.exec("COMMIT;");

      return postMessage({key});
    }
    default: {
      // log("default case")
    }
  }
};
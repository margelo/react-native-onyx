import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import _ from 'underscore';

const log = (...args) => console.log(1, ...args);
const error = (...args) => console.error(...args);

const DB_NAME = 'OnyxDB_1';
let db;

const start = function (sqlite3) {
  log('Running SQLite3 version', sqlite3.version.libVersion);

  if ('opfs' in sqlite3) {
    db = new sqlite3.oo1.OpfsDb(`/${DB_NAME}.sqlite3`);
    log('OPFS is available, created persisted database at', db.filename);
  } else {
    db = new sqlite3.oo1.DB(`/${DB_NAME}.sqlite3`, 'ct');
    log('OPFS is not available, created transient database', db.filename);
  }

  db.exec(['CREATE TABLE IF NOT EXISTS keyvaluepairs (record_key TEXT NOT NULL PRIMARY KEY , valueJSON JSON NOT NULL) WITHOUT ROWID;']);
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

onmessage = function ({data}) {
  const {operation, key, params} = data;
  log('Worker: Message received from main script', data);

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

      log("getAllKeys", keys)

      return postMessage({key, data: keys});
    }
    case "getItem": {
      const query = 'SELECT record_key, valueJSON FROM keyvaluepairs WHERE record_key = ?;';
      const value = db.selectValue(query, [params.key]);

      log("getItem - value", value)

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
    default: {
      log("default case")
    }
  }
};
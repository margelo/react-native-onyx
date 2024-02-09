import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = (...args) => console.log(1, ...args);
const error = (...args) => console.error(...args);

const start = function (sqlite3) {
  log('Running SQLite3 version', sqlite3.version.libVersion);
  let db;
  if ('opfs' in sqlite3) {
    db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');
    log('OPFS is available, created persisted database at', db.filename);
  } else {
    db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
    log('OPFS is not available, created transient database', db.filename);
  }
  // Your SQLite code here.
  const stmt = db.selectValues('SELECT a FROM t;');
  log(999, stmt)
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
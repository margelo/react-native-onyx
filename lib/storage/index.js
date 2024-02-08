import makeWebStorage from './WebStorage';
import StorageProvider from './providers/IDBKeyVal';

export default makeWebStorage(StorageProvider);
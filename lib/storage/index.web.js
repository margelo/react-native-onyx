import makeWebStorage from './WebStorage';
import StorageProvider from './providers/LocalForage';

export default makeWebStorage(StorageProvider);

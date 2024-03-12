import type StorageProvider from './types';
import type { Key, Value } from './types';
type Store = Record<Key, Value>;
declare let store: Store;
declare const set: (key: Key, value: Value) => Promise<IDBValidKey>;
declare const provider: StorageProvider;
declare const setMockStore: (data: Store) => void;
export default provider;
export { store as mockStore, set as mockSet, setMockStore };

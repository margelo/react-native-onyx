import _ from 'underscore';
import type {UseStore} from 'idb-keyval';
import idbKeyVal from 'idb-keyval';
import type {StorageProvider, MockStorageProvider} from '../types';

const IDBKeyValProvider = jest.requireActual('../IDBKeyValProvider');
const idbKeyValStore: UseStore = IDBKeyValProvider.idbKeyValStore;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const {name: _name, ...IDBKeyValProviderFunctions} = IDBKeyValProvider.default as StorageProvider;
const IDBKeyValProviderMockBase = _.reduce<typeof IDBKeyValProviderFunctions, Partial<MockStorageProvider>>(
    IDBKeyValProviderFunctions,
    (mockAcc, fn, fnName) => ({
        ...mockAcc,
        [fnName]: jest.fn(fn),
    }),
    {name: IDBKeyValProvider.name},
) as MockStorageProvider;

const IDBKeyValProviderMock = {
    ...IDBKeyValProviderMockBase,
    idbKeyval: idbKeyVal,
    idbKeyValStore,
};

export default IDBKeyValProviderMock;

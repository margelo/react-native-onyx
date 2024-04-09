import _ from 'underscore';
import idbKeyVal from 'idb-keyval';
import type {StorageProvider, MockStorageProvider} from '../types';

const IDBKeyValProvider: StorageProvider = jest.requireActual('../IDBKeyValProvider').default;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const {name: _name, ...IDBKeyValProviderFunctions} = IDBKeyValProvider;
const IDBKeyValProviderMockBase = _.reduce<typeof IDBKeyValProviderFunctions, Partial<MockStorageProvider>>(
    IDBKeyValProviderFunctions,
    (mockAcc, fn, fnName) => ({
        ...mockAcc,
        // @ts-expect-error - TS doesn't like the dynamic nature of this
        [fnName]: jest.fn(fn),
    }),
    {name: IDBKeyValProvider.name},
) as MockStorageProvider;

const IDBKeyValProviderMock = {
    ...IDBKeyValProviderMockBase,
    idbKeyval: idbKeyVal,
};

export default IDBKeyValProviderMock;

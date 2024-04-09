import _ from 'underscore';
import IDBKeyValProvider from '../IDBKeyValProvider';
import type {StorageProvider, MockStorageProvider} from '../types';

const IDBKeyValProviderEntries = Object.entries(IDBKeyValProvider);

const IDBKeyValProviderMock = _.reduce<typeof Object.entries<StorageProvider>, MockStorageProvider>(
    IDBKeyValProviderEntries,
    (mockAcc, [fnName, fn]) => ({
        ...mockAcc,
        [fnName]: jest.fn(fn),
    }),
    {},
) satisfies MockStorageProvider;

export default IDBKeyValProviderMock;

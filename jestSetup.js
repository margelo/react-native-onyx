jest.mock('idb-keyval', () => {
    const idbKeyValMockBase = require('./node_modules/idb-keyval/dist/mock');

    return {
        clear: jest.fn(idbKeyValMockBase.clear),
        createStore: jest.fn(idbKeyValMockBase.createStore),
        del: jest.fn(idbKeyValMockBase.del),
        delMany: jest.fn(idbKeyValMockBase.delMany),
        entries: jest.fn(idbKeyValMockBase.entries),
        get: jest.fn(idbKeyValMockBase.get),
        getMany: jest.fn(idbKeyValMockBase.getMany),
        keys: jest.fn(idbKeyValMockBase.keys),
        promisifyRequest: jest.fn(idbKeyValMockBase.promisifyRequest),
        set: jest.fn(idbKeyValMockBase.set),
        setMany: jest.fn(idbKeyValMockBase.setMany),
        update: jest.fn(idbKeyValMockBase.update),
        values: jest.fn(idbKeyValMockBase.values),
    };
});

jest.mock('./lib/storage');
jest.mock('./lib/storage/providers/IDBKeyValProvider', () => require('./lib/storage/providers/__mocks__/IDBKeyValProvider'));
jest.mock('./lib/storage/platforms/index.native', () => require('./lib/storage/__mocks__'));

jest.mock('react-native-device-info', () => ({getFreeDiskStorage: () => {}}));
jest.mock('react-native-quick-sqlite', () => ({
    open: () => ({execute: () => {}}),
}));

jest.useRealTimers();

const unstable_batchedUpdates_jest = require('react-test-renderer').unstable_batchedUpdates;
require('./lib/batch.native').default = unstable_batchedUpdates_jest;

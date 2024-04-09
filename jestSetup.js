jest.mock('./lib/storage');
jest.mock('./lib/storage/providers');
jest.mock('./lib/storage/platforms/index.native', () => require('./lib/storage/__mocks__'));
jest.mock('idb-keyval', () => require('./node_modules/idb-keyval/dist/mock'));

jest.mock('react-native-device-info', () => ({getFreeDiskStorage: () => {}}));
jest.mock('react-native-quick-sqlite', () => ({
    open: () => ({execute: () => {}}),
}));

jest.useRealTimers();

const unstable_batchedUpdates_jest = require('react-test-renderer').unstable_batchedUpdates;
require('./lib/batch.native').default = unstable_batchedUpdates_jest;

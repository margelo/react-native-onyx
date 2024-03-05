import _ from 'underscore';
import sizeof from 'object-sizeof';
import utils from '../../utils';
import type StorageProvider from './types';
import type {Key, KeyValuePair, Value} from './types';

type Store = Record<Key, Value>;

// eslint-disable-next-line import/no-mutable-exports
let store: Store = {};

const setInternal = (key: Key, value: Value) => {
    store[key] = value;
    return Promise.resolve(value);
};

const isJestRunning = typeof jest !== 'undefined';
const set = isJestRunning ? jest.fn(setInternal) : setInternal;

const provider: StorageProvider = {
    /**
     * The name of the provider that can be printed to the logs
     */
    name: 'MemoryOnlyProvider',

    /**
     * Initializes the storage provider
     */
    init() {
        // do nothing
    },

    /**
     * Get the value of a given key or return `null` if it's not available in memory
     */
    getItem(key) {
        const value = store[key];

        return Promise.resolve(value === undefined ? null : value);
    },

    /**
     * Get multiple key-value pairs for the give array of keys in a batch.
     */
    multiGet(keys) {
        const getPromises = _.map(keys, (key) => new Promise((resolve) => this.getItem(key).then((value) => resolve([key, value])))) as Array<Promise<KeyValuePair>>;
        return Promise.all(getPromises);
    },

    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     */
    setItem(key, value) {
        set(key, value);

        return Promise.resolve();
    },

    /**
     * Stores multiple key-value pairs in a batch
     */
    multiSet(pairs) {
        const setPromises = _.map(pairs, ([key, value]) => this.setItem(key, value));
        return new Promise((resolve) => Promise.all(setPromises).then(() => resolve()));
    },

    /**
     * Merging an existing value with a new one
     */
    mergeItem(key, _changes, modifiedData) {
        // Since Onyx already merged the existing value with the changes, we can just set the value directly
        return this.setItem(key, modifiedData);
    },

    /**
     * Multiple merging of existing and new values in a batch
     * This function also removes all nested null values from an object.
     */
    multiMerge(pairs) {
        _.forEach(pairs, ([key, value]) => {
            const existingValue = store[key] as unknown as Record<string, unknown>;
            const newValue = utils.fastMerge(existingValue, value as unknown as Record<string, unknown>) as unknown as Value;

            set(key, newValue);
        });

        return Promise.resolve([]);
    },

    /**
     * Remove given key and it's value from memory
     */
    removeItem(key) {
        delete store[key];
        return Promise.resolve();
    },

    /**
     * Remove given keys and their values from memory
     */
    removeItems(keys) {
        _.each(keys, (key) => {
            delete store[key];
        });
        return Promise.resolve();
    },

    /**
     * Clear everything from memory
     */
    clear() {
        store = {};
        return Promise.resolve();
    },

    /*
     * Since this is an in-memory only provider, nothing special needs to happen here and it can just be a noop
     */
    setMemoryOnlyKeys() {
        // do nothing
    },

    /**
     * Returns all keys available in memory
     */
    getAllKeys() {
        return Promise.resolve(_.keys(store));
    },

    /**
     * Gets the total bytes of the store.
     * `bytesRemaining` will always be `Number.POSITIVE_INFINITY` since we don't have a hard limit on memory.
     */
    getDatabaseSize() {
        const storeSize = sizeof(store);

        return Promise.resolve({bytesRemaining: Number.POSITIVE_INFINITY, bytesUsed: storeSize});
    },
};

const setMockStore = (data: Store) => {
    store = data;
};

export default provider;
export {store as mockStore, set as mockSet, setMockStore};

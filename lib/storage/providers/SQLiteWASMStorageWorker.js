import _ from 'underscore';

const log = (...args) => console.log(2, ...args);
const error = (...args) => console.error(...args);

const worker = new Worker(new URL('./worker.js', import.meta.url));
const promises = {};

worker.onmessage = ((e) => {
  const { key, data } = e.data;

  console.log(3, key, promises[key], data);

  promises[key](data);
  promises[key] = null;
});

// TODO: implement these methods
// - getDatabaseSize
const provider = {
    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     * @param {String} key
     * @param {*} value
     * @return {Promise<void>}
     */
    setItem(key, value) {
      log("setItem", key, value);

      const operationKey = `setItem-${key}`;

      worker.postMessage({operation: "setItem", key: operationKey, params: { key, value }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Get multiple key-value pairs for the give array of keys in a batch.
     * This is optimized to use only one database transaction.
     * @param {String[]} keys
     * @return {Promise<Array<[key, value]>>}
     */
    multiGet(keys) {
      log("multiGet", keys);

      const operationKey = `multiGet-${keys.join()}`;

      worker.postMessage({operation: "multiGet", key: operationKey, params: { keys }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Multiple merging of existing and new values in a batch
     * @param {Array<[key, value]>} pairs
     * This function also removes all nested null values from an object.
     * @return {Promise<void>}
     */
    multiMerge(pairs) {
      log("multiMerge", pairs);

      const operationKey = `multiMerge-${_.map(pairs, pair => pair[0]).join()}`;

      worker.postMessage({operation: "multiMerge", key: operationKey, params: { pairs }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Merging an existing value with a new one
     * @param {String} key
     * @param {any} changes - not used, as we rely on the pre-merged data from the `modifiedData`
     * @return {Promise<void>}
     */
    mergeItem(key, changes) {
        log("mergeItem", key, changes);
        return this.multiMerge([[key, changes]]);
    },

    /**
     * Stores multiple key-value pairs in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiSet(pairs) {
      log("multiSet", pairs);

      const operationKey = `multiSet-${_.map(pairs, pair => pair[0]).join()}`;

      worker.postMessage({operation: "multiSet", key: operationKey, params: { pairs }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Clear everything from storage and also stops the SyncQueue from adding anything more to storage
     * @returns {Promise<void>}
     */
    clear() {
      log("clear");
      
      const operationKey = "clear";

      worker.postMessage({operation: operationKey, key: operationKey});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    // This is a noop for now in order to keep clients from crashing see https://github.com/Expensify/Expensify/issues/312438
    setMemoryOnlyKeys: () => {},

    /**
     * Returns all keys available in storage
     * @returns {Promise<String[]>}
     */
    getAllKeys() {
      log("getAllKeys");

      const operationKey = "getAllKeys";

      worker.postMessage({operation: operationKey, key: operationKey});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Get the value of a given key or return `null` if it's not available in storage
     * @param {String} key
     * @return {Promise<*>}
     */
    getItem(key) {
      log("getItem", key);
      
      const operationKey = `getItem-${key}`;

      worker.postMessage({operation: "getItem", key: operationKey, params: { key }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Remove given key and it's value from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    removeItem(key) {
      log("removeItem", key);

      const operationKey = `removeItem-${key}`;

      worker.postMessage({operation: "removeItem", key: operationKey, params: { key }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Remove given keys and their values from storage
     *
     * @param {Array} keys
     * @returns {Promise}
     */
    removeItems(keys) {
      log("removeItems", keys);
      
      const operationKey = `removeItems-${keys.join('')}`;

      worker.postMessage({operation: "removeItems", key: operationKey, params: { keys }});

      return new Promise((resolve) => {
        promises[operationKey] = resolve;
      });
    },

    /**
     * Gets the total bytes of the database file
     * @returns {Promise<number>}
     */
    // TODO: implement
    getDatabaseSize() {
      return Promise.resolve(10_000);
    },
};

export default provider;
const provider = {
  /**
   * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
   * @param {String} key
   * @param {*} value
   * @return {Promise<void>}
   */
  setItem: (key, value) => Promise.resolve(),

  /**
   * Get multiple key-value pairs for the give array of keys in a batch.
   * This is optimized to use only one database transaction.
   * @param {String[]} keysParam
   * @return {Promise<Array<[key, value]>>}
   */
  multiGet: (keysParam) => Promise.resolve([]),

  /**
   * Multiple merging of existing and new values in a batch
   * @param {Array<[key, value]>} pairs
   * This function also removes all nested null values from an object.
   * @return {Promise<void>}
   */
  multiMerge: (pairs) => Promise.resolve(),

  /**
   * Merging an existing value with a new one
   * @param {String} key
   * @param {any} _changes - not used, as we rely on the pre-merged data from the `modifiedData`
   * @param {any} modifiedData - the pre-merged data from `Onyx.applyMerge`
   * @return {Promise<void>}
   */
  mergeItem(key, _changes, modifiedData) {
      return Promise.resolve();
  },

  /**
   * Stores multiple key-value pairs in a batch
   * @param {Array<[key, value]>} pairs
   * @return {Promise<void>}
   */
  multiSet: (pairs) => Promise.resolve(),

  /**
   * Clear everything from storage and also stops the SyncQueue from adding anything more to storage
   * @returns {Promise<void>}
   */
  clear: () => Promise.resolve(),

  // This is a noop for now in order to keep clients from crashing see https://github.com/Expensify/Expensify/issues/312438
  setMemoryOnlyKeys: () => {},

  /**
   * Returns all keys available in storage
   * @returns {Promise<String[]>}
   */
  getAllKeys: () => Promise.resolve([]),

  /**
   * Get the value of a given key or return `null` if it's not available in storage
   * @param {String} key
   * @return {Promise<*>}
   */
  getItem: (key) => Promise.resolve(),

  /**
   * Remove given key and it's value from storage
   * @param {String} key
   * @returns {Promise<void>}
   */
  removeItem: (key) => Promise.resolve(),

  /**
   * Remove given keys and their values from storage
   *
   * @param {Array} keysParam
   * @returns {Promise}
   */
  removeItems: (keysParam) => Promise.resolve(),

  /**
   * Gets the total bytes of the database file
   * @returns {Promise<number>}
   */
  getDatabaseSize() {
      if (!window.navigator || !window.navigator.storage) {
          throw new Error('StorageManager browser API unavailable');
      }

      return window.navigator.storage
          .estimate()
          .then((value) => ({
              bytesUsed: value.usage,
              bytesRemaining: value.quota - value.usage,
          }))
          .catch((error) => {
              throw new Error(`Unable to estimate web storage quota. Original error: ${error}`);
          });
  },
};

export default provider;
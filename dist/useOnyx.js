"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_equals_1 = require("fast-equals");
const react_1 = require("react");
const Onyx_1 = __importDefault(require("./Onyx"));
const useLiveRef_1 = __importDefault(require("./useLiveRef"));
const usePrevious_1 = __importDefault(require("./usePrevious"));
function getCachedValue(key, selector) {
    return Onyx_1.default.tryGetCachedValue(key, { selector });
}
function useOnyx(key, options) {
    const connectionIDRef = (0, react_1.useRef)(null);
    const previousKey = (0, usePrevious_1.default)(key);
    // Used to stabilize the selector reference and avoid unnecessary calls to `getSnapshot()`.
    const selectorRef = (0, useLiveRef_1.default)(options === null || options === void 0 ? void 0 : options.selector);
    // Stores the previous cached value as it's necessary to compare with the new value in `getSnapshot()`.
    // We initialize it to `undefined` to simulate that we don't have any value from cache yet.
    const cachedValueRef = (0, react_1.useRef)(undefined);
    // Stores the previously result returned by the hook, containing the data from cache and the fetch status.
    // We initialize it to `null` and `loading` fetch status to simulate the initial result when the hook is loading from the cache.
    // However, if `initWithStoredValues` is `true` we set the fetch status to `loaded` since we want to signal that data is ready.
    const resultRef = (0, react_1.useRef)([
        null,
        {
            status: (options === null || options === void 0 ? void 0 : options.initWithStoredValues) === false ? 'loaded' : 'loading',
        },
    ]);
    // Indicates if it's the first Onyx connection of this hook or not, as we don't want certain use cases
    // in `getSnapshot()` to be satisfied several times.
    const isFirstConnectionRef = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        // These conditions will ensure we can only handle dynamic collection member keys from the same collection.
        if (previousKey === key) {
            return;
        }
        try {
            const previousCollectionKey = Onyx_1.default.splitCollectionMemberKey(previousKey)[0];
            const collectionKey = Onyx_1.default.splitCollectionMemberKey(key)[0];
            if (Onyx_1.default.isCollectionMemberKey(previousCollectionKey, previousKey) && Onyx_1.default.isCollectionMemberKey(collectionKey, key) && previousCollectionKey === collectionKey) {
                return;
            }
        }
        catch (e) {
            throw new Error(`'${previousKey}' key can't be changed to '${key}'. useOnyx() only supports dynamic keys if they are both collection member keys from the same collection e.g. from 'collection_id1' to 'collection_id2'.`);
        }
        throw new Error(`'${previousKey}' key can't be changed to '${key}'. useOnyx() only supports dynamic keys if they are both collection member keys from the same collection e.g. from 'collection_id1' to 'collection_id2'.`);
    }, [previousKey, key]);
    const getSnapshot = (0, react_1.useCallback)(() => {
        var _a;
        // We get the value from the cache, supplying a selector too in case it's defined.
        // If `newValue` is `undefined` it means that the cache doesn't have a value for that key yet.
        // If `newValue` is `null` or any other value if means that the cache does have a value for that key.
        // This difference between `undefined` and other values is crucial and it's used to address the following
        // conditions and use cases.
        let newValue = getCachedValue(key, selectorRef.current);
        // Since the fetch status can be different given the use cases below, we define the variable right away.
        let newFetchStatus;
        // If we have pending merge operations for the key during the first connection, we set the new value to `undefined`
        // and fetch status to `loading` to simulate that it is still being loaded until we have the most updated data.
        // If `allowStaleData` is `true` this logic will be ignored and cached value will be used, even if it's stale data.
        if (isFirstConnectionRef.current && Onyx_1.default.hasPendingMergeForKey(key) && !(options === null || options === void 0 ? void 0 : options.allowStaleData)) {
            newValue = undefined;
            newFetchStatus = 'loading';
        }
        // If data is not present in cache (if it's `undefined`) and `initialValue` is set during the first connection,
        // we set the new value to `initialValue` and fetch status to `loaded` since we already have some data to return to the consumer.
        if (isFirstConnectionRef.current && newValue === undefined && (options === null || options === void 0 ? void 0 : options.initialValue) !== undefined) {
            newValue = options === null || options === void 0 ? void 0 : options.initialValue;
            newFetchStatus = 'loaded';
        }
        // If the previously cached value is different from the new value, we update both cached value
        // and the result to be returned by the hook.
        if (!(0, fast_equals_1.deepEqual)(cachedValueRef.current, newValue)) {
            cachedValueRef.current = newValue;
            // If the new value is `undefined` we default it to `null` to ensure the consumer get a consistent result from the hook.
            resultRef.current = [((_a = cachedValueRef.current) !== null && _a !== void 0 ? _a : null), { status: newFetchStatus !== null && newFetchStatus !== void 0 ? newFetchStatus : 'loaded' }];
        }
        return resultRef.current;
    }, [key, selectorRef, options === null || options === void 0 ? void 0 : options.allowStaleData, options === null || options === void 0 ? void 0 : options.initialValue]);
    const subscribe = (0, react_1.useCallback)((onStoreChange) => {
        connectionIDRef.current = Onyx_1.default.connect({
            key: key,
            callback: () => {
                // We don't need to update the Onyx cache again here, when `callback` is called the cache is already
                // expected to be updated, so we just signal that the store changed and `getSnapshot()` can be called again.
                isFirstConnectionRef.current = false;
                onStoreChange();
            },
            initWithStoredValues: options === null || options === void 0 ? void 0 : options.initWithStoredValues,
            waitForCollectionCallback: Onyx_1.default.isCollectionKey(key),
        });
        return () => {
            if (!connectionIDRef.current) {
                return;
            }
            Onyx_1.default.disconnect(connectionIDRef.current);
            isFirstConnectionRef.current = false;
        };
    }, [key, options === null || options === void 0 ? void 0 : options.initWithStoredValues]);
    // Mimics withOnyx's checkEvictableKeys() behavior.
    (0, react_1.useEffect)(() => {
        if ((options === null || options === void 0 ? void 0 : options.canEvict) === undefined || !connectionIDRef.current) {
            return;
        }
        if (!Onyx_1.default.isSafeEvictionKey(key)) {
            throw new Error(`canEvict can't be used on key '${key}'. This key must explicitly be flagged as safe for removal by adding it to Onyx.init({safeEvictionKeys: []}).`);
        }
        if (options.canEvict) {
            Onyx_1.default.removeFromEvictionBlockList(key, connectionIDRef.current);
        }
        else {
            Onyx_1.default.addToEvictionBlockList(key, connectionIDRef.current);
        }
    }, [key, options === null || options === void 0 ? void 0 : options.canEvict]);
    const result = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot);
    return result;
}
exports.default = useOnyx;

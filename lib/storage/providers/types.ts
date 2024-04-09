import type {BatchQueryResult, QueryResult} from 'react-native-quick-sqlite';
import type {OnyxKey, OnyxValue} from '../../types';

type KeyValuePair = [OnyxKey, OnyxValue<OnyxKey>];
type KeyList = OnyxKey[];
type KeyValuePairList = KeyValuePair[];

type OnStorageKeyChanged = <TKey extends OnyxKey>(key: TKey, value: OnyxValue<TKey> | null) => void;

type StorageProvider = {
    /**
     * The name of the provider that can be printed to the logs
     */
    name: string;
    /**
     * Initializes the storage provider
     */
    init: () => void;
    /**
     * Gets the value of a given key or return `null` if it's not available in storage
     */
    getItem: <TKey extends OnyxKey>(key: TKey) => Promise<OnyxValue<TKey> | null>;

    /**
     * Get multiple key-value pairs for the given array of keys in a batch
     */
    multiGet: (keys: KeyList) => Promise<KeyValuePairList>;

    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     */
    setItem: <TKey extends OnyxKey>(key: TKey, value: OnyxValue<TKey>) => Promise<QueryResult | void>;

    /**
     * Stores multiple key-value pairs in a batch
     */
    multiSet: (pairs: KeyValuePairList) => Promise<BatchQueryResult | void>;

    /**
     * Multiple merging of existing and new values in a batch
     */
    multiMerge: (pairs: KeyValuePairList) => Promise<BatchQueryResult | IDBValidKey[] | void>;

    /**
     * Merges an existing value with a new one by leveraging JSON_PATCH
     * @param changes - the delta for a specific key
     * @param modifiedData - the pre-merged data from `Onyx.applyMerge`
     */
    mergeItem: <TKey extends OnyxKey>(key: TKey, changes: OnyxValue<TKey>, modifiedData: OnyxValue<TKey>) => Promise<BatchQueryResult | void>;

    /**
     * Returns all keys available in storage
     */
    getAllKeys: () => Promise<KeyList>;

    /**
     * Removes given key and its value from storage
     */
    removeItem: (key: OnyxKey) => Promise<QueryResult | void>;

    /**
     * Removes given keys and their values from storage
     */
    removeItems: (keys: KeyList) => Promise<QueryResult | void>;

    /**
     * Clears absolutely everything from storage
     */
    clear: () => Promise<QueryResult | void>;

    /**
     * Gets the total bytes of the database file
     */
    getDatabaseSize: () => Promise<{bytesUsed: number; bytesRemaining: number}>;

    /**
     * @param onStorageKeyChanged Storage synchronization mechanism keeping all opened tabs in sync
     */
    keepInstancesSync?: (onStorageKeyChanged: OnStorageKeyChanged) => void;
};

type MethodsOnly<T, Excluded extends keyof T = never> = Pick<
    T,
    {
        // eslint-disable-next-line @typescript-eslint/ban-types
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T] &
        Exclude<keyof T, Excluded>
>;

interface MockStorageProviderGenerics {
    getItem: jest.Mock<Promise<OnyxValue<OnyxKey> | null>, [OnyxKey]>;
    setItem: jest.Mock<Promise<QueryResult | void>, [OnyxKey, OnyxValue<OnyxKey>]>;
}

type MockStorageProviderMethods = {
    [K in keyof MethodsOnly<StorageProvider, 'getItem' | 'setItem'>]: jest.Mock<ReturnType<StorageProvider[K]>, Parameters<StorageProvider[K]>>;
};

type MockStorageProvider = MockStorageProviderGenerics & MockStorageProviderMethods;

export type {StorageProvider, KeyList, KeyValuePair, KeyValuePairList, OnStorageKeyChanged, MockStorageProvider};

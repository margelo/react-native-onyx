import type { KeyList, Key, OnStorageKeyChanged } from '../providers/types';
import type StorageProvider from '../providers/types';
/**
 * Raise an event through `localStorage` to let other tabs know a value changed
 * @param {String} onyxKey
 */
declare function raiseStorageSyncEvent(onyxKey: Key): void;
declare function raiseStorageSyncManyKeysEvent(onyxKeys: KeyList): void;
declare const InstanceSync: {
    shouldBeUsed: boolean;
    /**
     * @param {Function} onStorageKeyChanged Storage synchronization mechanism keeping all opened tabs in sync
     */
    init: (onStorageKeyChanged: OnStorageKeyChanged, store: StorageProvider) => void;
    setItem: typeof raiseStorageSyncEvent;
    removeItem: typeof raiseStorageSyncEvent;
    removeItems: typeof raiseStorageSyncManyKeysEvent;
    mergeItem: typeof raiseStorageSyncEvent;
    clear: (clearImplementation: () => void) => Promise<void>;
};
export default InstanceSync;

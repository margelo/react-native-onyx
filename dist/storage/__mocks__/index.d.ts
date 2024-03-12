/// <reference types="jest" />
declare const StorageMock: {
    init: jest.Mock<void, []>;
    getItem: jest.Mock<Promise<IDBValidKey | null>, [key: string]>;
    multiGet: jest.Mock<Promise<import("../providers/types").KeyValuePairList>, [keys: import("../providers/types").KeyList]>;
    setItem: jest.Mock<Promise<void | import("react-native-quick-sqlite").QueryResult>, [key: string, value: IDBValidKey]>;
    multiSet: jest.Mock<Promise<void | import("react-native-quick-sqlite").BatchQueryResult>, [pairs: import("../providers/types").KeyValuePairList]>;
    mergeItem: jest.Mock<Promise<void | import("react-native-quick-sqlite").BatchQueryResult>, [key: string, changes: IDBValidKey, modifiedData: IDBValidKey]>;
    multiMerge: jest.Mock<Promise<import("react-native-quick-sqlite").BatchQueryResult | IDBValidKey[]>, [pairs: import("../providers/types").KeyValuePairList]>;
    removeItem: jest.Mock<Promise<void | import("react-native-quick-sqlite").QueryResult>, [key: string]>;
    removeItems: jest.Mock<Promise<void | import("react-native-quick-sqlite").QueryResult>, [keys: import("../providers/types").KeyList]>;
    clear: jest.Mock<Promise<void | import("react-native-quick-sqlite").QueryResult>, []>;
    getAllKeys: jest.Mock<Promise<import("../providers/types").KeyList>, []>;
    getDatabaseSize: jest.Mock<Promise<{
        bytesUsed: number;
        bytesRemaining: number;
    }>, []>;
    keepInstancesSync: jest.Mock<any, any>;
    mockSet: (key: string, value: IDBValidKey) => Promise<IDBValidKey>;
    getMockStore: jest.Mock<{
        [x: string]: IDBValidKey;
    }, []>;
    setMockStore: jest.Mock<void, [data: any]>;
};
export default StorageMock;

/* eslint-disable rulesdir/prefer-underscore-method */
/* eslint-disable @lwc/lwc/no-async-await */
import {
    set,
    keys,
    getMany,
    setMany,
    get,
    clear,
    del,
    delMany,
    createStore,
    promisifyRequest,
} from 'idb-keyval';
import _ from 'underscore';
import fastMerge from '../../fastMerge';

// Same config as earlier with localforage
const customStore = createStore('OnyxDB', 'keyvaluepairs');

const provider = {
    getAllKeys: () => keys(customStore),

    multiGet: async keysParam => getMany(keysParam, customStore)
        .then(values => values.map((value, index) => [keysParam[index], value])),

    getItem: key => get(key, customStore),

    multiSet: pairs => setMany(pairs, customStore),

    setItem: (key, value) => set(key, value, customStore),

    multiMerge: pairs => customStore('readwrite', (store) => {
        const getValues = Promise.all(pairs.map(([key]) => promisifyRequest(store.get(key))));

        return getValues.then((values) => {
            const upsertMany = pairs.map(([key, value], index) => {
                const prev = values[index];
                // eslint-disable-next-line prefer-object-spread
                const newValue = _.isObject(prev) ? Object.assign({}, fastMerge(prev, value)) : value;
                return promisifyRequest(store.put(newValue, key));
            });
            return Promise.all(upsertMany);
        });
    }),

    mergeItem(key, _changes, modifiedData) {
        return provider.multiMerge([[key, modifiedData]]);
    },

    clear: () => clear(customStore),

    removeItem: key => del(key, customStore),

    removeItems: keysParam => delMany(keysParam, customStore),
};

export default provider;

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
    update,
    createStore,
    promisifyRequest,
} from 'idb-keyval';
import _ from 'underscore';
import fastMerge from '../../fastMerge';

const customStore = createStore('OnyxDB', 'keyvaluepairs');

const provider = {
    setItem: (key, value) => set(key, value, customStore),

    mergeItem(key, _changes, modifiedData) {
        return update(key, prev => (_.isObject(prev) ? fastMerge(prev, modifiedData) : modifiedData), customStore);
    },

    getAllKeys: () => keys(customStore),

    multiGet: async keysParam => getMany(keysParam, customStore)
        .then(values => values.map((value, index) => [keysParam[index], value])),

    multiSet: pairs => setMany(pairs, customStore),

    multiMerge: async pairs => customStore('readwrite', (store) => {
        Promise.all(pairs.map(([key]) => promisifyRequest(store.get(key)))).then((values) => {
            pairs.forEach(([key, value], index) => {
                const prev = values[index];
                store.put(fastMerge(prev, value), key);
            });
        });
    }),

    getItem: key => get(key, customStore),

    clear: () => {
        clear(customStore);
    },

    removeItem: key => del(key, customStore),
};

export default provider;

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

const customStore = createStore('OnyxDB', 'keyvaluepairs');

const provider = {
    getAllKeys: () => keys(customStore),

    multiGet: async keysParam => getMany(keysParam, customStore)
        .then(values => values.map((value, index) => [keysParam[index], value])),

    getItem: key => get(key, customStore),

    multiSet: pairs => setMany(pairs, customStore),

    setItem: (key, value) => set(key, value, customStore),

    multiMerge: async pairs => customStore('readwrite', (store) => {
        Promise.all(pairs.map(([key]) => promisifyRequest(store.get(key)))).then((values) => {
            pairs.forEach(([key, value], index) => {
                const prev = values[index];
                const newValue = _.isObject(prev)

                // lodash adds a small overhead so we don't use it here
                // eslint-disable-next-line prefer-object-spread, rulesdir/prefer-underscore-method
                    ? Object.assign({}, fastMerge(prev, value))
                    : value;
                store.put(newValue, key);
            });
        });
    }),

    mergeItem(key, _changes, modifiedData) {
        return provider.multiMerge([[key, modifiedData]]);
    },

    clear: () => {
        clear(customStore);
    },

    removeItem: key => del(key, customStore),

    removeItems: keysParam => delMany(keysParam, customStore),
};

export default provider;

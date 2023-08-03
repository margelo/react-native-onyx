/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
/* eslint-disable rulesdir/prefer-underscore-method */
/* eslint-disable rulesdir/prefer-actions-set-data */
/* eslint-disable @lwc/lwc/no-async-await */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {faker} from '@faker-js/faker';
import Onyx from '../../lib/index';
import makeWebStorage from '../../lib/storage/WebStorage';
import IDBKeyValStorageProvider from '../../lib/storage/providers/IDBKeyVal';
import LocalforageStorageProvider from '../../lib/storage/providers/LocalForage';

function Option({
    label, category, value, defaultSelected = false,
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: '1rem',
        }}
        >
            <input type="radio" name={category} id={label} value={value || label} defaultChecked={defaultSelected} />
            <label htmlFor={label}>{label}</label>
        </div>
    );
}

const getValue = (category) => {
    const selectedOption = document.querySelector(`input[name="${category}"]:checked`);
    return selectedOption ? selectedOption.value : null;
};

const getNumberInputValueBy = (id) => {
    const input = document.getElementById(id);
    return input ? Number(input.value) : null;
};

const ONYXKEYS = {
    COLLECTION: {
        SAMPLE: 'collection_',
    },
    SAMPLE: 'sample',
};
const config = {
    keys: ONYXKEYS,
};

function makeRandomWord() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return possible.charAt(Math.floor(Math.random() * possible.length));
}

function generateRandomObject(numProperties, depth) {
    if (depth <= 0) {
        return makeRandomWord(); // Return a random value (e.g., word, sentence, etc.) from Faker.js
    }

    const obj = {};

    for (let i = 0; i < numProperties; i++) {
        const propName = makeRandomWord();
        const propValue = generateRandomObject(numProperties, depth - 1);
        obj[propName] = propValue;
    }

    return obj;
}

function generateFakeDataAsync(count, length, depth) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const fakeData = {};
            for (let i = 0; i < Number(count); i++) {
                fakeData[`${ONYXKEYS.COLLECTION.SAMPLE}${i}`] = generateRandomObject(length, depth);
            }
            resolve(fakeData);
        }, 0);
    });
}

function App() {
    const [logs, setLogs] = React.useState([]);
    const addLog = (log) => {
        setLogs(prevLogs => [...prevLogs, log]);
        console.log(log);
    };

    const handleClick = async () => {
        setLogs([]);

        const operation = getValue('operation');
        const itemCount = getValue('items');
        const length = getNumberInputValueBy('length');
        const depth = getNumberInputValueBy('depth');
        const database = getValue('database');

        let storageProvider;
        if (database === 'idb-keyval/IndexedDB') {
            storageProvider = makeWebStorage(IDBKeyValStorageProvider);
        } else if (database === 'Localforage/IndexedDB (Default)') {
            storageProvider = makeWebStorage(LocalforageStorageProvider);
        }

        // Setup onyx
        await Onyx.init({
            ...config,
            storageProvider,
        });

        // Always clear onyx before running tests
        // if (operation === 'Clear') {
        addLog('Clearing Onyx...');
        await Onyx.clear();
        addLog('Cleared Onyx');

        // return;
        // }

        // Generate fake data with faker
        addLog(`Generating ${itemCount} fake data items with length "${length}" and depth "${depth}"`);
        const fakeData = await generateFakeDataAsync(itemCount, length, depth);
        const bytes = JSON.stringify(fakeData).length;
        const megabytes = bytes / 1000000;
        addLog(`Generated ${itemCount} fake data items of size ${megabytes}MB`);

        if (operation === 'Get (collection)') {
            addLog('Inserting items into onyx for getting later');
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.SAMPLE, fakeData);
        }

        // Insert N items into onyx, while measuring time
        addLog(`${operation} ${itemCount} items from/into Onyx...`);
        const start = performance.now();
        if (operation === 'MergeCollection') {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.SAMPLE, fakeData);
        }
        if (operation === 'Single Merge') {
            await Onyx.merge(ONYXKEYS.SAMPLE, fakeData);
        }
        if (operation === 'Single Set') {
            await Onyx.set(ONYXKEYS.SAMPLE, fakeData);
        }
        if (operation === 'Get (collection)') {
            await new Promise((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.COLLECTION.SAMPLE,
                    waitForCollectionCallback: true,
                    callback: () => {
                        resolve();
                    },
                });
            });
        }
        const end = performance.now();

        addLog(`${operation} ${itemCount} items into Onyx in ${end - start}ms`);
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                columnGap: '1rem',
            }}
            >
                <div>
                    <b>Operation</b>
                    <Option label="Single Set" category="operation" defaultSelected />
                    <Option label="Get (collection)" category="operation" />
                    <Option label="MergeCollection" category="operation" />
                    <Option label="Single Merge" category="operation" />
                    <Option label="Clear" category="operation" />
                </div>
                <div>
                    <b>Items</b>
                    <Option label="100" category="items" value={100} defaultSelected />
                    <Option label="1,000" category="items" value={1000} />
                    <Option label="10,000" category="items" value={10000} />
                    <Option label="100,000" category="items" value={100000} />
                </div>
                <div>
                    <b>Length</b>
                    <input
                        id="length"
                        type="number"
                        defaultValue={35}
                        style={{
                            display: 'block',
                        }}
                    />
                    <b>Depth</b>
                    <input
                        id="depth"
                        type="number"
                        defaultValue={1}
                        style={{
                            display: 'block',
                        }}
                    />
                </div>
                <div>
                    <b>Database</b>
                    <Option label="Localforage/IndexedDB (Default)" category="database" defaultSelected />
                    <Option label="WebSQL" category="database" />
                    <Option label="idb-keyval/IndexedDB" category="database" />
                </div>
            </div>
            <button onClick={handleClick} type="button">Get Selected Options</button>

            <div>
                <h2>Logs</h2>
                <ul>
                    {logs.map((log, i) => <li key={i}>{log}</li>)}
                </ul>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(<App />);

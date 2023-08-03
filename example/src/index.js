/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
/* eslint-disable rulesdir/prefer-underscore-method */
/* eslint-disable rulesdir/prefer-actions-set-data */
/* eslint-disable @lwc/lwc/no-async-await */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {faker} from '@faker-js/faker';
import Onyx from '../../lib/index';

function Option({label, category, value}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: '1rem',
        }}
        >
            <input type="radio" name={category} id={label} value={value || label} />
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

function generateRandomObject(numProperties, depth) {
    if (depth <= 0) {
        return faker.word.words(); // Return a random value (e.g., word, sentence, etc.) from Faker.js
    }

    const obj = {};

    for (let i = 0; i < numProperties; i++) {
        const propName = faker.word.noun();
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

        // Setup onyx
        Onyx.init(config);

        if (operation === 'Clear') {
            addLog('Clearing Onyx...');
            await Onyx.clear();
            addLog('Cleared Onyx');
            return;
        }

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
        if (operation === 'Merge') {
            await Onyx.merge(ONYXKEYS.SAMPLE, fakeData);
        }
        if (operation === 'Set') {
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
                    <Option label="Set" category="operation" />
                    <Option label="Get (collection)" category="operation" />
                    <Option label="MergeCollection" category="operation" />
                    <Option label="Merge" category="operation" />
                    <Option label="Clear" category="operation" />
                </div>
                <div>
                    <b>Items</b>
                    <Option label="100" category="items" value={100} />
                    <Option label="1,000" category="items" value={1000} />
                    <Option label="10,000" category="items" value={10000} />
                    <Option label="100,000" category="items" value={100000} />
                </div>
                <div>
                    <b>Length</b>
                    <input
                        id="length"
                        type="number"
                        value={35}
                        style={{
                            display: 'block',
                        }}
                    />
                    <b>Depth</b>
                    <input
                        id="depth"
                        type="number"
                        value={1}
                        style={{
                            display: 'block',
                        }}
                    />
                </div>
                <div>
                    <b>Database</b>
                    <Option label="Localforage/IndexedDB (Default)" category="database" />
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

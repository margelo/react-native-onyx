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

const ONYXKEYS = {
    COLLECTION: {
        SAMPLE: 'collection_',
    },
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

function generateFakeDataAsync(count) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const fakeData = {};
            for (let i = 0; i < Number(count); i++) {
                fakeData[`${ONYXKEYS.COLLECTION.SAMPLE}${i}`] = generateRandomObject(10, 3);
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
        const database = getValue('database');

        // Setup onyx
        Onyx.init(config);

        // Generate fake data with faker
        addLog(`Generating ${itemCount} fake data items...`);
        const fakeData = await generateFakeDataAsync(itemCount);
        const bytes = JSON.stringify(fakeData).length;
        const megabytes = bytes / 1000000;
        addLog(`Generated ${itemCount} fake data items of size ${megabytes}MB`);

        // Insert N items into onyx, while measuring time
        addLog(`Inserting ${itemCount} items into Onyx...`);
        const start = performance.now();
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.SAMPLE, fakeData);
        const end = performance.now();

        addLog(`Inserted ${itemCount} items into Onyx in ${end - start}ms`);
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
                    <Option label="Get" category="operation" />
                    <Option label="Merge" category="operation" />
                </div>
                <div>
                    <b>Items</b>
                    <Option label="100" category="items" value={100} />
                    <Option label="1,000" category="items" value={1000} />
                    <Option label="10,000" category="items" value={10000} />
                    <Option label="100,000" category="items" value={100000} />
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

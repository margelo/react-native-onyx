import React from 'react';
import {createRoot} from 'react-dom/client';
import Onyx from '../../lib/index';

function App() {
    return (
        <p>Hello world</p>
    );
}

createRoot(document.getElementById('root')).render(<App />);

import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Install MiniKit
MiniKit.install();

// Render the Blaze It app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(App));

console.log('Blaze It app loaded!');
console.log('MiniKit installed:', MiniKit.isInstalled());

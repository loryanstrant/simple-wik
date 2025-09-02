import React from 'react';
import ReactDOM from 'react-dom/client';
import './monaco-config'; // Configure Monaco Editor before app starts
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
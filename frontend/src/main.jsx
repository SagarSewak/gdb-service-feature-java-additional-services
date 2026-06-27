import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global patch for Intl.NumberFormat to dynamic format currency irrespective of hardcoded component values
const OriginalNumberFormat = Intl.NumberFormat;
Intl.NumberFormat = function(locale, options) {
  if (options && options.style === 'currency') {
    let currency = 'INR';
    try {
      const stored = localStorage.getItem('gdb-global-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        currency = parsed.state?.settings?.currency || 'INR';
      }
    } catch (e) {
      console.error('Error reading persisted currency setting:', e);
    }
    const currencyLocales = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
    };
    return new OriginalNumberFormat(currencyLocales[currency] || 'en-IN', {
      ...options,
      currency: currency,
    });
  }
  return new OriginalNumberFormat(locale, options);
};

// Copy prototype properties
Intl.NumberFormat.prototype = OriginalNumberFormat.prototype;
Intl.NumberFormat.supportedLocalesOf = OriginalNumberFormat.supportedLocalesOf;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


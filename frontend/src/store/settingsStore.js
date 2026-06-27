import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useThemeStore from './themeStore';

const currencyLocales = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
        theme: 'light',
      },
      loading: false,

      fetchSettings: async () => {
        // Purely frontend logic: sync theme with the loaded state
        const data = get().settings;
        if (data && data.theme) {
          useThemeStore.getState().setTheme(data.theme);
        }
      },

      updateSettings: async (newSettings) => {
        // Purely frontend logic: update store state (persisted automatically by Zustand)
        set({ settings: newSettings });
        if (newSettings.theme) {
          useThemeStore.getState().setTheme(newSettings.theme);
        }
        return newSettings;
      },

      // Helper to format currency
      formatCurrency: (amount) => {
        const { currency } = get().settings;
        const locale = currencyLocales[currency] || 'en-IN';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
        }).format(amount || 0);
      },

      // Helper to get currency symbol
      getCurrencySymbol: () => {
        const { currency } = get().settings;
        return currencySymbols[currency] || '₹';
      },

      // Helper to format date with timezone and date format preferences
      formatDate: (dateValue, includeTime = true) => {
        if (!dateValue) return '';
        const { timezone, dateFormat } = get().settings;
        
        // Parse date safely
        let date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        if (isNaN(date.getTime())) {
          // Try parsing custom format if it is a string with space
          if (typeof dateValue === 'string') {
            const normalized = dateValue.replace(' ', 'T');
            date = new Date(normalized);
          }
        }
        if (isNaN(date.getTime())) return String(dateValue);

        // Map DD/MM/YYYY -> day: '2-digit', month: '2-digit', year: 'numeric'
        // Map MM/DD/YYYY -> month: '2-digit', day: '2-digit', year: 'numeric'
        // Map YYYY-MM-DD -> year: 'numeric', month: '2-digit', day: '2-digit'
        
        try {
          // We format using Intl.DateTimeFormat
          const options = {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          };
          
          if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
          }

          const formatter = new Intl.DateTimeFormat('en-US', options);
          const parts = formatter.formatToParts(date);
          
          const day = parts.find(p => p.type === 'day')?.value || '';
          const month = parts.find(p => p.type === 'month')?.value || '';
          const year = parts.find(p => p.type === 'year')?.value || '';
          const hour = parts.find(p => p.type === 'hour')?.value || '';
          const minute = parts.find(p => p.type === 'minute')?.value || '';
          const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || '';

          let formattedDate = '';
          if (dateFormat === 'MM/DD/YYYY') {
            formattedDate = `${month}/${day}/${year}`;
          } else if (dateFormat === 'YYYY-MM-DD') {
            formattedDate = `${year}-${month}-${day}`;
          } else {
            // default DD/MM/YYYY
            formattedDate = `${day}/${month}/${year}`;
          }

          if (includeTime && hour && minute) {
            const timeStr = `${hour}:${minute} ${dayPeriod}`;
            return `${formattedDate}, ${timeStr}`;
          }

          return formattedDate;
        } catch (e) {
          console.error('Error formatting date:', e);
          return date.toLocaleDateString();
        }
      }
    }),
    {
      name: 'gdb-global-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useSettingsStore;

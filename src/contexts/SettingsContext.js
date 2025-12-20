import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGlobalSettings } from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteName: 'AR ONE',
        logoUrl: '',
        primaryColor: '#cf1020',
        secondaryColor: '#1a1a1a',
        emailNotifications: true,
        maintenanceMode: false,
        currency: 'LKR',
        sessionTimeout: 30,
        contactEmail: '',
        contactPhone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);

    // Helper to darken/lighten color (simple implementation)
    const adjustColor = (hex, amt) => {
        let col = hex.replace(/^#/, '');
        if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
        let [r, g, b] = col.match(/.{2}/g).map(x => parseInt(x, 16));

        r = Math.max(0, Math.min(255, r + amt));
        g = Math.max(0, Math.min(255, g + amt));
        b = Math.max(0, Math.min(255, b + amt));

        const getHex = n => n.toString(16).padStart(2, '0');
        return `#${getHex(r)}${getHex(g)}${getHex(b)}`;
    };

    const applyStyles = (data) => {
        try {
            if (data.primaryColor) {
                const primary = data.primaryColor;
                document.documentElement.style.setProperty('--primary-color', primary);
                document.documentElement.style.setProperty('--primary-dark', adjustColor(primary, -30));
                document.documentElement.style.setProperty('--primary-light', adjustColor(primary, 40));
                document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primary} 0%, ${adjustColor(primary, 40)} 100%)`);
            }
            if (data.secondaryColor) {
                const secondary = data.secondaryColor;
                document.documentElement.style.setProperty('--secondary-color', secondary);
                document.documentElement.style.setProperty('--secondary-dark', adjustColor(secondary, -20));
                document.documentElement.style.setProperty('--secondary-light', adjustColor(secondary, 30));
                document.documentElement.style.setProperty('--secondary-gradient', `linear-gradient(135deg, ${secondary} 0%, ${adjustColor(secondary, 30)} 100%)`);
            }
        } catch (cssError) {
            console.error('Error applying theme styles:', cssError);
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getGlobalSettings();
                setSettings(data);
                applyStyles(data);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const value = {
        settings,
        loading,
        refreshSettings: async () => {
            const data = await getGlobalSettings();
            setSettings(data);
            applyStyles(data);
        }
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

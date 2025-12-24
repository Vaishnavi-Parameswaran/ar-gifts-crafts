import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SETTINGS_DOC_ID = 'global';
const SETTINGS_COLLECTION = 'settings';

export const getGlobalSettings = async () => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);

        const defaultSettings = {
            siteName: 'AR ONE',
            logoUrl: '',
            primaryColor: '#cf1020',
            secondaryColor: '#1a1a1a',
            emailNotifications: true,
            maintenanceMode: false,
            currency: 'LKR',
            sessionTimeout: 30,
            contactEmail: 'support@arone.com',
            contactPhone: '+94 77 123 4567',
            address: 'Colombo, Sri Lanka'
        };

        if (docSnap.exists()) {
            return { ...defaultSettings, ...docSnap.data() };
        } else {
            return defaultSettings;
        }
    } catch (error) {
        console.error("Error getting settings:", error);
        throw error;
    }
};

export const updateGlobalSettings = async (settings) => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        // Use setDoc with merge: true to ensure we don't overwrite if document is missing partial fields initially
        await setDoc(docRef, settings, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating settings:", error);
        throw error;
    }
};

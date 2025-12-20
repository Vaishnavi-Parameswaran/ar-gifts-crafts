import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const CONTACT_COLLECTION = 'contact_messages';

/**
 * Submit a contact/support message
 * @param {Object} data - { name, email, subject, message, userId (optional), orderId (optional) }
 */
export const submitContactMessage = async (data) => {
    try {
        const docRef = await addDoc(collection(db, CONTACT_COLLECTION), {
            ...data,
            status: 'new',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error submitting contact message:', error);
        throw error;
    }
};

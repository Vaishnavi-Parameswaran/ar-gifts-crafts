// User Service - Handles user profile and account operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../config/firebase';

const USERS_COLLECTION = 'users';

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Get all users (admin)
export const getAllUsers = async (role = null) => {
    try {
        let q = query(
            collection(db, USERS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        if (role) {
            q = query(q, where('role', '==', role));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (userId, updates, avatarFile = null) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        let newPhotoURL = updates.photoURL;

        if (avatarFile) {
            const avatarRef = ref(storage, `users/${userId}/avatar_${Date.now()}`);
            await uploadBytes(avatarRef, avatarFile);
            newPhotoURL = await getDownloadURL(avatarRef);
            updates.avatar = newPhotoURL;
            updates.photoURL = newPhotoURL;
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        // Update Firebase Auth Profile for global consistency
        const user = auth.currentUser;
        if (user && user.uid === userId) {
            const authUpdates = {};
            if (updates.displayName) authUpdates.displayName = updates.displayName;
            if (newPhotoURL) authUpdates.photoURL = newPhotoURL;

            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(user, authUpdates);
            }
        }

        return { id: userId, ...updates };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Update user status (admin)
export const updateUserStatus = async (userId, status) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

// Update user role (admin)
export const updateUserRole = async (userId, role) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            role,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No authenticated user');

        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        return true;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// Change email
export const changeEmail = async (newEmail, currentPassword) => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No authenticated user');

        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update email
        await updateEmail(user, newEmail);

        // Update email in Firestore
        const docRef = doc(db, USERS_COLLECTION, user.uid);
        await updateDoc(docRef, {
            email: newEmail,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error changing email:', error);
        throw error;
    }
};

// Manage addresses
export const getUserAddresses = async (userId) => {
    try {
        const user = await getUserById(userId);
        return user?.addresses || [];
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

export const addAddress = async (userId, address) => {
    try {
        const user = await getUserById(userId);
        const addresses = user?.addresses || [];

        const newAddress = {
            id: Date.now().toString(),
            ...address,
            isDefault: addresses.length === 0 ? true : address.isDefault || false
        };

        // If new address is default, unset other defaults
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: newAddress.isDefault ? false : addr.isDefault
        }));
        updatedAddresses.push(newAddress);

        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            addresses: updatedAddresses,
            updatedAt: serverTimestamp()
        });

        return newAddress;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

export const updateAddress = async (userId, addressId, updates) => {
    try {
        const user = await getUserById(userId);
        let addresses = user?.addresses || [];

        // If setting as default, unset other defaults
        if (updates.isDefault) {
            addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        addresses = addresses.map(addr =>
            addr.id === addressId ? { ...addr, ...updates } : addr
        );

        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            addresses,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

export const deleteAddress = async (userId, addressId) => {
    try {
        const user = await getUserById(userId);
        const addresses = (user?.addresses || []).filter(addr => addr.id !== addressId);

        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            addresses,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

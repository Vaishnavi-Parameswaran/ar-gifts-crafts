// Authentication Context - Manages user authentication state across the app
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new user
    const register = async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, {
                displayName: userData.displayName
            });

            // Create user profile in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName,
                phone: userData.phone || '',
                role: userData.role || 'customer',
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return user;
        } catch (error) {
            console.error("AuthContext Register Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            throw error; // Re-throw to be handled by the component
        }
    };

    // Login user
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    // Logout user
    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    // Google Sign-In
    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create new user profile if first time
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                phone: user.phoneNumber || '',
                role: 'customer', // Default role
                status: 'active',
                avatar: user.photoURL,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return user;
    };

    // Reset password
    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
    };

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid) => {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    };

    // Check if user is admin
    const isAdmin = () => {
        return userProfile?.role === 'admin';
    };

    // Check if user is vendor
    const isVendor = () => {
        return userProfile?.role === 'vendor';
    };

    // Check if user is customer
    const isCustomer = () => {
        return userProfile?.role === 'customer';
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const profile = await fetchUserProfile(user.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Manual profile refresh
    const refreshProfile = async () => {
        if (currentUser) {
            const profile = await fetchUserProfile(currentUser.uid);
            setUserProfile(profile);
            return profile;
        }
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        register,
        login,
        logout,
        resetPassword,
        fetchUserProfile,
        isAdmin,
        isVendor,
        isCustomer,
        googleSignIn,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

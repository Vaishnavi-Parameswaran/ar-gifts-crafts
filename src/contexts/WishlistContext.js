// Wishlist Context - Manages user wishlist
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            const wishlistRef = doc(db, 'wishlists', currentUser.uid);
            const unsubscribe = onSnapshot(wishlistRef, (doc) => {
                if (doc.exists()) {
                    setWishlistItems(doc.data().items || []);
                } else {
                    setWishlistItems([]);
                }
                setLoading(false);
            });
            return unsubscribe;
        } else {
            setWishlistItems([]);
            setLoading(false);
        }
    }, [currentUser]);

    const saveWishlist = async (items) => {
        if (currentUser) {
            const wishlistRef = doc(db, 'wishlists', currentUser.uid);
            await setDoc(wishlistRef, {
                userId: currentUser.uid,
                items,
                updatedAt: serverTimestamp()
            });
        }
    };

    const addToWishlist = async (product) => {
        if (!currentUser) {
            throw new Error('Please login to add items to wishlist');
        }

        const exists = wishlistItems.some(item => item.productId === product.id);
        if (exists) return;

        const newItems = [...wishlistItems, {
            productId: product.id,
            name: product.name,
            price: product.salePrice || product.price,
            originalPrice: product.price,
            image: product.images?.[0] || '',
            vendorId: product.vendorId,
            vendorName: product.vendorName,
            addedAt: new Date().toISOString()
        }];

        setWishlistItems(newItems);
        await saveWishlist(newItems);
    };

    const removeFromWishlist = async (productId) => {
        const newItems = wishlistItems.filter(item => item.productId !== productId);
        setWishlistItems(newItems);
        await saveWishlist(newItems);
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

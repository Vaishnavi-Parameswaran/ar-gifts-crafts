// Cart Context - Manages shopping cart state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Sync cart with Firestore when user is logged in
    useEffect(() => {
        if (currentUser) {
            const cartRef = doc(db, 'carts', currentUser.uid);
            const unsubscribe = onSnapshot(cartRef, (doc) => {
                if (doc.exists()) {
                    setCartItems(doc.data().items || []);
                } else {
                    setCartItems([]);
                }
                setLoading(false);
            });
            return unsubscribe;
        } else {
            // Load from localStorage for guest users
            const localCart = localStorage.getItem('guestCart');
            setCartItems(localCart ? JSON.parse(localCart) : []);
            setLoading(false);
        }
    }, [currentUser]);

    // Save cart to Firestore or localStorage
    const saveCart = async (items) => {
        if (currentUser) {
            const cartRef = doc(db, 'carts', currentUser.uid);
            // Sanitize items just in case to remove undefined fields
            const sanitizedItems = items.map(item => {
                const cleanItem = { ...item };
                Object.keys(cleanItem).forEach(key => {
                    if (cleanItem[key] === undefined) {
                        delete cleanItem[key];
                    }
                });
                return cleanItem;
            });

            await setDoc(cartRef, {
                userId: currentUser.uid,
                items: sanitizedItems,
                updatedAt: serverTimestamp()
            });
            // Update local state immediately to avoid race conditions with onSnapshot
            setCartItems(sanitizedItems);
        } else {
            localStorage.setItem('guestCart', JSON.stringify(items));
        }
    };

    // Add item to cart
    const addToCart = async (product, quantity = 1, selectedVariant = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                setCartItems(prevItems => {
                    const existingIndex = prevItems.findIndex(
                        item => item.productId === product.id &&
                            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
                    );

                    let newItems;
                    if (existingIndex > -1) {
                        newItems = prevItems.map((item, index) =>
                            index === existingIndex
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        newItems = [...prevItems, {
                            productId: product.id,
                            name: product.name,
                            price: product.salePrice || product.price,
                            originalPrice: product.price,
                            image: product.images?.[0] || '',
                            vendorId: product.vendorId,
                            vendorName: product.vendorName,
                            selectedVariant,
                            quantity,
                            addedAt: new Date().toISOString()
                        }];
                    }

                    // Save to DB in background
                    saveCart(newItems);
                    return newItems;
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };

    // Update item quantity
    const updateQuantity = async (productId, quantity, selectedVariant = null) => {
        if (quantity < 1) {
            await removeFromCart(productId, selectedVariant);
            return;
        }

        const newItems = cartItems.map(item =>
            item.productId === productId &&
                JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
                ? { ...item, quantity }
                : item
        );

        setCartItems(newItems);
        await saveCart(newItems);
    };

    // Remove item from cart
    const removeFromCart = async (productId, selectedVariant = null) => {
        const newItems = cartItems.filter(item =>
            !(item.productId === productId &&
                JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
        );

        setCartItems(newItems);
        await saveCart(newItems);
    };

    // Clear entire cart
    const clearCart = async () => {
        setCartItems([]);
        await saveCart([]);
    };

    // Calculate totals
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // Transfer guest cart to user cart after login
    const transferGuestCart = async (user = currentUser) => {
        if (user) {
            const localCart = localStorage.getItem('guestCart');
            if (localCart) {
                const guestItems = JSON.parse(localCart);
                if (guestItems.length > 0) {
                    const cartRef = doc(db, 'carts', user.uid);
                    const existingCart = await getDoc(cartRef);
                    let mergedItems = guestItems;

                    if (existingCart.exists()) {
                        const existingItems = existingCart.data().items || [];
                        mergedItems = [...existingItems];

                        guestItems.forEach(guestItem => {
                            const existingIndex = mergedItems.findIndex(
                                item => item.productId === guestItem.productId
                            );
                            if (existingIndex > -1) {
                                mergedItems[existingIndex].quantity += guestItem.quantity;
                            } else {
                                mergedItems.push(guestItem);
                            }
                        });
                    }

                    await saveCart(mergedItems);
                    setCartItems(mergedItems);
                    localStorage.removeItem('guestCart');
                }
            }
        }
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        transferGuestCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

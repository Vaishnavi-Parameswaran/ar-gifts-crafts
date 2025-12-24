// Coupon Service - Handles discount coupons and promotions
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COUPONS_COLLECTION = 'coupons';

// Validate coupon
export const validateCoupon = async (code, cartTotal, customerId = null) => {
    try {
        const q = query(
            collection(db, COUPONS_COLLECTION),
            where('code', '==', code.toUpperCase()),
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { valid: false, message: 'Invalid coupon code' };
        }

        const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate.toDate()) < new Date()) {
            return { valid: false, message: 'Coupon has expired' };
        }

        // Check start date
        if (coupon.startDate && new Date(coupon.startDate.toDate()) > new Date()) {
            return { valid: false, message: 'Coupon is not yet active' };
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
            return {
                valid: false,
                message: `Minimum order amount is Rs. ${coupon.minOrderAmount}`
            };
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return { valid: false, message: 'Coupon usage limit reached' };
        }

        // Check per-user limit
        if (coupon.perUserLimit && customerId) {
            const usageCount = coupon.usedBy?.filter(id => id === customerId).length || 0;
            if (usageCount >= coupon.perUserLimit) {
                return { valid: false, message: 'You have already used this coupon' };
            }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        return {
            valid: true,
            coupon,
            discount: Math.round(discount * 100) / 100,
            message: `Coupon applied! You save Rs. ${discount.toFixed(2)}`
        };
    } catch (error) {
        console.error('Error validating coupon:', error);
        throw error;
    }
};

// Mark coupon as used
export const useCoupon = async (couponId, customerId) => {
    try {
        const docRef = doc(db, COUPONS_COLLECTION, couponId);
        const couponDoc = await getDoc(docRef);

        if (couponDoc.exists()) {
            const coupon = couponDoc.data();
            await updateDoc(docRef, {
                usedCount: (coupon.usedCount || 0) + 1,
                usedBy: [...(coupon.usedBy || []), customerId],
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('Error using coupon:', error);
        throw error;
    }
};

// Get all coupons (admin)
export const getAllCoupons = async () => {
    try {
        const q = collection(db, COUPONS_COLLECTION);
        // Removed orderBy to avoid index error if we add filters later

        const snapshot = await getDocs(q);
        const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return coupons.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    } catch (error) {
        console.error('Error fetching coupons:', error);
        throw error;
    }
};

// Get active coupons for customers
export const getActiveCoupons = async () => {
    try {
        const now = new Date();
        const q = query(
            collection(db, COUPONS_COLLECTION),
            where('status', '==', 'active'),
            where('isPublic', '==', true)
            // Removed orderBy which causes index error
        );

        const snapshot = await getDocs(q);
        const coupons = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(coupon => {
                if (coupon.expiryDate && new Date(coupon.expiryDate.toDate()) < now) return false;
                if (coupon.startDate && new Date(coupon.startDate.toDate()) > now) return false;
                if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
                return true;
            });

        return coupons.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    } catch (error) {
        console.error('Error fetching active coupons:', error);
        throw error;
    }
};

// Create coupon (admin)
export const createCoupon = async (couponData) => {
    try {
        const newCoupon = {
            code: couponData.code.toUpperCase(),
            description: couponData.description || '',
            discountType: couponData.discountType, // percentage or fixed
            discountValue: couponData.discountValue,
            minOrderAmount: couponData.minOrderAmount || 0,
            maxDiscount: couponData.maxDiscount || null,
            usageLimit: couponData.usageLimit || null,
            perUserLimit: couponData.perUserLimit || 1,
            usedCount: 0,
            usedBy: [],
            startDate: couponData.startDate || null,
            expiryDate: couponData.expiryDate || null,
            applicableCategories: couponData.applicableCategories || [],
            applicableVendors: couponData.applicableVendors || [],
            isPublic: couponData.isPublic !== false,
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COUPONS_COLLECTION), newCoupon);
        return { id: docRef.id, ...newCoupon };
    } catch (error) {
        console.error('Error creating coupon:', error);
        throw error;
    }
};

// Update coupon (admin)
export const updateCoupon = async (couponId, updates) => {
    try {
        const docRef = doc(db, COUPONS_COLLECTION, couponId);

        if (updates.code) {
            updates.code = updates.code.toUpperCase();
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        return { id: couponId, ...updates };
    } catch (error) {
        console.error('Error updating coupon:', error);
        throw error;
    }
};

// Delete coupon (admin)
export const deleteCoupon = async (couponId) => {
    try {
        await deleteDoc(doc(db, COUPONS_COLLECTION, couponId));
        return true;
    } catch (error) {
        console.error('Error deleting coupon:', error);
        throw error;
    }
};

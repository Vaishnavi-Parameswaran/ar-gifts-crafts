// Vendor Service - Handles all vendor-related Firestore operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { getVendorOrders } from './orderService';

const VENDORS_COLLECTION = 'vendors';

// Register as vendor
export const registerVendor = async (userId, vendorData, documents = {}) => {
    // 20 Second Timeout
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 20000)
    );

    const registrationLogic = async () => {
        try {
            const docRef = doc(db, VENDORS_COLLECTION, userId);

            // Process verification documents
            const uploadedDocs = {};
            if (Object.keys(documents).length > 0) {
                try {
                    console.log('Processing documents...');
                    const uploadPromise = async () => {
                        for (const [key, value] of Object.entries(documents)) {
                            if (value) {
                                if (typeof value === 'string') {
                                    // If it's a URL string, save it directly
                                    uploadedDocs[key] = value;
                                } else if (value instanceof File) {
                                    // If it's a File object (legacy/if storage worked), try upload
                                    console.log(`Uploading ${key}...`);
                                    try {
                                        const storageRef = ref(storage, `vendors/${userId}/${key}_${Date.now()}`);
                                        await uploadBytes(storageRef, value, { contentType: value.type });
                                        uploadedDocs[key] = await getDownloadURL(storageRef);
                                    } catch (err) {
                                        console.warn(`Failed to upload ${key}, skipping:`, err);
                                    }
                                }
                            }
                        }
                    };

                    await uploadPromise();
                } catch (ProcessingError) {
                    console.error("Document processing error:", ProcessingError);
                }
            } else {
                console.log('No documents provided.');
            }

            console.log('Saving vendor data to Firestore...');
            const newVendor = {
                userId,
                businessName: vendorData.businessName,
                businessDescription: vendorData.businessDescription,
                businessEmail: vendorData.businessEmail,
                businessPhone: vendorData.businessPhone,
                businessAddress: vendorData.businessAddress,
                businessType: vendorData.businessType,
                taxId: vendorData.taxId || '',
                bankDetails: {
                    accountName: vendorData.bankAccountName || '',
                    accountNumber: vendorData.bankAccountNumber || '',
                    bankName: vendorData.bankName || '',
                    ifscCode: vendorData.ifscCode || ''
                },
                documents: uploadedDocs,
                logo: '',
                banner: '',
                status: 'pending', // pending, approved, suspended, rejected
                commissionRate: 10, // Default 10% platform commission
                rating: 0,
                reviewCount: 0,
                totalSales: 0,
                totalEarnings: 0,
                availableBalance: 0,
                pendingBalance: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(docRef, newVendor);
            console.log('Vendor data saved successfully!');
            return { id: userId, ...newVendor };
        } catch (error) {
            console.error('Error registering vendor:', error);
            throw error;
        }
    };

    return Promise.race([registrationLogic(), timeout]);
};

// Get vendor by ID
export const getVendorById = async (vendorId) => {
    try {
        const docRef = doc(db, VENDORS_COLLECTION, vendorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching vendor:', error);
        throw error;
    }
};

// Get all vendors (admin)
export const getAllVendors = async (status = null) => {
    try {
        let q = query(
            collection(db, VENDORS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        if (status) {
            q = query(q, where('status', '==', status));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
    }
};

// Update vendor profile
export const updateVendorProfile = async (vendorId, updates, logoFile = null, bannerFile = null) => {
    try {
        const docRef = doc(db, VENDORS_COLLECTION, vendorId);

        if (logoFile) {
            if (typeof logoFile === 'string') {
                updates.logo = logoFile;
            } else {
                try {
                    const logoRef = ref(storage, `vendors/${vendorId}/logo_${Date.now()}`);
                    await uploadBytes(logoRef, logoFile, { contentType: logoFile.type });
                    updates.logo = await getDownloadURL(logoRef);
                } catch (e) {
                    console.warn("Logo upload failed:", e);
                }
            }
        }

        if (bannerFile) {
            if (typeof bannerFile === 'string') {
                updates.banner = bannerFile;
            } else {
                try {
                    const bannerRef = ref(storage, `vendors/${vendorId}/banner_${Date.now()}`);
                    await uploadBytes(bannerRef, bannerFile, { contentType: bannerFile.type });
                    updates.banner = await getDownloadURL(bannerRef);
                } catch (e) {
                    console.warn("Banner upload failed:", e);
                }
            }
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        return { id: vendorId, ...updates };
    } catch (error) {
        console.error('Error updating vendor profile:', error);
        throw error;
    }
};

// Update vendor status (admin)
export const updateVendorStatus = async (vendorId, status, reason = '') => {
    try {
        const docRef = doc(db, VENDORS_COLLECTION, vendorId);
        await updateDoc(docRef, {
            status,
            statusReason: reason,
            statusUpdatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating vendor status:', error);
        throw error;
    }
};

// Get vendor statistics
export const getVendorStats = async (vendorId) => {
    try {
        const vendorIds = Array.isArray(vendorId) ? vendorId : [vendorId];

        let totalStats = {
            totalProducts: 0,
            activeProducts: 0,
            totalSales: 0,
            totalEarnings: 0,
            availableBalance: 0,
            pendingBalance: 0,
            rating: 0,
            reviewCount: 0
        };

        // Fetch each vendor doc and sum up
        const vendorDocs = await Promise.all(vendorIds.map(id => getVendorById(id)));
        vendorDocs.forEach(v => {
            if (v) {
                totalStats.totalSales += v.totalSales || 0;
                totalStats.totalEarnings += v.totalEarnings || 0;
                totalStats.availableBalance += v.availableBalance || 0;
                totalStats.pendingBalance += v.pendingBalance || 0;

                // For rating, we take the best one or could do weighted average
                // Here we'll treat the rating from the doc with most reviews as primary
                if (v.reviewCount > totalStats.reviewCount) {
                    totalStats.rating = v.rating;
                }
                totalStats.reviewCount += v.reviewCount || 0;
            }
        });

        // Get products count across all IDs
        const productsQuery = query(
            collection(db, 'products'),
            where('vendorId', 'in', vendorIds)
        );
        const productsSnap = await getDocs(productsQuery);
        totalStats.totalProducts = productsSnap.size;
        totalStats.activeProducts = productsSnap.docs.filter(doc => doc.data().status === 'approved').length;

        return totalStats;
    } catch (error) {
        console.error('Error fetching vendor stats:', error);
        throw error;
    }
};

// Process vendor payout
export const processVendorPayout = async (vendorId, amount, payoutDetails) => {
    try {
        const vendor = await getVendorById(vendorId);
        if (!vendor || vendor.availableBalance < amount) {
            throw new Error('Insufficient balance for payout');
        }

        // Create payout record
        const payoutRef = collection(db, 'payouts');
        await setDoc(doc(payoutRef), {
            vendorId,
            amount,
            status: 'pending',
            bankDetails: vendor.bankDetails,
            ...payoutDetails,
            createdAt: serverTimestamp()
        });

        // Update vendor balance
        const docRef = doc(db, VENDORS_COLLECTION, vendorId);
        await updateDoc(docRef, {
            availableBalance: vendor.availableBalance - amount,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error processing payout:', error);
        throw error;
    }
};

// Get vendor payouts
export const getVendorPayouts = async (vendorId) => {
    try {
        const q = query(
            collection(db, 'payouts'),
            where('vendorId', '==', vendorId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching payouts:', error);
        throw error;
    }
};

// Get vendor customers (from orders)
export const getVendorCustomers = async (vendorId) => {
    try {
        // Get orders efficiently (relies on orderService proper filtering)
        const orders = await getVendorOrders(vendorId);

        // Extract unique customers
        const customersMap = new Map();

        orders.forEach(order => {
            if (!customersMap.has(order.customerId)) {
                customersMap.set(order.customerId, {
                    id: order.customerId,
                    name: order.customerName,
                    email: order.customerEmail,
                    phone: order.shippingAddress?.phone || 'N/A',
                    city: order.shippingAddress?.city || 'N/A',
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrderDate: order.createdAt
                });
            }

            const customer = customersMap.get(order.customerId);
            customer.totalOrders += 1;

            // Calculate spent amount for this vendor specific items
            const vendorOrderPart = order.vendorOrders.find(vo => vo.vendorId === vendorId);
            if (vendorOrderPart) {
                // Approximate spent if subtotal not explicitly stored in vendorOrder part (but createOrder stores it)
                customer.totalSpent += vendorOrderPart.subtotal || 0;
            }
        });

        return Array.from(customersMap.values());
    } catch (error) {
        console.error('Error fetching vendor customers:', error);
        throw error;
    }
};

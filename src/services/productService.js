// Product Service - Handles all product-related Firestore operations
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
    limit,
    startAfter,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { createNotification, NotificationTemplates } from './notificationService';

const PRODUCTS_COLLECTION = 'products';

// Get all products with optional filters and pagination
export const getProducts = async (filters = {}, lastDoc = null, pageSize = 12) => {
    try {
        let q = collection(db, PRODUCTS_COLLECTION);
        const conditions = [];

        // IMPORTANT: Only show approved products to customers unless explicitly specified
        if (filters.status === undefined && !filters.includeUnapproved) {
            conditions.push(where('status', '==', 'approved'));
        } else if (filters.status) {
            conditions.push(where('status', '==', filters.status));
        }

        // Apply other filters
        if (filters.category) {
            conditions.push(where('category', '==', filters.category));
        }
        if (filters.vendorId) {
            conditions.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters.minPrice !== undefined) {
            conditions.push(where('price', '>=', filters.minPrice));
        }
        if (filters.maxPrice !== undefined) {
            conditions.push(where('price', '<=', filters.maxPrice));
        }
        if (filters.featured) {
            conditions.push(where('featured', '==', true));
        }

        // Build query with conditions
        if (conditions.length > 0) {
            q = query(q, ...conditions);
        }

        // Add limit (no orderBy to avoid composite index requirement)
        q = query(q, limit(pageSize));

        // Pagination
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        let products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort in memory
        const orderByField = filters.orderBy || 'createdAt';
        const orderDirection = filters.orderDirection || 'desc';

        products.sort((a, b) => {
            let aVal = a[orderByField];
            let bVal = b[orderByField];

            // Handle Firestore timestamps
            if (aVal?.toMillis) aVal = aVal.toMillis();
            if (bVal?.toMillis) bVal = bVal.toMillis();

            if (orderDirection === 'desc') {
                return (bVal || 0) - (aVal || 0);
            } else {
                return (aVal || 0) - (bVal || 0);
            }
        });

        // FILTER OUT PRODUCTS FROM SUSPENDED VENDORS
        // Fetch vendor status for all unique vendor IDs
        const vendorIds = [...new Set(products.map(p => p.vendorId).filter(id => id))];
        const vendorStatusMap = {};

        // Batch fetch vendor statuses
        if (vendorIds.length > 0 && !filters.includeSuspended) {
            const vendorPromises = vendorIds.map(async (vendorId) => {
                try {
                    const vendorDoc = await getDoc(doc(db, 'vendors', vendorId));
                    return {
                        id: vendorId,
                        status: vendorDoc.exists() ? vendorDoc.data().status : 'unknown'
                    };
                } catch (err) {
                    console.warn(`Could not fetch vendor ${vendorId}:`, err);
                    return { id: vendorId, status: 'unknown' };
                }
            });

            const vendorResults = await Promise.all(vendorPromises);
            vendorResults.forEach(v => {
                vendorStatusMap[v.id] = v.status;
            });

            // Filter out products from suspended vendors
            const beforeCount = products.length;
            products = products.filter(product => {
                const vendorStatus = vendorStatusMap[product.vendorId];
                return vendorStatus === 'approved'; // Only show approved vendor products
            });
            const filteredCount = beforeCount - products.length;
            if (filteredCount > 0) {
                console.log(`🚫 Filtered out ${filteredCount} products from suspended vendors`);
            }
        }

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        const hasMore = snapshot.docs.length === pageSize;

        return { products, lastVisible, hasMore };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get single product by ID
export const getProductById = async (productId) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const productData = { id: docSnap.id, ...docSnap.data() };

            // Try to fetch vendor name and STATUS if not present in product doc
            if (productData.vendorId) {
                try {
                    const vendorSnap = await getDoc(doc(db, 'vendors', productData.vendorId));
                    if (vendorSnap.exists()) {
                        const vendorData = vendorSnap.data();
                        productData.vendorName = vendorData.businessName;

                        // CHECK VENDOR STATUS - Hide product if vendor is suspended
                        if (vendorData.status === 'suspended') {
                            console.log(`🚫 Product ${productId} belongs to suspended vendor`);
                            return null; // Hide product from suspended vendor
                        }
                    }
                } catch (e) {
                    console.warn('Could not fetch vendor info for product:', e);
                }
            }

            return productData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

// Create new product
export const createProduct = async (productData, imageFiles = []) => {
    try {
        // Upload images first
        const imageUrls = await Promise.all(
            imageFiles.map(async (file) => {
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file, { contentType: file.type });
                return getDownloadURL(storageRef);
            })
        );

        const newProduct = {
            ...productData,
            images: imageUrls,
            status: 'pending', // Requires admin approval
            views: 0,
            sales: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), newProduct);
        return { id: docRef.id, ...newProduct };
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// Update product
// Update product

export const updateProduct = async (productId, updates, newImageFiles = []) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);

        // Upload new images if provided
        if (newImageFiles.length > 0) {
            const newImageUrls = await Promise.all(
                newImageFiles.map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file, { contentType: file.type });
                    return getDownloadURL(storageRef);
                })
            );
            updates.images = [...(updates.images || []), ...newImageUrls];
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        // Trigger notification if status changed
        if (updates.status && ['approved', 'rejected'].includes(updates.status)) {
            const productDoc = await getDoc(docRef);
            if (productDoc.exists()) {
                const product = productDoc.data();
                if (product.vendorId) {
                    let notification = null;
                    if (updates.status === 'approved') {
                        notification = NotificationTemplates.productApproved(product.name);
                    } else if (updates.status === 'rejected') {
                        notification = NotificationTemplates.productRejected(product.name, 'Admin decision');
                    }

                    if (notification) {
                        // Add vendorId as userId for the notification
                        await createNotification({ ...notification, userId: product.vendorId });
                    }
                }
            }
        }

        return { id: productId, ...updates };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Delete product
export const deleteProduct = async (productId) => {
    try {
        // Get product to delete associated images
        const product = await getProductById(productId);

        if (product?.images) {
            await Promise.all(
                product.images.map(async (imageUrl) => {
                    try {
                        const imageRef = ref(storage, imageUrl);
                        await deleteObject(imageRef);
                    } catch (e) {
                        console.warn('Could not delete image:', e);
                    }
                })
            );
        }

        await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Increment product views
export const incrementProductViews = async (productId) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        await updateDoc(docRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
};

// Search products
export const searchProducts = async (searchTerm, pageSize = 20) => {
    try {
        // Note: For production, use Algolia or Elasticsearch for proper full-text search
        // This is a basic implementation using Firestore
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('status', '==', 'approved'),
            orderBy('name'),
            limit(pageSize)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );

        return products;
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

// Get featured products
export const getFeaturedProducts = async (limitCount = 8) => {
    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('featured', '==', true),
            where('status', '==', 'approved'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by createdAt in memory
        return products.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
    }
};

// Get products by category
export const getProductsByCategory = async (category, pageSize = 100) => {
    try {
        // Query without orderBy to avoid index requirements
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('category', '==', category),
            where('status', '==', 'approved'),
            limit(pageSize)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory by createdAt
        return products.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        // If composite index error, try simpler query
        if (error.code === 'failed-precondition') {
            console.log('Trying fallback query without compound filter...');
            try {
                const simpleQuery = query(
                    collection(db, PRODUCTS_COLLECTION),
                    where('category', '==', category),
                    limit(pageSize)
                );
                const snapshot = await getDocs(simpleQuery);
                const products = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => p.status === 'approved');

                return products.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return bTime - aTime;
                });
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                throw fallbackError;
            }
        }
        throw error;
    }
};

// Get vendor products
export const getVendorProducts = async (vendorId, status = null) => {
    try {
        let q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('vendorId', '==', vendorId)
            // orderBy('createdAt', 'desc') // Temporarily disabled to ensure data loads
        );

        if (status) {
            q = query(q, where('status', '==', status));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        throw error;
    }
};

// Category Service - Handles all category-related Firestore operations
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const CATEGORIES_COLLECTION = 'categories';

// Get all categories
export const getAllCategories = async () => {
    try {
        const q = query(
            collection(db, CATEGORIES_COLLECTION),
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by order in memory
        return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get parent categories only
export const getParentCategories = async () => {
    try {
        const q = query(
            collection(db, CATEGORIES_COLLECTION),
            where('status', '==', 'active'),
            where('parentId', '==', null)
        );

        const snapshot = await getDocs(q);
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by order in memory
        return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error('Error fetching parent categories:', error);
        throw error;
    }
};

// Get subcategories
export const getSubcategories = async (parentId) => {
    try {
        const q = query(
            collection(db, CATEGORIES_COLLECTION),
            where('status', '==', 'active'),
            where('parentId', '==', parentId)
        );

        const snapshot = await getDocs(q);
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by order in memory
        return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
    }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
    try {
        const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
};

// Get category by slug
export const getCategoryBySlug = async (slug) => {
    try {
        const q = query(
            collection(db, CATEGORIES_COLLECTION),
            where('slug', '==', slug)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        throw error;
    }
};

// Create category (admin)
export const createCategory = async (categoryData, image = null) => {
    try {
        let imageUrl = '';
        if (image) {
            if (typeof image === 'string') {
                imageUrl = image;
            } else {
                const storageRef = ref(storage, `categories/${Date.now()}_${image.name}`);
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            }
        }

        const slug = categoryData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const newCategory = {
            name: categoryData.name,
            slug,
            description: categoryData.description || '',
            image: imageUrl,
            parentId: categoryData.parentId || null,
            order: categoryData.order || 0,
            status: 'active',
            productCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), newCategory);
        return { id: docRef.id, ...newCategory };
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Update category (admin)
export const updateCategory = async (categoryId, updates, newImage = null) => {
    try {
        const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);

        if (newImage) {
            if (typeof newImage === 'string') {
                updates.image = newImage;
            } else {
                const storageRef = ref(storage, `categories/${Date.now()}_${newImage.name}`);
                await uploadBytes(storageRef, newImage);
                updates.image = await getDownloadURL(storageRef);
            }
        }

        if (updates.name) {
            updates.slug = updates.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        return { id: categoryId, ...updates };
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

// Delete category (admin)
export const deleteCategory = async (categoryId) => {
    try {
        const category = await getCategoryById(categoryId);

        if (category?.image) {
            try {
                const imageRef = ref(storage, category.image);
                await deleteObject(imageRef);
            } catch (e) {
                console.warn('Could not delete image:', e);
            }
        }

        await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async () => {
    try {
        const allCategories = await getAllCategories();

        const buildTree = (categories, parentId = null) => {
            return categories
                .filter(cat => cat.parentId === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(categories, cat.id)
                }));
        };

        return buildTree(allCategories);
    } catch (error) {
        console.error('Error building category tree:', error);
        throw error;
    }
};

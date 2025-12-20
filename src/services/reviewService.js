// Review Service - Handles product reviews and ratings
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

const REVIEWS_COLLECTION = 'reviews';

// Helper to check for first-time reviewers
const isFirstTimeReviewer = async (customerId) => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('customerId', '==', customerId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        return snapshot.empty;
    } catch (e) {
        return true; // Assume first time on error for safety
    }
};

// Helper to check content for bad words or negative sentiment
const needsManualReview = (content) => {
    const badWords = [
        'bad', 'poor', 'worst', 'fake', 'scam', 'terrible', 'horrible', 'waste', 'cheat', 'broken',
        'stupid', 'idiot', 'useless', 'garbage', 'f***', 's***', 'bitch', 'ass'
    ];
    const text = content.toLowerCase();
    return badWords.some(word => text.includes(word));
};

// Add new review
export const addReview = async (reviewData) => {
    try {
        console.log('Submitting review:', reviewData);

        const rating = Number(reviewData.rating) || 5;
        const comment = reviewData.comment || '';
        const title = reviewData.title || '';
        const content = (title + ' ' + comment).toLowerCase();

        // IMPLEMENT HYBRID MODERATION RULES
        let status = 'approved';
        let moderationReason = '';

        // Rule 1: First review from a customer must be manually checked
        const firstTime = await isFirstTimeReviewer(reviewData.customerId);
        if (firstTime) {
            status = 'pending';
            moderationReason = 'First time reviewer';
        }

        // Rule 2: Low ratings (1-2 stars) require manual check
        if (status === 'approved' && rating <= 2) {
            status = 'pending';
            moderationReason = 'Low rating';
        }

        // Rule 3: Bad words or negative flags require manual check
        if (status === 'approved' && needsManualReview(content)) {
            status = 'pending';
            moderationReason = 'Flagged content';
        }

        console.log(`Moderation decision: ${status} ${moderationReason ? `(${moderationReason})` : ''}`);

        const newReview = {
            productId: reviewData.productId || null,
            productName: reviewData.productName || null,
            vendorId: reviewData.vendorId || null,
            vendorName: reviewData.vendorName || null,
            customerId: reviewData.customerId || 'anonymous',
            customerName: reviewData.customerName || 'Anonymous',
            orderId: reviewData.orderId || null,
            rating: rating,
            title: title,
            comment: comment,
            images: reviewData.images || [],
            status: status,
            moderationReason: moderationReason,
            helpful: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Validate required fields
        if (!newReview.customerId) throw new Error('Customer ID is required');
        if (!newReview.vendorId && !newReview.productId) throw new Error('Vendor ID or Product ID is required');

        const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), newReview);

        // Update ratings only if approved
        if (status === 'approved') {
            try {
                const updatePromises = [];
                if (newReview.productId) {
                    updatePromises.push(updateProductRating(newReview.productId));
                }
                if (newReview.vendorId) {
                    updatePromises.push(updateVendorRating(newReview.vendorId));
                }

                if (updatePromises.length > 0) {
                    Promise.all(updatePromises).catch(e => console.warn('Background rating update failed:', e));
                }
            } catch (ratingError) {
                console.warn('Silent error updating ratings:', ratingError);
            }
        }

        return { id: docRef.id, ...newReview };
    } catch (error) {
        console.error('Error in addReview service:', error);
        throw error;
    }
};

// Get reviews for a product
export const getProductReviews = async (productId, currentUserId = null) => {
    try {
        const reviewsCollection = collection(db, REVIEWS_COLLECTION);

        // 1. Get approved reviews
        const qApproved = query(
            reviewsCollection,
            where('productId', '==', productId),
            where('status', '==', 'approved')
        );
        const snapshotApproved = await getDocs(qApproved);
        let reviews = snapshotApproved.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. If user is logged in, also get THEIR pending reviews so they see instant feedback
        if (currentUserId) {
            const qPending = query(
                reviewsCollection,
                where('productId', '==', productId),
                where('customerId', '==', currentUserId),
                where('status', '==', 'pending')
            );
            const snapshotPending = await getDocs(qPending);
            const pendingReviews = snapshotPending.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Avoid duplicates just in case
            const approvedIds = new Set(reviews.map(r => r.id));
            pendingReviews.forEach(pr => {
                if (!approvedIds.has(pr.id)) {
                    reviews.push(pr);
                }
            });
        }

        // Robust sort
        return reviews.sort((a, b) => {
            const getMillis = (date) => {
                if (!date) return Date.now() + 10000;
                if (date.toMillis) return date.toMillis();
                if (date.seconds) return date.seconds * 1000;
                if (typeof date === 'number') return date;
                if (date instanceof Date) return date.getTime();
                return Date.now() + 10000;
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

// Get specific store reviews (not product reviews)
export const getStoreReviews = async (vendorId, currentUserId = null) => {
    try {
        const reviewsCollection = collection(db, REVIEWS_COLLECTION);

        // 1. Get approved store reviews
        const qApproved = query(
            reviewsCollection,
            where('vendorId', '==', vendorId),
            where('productId', '==', null),
            where('status', '==', 'approved')
        );
        const snapshotApproved = await getDocs(qApproved);
        let reviews = snapshotApproved.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. If user is logged in, also get THEIR pending store reviews
        if (currentUserId) {
            const qPending = query(
                reviewsCollection,
                where('vendorId', '==', vendorId),
                where('productId', '==', null),
                where('customerId', '==', currentUserId),
                where('status', '==', 'pending')
            );
            const snapshotPending = await getDocs(qPending);
            const pendingReviews = snapshotPending.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const approvedIds = new Set(reviews.map(r => r.id));
            pendingReviews.forEach(pr => {
                if (!approvedIds.has(pr.id)) reviews.push(pr);
            });
        }

        // Robust sort
        return reviews.sort((a, b) => {
            const getMillis = (date) => {
                if (!date) return Date.now() + 10000; // Put null/pending at the very top
                if (date.toMillis) return date.toMillis();
                if (date.seconds) return date.seconds * 1000;
                if (typeof date === 'number') return date;
                if (date instanceof Date) return date.getTime();
                return Date.now() + 10000; // Sentinel or unknown: put at top
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });
    } catch (error) {
        console.error('Error fetching store reviews:', error);
        throw error;
    }
};

// Get reviews by vendor
export const getVendorReviews = async (vendorId) => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('vendorId', '==', vendorId)
            // Removed orderBy to avoid index error
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Robust sort
        return reviews.sort((a, b) => {
            const getMillis = (date) => {
                if (!date) return Date.now() + 10000;
                if (date.toMillis) return date.toMillis();
                if (date.seconds) return date.seconds * 1000;
                if (typeof date === 'number') return date;
                if (date instanceof Date) return date.getTime();
                return Date.now() + 10000;
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });
    } catch (error) {
        console.error('Error fetching vendor reviews:', error);
        throw error;
    }
};

// Get customer reviews
export const getCustomerReviews = async (customerId) => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('customerId', '==', customerId)
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Robust sort
        return reviews.sort((a, b) => {
            const getMillis = (date) => {
                if (!date) return Date.now() + 10000;
                if (date.toMillis) return date.toMillis();
                if (date.seconds) return date.seconds * 1000;
                if (typeof date === 'number') return date;
                if (date instanceof Date) return date.getTime();
                return Date.now() + 10000;
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });
    } catch (error) {
        console.error('Error fetching customer reviews:', error);
        throw error;
    }
};

// Get all reviews (admin)
export const getAllReviews = async (status = null) => {
    try {
        let q = collection(db, REVIEWS_COLLECTION);

        if (status) {
            q = query(q, where('status', '==', status));
        } else {
            q = query(q);
        }

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch vendor names for any reviews missing them
        const updatedReviews = await Promise.all(reviews.map(async (review) => {
            if (!review.vendorName && review.vendorId) {
                try {
                    const vendorDoc = await getDoc(doc(db, 'vendors', review.vendorId));
                    if (vendorDoc.exists()) {
                        return { ...review, vendorName: vendorDoc.data().businessName };
                    }
                } catch (e) {
                    console.warn(`Could not fetch vendor Name for ${review.vendorId}`);
                }
            }
            return review;
        }));

        // Sort in memory
        return updatedReviews.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0);
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0);
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        throw error;
    }
};

// Update review status (admin/vendor)
export const updateReviewStatus = async (reviewId, status) => {
    try {
        const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });

        // Recalculate ratings
        const reviewDoc = await getDoc(docRef);
        if (reviewDoc.exists()) {
            const data = reviewDoc.data();
            if (data.productId) {
                await updateProductRating(data.productId);
            }
            if (data.vendorId) {
                await updateVendorRating(data.vendorId);
            }
        }

        return true;
    } catch (error) {
        console.error('Error updating review status:', error);
        throw error;
    }
};

// Reply to review (vendor)
export const replyToReview = async (reviewId, reply) => {
    try {
        const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
        await updateDoc(docRef, {
            vendorReply: {
                text: reply,
                repliedAt: serverTimestamp()
            },
            status: 'approved', // Auto-approve if vendor replies
            updatedAt: serverTimestamp()
        });

        // Recalculate ratings
        const reviewDoc = await getDoc(docRef);
        if (reviewDoc.exists()) {
            const data = reviewDoc.data();
            if (data.productId) await updateProductRating(data.productId);
            if (data.vendorId) await updateVendorRating(data.vendorId);
        }

        return true;
    } catch (error) {
        console.error('Error replying to review:', error);
        throw error;
    }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
    try {
        const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
        const reviewDoc = await getDoc(docRef);

        if (reviewDoc.exists()) {
            await updateDoc(docRef, {
                helpful: (reviewDoc.data().helpful || 0) + 1
            });
        }

        return true;
    } catch (error) {
        console.error('Error marking review helpful:', error);
        throw error;
    }
};

// Delete review
export const deleteReview = async (reviewId) => {
    try {
        const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
        const reviewDoc = await getDoc(docRef);
        const productId = reviewDoc.data()?.productId;

        await deleteDoc(docRef);

        if (productId) {
            await updateProductRating(productId);
        }

        const vendorId = reviewDoc.data()?.vendorId;
        if (vendorId) {
            await updateVendorRating(vendorId);
        }

        return true;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('productId', '==', productId),
            where('status', '==', 'approved')
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => doc.data());

        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            reviewCount
        });
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
}


// Helper function to update vendor rating
const updateVendorRating = async (vendorId) => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('vendorId', '==', vendorId),
            where('status', '==', 'approved')
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => doc.data());

        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

        const vendorRef = doc(db, 'vendors', vendorId);
        await updateDoc(vendorRef, {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount
        });
    } catch (error) {
        console.error('Error updating vendor rating:', error);
    }
};

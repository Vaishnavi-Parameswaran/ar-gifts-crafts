// Notification Service - Handles user notifications
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Get user notifications
export const getUserNotifications = async (userId, unreadOnly = false, limitCount = 50) => {
    try {
        let q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        if (unreadOnly) {
            q = query(q, where('read', '==', false));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Get unread count
export const getUnreadCount = async (userId) => {
    try {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

// Create notification
export const createNotification = async (notificationData) => {
    try {
        const notification = {
            userId: notificationData.userId,
            type: notificationData.type, // order, product, system, promotion
            title: notificationData.title,
            message: notificationData.message,
            link: notificationData.link || null,
            data: notificationData.data || {},
            read: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
        return { id: docRef.id, ...notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    try {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(docRef, {
            read: true,
            readAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
    try {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.docs.forEach(document => {
            batch.update(doc(db, NOTIFICATIONS_COLLECTION, document.id), {
                read: true,
                readAt: serverTimestamp()
            });
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// Delete all notifications for user
export const deleteAllNotifications = async (userId) => {
    try {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.docs.forEach(document => {
            batch.delete(doc(db, NOTIFICATIONS_COLLECTION, document.id));
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
};

// Notification templates
export const NotificationTemplates = {
    orderPlaced: (orderId) => ({
        type: 'order',
        title: 'Order Placed Successfully',
        message: `Your order #${orderId} has been placed successfully.`,
        link: `/orders/${orderId}`
    }),

    orderShipped: (orderId, trackingNumber) => ({
        type: 'order',
        title: 'Order Shipped',
        message: `Your order #${orderId} has been shipped. Tracking: ${trackingNumber}`,
        link: `/orders/${orderId}`
    }),

    orderDelivered: (orderId) => ({
        type: 'order',
        title: 'Order Delivered',
        message: `Your order #${orderId} has been delivered.`,
        link: `/orders/${orderId}`
    }),

    vendorNewOrder: (orderId) => ({
        type: 'order',
        title: 'New Order Received',
        message: `You have received a new order #${orderId}.`,
        link: `/vendor/orders/${orderId}`
    }),

    productApproved: (productName) => ({
        type: 'product',
        title: 'Product Approved',
        message: `Your product "${productName}" has been approved and is now live.`,
        link: '/vendor/products'
    }),

    productRejected: (productName, reason) => ({
        type: 'product',
        title: 'Product Rejected',
        message: `Your product "${productName}" was rejected. Reason: ${reason}`,
        link: '/vendor/products'
    }),

    vendorApproved: () => ({
        type: 'system',
        title: 'Vendor Account Approved',
        message: 'Congratulations! Your vendor account has been approved. You can now start selling.',
        link: '/vendor/dashboard'
    }),

    newReview: (productName, rating) => ({
        type: 'product',
        title: 'New Review',
        message: `Your product "${productName}" received a ${rating}-star review.`,
        link: '/vendor/reviews'
    }),

    // NEW: Vendor Suspension Notifications
    vendorSuspended: () => ({
        type: 'system',
        title: 'Account Suspended',
        message: 'Your vendor account has been suspended by the administrator. You can only use customer features.',
        link: '/'
    }),

    vendorActivated: () => ({
        type: 'system',
        title: 'Account Activated',
        message: 'Great news! Your vendor account has been activated. Full access restored.',
        link: '/vendor/dashboard'
    }),

    // Order Status Notifications
    orderConfirmed: (orderId) => ({
        type: 'order',
        title: 'Order Confirmed',
        message: `Your order #${orderId} has been confirmed and is being processed.`,
        link: `/orders/${orderId}`
    }),

    orderProcessing: (orderId) => ({
        type: 'order',
        title: 'Order Processing',
        message: `Your order #${orderId} is now being prepared for shipment.`,
        link: `/orders/${orderId}`
    }),

    // Admin Notifications
    adminNewVendor: (businessName) => ({
        type: 'system',
        title: 'New Vendor Registration',
        message: `${businessName} has registered as a new vendor and is awaiting approval.`,
        link: '/admin/vendors'
    }),

    adminNewOrder: (orderId, amount) => ({
        type: 'order',
        title: 'New Order Placed',
        message: `Order #${orderId} placed - Rs. ${amount}`,
        link: '/admin/orders'
    })
};

// ============================================
// PUSH NOTIFICATION FUNCTIONALITY (FCM)
// ============================================

// VAPID Key for FCM
const VAPID_KEY = "BJhTZbKuH3Xbqnpcd7cLCmDyUOTUmF0pRo205QdUzoy6nhiW1oRX_kYXeRQZ7rhWlQpiZYEU7O-vXuMmBIVUvUc";

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.log('❌ Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Get FCM token for push notifications
 */
export const getFCMToken = async (messaging) => {
    try {
        if (!messaging) {
            console.error('Messaging instance not provided');
            return null;
        }

        const token = await messaging.getToken({ vapidKey: VAPID_KEY });
        if (token) {
            console.log('✅ FCM Token obtained:', token);
            return token;
        } else {
            console.log('❌ No registration token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Save FCM token to user document
 */
export const saveFCMToken = async (userId, token) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdatedAt: serverTimestamp()
        });
        console.log('✅ FCM token saved to user document');
        return true;
    } catch (error) {
        console.error('Error saving FCM token:', error);
        return false;
    }
};

/**
 * Send push notification (creates in-app notification + triggers push)
 */
export const sendPushNotification = async (userId, notificationData) => {
    try {
        // Create in-app notification
        const notification = await createNotification({
            userId,
            ...notificationData
        });

        // Note: Actual push notification sending happens server-side
        // This function creates the Firebase notification document
        // which can trigger a Cloud Function to send the actual push

        console.log('📬 Notification created:', notification);
        return notification;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotifications = async (userIds, notificationTemplate) => {
    try {
        const batch = writeBatch(db);
        const notifications = [];

        userIds.forEach(userId => {
            const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
            const notification = {
                userId,
                ...notificationTemplate,
                read: false,
                createdAt: serverTimestamp()
            };
            batch.set(notificationRef, notification);
            notifications.push({ id: notificationRef.id, ...notification });
        });

        await batch.commit();
        console.log(`✅ Sent ${notifications.length} notifications`);
        return notifications;
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        throw error;
    }
};

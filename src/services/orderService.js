// Order Service - Handles all order-related Firestore operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification, NotificationTemplates } from './notificationService';

const ORDERS_COLLECTION = 'orders';

// Generate unique order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `AR${timestamp}${random}`;
};

// Create new order
export const createOrder = async (orderData) => {
    try {
        const orderId = generateOrderId();

        // Group items by vendor
        const vendorOrders = {};
        orderData.items.forEach(item => {
            if (!vendorOrders[item.vendorId]) {
                vendorOrders[item.vendorId] = {
                    vendorId: item.vendorId,
                    vendorName: item.vendorName,
                    items: [],
                    subtotal: 0,
                    status: 'pending'
                };
            }
            vendorOrders[item.vendorId].items.push(item);
            vendorOrders[item.vendorId].subtotal += item.price * item.quantity;
        });

        const newOrder = {
            orderId,
            customerId: orderData.customerId,
            customerEmail: orderData.customerEmail,
            customerName: orderData.customerName,
            shippingAddress: orderData.shippingAddress,
            billingAddress: orderData.billingAddress || orderData.shippingAddress,
            items: orderData.items,
            vendorOrders: Object.values(vendorOrders),
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost || 0,
            tax: orderData.tax || 0,
            discount: orderData.discount || 0,
            couponCode: orderData.couponCode || null,
            totalAmount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            notes: orderData.notes || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Recursive function to remove undefined
        const sanitize = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(v => sanitize(v));
            } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && typeof obj.toMillis !== 'function') { // Check for simple objects (not Firestore Timestamps etc)
                return Object.keys(obj).reduce((acc, key) => {
                    const value = obj[key];
                    if (value === undefined) {
                        acc[key] = null;
                    } else {
                        acc[key] = sanitize(value);
                    }
                    return acc;
                }, {});
            }
            return obj;
        };

        // We can't sanitize serverTimestamp(), so we constructing sanitized object carefully or just doing a cleanup pass on data parts
        // Best approach: Sanitize the plain data parts
        const safeOrder = {
            ...newOrder,
            items: sanitize(newOrder.items),
            vendorOrders: sanitize(newOrder.vendorOrders),
            shippingAddress: sanitize(newOrder.shippingAddress)
        };

        // Remove undefined from top level keys too
        Object.keys(safeOrder).forEach(key => {
            if (safeOrder[key] === undefined) safeOrder[key] = null;
        });

        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), safeOrder);

        // Send Notifications
        try {
            // Notify Customer
            await createNotification({
                ...NotificationTemplates.orderPlaced(newOrder.orderId),
                userId: newOrder.customerId
            });

            // Notify Vendors
            const vendorIds = Object.keys(vendorOrders);
            await Promise.all(vendorIds.map(vid =>
                createNotification({
                    ...NotificationTemplates.vendorNewOrder(newOrder.orderId),
                    userId: vid
                })
            ));
        } catch (error) {
            console.error("Error sending order notifications:", error);
        }

        return { id: docRef.id, ...newOrder };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Get order by ID (supports both Document ID and custom orderId field)
export const getOrderById = async (docId) => {
    try {
        // Try getting by Document ID first
        const docRef = doc(db, ORDERS_COLLECTION, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }

        // If not found, try finding by custom 'orderId' field (e.g. AR12345)
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('orderId', '==', docId),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }

        return null;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

// Get customer orders
export const getCustomerOrders = async (customerId) => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('customerId', '==', customerId)
        );

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side to avoid Firestore composite index requirement
        return orders.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        throw error;
    }
};

// Get vendor orders
export const getVendorOrders = async (vendorId) => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('vendorOrders', 'array-contains-any', [{ vendorId }]),
            orderBy('createdAt', 'desc')
        );

        // Alternative approach using a different query structure
        const allOrders = await getDocs(collection(db, ORDERS_COLLECTION));
        const vendorOrders = allOrders.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(order =>
                order.vendorOrders?.some(vo => vo.vendorId === vendorId)
            );

        return vendorOrders.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        throw error;
    }
};

// Get all orders (admin)
export const getAllOrders = async (status = null, limitCount = 50) => {
    try {
        let q = query(
            collection(db, ORDERS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        if (status) {
            q = query(q, where('orderStatus', '==', status));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

// Update order status
// Update order status


export const updateOrderStatus = async (orderId, status, vendorId = null) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderDoc = await getDoc(docRef);

        if (!orderDoc.exists()) {
            throw new Error('Order not found');
        }

        const order = orderDoc.data();
        let notificationData = null;

        if (vendorId) {
            // Update vendor-specific status
            const updatedVendorOrders = order.vendorOrders.map(vo =>
                vo.vendorId === vendorId ? { ...vo, status } : vo
            );

            await updateDoc(docRef, {
                vendorOrders: updatedVendorOrders,
                updatedAt: serverTimestamp()
            });

            // Notify customer about status change from this vendor
            // Only if significant status change
            if (['shipped', 'delivered', 'cancelled'].includes(status)) {
                notificationData = {
                    userId: order.customerId,
                    type: 'order',
                    title: `Order Status Update`,
                    message: `Item(s) in your order #${order.orderId} have been marked as ${status}.`,
                    link: `/orders/${order.orderId}`
                };
            }

        } else {
            // Update overall order status (Admin)
            await updateDoc(docRef, {
                orderStatus: status,
                updatedAt: serverTimestamp()
            });

            // Notify customer
            if (status === 'shipped') {
                notificationData = NotificationTemplates.orderShipped(order.orderId, 'Check details');
            } else if (status === 'delivered') {
                notificationData = NotificationTemplates.orderDelivered(order.orderId);
            } else {
                notificationData = {
                    userId: order.customerId,
                    type: 'order',
                    title: `Order Status Update`,
                    message: `Your order #${order.orderId} is now ${status}.`,
                    link: `/orders/${order.orderId}`
                };
            }
            // Add userId to template if using template
            if (notificationData) notificationData.userId = order.customerId;
        }

        if (notificationData) {
            await createNotification(notificationData);
        }

        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Update payment status
export const updatePaymentStatus = async (orderId, status, transactionId = null) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const updates = {
            paymentStatus: status,
            updatedAt: serverTimestamp()
        };

        if (transactionId) {
            updates.transactionId = transactionId;
        }

        if (status === 'completed') {
            updates.paidAt = serverTimestamp();
        }

        await updateDoc(docRef, updates);
        return true;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

// Add tracking info
export const addTrackingInfo = async (orderId, vendorId, trackingNumber, carrier) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderDoc = await getDoc(docRef);

        if (orderDoc.exists()) {
            const order = orderDoc.data();
            const updatedVendorOrders = order.vendorOrders.map(vo =>
                vo.vendorId === vendorId
                    ? { ...vo, trackingNumber, carrier, status: 'shipped' }
                    : vo
            );

            await updateDoc(docRef, {
                vendorOrders: updatedVendorOrders,
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('Error adding tracking info:', error);
        throw error;
    }
};

// Cancel order
export const cancelOrder = async (orderId, reason, cancelledBy) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(docRef, {
            orderStatus: 'cancelled',
            cancellation: {
                reason,
                cancelledBy,
                cancelledAt: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};

// Request return
export const requestReturn = async (orderId, itemId, reason) => {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderDoc = await getDoc(docRef);

        if (orderDoc.exists()) {
            const order = orderDoc.data();
            const returns = order.returns || [];
            returns.push({
                itemId,
                reason,
                status: 'requested',
                requestedAt: new Date().toISOString()
            });

            await updateDoc(docRef, {
                returns,
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting return:', error);
        throw error;
    }
};

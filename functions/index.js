/**
 * Cloud Functions for AR ONE Gifts & Crafts
 * 
 * This file contains all serverless functions for:
 * - Order processing and notifications
 * - Vendor commission calculations
 * - Product and vendor status changes
 * - Email notifications
 * - Scheduled tasks
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// ============================================
// ORDER FUNCTIONS
// ============================================

/**
 * Triggered when a new order is created
 * - Sends notification to customer
 * - Sends notification to vendors
 * - Updates product stock
 * - Calculates vendor commissions
 */
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        const orderId = context.params.orderId;

        try {
            // Send notification to customer
            await createNotification({
                userId: order.customerId,
                type: 'order',
                title: 'Order Placed Successfully',
                message: `Your order #${order.orderId} has been placed successfully.`,
                link: `/orders/${orderId}`,
                data: { orderId }
            });

            // Send notifications to vendors
            if (order.vendorOrders) {
                for (const vendorOrder of order.vendorOrders) {
                    await createNotification({
                        userId: vendorOrder.vendorId,
                        type: 'order',
                        title: 'New Order Received',
                        message: `You have received a new order #${order.orderId}`,
                        link: `/vendor/orders/${orderId}`,
                        data: { orderId }
                    });
                }
            }

            // Update product stock
            for (const item of order.items) {
                const productRef = db.collection('products').doc(item.productId);
                await productRef.update({
                    stock: admin.firestore.FieldValue.increment(-item.quantity),
                    sales: admin.firestore.FieldValue.increment(item.quantity)
                });
            }

            console.log(`Order ${orderId} processed successfully`);
            return { success: true };
        } catch (error) {
            console.error('Error processing order:', error);
            throw new functions.https.HttpsError('internal', 'Failed to process order');
        }
    });

/**
 * Triggered when an order status is updated
 */
exports.onOrderStatusUpdated = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const orderId = context.params.orderId;

        // Check if order status changed
        if (before.orderStatus !== after.orderStatus) {
            const statusMessages = {
                'confirmed': 'Your order has been confirmed',
                'processing': 'Your order is being processed',
                'shipped': 'Your order has been shipped',
                'delivered': 'Your order has been delivered',
                'cancelled': 'Your order has been cancelled'
            };

            if (statusMessages[after.orderStatus]) {
                await createNotification({
                    userId: after.customerId,
                    type: 'order',
                    title: `Order ${after.orderStatus.charAt(0).toUpperCase() + after.orderStatus.slice(1)}`,
                    message: `${statusMessages[after.orderStatus]}. Order #${after.orderId}`,
                    link: `/orders/${orderId}`,
                    data: { orderId, status: after.orderStatus }
                });
            }
        }

        // Check if payment status changed to completed
        if (before.paymentStatus !== after.paymentStatus && after.paymentStatus === 'completed') {
            // Calculate and update vendor earnings
            if (after.vendorOrders) {
                for (const vendorOrder of after.vendorOrders) {
                    const vendorRef = db.collection('vendors').doc(vendorOrder.vendorId);
                    const vendorDoc = await vendorRef.get();

                    if (vendorDoc.exists) {
                        const vendor = vendorDoc.data();
                        const commissionRate = vendor.commissionRate || 10;
                        const commission = (vendorOrder.subtotal * commissionRate) / 100;
                        const vendorEarning = vendorOrder.subtotal - commission;

                        await vendorRef.update({
                            pendingBalance: admin.firestore.FieldValue.increment(vendorEarning),
                            totalEarnings: admin.firestore.FieldValue.increment(vendorEarning),
                            totalSales: admin.firestore.FieldValue.increment(1)
                        });
                    }
                }
            }
        }

        return { success: true };
    });

// ============================================
// VENDOR FUNCTIONS
// ============================================

/**
 * Triggered when a vendor status is updated
 */
exports.onVendorStatusUpdated = functions.firestore
    .document('vendors/{vendorId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const vendorId = context.params.vendorId;

        if (before.status !== after.status) {
            const messages = {
                'approved': {
                    title: 'Vendor Account Approved',
                    message: 'Congratulations! Your vendor account has been approved. You can now start selling.'
                },
                'suspended': {
                    title: 'Vendor Account Suspended',
                    message: `Your vendor account has been suspended. Reason: ${after.statusReason || 'Policy violation'}`
                },
                'rejected': {
                    title: 'Vendor Application Rejected',
                    message: `Your vendor application has been rejected. Reason: ${after.statusReason || 'Requirements not met'}`
                }
            };

            if (messages[after.status]) {
                await createNotification({
                    userId: vendorId,
                    type: 'system',
                    ...messages[after.status],
                    link: '/vendor/dashboard'
                });

                // Update user role if approved
                if (after.status === 'approved') {
                    await db.collection('users').doc(vendorId).update({
                        role: 'vendor'
                    });
                }
            }
        }

        return { success: true };
    });

// ============================================
// PRODUCT FUNCTIONS
// ============================================

/**
 * Triggered when a product status is updated
 */
exports.onProductStatusUpdated = functions.firestore
    .document('products/{productId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        if (before.status !== after.status) {
            const messages = {
                'approved': {
                    title: 'Product Approved',
                    message: `Your product "${after.name}" has been approved and is now live.`
                },
                'rejected': {
                    title: 'Product Rejected',
                    message: `Your product "${after.name}" was rejected. Please review and resubmit.`
                }
            };

            if (messages[after.status]) {
                await createNotification({
                    userId: after.vendorId,
                    type: 'product',
                    ...messages[after.status],
                    link: '/vendor/products'
                });
            }
        }

        return { success: true };
    });

// ============================================
// REVIEW FUNCTIONS
// ============================================

/**
 * Triggered when a new review is created
 */
exports.onReviewCreated = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
        const review = snap.data();

        // Notify vendor about new review
        await createNotification({
            userId: review.vendorId,
            type: 'product',
            title: 'New Review',
            message: `Your product received a ${review.rating}-star review.`,
            link: '/vendor/reviews'
        });

        return { success: true };
    });

// ============================================
// PAYOUT FUNCTIONS
// ============================================

/**
 * Process vendor payout (admin callable)
 */
exports.processVendorPayout = functions.https.onCall(async (data, context) => {
    // Verify admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { vendorId, amount, payoutMethod } = data;

    try {
        const vendorRef = db.collection('vendors').doc(vendorId);
        const vendorDoc = await vendorRef.get();

        if (!vendorDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Vendor not found');
        }

        const vendor = vendorDoc.data();
        if (vendor.availableBalance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
        }

        // Create payout record
        const payoutRef = await db.collection('payouts').add({
            vendorId,
            amount,
            payoutMethod,
            bankDetails: vendor.bankDetails,
            status: 'processing',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            processedBy: context.auth.uid
        });

        // Update vendor balance
        await vendorRef.update({
            availableBalance: admin.firestore.FieldValue.increment(-amount)
        });

        // Notify vendor
        await createNotification({
            userId: vendorId,
            type: 'system',
            title: 'Payout Processing',
            message: `Your payout of ₹${amount} is being processed.`,
            link: '/vendor/earnings'
        });

        return { success: true, payoutId: payoutRef.id };
    } catch (error) {
        console.error('Payout error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Release pending balance to available (runs daily)
 */
exports.releasePendingBalance = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        // Release pending balance after 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ordersSnap = await db.collection('orders')
            .where('orderStatus', '==', 'delivered')
            .where('paymentStatus', '==', 'completed')
            .where('updatedAt', '<=', sevenDaysAgo)
            .where('balanceReleased', '==', false)
            .get();

        for (const orderDoc of ordersSnap.docs) {
            const order = orderDoc.data();

            for (const vendorOrder of order.vendorOrders) {
                const vendorRef = db.collection('vendors').doc(vendorOrder.vendorId);
                const vendorDoc = await vendorRef.get();

                if (vendorDoc.exists) {
                    const vendor = vendorDoc.data();
                    const commissionRate = vendor.commissionRate || 10;
                    const commission = (vendorOrder.subtotal * commissionRate) / 100;
                    const vendorEarning = vendorOrder.subtotal - commission;

                    await vendorRef.update({
                        pendingBalance: admin.firestore.FieldValue.increment(-vendorEarning),
                        availableBalance: admin.firestore.FieldValue.increment(vendorEarning)
                    });
                }
            }

            await orderDoc.ref.update({ balanceReleased: true });
        }

        console.log(`Released balance for ${ordersSnap.size} orders`);
        return null;
    });

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create notification helper
 */
async function createNotification(data) {
    return db.collection('notifications').add({
        ...data,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * HTTP function to set user as admin (for initial setup only)
 * Remove or protect in production
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // This should be removed or heavily protected in production
    const { userId, secretKey } = data;

    // Use a secret key for protection
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid secret key');
    }

    await db.collection('users').doc(userId).update({
        role: 'admin'
    });

    return { success: true };
});

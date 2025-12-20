# Vendor Suspension & Notification System Implementation

## Phase 1: Vendor Suspension Fix (IMMEDIATE)

### Step 1: Create AR Gifts Official Vendor Document
```javascript
// Run this in Firebase Console or via script
{
  id: "ar_gifts_official",
  userId: "ar_gifts_official",
  businessName: "AR Gifts Official",
  businessEmail: "admin@argifts.lk",
  businessPhone: "+94771234567",
  businessAddress: "Colombo, Sri Lanka",
  businessDescription: "Official AR Gifts platform products - curated collection of gifts and crafts",
  businessType: "Official Store",
  logo: "https://ui-avatars.com/api/?name=AR+Gifts&background=4f46e5&color=fff&size=200",
  status: "approved",
  rating: 5.0,
  reviewCount: 0,
  totalSales: 0,
  totalEarnings: 0,
  availableBalance: 0,
  pendingBalance: 0,
  commissionRate: 0, // Platform products - no commission
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Step 2: Reassign Orphaned Products
Update all products with vendorId: vendor_1, vendor_2, vendor_3
→ vendorId: "ar_gifts_official"

### Step 3: Update Product Service to Hide Suspended Vendor Products
Filter products where vendor.status !== 'suspended'

### Step 4: Block Vendor Dashboard Access
Add ProtectedRoute check for vendor.status === 'approved'

---

## Phase 2: Push Notification System

### VAPID Configuration
```javascript
VAPID_PUBLIC_KEY: "BJhTZbKuH3Xbqnpcd7cLCmDyUOTUmF0pRo205QdUzoy6nhiW1oRX_kYXeRQZ7rhWlQpiZYEU7O-vXuMmBIVUvUc"
```

### Notification Types

#### 1. Customer Notifications
- **Order Confirmed**: "Your order #12345 has been confirmed!"
- **Order Processing**: "Your order #12345 is being prepared"
- **Order Shipped**: "Your order #12345 has been shipped - Track: ABC123"
- **Order Delivered**: "Your order #12345 has been delivered"

#### 2. Vendor Notifications  
- **Account Suspended**: "Your vendor account has been suspended by admin"
- **Product Approved**: "Your product '[Product Name]' has been approved"
- **Product Rejected**: "Your product '[Product Name]' was rejected - [Reason]"
- **New Order**: "New order received - Order #12345"

#### 3. Admin Notifications
- **New Vendor Registration**: "New vendor signup: [Business Name]"
- **New Order**: "New order placed - Order #12345 - Rs. 5000"
- **Low Stock Alert**: "Product '[Name]' is low on stock"
- **System Updates**: Critical system events

### Files to Create/Update:
1. `public/firebase-messaging-sw.js` - Service worker
2. `src/services/notificationService.js` - Enhanced with push notifications
3. `src/contexts/NotificationContext.js` - Global notification state
4. `src/components/NotificationBell.js` - UI component

---

## Implementation Priority
1. ✅ Fix vendor suspension (Phase 1) - **START NOW**
2. ✅ Set up notification infrastructure (Phase 2)
3. ✅ Test end-to-end workflow

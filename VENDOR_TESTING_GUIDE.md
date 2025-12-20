# Vendor System - Complete Setup & Testing Guide

## Overview
This guide helps you verify that all vendor functionality is working correctly with real-time data.

## Quick Access URLs

1. **Vendor Registration**: `http://localhost:3000/vendor/register`
2. **Vendor Dashboard**: `http://localhost:3000/vendor/dashboard`
3. **Vendor Diagnostics**: `http://localhost:3000/vendor/diagnostics`
4. **Public Vendor Profile**: `http://localhost:3000/vendor/{YOUR_USER_ID}`

## Step-by-Step Verification

### 1. Register as a Vendor

1. Go to `/vendor/register`
2. Fill in all required fields:
   - Business Name
   - Business Email
   - Business Phone
   - Business Address
   - Business Description
   - Tax ID (optional)
   - Bank Details
   - Verification Documents (paste URLs)
3. Submit the registration
4. **IMPORTANT**: The system will:
   - Create/update your user profile with role='vendor'
   - Create a vendor document in Firestore with your userId
   - Redirect you to the vendor dashboard

### 2. Run Diagnostics

1. Go to `/vendor/diagnostics`
2. Click "Run Diagnostics"
3. Check each section:

   **✓ Current User**
   - Should show: Exists = YES
   - Should have your UID, email, and display name

   **✓ User Profile (Firestore users collection)**
   - Should show: Exists = YES
   - Role should be: "vendor" (in BLUE badge)
   - Status should be: "active"

   **✓ Vendor Profile (Firestore vendors collection)**
   - Should show: Exists = YES
   - Business Name should be shown
   - Status should be: "pending" (until admin approves) or "approved"

   **✓ Vendor Statistics**
   - Should show counts for products, sales, earnings, etc.
   - Values may be 0 if you haven't added products yet

   **✓ Vendor Products**
   - Count: Shows number of products you've created
   - List: Shows your products if any exist

   **✓ Vendor Orders**
   - Count: Shows number of orders you've received
   - List: Shows recent orders if any exist

### 3. Test Vendor Dashboard

1. Go to `/vendor/dashboard`
2. **If you see "Vendor Profile Not Found"**:
   - This means you're not registered as a vendor yet
   - You'll be redirected to `/vendor/register` after 2 seconds
   - Complete the vendor registration

3. **If the dashboard loads**:
   - ✓ Sidebar shows your shop name and status badge
   - ✓ Dashboard Overview shows statistics (may be 0 initially)
   - ✓ Can navigate to different sections (Products, Orders, Settings, etc.)

### 4. Test Adding Products

1. In Vendor Dashboard, click "Products"
2. Click "Add Product"
3. Fill in product details:
   - Product Name
   - Description
   - Price
   - Stock Quantity
   - Category
   - Product Image URL (paste a public image URL)
4. Click "Publish Product"
5. The product will be created with:
   - vendorId: YOUR_USER_ID
   - vendorName: YOUR_BUSINESS_NAME (automatically added)
   - status: "pending" (until admin approval)

### 5. Test Public Vendor Profile

1. In Vendor Dashboard sidebar, click "View My Shop"
2. This opens your public profile at `/vendor/{YOUR_USER_ID}`
3. You should see:
   - Banner image (if you've uploaded one in Settings)
   - Logo (if you've uploaded one in Settings)
   - "Dashboard" and "My Account" buttons (only visible to you as the owner)
   - About Shop, Contact Information, Vendor Rating cards
   - Products tab (shows your approved products)
   - Customer Reviews tab (shows reviews for your shop)
4. **Owner-only features you'll see**:
   - Dashboard button (goes to `/vendor/dashboard`)
   - My Account button (goes to `/account`)
   - NO "Write a Review" button (you can't review your own shop)

### 6. Test Settings Page

1. Go to Vendor Dashboard > Settings
2. You should see a single-page form with sections:
   - **Account Information**
     - Profile Picture (paste URL)
     - Shop Name
     - Email (disabled/read-only)
     - Change Password fields
   - **Contact Details**
     - Phone Number
     - Business Address
   - **Shop Preferences**
     - Shop Description
     - Visibility toggle
   - **Notification Settings**
     - Email preferences checkboxes
   - **Payment & Billing**
     - Bank Name, Account Holder, Account Number, IFSC Code
3. Make changes and click "Save Changes"
4. Changes should save successfully with a success message

### 7. Test Real-Time Updates

1. **Add a product** in the vendor dashboard
2. Immediately go to "Products" tab
3. Your new product should appear in the list
4. **Check stats** on Dashboard Overview - product count should update

## Common Issues & Solutions

### Issue: "Vendor Profile Not Found" on Dashboard

**Cause**: User doesn't have a vendor document in Firestore

**Solutions**:
1. Go to `/vendor/diagnostics` and check:
   - Is "User Profile" exists = YES?
   - Is "User Profile" role = "vendor"?
   - Is "Vendor Profile" exists = NO?

2. If vendor profile doesn't exist, complete vendor registration at `/vendor/register`

3. If user profile role is not "vendor":
   - Your registration may not have completed
   - Re-register at `/vendor/register` (it will update your role)

### Issue: "View My Shop" Opens Blank Page

**Cause**: Routing issue fixed in latest update

**Solution**: 
- The route `/vendor/:id` should now work correctly
- Clear browser cache and reload
- Access directly: `http://localhost:3000/vendor/{YOUR_USER_ID}`

### Issue: Products Don't Show Vendor Name

**Cause**: Products created before the fix don't have vendorName field

**Solutions**:
1. For NEW products: VendorProductForm now automatically adds vendorName
2. For OLD products: 
   - Re-publish them OR
   - Manually update in Firestore: add `vendorName: "Your Business Name"` field

### Issue: Dashboard Statistics Show 0

**Cause**: This is normal for a new vendor account

**When it updates**:
- Total Products: Updates when you create products
- Active Products: Updates when admin approves your products
- Total Sales: Updates when customers place orders
- Total Earnings: Updates when orders are completed
- Rating: Updates when customers leave reviews

## Firestore Collections Structure

### users/{userId}
```json
{
  "uid": "USER_ID",
  "email": "email@example.com",
  "displayName": "User Name",
  "role": "vendor",  // CRITICAL: Must be "vendor"
  "status": "active",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### vendors/{userId}
```json
{
  "userId": "USER_ID",
  "businessName": "My Shop Name",
  "businessEmail": "shop@example.com",
  "businessPhone": "+94xxxxxxxxx",
  "businessAddress": "Shop Address, City",
  "businessDescription": "About our shop...",
  "businessType": "individual/company",
  "logo": "https://...",
  "banner": "https://...",
  "status": "pending/approved/suspended/rejected",
  "rating": 0,
  "reviewCount": 0,
  "totalSales": 0,
  "totalEarnings": 0,
  "availableBalance": 0,
  "pendingBalance": 0,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### products/{productId}
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 1000,
  "stock": 50,
  "category": "handmade-crafts",
  "vendorId": "VENDOR_USER_ID",
  "vendorName": "My Shop Name",  // NOW AUTOMATICALLY ADDED
  "images": ["https://..."],
  "status": "pending/approved/rejected",
  "views": 0,
  "sales": 0,
  "rating": 0,
  "reviewCount": 0,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## Admin Approval Process

For a vendor to sell products:

1. **Vendor Registration**: Creates vendor document with status="pending"
2. **Admin Review**: Admin goes to `/admin/dashboard` > Vendors
3. **Admin Approval**: Admin changes status to "approved"
4. **Product Review**: Each product also needs approval
5. **Product Approval**: Admin approves individual products
6. **Live**: Approved products appear on the website

## Security & Access Control

### Protected Routes
- `/vendor/dashboard/*`: Requires role="vendor"
- `/vendor/products/*`: Requires role="vendor"
- `/vendor/orders/*`: Requires role="vendor"
- `/vendor/settings`: Requires role="vendor"

### Public Routes
- `/vendor/register`: Anyone can register
- `/vendor/:id`: Public vendor profile (anyone can view)
- `/shop/:id`: Alias for vendor profile

### Route Guards (ProtectedRoute.js)
- **VendorRoute**: Checks `isVendor()` from AuthContext
- **isVendor()**: Returns `userProfile?.role === 'vendor'`
- **userProfile**: Fetched from Firestore `users/{userId}` collection

## Testing Checklist

- [ ] Can register as vendor
- [ ] Vendor profile created in Firestore
- [ ] User role updated to "vendor" in Firestore
- [ ] Can access vendor dashboard
- [ ] Dashboard shows vendor info and stats
- [ ] Can create new products
- [ ] Products include vendorName field
- [ ] Can view products in dashboard
- [ ] Can edit products
- [ ] Can delete products
- [ ] Can update settings
- [ ] Settings save correctly
- [ ] Can view public shop profile
- [ ] Public profile shows products
- [ ] Public profile shows reviews
- [ ] Owner sees special buttons on public profile
- [ ] Non-owners can write reviews
- [ ] Owner cannot write reviews on own shop

## Diagnostics Page Features

The diagnostics page (`/vendor/diagnostics`) helps you:

1. **Verify Authentication**: Check if you're logged in
2. **Verify User Profile**: Check if your user document exists and has correct role
3. **Verify Vendor Profile**: Check if your vendor document exists
4. **View Statistics**: See your real-time stats
5. **List Products**: See all your products
6. **List Orders**: See all your orders
7. **Refresh Profile**: Force reload your user profile data

## Next Steps

After verification:

1. **Approve your vendor account** (if you have admin access):
   - Go to `/admin/dashboard`
   - Click "Vendors" tab
   - Find your business
   - Change status to "approved"

2. **Approve your products**:
   - Go to `/admin/dashboard`
   - Click "Products" tab
   - Find your products
   - Change status to "approved"

3. **Test customer flow**:
   - Log out
   - Browse to your public profile `/vendor/{YOUR_ID}`
   - View your products
   - Add to cart
   - Complete checkout

4. **Monitor orders**:
   - Log back in as vendor
   - Check "Orders" in vendor dashboard
   - Process orders as they come in

---

**Last Updated**: 2025-12-17
**Version**: 1.0
**Status**: All vendor functionality operational with real-time data ✅

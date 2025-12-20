# Firebase Detailed Setup & Database Guide

This guide provides a comprehensive step-by-step walkthrough for setting up your Firebase project, configuring Firestore Database, and understanding the schema structure used in this application.

## 1. Firebase Project Setup

### Step 1: Create Project
1. Go to [Firebase Console](https://console.firebase.google.com).
2. Click **"Add project"**.
3. Name your project (e.g., `ar-gifts-crafts`) and click **Continue**.
4. Disable Google Analytics for now (optional) and click **Create project**.

### Step 2: Register Web App
1. In your project overview, click the **Web icon (</>)**.
2. Register app nickname: `ar-gifts-web`.
3. Click **Register app**.
4. **Important**: Copy `firebaseConfig` keys from the SDK setup snippet. You will need these for your environment variables.

### Step 3: Enable Authentication
1. Go to **Build > Authentication** in the sidebar.
2. Click **Get Started**.
3. Select **Email/Password** provider.
4. Toggle **Enable** and click **Save**.

### Step 4: Enable Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select a location (e.g., `asia-south1` or `us-central1` depending on where you want your data hosted).
4. Start in **Test Mode** (we will update rules later) and click **Create**.

### Step 5: Enable Storage
1. Go to **Build > Storage**.
2. Click **Get Started**.
3. Start in **Test Mode** and click **Done**.

---

## 2. Configuration

### Environment Variables
Updated your `.env` file in the project root with the keys you copied in Step 2:

```properties
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Security Rules
Copy the following rules to your **Firestore Database > Rules** tab to secure your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function - Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    // Helper function - Check if user owns the document (by userId)
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ... [See full firestore.rules file in your project] ...
  }
}
```

---

## 3. Firestore Database Schema and Collections

Your application uses the following collections. Below is the detailed document structure (fields) for each.

### 1. `users` Collection
Stores customer and basic user profile information.
*   **Document ID**: `uid` (from Authentication)
*   **Fields**:
    *   `uid` (string): User's unique ID
    *   `displayName` (string): Full name
    *   `email` (string): Email address
    *   `role` (string): 'customer' | 'vendor' | 'admin'
    *   `phone` (string): Contact number
    *   `status` (string): 'active' | 'suspended'
    *   `avatar` (string, optional): URL to profile picture
    *   `addresses` (array): List of address objects
        *   `id` (string)
        *   `name`, `phone`, `address`, `city`, `state`, `pincode`
        *   `isDefault` (boolean)
    *   `createdAt`, `updatedAt` (timestamp)

### 2. `vendors` Collection
Stores business profiles for vendors.
*   **Document ID**: `uid` (same as User ID to link easily)
*   **Fields**:
    *   `userId` (string): Link to Auth UID
    *   `businessName` (string)
    *   `businessEmail`, `businessPhone` (string)
    *   `businessDescription` (string)
    *   `businessType` (string)
    *   `status` (string): 'pending' | 'approved' | 'suspended' | 'rejected'
    *   `logo`, `banner` (string): URLs to images
    *   `rating` (number): Average rating (e.g., 4.5)
    *   `reviewCount` (number)
    *   `totalSales`, `totalEarnings` (number)
    *   `availableBalance`, `pendingBalance` (number)
    *   `commissionRate` (number): Platform fee percentage (e.g., 10)
    *   `bankDetails` (map): { `accountName`, `accountNumber`, `bankName`, `ifscCode` }
    *   `documents` (map): Verification doc URLs

### 3. `products` Collection
Stores all product details.
*   **Document ID**: `auto-generated`
*   **Fields**:
    *   `name` (string)
    *   `description` (string)
    *   `price` (number)
    *   `salePrice` (number, optional)
    *   `categoryId` (string): ID of the category
    *   `vendorId` (string): ID of the vendor who owns this product
    *   `vendorName` (string): Denormalized for easier display
    *   `images` (array): List of image URLs
    *   `stock` (number): Inventory count
    *   `status` (string): 'pending' | 'approved' | 'rejected'
    *   `featured` (boolean): If true, shows on home page
    *   `views` (number), `sales` (number)
    *   `rating` (number), `reviewCount` (number)
    *   `createdAt`, `updatedAt` (timestamp)

### 4. `orders` Collection
Stores all order transactions.
*   **Document ID**: `auto-generated` or custom (e.g., AR2024...)
*   **Fields**:
    *   `orderId` (string): Human-readable ID
    *   `customerId` (string)
    *   `customerName`, `customerEmail` (string)
    *   `items` (array): List of cart items
        *   `productId`, `name`, `price`, `quantity`, `vendorId`
    *   `vendorOrders` (array): Split details for multi-vendor support
        *   `vendorId`, `subtotal`, `status` ('pending' | 'shipped' | 'delivered'), `trackingNumber`
    *   `shippingAddress` (map)
    *   `subtotal`, `shippingCost`, `discount`, `totalAmount` (number)
    *   `paymentMethod` (string): 'cod' | 'card'
    *   `paymentStatus` (string): 'pending' | 'completed'
    *   `orderStatus` (string): Global status ('pending', 'processing', 'completed', 'cancelled')
    *   `createdAt` (timestamp)

### 5. `categories` Collection
Stores product categories.
*   **Document ID**: `slug` or `auto-generated`
*   **Fields**:
    *   `name` (string)
    *   `slug` (string)
    *   `description` (string)
    *   `image` (string): URL
    *   `parentId` (string, optional): For subcategories
    *   `order` (number): Display order
    *   `status` (string): 'active' | 'inactive'

### 6. `reviews` Collection
Stores product reviews.
*   **Fields**:
    *   `productId`, `vendorId` (string)
    *   `customerId`, `customerName` (string)
    *   `rating` (number): 1-5
    *   `comment` (string)
    *   `status` (string): 'pending' | 'approved'

### 7. `payouts` Collection
Stores vendor withdrawal requests.
*   **Fields**:
    *   `vendorId` (string)
    *   `amount` (number)
    *   `status` (string): 'pending' | 'processed'
    *   `bankDetails` (map)

---

## 4. Initial Data Seeding

Since you are starting fresh, you can use the **Admin Seeder** tool we built to populate `categories`, `vendors`, and sample `products` instantly.

1.  Run your app: `npm start`
2.  Navigate to: `http://localhost:3000/admin/seed`
3.  Click **"Seed Database"** to populate the initial data with Sri Lankan localization (Currency Rs., etc.).

This will automatically create the documents in Firestore with the correct structure described above.

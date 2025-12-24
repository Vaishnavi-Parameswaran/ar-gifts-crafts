
# ar-gifts-crafts
e-commerce multi vendor site

# AR ONE Gifts & Crafts

A full-featured multi-vendor e-commerce platform for gifts and crafts, built with React.js and Firebase.

## 🎁 Overview

AR ONE Gifts & Crafts is an Amazon-like marketplace that connects talented artisans and sellers with customers who appreciate unique, handmade products. The platform supports three user roles:

- **Customers**: Browse products, manage cart/wishlist, place orders, track deliveries, submit reviews
- **Vendors**: Register stores, manage products, process orders, track earnings, handle returns
- **Admins**: Approve vendors/products, manage users, moderate reviews, configure settings

## 🚀 Tech Stack

- **Frontend**: React.js 19, React Router v6, Bootstrap 5, React Bootstrap
- **Backend**: Firebase (Authentication, Firestore, Storage, Cloud Functions)
- **Styling**: CSS3 with CSS Variables, Bootstrap
- **Icons**: React Icons (Feather Icons)

## 📁 Project Structure

```
ar-gifts-crafts/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Navbar, Footer, Loading, ProtectedRoute
│   │   └── product/       # ProductCard, etc.
│   ├── config/            # Firebase configuration
│   ├── contexts/          # React contexts (Auth, Cart, Wishlist)
│   ├── pages/             # Page components
│   │   ├── Admin/         # Admin dashboard
│   │   ├── Auth/          # Login, Register, ForgotPassword
│   │   ├── Cart/          # Shopping cart
│   │   ├── Home/          # Homepage
│   │   ├── Product/       # Product detail
│   │   └── Vendor/        # Vendor dashboard & registration
│   ├── services/          # Firebase services (CRUD operations)
│   ├── App.js             # Main app with routing
│   ├── App.css            # Global styles
│   └── index.js           # Entry point
├── functions/             # Firebase Cloud Functions
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── firebase.json          # Firebase configuration
└── firestore.indexes.json # Firestore indexes
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Firebase account and project created
- Firebase CLI installed (`npm install -g firebase-tools`)

### 1. Clone and Install

```bash
cd ar-gifts-crafts
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config to `.env`:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 3. Deploy Security Rules

```bash
firebase login
firebase init
firebase deploy --only firestore:rules,storage:rules
```

### 4. Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 5. Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Features Implemented

### Customer Module
- ✅ User registration and authentication
- ✅ Product browsing and search
- ✅ Shopping cart with localStorage + Firestore sync
- ✅ Wishlist management
- ✅ Product detail pages
- ⏳ Checkout and payment integration
- ⏳ Order tracking
- ⏳ Review submission

### Vendor Module
- ✅ Vendor registration (multi-step form)
- ✅ Vendor dashboard with stats
- ✅ Product management
- ⏳ Order processing
- ⏳ Earnings and payout tracking
- ⏳ Analytics

### Admin Module
- ✅ Admin dashboard with overview
- ✅ Vendor management (approve/reject)
- ✅ User management
- ⏳ Product moderation
- ⏳ Category management
- ⏳ Coupon management
- ⏳ Reports and analytics

### Security
- ✅ Firebase Authentication integration
- ✅ Role-based access control (Customer, Vendor, Admin)
- ✅ Firestore security rules
- ✅ Storage security rules
- ✅ Protected routes

## 🔒 Database Structure

```
users/
  {userId}/
    - uid, email, displayName, phone, role, status, addresses[], createdAt

vendors/
  {vendorId}/
    - userId, businessName, businessEmail, status, commissionRate, 
      totalEarnings, availableBalance, bankDetails{}, documents{}

products/
  {productId}/
    - name, description, price, salePrice, images[], category, 
      vendorId, vendorName, stock, status, rating, reviewCount

orders/
  {orderId}/
    - orderId, customerId, items[], vendorOrders[], totalAmount,
      orderStatus, paymentStatus, shippingAddress{}

reviews/
  {reviewId}/
    - productId, vendorId, customerId, rating, comment, status, vendorReply{}

carts/
  {userId}/
    - items[]

wishlists/
  {userId}/
    - items[]

categories/
  {categoryId}/
    - name, slug, image, parentId, status, order

coupons/
  {couponId}/
    - code, discountType, discountValue, usageLimit, status

notifications/
  {notificationId}/
    - userId, type, title, message, read, createdAt
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## 📝 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Firebase team for the comprehensive backend services
- Bootstrap team for the UI components
- All contributors and artisans who make this platform possible

---

**AR ONE Gifts & Crafts** - Connecting Artisans with Art Lovers ❤️
>>>>>>> master

# 🔥 Firebase Setup Guide for AR ONE Gifts & Crafts

This guide will help you set up Firebase for your e-commerce platform.

## 📋 Prerequisites

- Node.js 18+ installed
- A Google account
- Firebase CLI installed (`npm install -g firebase-tools`)

---

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or **"Add project"**)
3. Enter project name: `ar-gifts-crafts` (or any name you prefer)
4. Enable/Disable Google Analytics (optional)
5. Click **"Create Project"**

---

## 🌐 Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter app nickname: `AR ONE Web App`
3. ✅ Check **"Also set up Firebase Hosting"** (optional but recommended)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object - you'll need these values!

Example config (DO NOT use these values):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "ar-gifts-crafts.firebaseapp.com",
  projectId: "ar-gifts-crafts",
  storageBucket: "ar-gifts-crafts.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

---

## 🔐 Step 3: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Go to **Sign-in method** tab
4. Enable the following providers:

### Email/Password
1. Click **"Email/Password"**
2. Enable **"Email/Password"** toggle
3. (Optional) Enable **"Email link (passwordless sign-in)"**
4. Click **"Save"**

### Google Sign-In (Optional)
1. Click **"Google"**
2. Enable the toggle
3. Add your support email
4. Click **"Save"**

---

## 🗄️ Step 4: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose mode:
   - **Production mode** (recommended for live app)
   - **Test mode** (for development - 30 days open access)
4. Select your preferred location (closest to your users)
5. Click **"Enable"**

---

## 📦 Step 5: Enable Cloud Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose security rules mode (same as Firestore)
4. Select the same location as Firestore
5. Click **"Done"**

---

## 🔧 Step 6: Configure Environment Variables

1. In your project root, create a `.env` file:

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

2. Open `.env` and add your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyD...your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

⚠️ **IMPORTANT**: Never commit `.env` file to Git! It's already in `.gitignore`.

---

## 🛡️ Step 7: Deploy Security Rules

1. Login to Firebase CLI:
```bash
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init
```
   - Select: Firestore, Storage, Hosting (optional), Functions (optional)
   - Use existing project: Select your project
   - Accept default file locations

3. Deploy security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 📊 Step 8: Create Firestore Indexes (Optional)

Deploy the composite indexes for better query performance:

```bash
firebase deploy --only firestore:indexes
```

---

## 🧪 Step 9: Test Your Setup

1. Start the development server:
```bash
npm start
```

2. Open http://localhost:3000

3. Test the following:
   - ✅ Homepage loads without errors
   - ✅ Register a new account
   - ✅ Login with the account
   - ✅ Add items to cart
   - ✅ Navigate through pages

---

## 👤 Step 10: Create Admin User

To create an admin user, follow these steps:

### Method 1: Firebase Console (Manual)

1. Go to **Firebase Console → Authentication → Users**
2. Find the user you want to make admin
3. Copy their **UID**
4. Go to **Firestore Database**
5. Navigate to `users` collection
6. Find the document with that UID
7. Edit the `role` field to `"admin"`

### Method 2: Using Cloud Functions (Recommended)

After deploying Cloud Functions, call the `setAdminRole` function with:
- userId: The UID of the user
- secretKey: Your admin secret key (set in Cloud Functions config)

---

## 🚀 Optional: Deploy to Firebase Hosting

1. Build the production app:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

3. Your app will be live at: `https://your-project-id.web.app`

---

## 🐛 Troubleshooting

### "Missing Firebase config fields" warning
- Make sure your `.env` file exists and has all required values
- Restart the development server after changing `.env`

### "Permission denied" errors
- Check Firestore security rules
- Make sure you're logged in for protected routes
- Verify user role for vendor/admin pages

### "Firebase: Error (auth/...)" 
- Check if Authentication is enabled in Firebase Console
- Verify API key is correct
- Check if the auth domain matches

### Storage upload errors
- Verify Storage is enabled
- Check storage.rules for correct permissions
- Ensure file size is within limits

---

## 📱 Firebase Console Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Authentication](https://console.firebase.google.com/project/_/authentication)
- [Firestore](https://console.firebase.google.com/project/_/firestore)
- [Storage](https://console.firebase.google.com/project/_/storage)
- [Hosting](https://console.firebase.google.com/project/_/hosting)

---

## 📞 Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firebase YouTube Channel](https://www.youtube.com/firebase)

---

Happy coding! 🎉

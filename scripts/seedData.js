// Firebase Data Seeding Script
// Run this script to populate your Firestore with initial demo data
// Usage: node scripts/seedData.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (requires service account)
// Download service account from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Demo Categories
const categories = [
    {
        id: 'home-decor',
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Beautiful items to decorate your home',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        status: 'active',
        order: 1,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'handmade-crafts',
        name: 'Handmade Crafts',
        slug: 'handmade-crafts',
        description: 'Unique handcrafted items',
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400',
        status: 'active',
        order: 2,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'gift-boxes',
        name: 'Gift Boxes',
        slug: 'gift-boxes',
        description: 'Curated gift sets for any occasion',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
        status: 'active',
        order: 3,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'personalized',
        name: 'Personalized Gifts',
        slug: 'personalized',
        description: 'Custom items with personal touch',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400',
        status: 'active',
        order: 4,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'wedding',
        name: 'Wedding Collection',
        slug: 'wedding',
        description: 'Special gifts for weddings',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        status: 'active',
        order: 5,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'festivals',
        name: 'Festival Specials',
        slug: 'festivals',
        description: 'Celebrate with unique festival gifts',
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400',
        status: 'active',
        order: 6,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'corporate',
        name: 'Corporate Gifts',
        slug: 'corporate',
        description: 'Professional gifts for businesses',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
        status: 'active',
        order: 7,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'art-paintings',
        name: 'Art & Paintings',
        slug: 'art-paintings',
        description: 'Original artwork and prints',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
        status: 'active',
        order: 8,
        parentId: null,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
];

// Demo Products
const products = [
    {
        name: 'Handmade Ceramic Vase - Blue Ocean',
        slug: 'handmade-ceramic-vase-blue-ocean',
        description: 'Beautiful hand-painted ceramic vase with ocean blue patterns. Perfect for home decoration and gifting.',
        price: 2499,
        salePrice: 1999,
        images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800'],
        category: 'home-decor',
        categoryName: 'Home Decor',
        vendorId: 'demo-vendor-1',
        vendorName: 'Artisan Crafts',
        stock: 25,
        sku: 'HC-VASE-001',
        status: 'approved',
        featured: true,
        rating: 4.5,
        reviewCount: 128,
        tags: ['vase', 'ceramic', 'handmade', 'decor'],
        specifications: {
            material: 'Ceramic',
            height: '30 cm',
            color: 'Blue',
            weight: '800g'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        name: 'Personalized Wooden Photo Frame',
        slug: 'personalized-wooden-photo-frame',
        description: 'Custom engraved wooden photo frame. Add your name or message for a personal touch.',
        price: 1299,
        salePrice: null,
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800'],
        category: 'personalized',
        categoryName: 'Personalized Gifts',
        vendorId: 'demo-vendor-2',
        vendorName: 'WoodWorks Studio',
        stock: 50,
        sku: 'PF-WOOD-001',
        status: 'approved',
        featured: true,
        rating: 4.8,
        reviewCount: 256,
        tags: ['photo frame', 'wood', 'personalized', 'gift'],
        specifications: {
            material: 'Teak Wood',
            size: '8x10 inches',
            finish: 'Natural Polish'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        name: 'Luxury Gift Box Set - Premium Collection',
        slug: 'luxury-gift-box-set-premium',
        description: 'Exquisite gift box containing scented candles, chocolates, and handmade soaps. Perfect for special occasions.',
        price: 3999,
        salePrice: 2999,
        images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'],
        category: 'gift-boxes',
        categoryName: 'Gift Boxes',
        vendorId: 'demo-vendor-1',
        vendorName: 'Artisan Crafts',
        stock: 15,
        sku: 'GB-LUX-001',
        status: 'approved',
        featured: true,
        rating: 4.7,
        reviewCount: 89,
        tags: ['gift box', 'luxury', 'premium', 'occasion'],
        specifications: {
            contents: 'Candles, Chocolates, Soaps',
            packaging: 'Premium Box',
            weight: '1.5 kg'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        name: 'Hand-painted Canvas Art - Abstract Sunrise',
        slug: 'hand-painted-canvas-abstract-sunrise',
        description: 'Original hand-painted canvas artwork with vibrant abstract sunrise theme. Signed by the artist.',
        price: 4999,
        salePrice: null,
        images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'],
        category: 'art-paintings',
        categoryName: 'Art & Paintings',
        vendorId: 'demo-vendor-3',
        vendorName: 'Art Gallery',
        stock: 5,
        sku: 'ART-CAN-001',
        status: 'approved',
        featured: true,
        rating: 4.9,
        reviewCount: 45,
        tags: ['art', 'canvas', 'painting', 'abstract'],
        specifications: {
            size: '24x36 inches',
            medium: 'Acrylic on Canvas',
            framed: 'Yes'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        name: 'Decorative Scented Candles Set',
        slug: 'decorative-scented-candles-set',
        description: 'Set of 3 scented candles with lavender, vanilla, and rose fragrances. Long-burning and eco-friendly.',
        price: 899,
        salePrice: 699,
        images: ['https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'],
        category: 'home-decor',
        categoryName: 'Home Decor',
        vendorId: 'demo-vendor-4',
        vendorName: 'Aroma House',
        stock: 100,
        sku: 'HD-CAN-001',
        status: 'approved',
        featured: false,
        rating: 4.4,
        reviewCount: 189,
        tags: ['candles', 'scented', 'decor', 'aroma'],
        specifications: {
            quantity: '3 candles',
            burnTime: '20+ hours each',
            material: 'Soy Wax'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        name: 'Traditional Madhubani Painting',
        slug: 'traditional-madhubani-painting',
        description: 'Authentic Madhubani folk art painting on handmade paper. Traditional Indian craft.',
        price: 2499,
        salePrice: null,
        images: ['https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800'],
        category: 'art-paintings',
        categoryName: 'Art & Paintings',
        vendorId: 'demo-vendor-3',
        vendorName: 'Art Gallery',
        stock: 8,
        sku: 'ART-MAD-001',
        status: 'approved',
        featured: true,
        rating: 4.8,
        reviewCount: 67,
        tags: ['madhubani', 'traditional', 'indian art', 'folk'],
        specifications: {
            size: '18x24 inches',
            medium: 'Natural Colors',
            origin: 'Bihar, India'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
];

// Site Settings
const settings = [
    {
        id: 'general',
        siteName: 'AR ONE Gifts & Crafts',
        tagline: 'Unique Handmade Treasures',
        email: 'support@arone-gifts.com',
        phone: '+91 98765 43210',
        address: '123 Commerce Street, Mumbai, Maharashtra 400001, India',
        currency: 'INR',
        currencySymbol: '₹'
    },
    {
        id: 'shipping',
        freeShippingThreshold: 999,
        standardShippingCost: 99,
        expressShippingCost: 199,
        sameDayShippingCost: 299,
        estimatedDeliveryDays: {
            standard: '5-7',
            express: '2-3',
            sameDay: '1'
        }
    },
    {
        id: 'vendor',
        defaultCommissionRate: 10,
        payoutMinimum: 500,
        payoutHoldDays: 7,
        autoApproveProducts: false,
        autoApproveVendors: false
    }
];

// Seed function
async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Seed Categories
        console.log('📁 Seeding categories...');
        for (const category of categories) {
            await db.collection('categories').doc(category.id).set(category);
            console.log(`   ✅ Added category: ${category.name}`);
        }
        console.log(`   Total: ${categories.length} categories\n`);

        // Seed Products
        console.log('📦 Seeding products...');
        for (const product of products) {
            const docRef = await db.collection('products').add(product);
            console.log(`   ✅ Added product: ${product.name} (${docRef.id})`);
        }
        console.log(`   Total: ${products.length} products\n`);

        // Seed Settings
        console.log('⚙️ Seeding settings...');
        for (const setting of settings) {
            await db.collection('settings').doc(setting.id).set(setting);
            console.log(`   ✅ Added setting: ${setting.id}`);
        }
        console.log(`   Total: ${settings.length} settings\n`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Create a user account through the app');
        console.log('   2. Update the user role to "admin" in Firestore');
        console.log('   3. Start exploring the admin dashboard!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run seeding
seedDatabase();

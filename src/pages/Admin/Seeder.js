import React, { useState } from 'react';
import { Button, Card, Container, Alert, ProgressBar } from 'react-bootstrap';
import { collection, doc, setDoc, writeBatch, getDoc, setLogLevel, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const Seeder = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const [errorDetail, setErrorDetail] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');

    // Enable debug logs on mount
    React.useEffect(() => {
        setLogLevel('debug');
    }, []);

    const testConnection = async () => {
        setLoading(true);
        setStatus('Testing connection...');
        setErrorDetail(null);
        try {
            // Try to write a single tiny document
            await setDoc(doc(db, 'test_connection', 'ping'), {
                timestamp: new Date(),
                ok: true
            });
            setStatus('success: Connection verified! You can now Seed Database.');
        } catch (error) {
            console.error("Connection Test Failed:", error);
            setStatus('Error: Connection Test Failed');
            setErrorDetail(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Expanded Categories data - 13 categories
    const categories = [
        { id: 'handmade-crafts', name: 'Handmade Crafts', slug: 'handmade-crafts', description: 'Authentic handmade crafts and artifacts', image: 'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?w=500', status: 'active', order: 1, parentId: null, productCount: 0 },
        { id: 'home-decor', name: 'Home Decor', slug: 'home-decor', description: 'Beautiful decorative items for your home', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', status: 'active', order: 2, parentId: null, productCount: 0 },
        { id: 'gifts', name: 'Gifts', slug: 'gifts', description: 'Perfect gifts for all occasions', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', status: 'active', order: 3, parentId: null, productCount: 0 },
        { id: 'gift-boxes', name: 'Gift Boxes', slug: 'gift-boxes', description: 'Curated gift sets for any occasion', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', status: 'active', order: 4, parentId: null, productCount: 0 },
        { id: 'party-favours', name: 'Party Favours', slug: 'party-favours', description: 'Unique favours for your celebrations', image: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=500', status: 'active', order: 5, parentId: null, productCount: 0 },
        { id: 'wedding', name: 'Wedding Gifts', slug: 'wedding', description: 'Special gifts for weddings', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500', status: 'active', order: 6, parentId: null, productCount: 0 },
        { id: 'personalized', name: 'Personalized Items', slug: 'personalized', description: 'Customized gifts with your personal touch', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500', status: 'active', order: 7, parentId: null, productCount: 0 },
        { id: 'festivals', name: 'Festival Items', slug: 'festivals', description: 'Celebrate special occasions with style', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500', status: 'active', order: 8, parentId: null, productCount: 0 },
        { id: 'corporate-gifts', name: 'Corporate Gifts', slug: 'corporate-gifts', description: 'Professional gifts for business occasions', image: 'https://images.unsplash.com/photo-1513618364916-ae2f1f7f6501?w=500', status: 'active', order: 9, parentId: null, productCount: 0 },
        { id: 'toys-games', name: 'Toys & Games', slug: 'toys-games', description: 'Fun toys and games for all ages', image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500', status: 'active', order: 10, parentId: null, productCount: 0 },
        { id: 'jewelry', name: 'Jewelry & Accessories', slug: 'jewelry', description: 'Handcrafted jewelry and accessories', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', status: 'active', order: 11, parentId: null, productCount: 0 },
        { id: 'art-paintings', name: 'Art & Paintings', slug: 'art-paintings', description: 'Original artwork and paintings', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500', status: 'active', order: 12, parentId: null, productCount: 0 },
        { id: 'stationery', name: 'Stationery & Cards', slug: 'stationery', description: 'Beautiful stationery and greeting cards', image: 'https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?w=500', status: 'active', order: 13, parentId: null, productCount: 0 }
    ];

    // Vendors data
    const vendors = [
        {
            id: 'vendor_1_doc', // This is just for array iteration, the actual Doc ID is set below
            businessName: 'Lanka Crafts',
            businessEmail: 'contact@lankacrafts.lk',
            businessDescription: 'Authentic Sri Lankan handicrafts.',
            status: 'approved',
            rating: 4.8,
            reviewCount: 120,
            userId: 'vendor1', // Match the ID used in demoProduct in ProductDetail.js
            createdAt: new Date(),
            logo: 'https://ui-avatars.com/api/?name=Lanka+Crafts&background=random'
        },
        {
            id: 'vendor_2',
            businessName: 'Colombo Gifts',
            businessEmail: 'info@colombogifts.lk',
            businessDescription: 'Modern gifts for modern people.',
            status: 'approved',
            rating: 4.5,
            reviewCount: 85,
            userId: 'vendor_user_2',
            createdAt: new Date(),
            logo: 'https://ui-avatars.com/api/?name=Colombo+Gifts&background=random'
        },
        {
            id: 'vendor_3',
            businessName: 'Artisan Hub',
            businessEmail: 'hello@artisanhub.lk',
            businessDescription: 'Curated collection of Sri Lankan artisan products.',
            status: 'approved',
            rating: 4.9,
            reviewCount: 200,
            userId: 'vendor_user_3',
            createdAt: new Date(),
            logo: 'https://ui-avatars.com/api/?name=Artisan+Hub&background=random'
        }
    ];

    // Generate 120+ Products Programmatically across ALL categories
    const generateProducts = () => {
        const baseProducts = [
            // Handmade Crafts (15 items)
            { name: 'Hand-painted Elephant', cat: 'handmade-crafts', price: 2500, img: 'https://images.unsplash.com/photo-1599696853380-692b450543e0?w=500' },
            { name: 'Batik Wall Hanging', cat: 'handmade-crafts', price: 5000, img: 'https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?w=500' },
            { name: 'Coconut Shell Spoon', cat: 'handmade-crafts', price: 450, img: 'https://images.unsplash.com/photo-1584269600464-3701b2c45350?w=500' },
            { name: 'Wooden Mask', cat: 'handmade-crafts', price: 3500, img: 'https://images.unsplash.com/photo-1572506487501-c88283a38612?w=500' },
            { name: 'Clay Pottery', cat: 'handmade-crafts', price: 1800, img: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500' },

            // Home Decor (15 items)
            { name: 'Cinnamon Candles', cat: 'home-decor', price: 1200, img: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500' },
            { name: 'Handwoven Reed Mat', cat: 'home-decor', price: 2800, img: 'https://images.unsplash.com/photo-1615560375626-444f94480ce2?w=500' },
            { name: 'Brass Oil Lamp', cat: 'home-decor', price: 7500, img: 'https://images.unsplash.com/photo-1618683116544-23e592750085?w=500' },
            { name: 'Dream Catcher', cat: 'home-decor', price: 1600, img: 'https://images.unsplash.com/photo-1563804803738-466d3a82701a?w=500' },
            { name: 'Decorative Mirror', cat: 'home-decor', price: 3400, img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500' },

            // Gifts (10 items)
            { name: 'Personalized Mug', cat: 'gifts', price: 950, img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500' },
            { name: 'Gift Hamper', cat: 'gifts', price: 4500, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
            { name: 'Photo Album', cat: 'gifts', price: 2200, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500' },

            // Gift Boxes (10 items)
            { name: 'Premium Gift Box', cat: 'gift-boxes', price: 5500, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
            { name: 'Chocolate Gift Set', cat: 'gift-boxes', price: 3200, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500' },
            { name: 'Tea Gift Collection', cat: 'gift-boxes', price: 2800, img: 'https://images.unsplash.com/photo-1563822249366-3a00c313a3c7?w=500' },  // Party Favours (10 items)
            { name: 'Party Favor Box Set', cat: 'party-favours', price: 1500, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500' },
            { name: 'Wedding Cake Topper', cat: 'party-favours', price: 1800, img: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=500' },
            { name: 'Goodie Bags', cat: 'party-favours', price: 800, img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500' },

            // Wedding (12 items)
            { name: 'Wedding Invitation Set', cat: 'wedding', price: 3500, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500' },
            { name: 'Table Centerpiece', cat: 'wedding', price: 2500, img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500' },
            { name: 'Guest Book', cat: 'wedding', price: 1800, img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500' },

            // Personalized (10 items)
            { name: 'Custom Name Plate', cat: 'personalized', price: 1200, img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500' },
            { name: 'Engraved Keychain', cat: 'personalized', price: 600, img: 'https://images.unsplash.com/photo-1591127378374-0c135b5e6849?w=500' },
            { name: 'Photo Frame', cat: 'personalized', price: 1100, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500' },

            // Festivals (10 items)
            { name: 'Festival Lantern', cat: 'festivals', price: 2200, img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500' },
            { name: 'decorative Lights', cat: 'festivals', price: 3500, img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500' },

            // Corporate Gifts (8 items)
            { name: 'Executive Pen Set', cat: 'corporate-gifts', price: 4500, img: 'https://images.unsplash.com/photo-1513618364916-ae2f1f7f6501?w=500' },
            { name: 'Desk Organizer', cat: 'corporate-gifts', price: 2800, img: 'https://images.unsplash.com/photo-1531973819741-e27a5ae2cc7b?w=500' },

            // Toys & Games (10 items)
            { name: 'Wooden Puzzle', cat: 'toys-games', price: 1200, img: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500' },
            { name: 'Board Game', cat: 'toys-games', price: 2500, img: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500' },

            // Jewelry (10 items)
            { name: 'Silver Bracelet', cat: 'jewelry', price: 3500, img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' },
            { name: 'Handmade Necklace', cat: 'jewelry', price: 4200, img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500' },

            // Art & Paintings (8 items)
            { name: 'Canvas Painting', cat: 'art-paintings', price: 8500, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500' },
            { name: 'Watercolor Art', cat: 'art-paintings', price: 6500, img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=500' },

            // Stationery (8 items)
            { name: 'Greeting Card Set', cat: 'stationery', price: 600, img: 'https://images.unsplash.com/photo-1520032525096-7bd04a94b5a4?w=500' },
            { name: 'Handmade Notebook', cat: 'stationery', price: 1200, img: 'https://images.unsplash.com/photo-1544816565-aa8c1166648b?w=500' }
        ];

        const generated = [];
        // Generate 10 variations of each base product = 120+ products
        for (let i = 0; i < 120; i++) {
            const base = baseProducts[i % baseProducts.length];
            const isFeatured = Math.random() > 0.7; // 30% featured
            const variationPrice = base.price + Math.floor(Math.random() * 500) - 250;
            const vendor = vendors[i % 3]; // Distribute across 3 vendors

            generated.push({
                id: `prod_${i + 1}`,
                name: `${base.name} ${Math.floor(i / baseProducts.length) + 1}`,
                price: variationPrice > 0 ? variationPrice : base.price,
                description: `Authentic ${base.name} handcrafted with care in Sri Lanka. Perfect for your home or as a thoughtful gift.`,
                category: base.cat,
                vendorId: vendor.userId,
                vendorName: vendor.businessName,
                status: 'approved',
                stock: Math.floor(Math.random() * 50) + 5,
                images: [base.img],
                featured: isFeatured,
                views: Math.floor(Math.random() * 500),
                sales: Math.floor(Math.random() * 50),
                rating: 4.0 + Math.random(),
                reviewCount: Math.floor(Math.random() * 20),
                createdAt: new Date(Date.now() - (i * 1000000))
            });
        }
        return generated;
    };

    const products = generateProducts();

    const seedData = async () => {
        setLoading(true);
        setStatus('Starting seed...');
        setErrorDetail(null);
        setProgress(10);

        // Timeout promise
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Operation timed out. Please check your internet connection or if Firestore is enabled in console.")), 15000)
        );

        try {
            if (!db) throw new Error("Firebase DB not initialized. Check your credentials.");

            await Promise.race([
                (async () => {
                    const batch = writeBatch(db);

                    // Seed Categories
                    setStatus('Seeding Categories...');
                    categories.forEach(cat => {
                        const docRef = doc(db, 'categories', cat.id);
                        batch.set(docRef, cat);
                    });
                    setProgress(40);

                    // Seed Vendors
                    setStatus('Seeding Vendors...');
                    vendors.forEach(vendor => {
                        const docRef = doc(db, 'vendors', vendor.userId);
                        batch.set(docRef, vendor);
                    });
                    setProgress(70);

                    // Seed Products
                    setStatus('Seeding Products...');
                    products.forEach(prod => {
                        const docRef = doc(db, 'products', prod.id);
                        batch.set(docRef, prod);
                    });
                    setProgress(90);

                    setStatus('Committing changes to Firestore...');
                    await batch.commit();
                    setProgress(100);
                })(),
                timeout
            ]);

            setStatus('Success! Database populated with Sri Lankan localized data.');
        } catch (error) {
            console.error(error);
            console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); // improved error logging
            setStatus('Error: Failed to seed database.');
            setErrorDetail(error.message);

            if (error.code === 'permission-denied') {
                setErrorDetail("Permission Denied: Go to Firebase Console > Firestore Database > Rules and allow read/write access temporarily.");
            } else if (error.code === 'unavailable') {
                setErrorDetail("Service Unavailable: Check your internet connection or if you are offline.");
            } else if (error.message.includes("timed out")) {
                setErrorDetail("Timeout: Make sure you created the 'Firestore Database' in the Firebase Console!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async () => {
        setLoading(true);
        setStatus('Promoting user...');
        setErrorDetail(null);

        try {
            // Find user by email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', adminEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error(`User with email ${adminEmail} not found. Please register first.`);
            }

            // Update first matching user
            const userDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
                role: 'admin',
                updatedAt: new Date()
            });

            setStatus(`Success! ${adminEmail} is now an Admin. Logout and Login again to see changes.`);
            setAdminEmail('');
        } catch (error) {
            console.error(error);
            setStatus('Error: Failed to promote user.');
            setErrorDetail(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 mx-auto" style={{ maxWidth: '600px' }}>
                <h2 className="mb-4 text-center">System Data Seeder</h2>

                <Alert variant="warning" className="small">
                    <strong>Current Project (Environment):</strong> {process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not configured'} <br />
                    <strong>Active Config:</strong> {db?.app?.options?.projectId || 'Unknown'} <br />
                    Ensure this matches your Firebase Console project.
                </Alert>

                <Alert variant="info">
                    Use this tool to populate your Firestore database with initial data (Categories, Vendors, Products) localized for Sri Lanka.
                </Alert>

                {status && (
                    <Alert variant={status.startsWith('Error') ? 'danger' : 'success'}>
                        {status}
                        {errorDetail && (
                            <div className="mt-2 text-small border-top pt-2">
                                <strong>Troubleshooting:</strong> {errorDetail}
                            </div>
                        )}
                    </Alert>
                )}

                {loading && <ProgressBar now={progress} label={`${progress}%`} className="mb-3 animated" />}

                <Button
                    variant="outline-primary"
                    className="w-100 mb-3"
                    onClick={testConnection}
                    disabled={loading}
                >
                    Test Connection (Check First)
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={seedData}
                    disabled={loading}
                    className="w-100"
                >
                    {loading ? 'Seeding...' : 'Seed Database'}
                </Button>

                <div className="mt-4 pt-4 border-top">
                    <h4>Create Admin User</h4>
                    <p className="small text-muted">Enter the email of an <strong>existing registered user</strong> to promote them to Admin.</p>
                    <div className="d-flex gap-2">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="user@example.com"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                        />
                        <Button
                            variant="dark"
                            onClick={handleMakeAdmin}
                            disabled={loading || !adminEmail}
                        >
                            Promote
                        </Button>
                    </div>
                </div>

                <div className="mt-4 text-muted small">
                    <p><strong>Stuck at 90%?</strong></p>
                    <ul className="mb-0">
                        <li>Ensure you created the <strong>Firestore Database</strong> in Firebase Console.</li>
                        <li>Check your <strong>Security Rules</strong> allow writes (set to Test Mode).</li>
                        <li>Verify your <strong>.env</strong> file has the correct Project ID.</li>
                    </ul>
                </div>
            </Card>
        </Container>
    );
};

export default Seeder;

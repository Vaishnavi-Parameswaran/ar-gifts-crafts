// Fix Orphaned Vendors Script
// Run this with: node scripts/fix-vendors.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to add this

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixVendors() {
    console.log('🔧 Starting vendor fix...\n');

    // Step 1: Create AR Gifts Official vendor
    console.log('📦 Creating AR Gifts Official vendor...');
    const officialVendorRef = db.collection('vendors').doc('ar_gifts_official');

    await officialVendorRef.set({
        userId: 'ar_gifts_official',
        businessName: 'AR Gifts Official',
        businessEmail: 'admin@argifts.lk',
        businessPhone: '+94771234567',
        businessAddress: 'Colombo, Sri Lanka',
        businessDescription: 'Official AR Gifts platform products - curated collection of gifts and crafts',
        businessType: 'Official Store',
        logo: 'https://ui-avatars.com/api/?name=AR+Gifts&background=4f46e5&color=fff&size=200',
        banner: '',
        status: 'approved',
        rating: 5.0,
        reviewCount: 0,
        totalSales: 0,
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        commissionRate: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ AR Gifts Official vendor created\n');

    // Step 2: Reassign orphaned products
    console.log('🔄 Reassigning orphaned products...');
    const orphanedVendorIds = ['vendor_1', 'vendor_2', 'vendor_3'];

    for (const vendorId of orphanedVendorIds) {
        const productsSnapshot = await db.collection('products')
            .where('vendorId', '==', vendorId)
            .get();

        console.log(`   Found ${productsSnapshot.size} products for ${vendorId}`);

        const batch = db.batch();
        productsSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                vendorId: 'ar_gifts_official',
                vendorName: 'AR Gifts Official'
            });
        });

        await batch.commit();
        console.log(`   ✅ Reassigned ${productsSnapshot.size} products`);
    }

    console.log('\n✨ Vendor fix complete!\n');
    console.log('Summary:');
    console.log('- Created: AR Gifts Official vendor');
    console.log('- Reassigned: All orphaned products');
    console.log('\nYou can now manage all vendors in the admin dashboard!');

    process.exit(0);
}

fixVendors().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});

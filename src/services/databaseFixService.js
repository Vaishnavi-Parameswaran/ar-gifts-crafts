// Database Fix Utility Functions
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * One-Click Fix for Orphaned Vendors
 * Creates AR Gifts Official vendor and reassigns all orphaned products
 */
export const fixOrphanedVendors = async () => {
    console.log('🔧 Starting automated vendor fix...\n');

    const results = {
        success: false,
        vendorCreated: false,
        productsReassigned: 0,
        errors: []
    };

    try {
        // STEP 1: Create AR Gifts Official Vendor
        console.log('📦 Creating AR Gifts Official vendor...');

        const officialVendorData = {
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
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const vendorRef = doc(db, 'vendors', 'ar_gifts_official');
        await setDoc(vendorRef, officialVendorData);

        console.log('✅ AR Gifts Official vendor created');
        results.vendorCreated = true;

        // STEP 2: Reassign orphaned products
        console.log('\n🔄 Reassigning orphaned products...');
        const orphanedVendorIds = ['vendor_1', 'vendor_2', 'vendor_3'];
        let totalReassigned = 0;

        for (const vendorId of orphanedVendorIds) {
            try {
                // Query products for this vendor
                const q = query(
                    collection(db, 'products'),
                    where('vendorId', '==', vendorId)
                );

                const snapshot = await getDocs(q);
                console.log(`   Found ${snapshot.size} products for ${vendorId}`);

                // Update each product
                const updatePromises = snapshot.docs.map(productDoc =>
                    updateDoc(doc(db, 'products', productDoc.id), {
                        vendorId: 'ar_gifts_official',
                        vendorName: 'AR Gifts Official',
                        updatedAt: serverTimestamp()
                    })
                );

                await Promise.all(updatePromises);
                console.log(`   ✅ Reassigned ${snapshot.size} products`);
                totalReassigned += snapshot.size;

            } catch (err) {
                console.error(`   ❌ Error processing ${vendorId}:`, err);
                results.errors.push(`Failed to reassign products from ${vendorId}: ${err.message}`);
            }
        }

        results.productsReassigned = totalReassigned;
        results.success = true;

        console.log('\n✨ Vendor fix complete!');
        console.log(`Summary:`);
        console.log(`- Vendor created: ${results.vendorCreated ? 'Yes' : 'No'}`);
        console.log(`- Products reassigned: ${results.productsReassigned}`);
        console.log(`- Errors: ${results.errors.length}`);

        return results;

    } catch (error) {
        console.error('❌ Critical error during fix:', error);
        results.errors.push(`Critical error: ${error.message}`);
        return results;
    }
};

/**
 * Verify if the fix is needed
 */
export const checkIfFixNeeded = async () => {
    try {
        // Check if AR Gifts Official vendor exists
        const vendorRef = doc(db, 'vendors', 'ar_gifts_official');
        const vendorSnap = await getDoc(vendorRef);

        if (vendorSnap.exists()) {
            return { needed: false, reason: 'AR Gifts Official vendor already exists' };
        }

        // Check for orphaned products
        const orphanedVendorIds = ['vendor_1', 'vendor_2', 'vendor_3'];
        let orphanedCount = 0;

        for (const vendorId of orphanedVendorIds) {
            const q = query(
                collection(db, 'products'),
                where('vendorId', '==', vendorId)
            );
            const snapshot = await getDocs(q);
            orphanedCount += snapshot.size;
        }

        if (orphanedCount > 0) {
            return {
                needed: true,
                reason: `Found ${orphanedCount} orphaned products that need reassignment`
            };
        }

        return { needed: false, reason: 'No orphaned vendors or products found' };

    } catch (error) {
        console.error('Error checking fix status:', error);
        return { needed: true, reason: 'Unable to verify - recommend running fix' };
    }
};

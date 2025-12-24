import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const VendorQuickFix = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);
    const [vendorData, setVendorData] = useState(null);

    useEffect(() => {
        checkVendorStatus();
    }, [currentUser]);

    const checkVendorStatus = async () => {
        if (!currentUser) {
            setStatus({ type: 'danger', message: 'Not logged in!' });
            return;
        }

        try {
            const vendorRef = doc(db, 'vendors', currentUser.uid);
            const vendorSnap = await getDoc(vendorRef);

            if (vendorSnap.exists()) {
                setVendorData(vendorSnap.data());
                setBusinessName(vendorSnap.data().businessName || '');
                setStatus({ type: 'success', message: 'Vendor profile EXISTS ✅' });
            } else {
                setStatus({ type: 'warning', message: 'Vendor profile DOES NOT EXIST ❌' });
            }
        } catch (error) {
            setStatus({ type: 'danger', message: 'Error checking vendor: ' + error.message });
        }
    };

    const forceCreateVendorProfile = async () => {
        if (!currentUser) {
            alert('Please log in first!');
            return;
        }

        if (!businessName.trim()) {
            alert('Please enter a business name!');
            return;
        }

        setLoading(true);
        try {
            // 1. Update user role
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { role: 'vendor' }, { merge: true });
            console.log('✅ User role set to vendor');

            // 2. Create minimal vendor profile
            const vendorRef = doc(db, 'vendors', currentUser.uid);
            const vendorProfile = {
                userId: currentUser.uid,
                businessName: businessName.trim(),
                businessEmail: currentUser.email,
                businessPhone: '',
                businessAddress: '',
                businessDescription: '',
                businessType: 'individual',
                taxId: '',
                bankDetails: {
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    ifscCode: ''
                },
                documents: {},
                logo: '',
                banner: '',
                status: 'approved', // Auto-approve for testing
                commissionRate: 10,
                rating: 0,
                reviewCount: 0,
                totalSales: 0,
                totalEarnings: 0,
                availableBalance: 0,
                pendingBalance: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(vendorRef, vendorProfile);
            console.log('✅ Vendor profile created');

            // 3. Refresh profile
            await refreshProfile();
            console.log('✅ Profile refreshed');

            setStatus({ type: 'success', message: 'VENDOR PROFILE CREATED SUCCESSFULLY! ✅' });

            // Wait 2 seconds then redirect
            setTimeout(() => {
                navigate('/vendor/dashboard');
            }, 2000);

        } catch (error) {
            console.error('Error creating vendor profile:', error);
            setStatus({ type: 'danger', message: 'Error: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const fixUserRole = async () => {
        if (!currentUser) {
            alert('Please log in first!');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                role: 'vendor',
                updatedAt: serverTimestamp()
            }, { merge: true });

            await refreshProfile();
            setStatus({ type: 'success', message: 'User role updated to VENDOR ✅' });
        } catch (error) {
            setStatus({ type: 'danger', message: 'Error: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">🔧 Vendor Quick Fix</h1>

            {status.message && (
                <Alert variant={status.type}>{status.message}</Alert>
            )}

            <Card className="mb-4">
                <Card.Header><strong>Current Status</strong></Card.Header>
                <Card.Body>
                    <p><strong>User ID:</strong> <code>{currentUser?.uid || 'Not logged in'}</code></p>
                    <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>
                    <p><strong>User Role (from Context):</strong> <code>{userProfile?.role || 'N/A'}</code></p>
                    <p><strong>Vendor Profile Exists:</strong> {vendorData ? '✅ YES' : '❌ NO'}</p>
                    {vendorData && (
                        <>
                            <p><strong>Business Name:</strong> {vendorData.businessName}</p>
                            <p><strong>Status:</strong> {vendorData.status}</p>
                        </>
                    )}
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header><strong>Quick Actions</strong></Card.Header>
                <Card.Body>
                    <div className="mb-3">
                        <h5>1. Fix User Role Only</h5>
                        <p className="text-muted small">Updates your role to "vendor" in users collection</p>
                        <Button onClick={fixUserRole} disabled={loading} variant="warning">
                            {loading ? 'Fixing...' : 'Fix User Role'}
                        </Button>
                    </div>

                    <hr />

                    <div className="mb-3">
                        <h5>2. Create Complete Vendor Profile</h5>
                        <p className="text-muted small">Creates a vendor profile with auto-approve status</p>
                        <Form.Group className="mb-3">
                            <Form.Label>Business Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Enter your business name"
                                required
                            />
                        </Form.Group>
                        <Button
                            onClick={forceCreateVendorProfile}
                            disabled={loading || !businessName.trim()}
                            variant="primary"
                        >
                            {loading ? 'Creating...' : 'Create Vendor Profile'}
                        </Button>
                    </div>

                    <hr />

                    <div>
                        <h5>3. Check Status Again</h5>
                        <Button onClick={checkVendorStatus} variant="secondary">
                            Refresh Status
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header><strong>Instructions</strong></Card.Header>
                <Card.Body>
                    <ol>
                        <li>Make sure you're logged in</li>
                        <li>If "Vendor Profile Exists" shows ❌ NO:
                            <ul>
                                <li>Enter your business name</li>
                                <li>Click "Create Vendor Profile"</li>
                                <li>Wait for success message</li>
                                <li>You'll be redirected to dashboard</li>
                            </ul>
                        </li>
                        <li>If you only need to fix the role, click "Fix User Role"</li>
                        <li>After any action, click "Refresh Status" to verify</li>
                    </ol>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VendorQuickFix;

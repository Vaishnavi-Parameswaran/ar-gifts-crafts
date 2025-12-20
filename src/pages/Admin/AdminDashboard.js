// Admin Dashboard Component
import React, { useState, useEffect, useMemo } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Button, Badge, Table, Form, Modal } from 'react-bootstrap';
import {
    FiHome, FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
    FiSettings, FiLogOut, FiCheck, FiX, FiEye, FiEdit,
    FiTrash2, FiTrendingUp, FiAlertCircle, FiMessageSquare, FiTag, FiStar, FiUser
} from 'react-icons/fi';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    or
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, updateUserStatus, updateUserRole } from '../../services/userService';
import { getAllVendors, updateVendorStatus, getVendorStats } from '../../services/vendorService';
import { getProducts, updateProduct, getVendorProducts } from '../../services/productService';

import { sendPushNotification, NotificationTemplates } from '../../services/notificationService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { getAllReviews, getVendorReviews } from '../../services/reviewService';
import Loading from '../../components/common/Loading';
import { AdminCategories, AdminCoupons, AdminReviews, AdminSettings } from './AdminPages';
import AdminAnalytics from './AdminAnalytics';
import './AdminDashboard.css';

// Dashboard Overview
// Dashboard Overview
const AdminOverview = ({ vendorMap }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingVendors: 0,
        pendingProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for Stats
        const usersQ = query(collection(db, 'users'));
        const vendorsQ = query(collection(db, 'vendors'));
        const productsQ = query(collection(db, 'products'));
        const ordersQ = query(collection(db, 'orders'));

        const unsubUsers = onSnapshot(usersQ, snapshot => {
            setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
        });

        const unsubVendors = onSnapshot(vendorsQ, snapshot => {
            const vendors = snapshot.docs.map(doc => doc.data());
            setStats(prev => ({
                ...prev,
                totalVendors: snapshot.size,
                pendingVendors: vendors.filter(v => v.status === 'pending').length
            }));
        });

        const unsubProducts = onSnapshot(productsQ, snapshot => {
            const products = snapshot.docs.map(doc => doc.data());
            setStats(prev => ({
                ...prev,
                totalProducts: snapshot.size,
                pendingProducts: products.filter(p => p.status === 'pending').length
            }));
        });

        const unsubOrders = onSnapshot(ordersQ, snapshot => {
            const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            setStats(prev => ({ ...prev, totalOrders: snapshot.size, totalRevenue }));
            // Get 5 most recent orders
            const sorted = ordersList.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            setRecentOrders(sorted.slice(0, 5));
            setLoading(false);
        });

        return () => {
            unsubUsers();
            unsubVendors();
            unsubProducts();
            unsubOrders();
        };
    }, []);

    const displayStats = stats;

    if (loading) return <Loading text="Loading overview..." />;

    return (
        <div className="admin-overview">
            <h2>Dashboard Overview</h2>

            {/* Alert Cards */}
            {(displayStats.pendingVendors > 0 || displayStats.pendingProducts > 0) && (
                <div className="alert-cards">
                    {displayStats.pendingVendors > 0 && (
                        <Card className="alert-card warning">
                            <Card.Body>
                                <FiAlertCircle />
                                <span>{displayStats.pendingVendors} vendors awaiting approval</span>
                                <Link to="/admin/vendors?status=pending">Review</Link>
                            </Card.Body>
                        </Card>
                    )}
                    {displayStats.pendingProducts > 0 && (
                        <Card className="alert-card info">
                            <Card.Body>
                                <FiAlertCircle />
                                <span>{displayStats.pendingProducts} products pending review</span>
                                <Link to="/admin/products?status=pending">Review</Link>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            )}

            <Row className="stats-cards">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card users">
                        <Card.Body>
                            <div className="stat-icon"><FiUsers /></div>
                            <div className="stat-info">
                                <h3>{displayStats.totalUsers.toLocaleString()}</h3>
                                <p>Total Users</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card vendors">
                        <Card.Body>
                            <div className="stat-icon"><FiUsers /></div>
                            <div className="stat-info">
                                <h3>{displayStats.totalVendors}</h3>
                                <p>Total Vendors</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card products">
                        <Card.Body>
                            <div className="stat-icon"><FiPackage /></div>
                            <div className="stat-info">
                                <h3>{displayStats.totalProducts}</h3>
                                <p>Total Products</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card revenue">
                        <Card.Body>
                            <div className="stat-icon"><FiDollarSign /></div>
                            <div className="stat-info">
                                <h3>Rs. {displayStats.totalRevenue.toLocaleString()}</h3>
                                <p>Total Revenue</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="data-card">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Orders</h5>
                            <Link to="/admin/orders" className="btn btn-link btn-sm">View All</Link>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Vendor</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.orderId}</td>
                                                <td>{order.shippingAddress?.name || order.customerName || 'Customer'}</td>
                                                <td>
                                                    {order.vendorOrders?.map(vo => vendorMap[vo.vendorId] || vo.vendorName || 'Shop').join(', ') || 'Unknown'}
                                                </td>
                                                <td>Rs. {order.totalAmount?.toLocaleString()}</td>
                                                <td>
                                                    <Badge bg={
                                                        order.orderStatus === 'delivered' ? 'success' :
                                                            order.orderStatus === 'cancelled' ? 'danger' : 'warning'
                                                    }>
                                                        {order.orderStatus}
                                                    </Badge>
                                                </td>
                                                <td>{order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center text-muted">No orders found</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="data-card">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0">Quick Actions</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" as={Link} to="/admin/vendors?status=pending" className="text-start d-flex align-items-center gap-2">
                                    <FiUsers /> Review Pending Vendors
                                </Button>
                                <Button variant="outline-info" as={Link} to="/admin/products?status=pending" className="text-start d-flex align-items-center gap-2">
                                    <FiPackage /> Approve Products
                                </Button>
                                <Button variant="outline-success" as={Link} to="/admin/orders" className="text-start d-flex align-items-center gap-2">
                                    <FiShoppingBag /> Manage Orders
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Vendors Management (Split View)
const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorData, setVendorData] = useState({ stats: null, products: [], reviews: [] });
    const [detailLoading, setDetailLoading] = useState(false);


    useEffect(() => {
        // Real-time listener for Vendors list
        const q = query(collection(db, 'vendors'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Remove duplicates by businessName and aggregate IDs
            const uniqueVendorsMap = new Map();
            data.forEach(v => {
                let name = (v.businessName || 'Unknown Shop').trim();
                let normalizedName = name.toLowerCase();

                // Intelligent Merging: Handle variants for major vendors
                if (normalizedName.includes('artisan hub')) {
                    normalizedName = 'artisan hub';
                    name = 'Artisan Hub';
                } else if (normalizedName.includes('dream light')) {
                    normalizedName = 'dream light';
                    name = 'Dream Light';
                } else if (normalizedName.includes('dream big')) {
                    normalizedName = 'dream big';
                    name = 'Dream Big';
                } else if (normalizedName.includes('colombo gift')) {
                    normalizedName = 'colombo gifts';
                    name = 'Colombo Gifts';
                } else if (normalizedName.includes('lanka craft')) {
                    normalizedName = 'lanka crafts';
                    name = 'Lanka Crafts';
                }

                if (!uniqueVendorsMap.has(normalizedName)) {
                    uniqueVendorsMap.set(normalizedName, {
                        ...v,
                        businessName: name,
                        allIds: [v.id],
                        allNames: [v.businessName || name],
                        isMerged: name.toLowerCase() !== (v.businessName || '').toLowerCase()
                    });
                } else {
                    const existing = uniqueVendorsMap.get(normalizedName);
                    if (!existing.allIds.includes(v.id)) {
                        existing.allIds.push(v.id);
                    }
                    if (v.businessName && !existing.allNames.includes(v.businessName)) {
                        existing.allNames.push(v.businessName);
                    }
                    // Prioritize more complete profile data or active status
                    if (v.status === 'approved' && existing.status !== 'approved') {
                        existing.status = v.status;
                    }
                    if ((v.rating || 0) > (existing.rating || 0)) {
                        existing.rating = v.rating;
                    }
                }
            });

            // Post-process to inject LEGACY names for the Big 5
            const uniqueVendors = Array.from(uniqueVendorsMap.values()).map(v => {
                const names = new Set([...v.allNames].map(n => n.trim()));
                const lower = (v.businessName || '').toLowerCase();

                if (lower.includes('artisan hub')) names.add('Old Artisan Hub');
                if (lower.includes('dream light')) { names.add('Old Dream Light'); names.add('Dream Lights'); }
                if (lower.includes('dream big')) names.add('Dream Big Shop');
                if (lower.includes('colombo gift')) names.add('Colombo Gift');
                if (lower.includes('lanka craft')) names.add('Lanka Craft');

                return {
                    ...v,
                    allIds: [...v.allIds].sort(),
                    allNames: [...names].filter(n => n).sort()
                };
            });

            setVendors(uniqueVendors);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sync selected vendor whenever the vendors list updates
    useEffect(() => {
        if (vendors.length > 0) {


            if (!selectedVendor) {
                setSelectedVendor(vendors[0]);
            } else {
                const currentName = (selectedVendor.businessName || '').trim().toLowerCase();
                const latest = vendors.find(v => (v.businessName || '').trim().toLowerCase() === currentName);
                if (latest) {
                    // Smart Comparison: Only update if IDs, Names, or Status changed
                    // This prevents re-renders (and re-fetches) from object reference changes
                    const idsChanged = JSON.stringify(latest.allIds) !== JSON.stringify(selectedVendor.allIds);
                    const namesChanged = JSON.stringify(latest.allNames) !== JSON.stringify(selectedVendor.allNames);
                    const statusChanged = latest.status !== selectedVendor.status;

                    if (idsChanged || namesChanged || statusChanged) {
                        setSelectedVendor(latest);
                    }
                }
            }
        }
    }, [vendors, selectedVendor?.businessName]);

    const queryKey = useMemo(() => {
        if (!selectedVendor) return '';
        const ids = (selectedVendor.allIds || [selectedVendor.id]).filter(id => id).sort().join(',');
        const names = (selectedVendor.allNames || [selectedVendor.businessName || '']).filter(n => n).sort().join(',');
        return `${ids}|${names}`;
    }, [selectedVendor]);

    const [idProducts, setIdProducts] = useState([]);
    const [nameProducts, setNameProducts] = useState([]);

    useEffect(() => {
        if (!selectedVendor || !queryKey) return;

        setDetailLoading(true);
        let isActive = true;

        const vendorIds = (selectedVendor.allIds || [selectedVendor.id]).filter(id => id && typeof id === 'string');
        const queryIds = vendorIds.slice(0, 10);
        const queryNames = (selectedVendor.allNames || []).slice(0, 10);

        // 1. Real-time Snapshot for ID-based products
        let unsubIds = () => { };
        if (queryIds.length > 0) {
            const qIds = query(collection(db, 'products'), where('vendorId', 'in', queryIds));
            unsubIds = onSnapshot(qIds, (snapshot) => {
                if (isActive) {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setIdProducts(docs);
                    if (queryNames.length === 0) setDetailLoading(false);
                }
            });
        }

        // 2. Real-time Snapshot for Name-based products (Legacy)
        let unsubNames = () => { };
        if (queryNames.length > 0) {
            const qNames = query(collection(db, 'products'), where('vendorName', 'in', queryNames));
            unsubNames = onSnapshot(qNames, (snapshot) => {
                if (isActive) {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setNameProducts(docs);
                    setDetailLoading(false);
                }
            });
        } else {
            setNameProducts([]);
            setDetailLoading(false);
        }

        // 3. Fetch Reviews & Stats
        const fetchExtras = async () => {
            if (queryIds.length === 0) return;
            try {
                // Reviews
                const rQ = query(collection(db, 'reviews'), where('vendorId', 'in', queryIds));
                const rSnap = await getDocs(rQ);
                const reviews = rSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (isActive) {
                    setVendorData(prev => ({ ...prev, reviews }));
                }

                // Stats
                const stats = await getVendorStats(queryIds);
                if (isActive) {
                    setVendorData(prev => ({ ...prev, stats }));
                }
            } catch (e) {
                console.error("Extras error", e);
            }
        };
        fetchExtras();

        return () => {
            isActive = false;
            unsubIds();
            unsubNames();
        };
    }, [queryKey]);

    // Merge effect
    useEffect(() => {
        const combined = new Map();
        idProducts.forEach(p => combined.set(p.id, p));
        nameProducts.forEach(p => combined.set(p.id, p));
        const merged = Array.from(combined.values());

        setVendorData(prev => ({
            ...prev,
            products: merged
        }));
    }, [idProducts, nameProducts]);



    const handleStatusChange = async (status) => {
        if (!selectedVendor) return;
        const action = status === 'suspended' ? 'suspend' : 'activate';

        console.log('=== STATUS CHANGE DEBUG ===');
        console.log('Selected Vendor:', selectedVendor);
        console.log('Target Status:', status);
        console.log('All IDs:', selectedVendor.allIds);

        if (!window.confirm(`Are you sure you want to ${action} ${selectedVendor.businessName} and all its associated accounts?`)) {
            return;
        }

        const candidateIds = (selectedVendor.allIds || [selectedVendor.id]).filter(id => id && typeof id === 'string');
        console.log('Candidate IDs:', candidateIds);

        try {
            setDetailLoading(true);

            // STEP 1: Verify which vendor IDs actually exist in Firestore
            console.log('🔍 Verifying which vendor IDs actually exist...');
            const verificationPromises = candidateIds.map(async (id) => {
                try {
                    const vendorDoc = await getDoc(doc(db, 'vendors', id));
                    return { id, exists: vendorDoc.exists() };
                } catch (err) {
                    console.error(`Error checking vendor ${id}:`, err);
                    return { id, exists: false };
                }
            });

            const verificationResults = await Promise.all(verificationPromises);
            const realVendorIds = verificationResults.filter(r => r.exists).map(r => r.id);
            const fakeIds = verificationResults.filter(r => !r.exists).map(r => r.id);

            console.log(`✅ Real vendor IDs (${realVendorIds.length}):`, realVendorIds);
            console.log(`❌ Phantom/Fake IDs (${fakeIds.length}):`, fakeIds);

            if (realVendorIds.length === 0) {
                throw new Error('No valid vendor documents found to update!');
            }

            let successCount = 0;
            let failCount = 0;

            // STEP 2: Update only the REAL vendor documents
            for (const id of realVendorIds) {
                try {
                    console.log(`Updating vendor ${id} to ${status}...`);
                    await updateVendorStatus(id, status);
                    console.log(`✓ Vendor ${id} updated successfully`);
                    successCount++;
                } catch (err) {
                    console.error(`✗ Failed to update vendor ${id}:`, err);
                    failCount++;
                }
            }

            // STEP 3: Update user documents for real vendor IDs (with ROLE change)
            const userIdsToUpdate = new Set(realVendorIds);
            if (selectedVendor.userId && realVendorIds.includes(selectedVendor.userId)) {
                userIdsToUpdate.add(selectedVendor.userId);
            }

            // Determine user status and role based on vendor status
            const userStatus = status === 'approved' ? 'active' : 'suspended';
            const userRole = status === 'approved' ? 'vendor' : 'customer'; // ← ROLE CHANGE

            for (const uid of userIdsToUpdate) {
                try {
                    console.log(`Updating user ${uid} to ${userStatus} with role ${userRole}...`);

                    // Update both status and role
                    await updateDoc(doc(db, 'users', uid), {
                        status: userStatus,
                        role: userRole  // ← Change role based on suspension
                    });

                    console.log(`✓ User ${uid} updated successfully (role: ${userRole})`);
                    successCount++;
                } catch (err) {
                    console.warn(`⚠ User update skipped for ${uid}:`, err.message);
                }
            }

            console.log(`=== UPDATE COMPLETE: ${successCount} successful, ${failCount} failed ===`);
            if (fakeIds.length > 0) {
                console.warn(`⚠ Skipped ${fakeIds.length} phantom IDs that don't exist in Firestore`);
            }

            if (failCount > 0 && successCount === 0) {
                throw new Error('All updates failed');
            }

            // Send notifications to affected vendors
            for (const uid of userIdsToUpdate) {
                try {
                    const notificationTemplate = status === 'suspended'
                        ? NotificationTemplates.vendorSuspended()
                        : NotificationTemplates.vendorActivated();

                    await sendPushNotification(uid, notificationTemplate);
                    console.log(`📬 Notification sent to user ${uid}`);
                } catch (notifError) {
                    console.warn(`Failed to send notification to ${uid}:`, notifError);
                }
            }

            // Force UI update immediately
            setSelectedVendor(prev => ({ ...prev, status }));

            const msg = `${action === 'suspend' ? 'Vendor suspended - Role changed to customer' : 'Vendor activated - Full access restored'}! (${successCount} records updated${fakeIds.length > 0 ? `, ${fakeIds.length} phantom IDs skipped` : ''})`;
            alert(msg);
        } catch (error) {
            console.error('CRITICAL ERROR during status update:', error);
            alert(`Failed to update status: ${error.message}`);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredVendors = vendors.filter(v => {
        const nameMatch = (v.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = (v.businessEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || emailMatch;
    });

    if (loading) return <Loading text="Loading vendors..." />;

    return (
        <div className="admin-vendors" style={{ minHeight: '80vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Vendors</h2>

            </div>
            <Row className="h-100">
                {/* Vendor List Column */}
                <Col md={4} className="border-end pe-0">
                    <div className="p-3 bg-white h-100 rounded-start">
                        <Form.Control
                            type="search"
                            placeholder="Search vendors..."
                            className="mb-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="vendor-list pe-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                            {filteredVendors.map(v => (
                                <div
                                    key={v.id}
                                    className={`p-3 mb-2 rounded border-bottom transition-all ${selectedVendor?.businessName === v.businessName ? 'bg-white shadow-sm border-start border-4 border-primary' : 'bg-transparent text-muted'}`}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={() => setSelectedVendor(v)}
                                >
                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                        <div className="text-truncate">
                                            <h6 className={`mb-1 fw-bold ${selectedVendor?.businessName === v.businessName ? 'text-dark' : 'text-secondary'}`}>{v.businessName}</h6>
                                            <small className="d-block text-truncate opacity-75">{v.businessEmail}</small>
                                        </div>
                                        <Badge
                                            bg={v.status === 'approved' ? 'success' : v.status === 'suspended' ? 'danger' : 'warning'}
                                            className="ms-auto flex-shrink-0"
                                            style={{ fontSize: '0.7rem', padding: '0.4em 0.6em' }}
                                        >
                                            {v.status}
                                        </Badge>
                                    </div>
                                    <div className="d-flex align-items-center mt-2 small">
                                        <FiStar className="me-1 text-warning" fill="currentColor" />
                                        <span className={selectedVendor?.businessName === v.businessName ? 'text-dark' : 'text-muted'}>{v.rating || '0.0'}</span>
                                        {v.isMerged && <Badge bg="info" className="ms-2 px-1" style={{ fontSize: '0.6rem' }}>Merged</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>

                {/* Vendor Detail Column */}
                <Col md={8}>
                    {selectedVendor ? (
                        <div className="p-3 h-100" style={{ position: 'relative', opacity: detailLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                            {detailLoading && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 10, background: 'rgba(255,255,255,0.3)' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {/* Overview Card */}
                            <Card className="mb-4 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex gap-3">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1fd1f9 0%, #b621fe 100%)', fontSize: '1.5rem' }}
                                            >
                                                {selectedVendor.logo ? (
                                                    <img src={selectedVendor.logo} alt="" className="w-100 h-100 rounded-circle object-fit-cover" />
                                                ) : (
                                                    (selectedVendor?.businessName || 'V')[0]?.toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="mb-1">{selectedVendor?.businessName || 'Unknown Vendor'}</h4>
                                                <p className="text-muted mb-2">{selectedVendor?.businessEmail || 'No email provided'}</p>
                                                <div className="d-flex gap-2 text-muted small">
                                                    <span>Phone: {selectedVendor?.businessPhone || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {selectedVendor?.businessAddress && typeof selectedVendor.businessAddress === 'object'
                                                            ? `${selectedVendor.businessAddress.address || ''}, ${selectedVendor.businessAddress.city || ''}`.trim().replace(/^,/, '') || 'No Address'
                                                            : (selectedVendor?.businessAddress || 'No Address')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedVendor.status !== 'suspended' ? (
                                            <Button variant="danger" onClick={() => handleStatusChange('suspended')}>
                                                <FiX className="me-1" /> Suspend Vendor
                                            </Button>
                                        ) : (
                                            <Button variant="success" onClick={() => handleStatusChange('approved')}>
                                                <FiCheck className="me-1" /> Activate Vendor
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Metrics */}
                            <div className="mb-4">
                                <h5 className="mb-3">Performance Metrics</h5>
                                <Row>
                                    <Col sm={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <small className="text-muted text-uppercase">Total Earnings</small>
                                                <h3 className="mb-0 mt-1">Rs. {(vendorData.stats?.totalEarnings || 0).toLocaleString()}</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <small className="text-muted text-uppercase">Total Sales</small>
                                                <h3 className="mb-0 mt-1">{vendorData.stats?.totalSales || 0}</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm={4}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body>
                                                <small className="text-muted text-uppercase">Average Rating</small>
                                                <h3 className="mb-0 mt-1 d-flex align-items-center gap-2">
                                                    <FiStar className="text-warning" fill="currentColor" />
                                                    {vendorData.stats?.rating || '0.0'}
                                                </h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                            {/* Ratings & Reviews */}
                            <Card className="mb-4 border-0 shadow-sm">
                                <Card.Body>
                                    <h5 className="mb-3">Recent Reviews ({vendorData?.reviews?.length || 0})</h5>
                                    {vendorData?.reviews?.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {vendorData.reviews.slice(0, 3).map(review => (
                                                <div key={review.id} className="border-bottom pb-2">
                                                    <div className="d-flex justify-content-between">
                                                        <strong>{review?.customerName || 'Anonymous'}</strong>
                                                        <div className="text-warning">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FiStar key={i} fill={i < (review?.rating || 0) ? "currentColor" : "none"} className={i < (review?.rating || 0) ? "" : "text-muted"} size={14} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="mb-0 small text-muted">{review?.comment || 'No comment'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No reviews yet.</p>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Uploaded Items */}
                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Body>
                                    <h5 className="mb-4">Uploaded Items ({vendorData?.products?.length || 0})</h5>
                                    {(!vendorData?.products || vendorData.products.length === 0) ? (
                                        <div className="text-center py-4 text-muted border rounded bg-light">
                                            <FiPackage size={32} className="mb-2 opacity-50" />
                                            <p className="mb-0">No products found for this vendor.</p>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }} className="pe-2">
                                            <Row className="g-3">
                                                {vendorData.products.map(product => (
                                                    <Col key={product.id} xs={6} sm={4} md={3} lg={2}>
                                                        <div className="product-item h-100 p-2 border rounded hover-shadow transition-all bg-white text-center d-flex flex-column">
                                                            <div className="mb-2 position-relative pt-[100%] overflow-hidden rounded bg-light" style={{ paddingBottom: '100%' }}>
                                                                <img
                                                                    src={product?.images?.[0] || '/placeholder.png'}
                                                                    alt={product?.name}
                                                                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                                />
                                                            </div>
                                                            <div className="small fw-bold text-truncate mt-auto" title={product?.name}>
                                                                {product?.name || 'Unnamed Product'}
                                                            </div>
                                                            <div className="text-primary small fw-bold">
                                                                Rs. {product?.price?.toLocaleString() || '0'}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            <div className="text-center">
                                <FiUsers size={48} className="mb-3 opacity-50" />
                                <h5>Select a vendor to view details</h5>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

// Users Management
const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus} this user?`)) {
            try {
                await updateUserStatus(userId, newStatus);
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: newStatus });
            } catch (error) {
                alert('Failed to update status');
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (window.confirm(`Are you sure you want to change role to ${newRole}?`)) {
            try {
                await updateUserRole(userId, newRole);
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole });
            } catch (error) {
                alert('Failed to update role');
            }
        }
    };

    if (loading) return <Loading text="Loading users..." />;

    return (
        <div className="admin-users">
            <h2>Manage Users</h2>

            <div className="mb-3">
                <Form.Control
                    type="search"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="data-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users
                                .filter(u =>
                                    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
                                )
                                .map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />}
                                                {user.displayName || 'Relic User'}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={
                                                user.role === 'admin' ? 'danger' :
                                                    user.role === 'vendor' ? 'info' : 'secondary'
                                            }>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={user.status === 'active' ? 'success' : 'warning'}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button variant="light" size="sm" onClick={() => { setSelectedUser(user); setShowModal(true); }}>
                                                    <FiEye /> View / Edit
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div className="user-details-view">
                            <div className="text-center mb-4">
                                <img
                                    src={selectedUser.photoURL || 'https://via.placeholder.com/100'}
                                    alt="Profile"
                                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <h4 className="mt-2">{selectedUser.displayName}</h4>
                                <p className="text-muted">{selectedUser.email}</p>
                            </div>

                            <hr />

                            <Row className="mb-3">
                                <Col sm={4}><strong>User ID:</strong></Col>
                                <Col sm={8}>{selectedUser.uid || selectedUser.id}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={4}><strong>Phone:</strong></Col>
                                <Col sm={8}>{selectedUser.phone || 'N/A'}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col sm={4}><strong>Joined:</strong></Col>
                                <Col sm={8}>{selectedUser.createdAt?.toDate ? new Date(selectedUser.createdAt.toDate()).toLocaleDateString() : 'N/A'}</Col>
                            </Row>

                            <hr />

                            <h5>Management</h5>
                            <Row className="mb-3 align-items-center">
                                <Col sm={4}><strong>Current Status:</strong></Col>
                                <Col sm={8}>
                                    <Form.Select
                                        value={selectedUser.status}
                                        onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
                                        size="sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="align-items-center">
                                <Col sm={4}><strong>Current Role:</strong></Col>
                                <Col sm={8}>
                                    <Form.Select
                                        value={selectedUser.role}
                                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                                        size="sm"
                                        disabled={selectedUser.role === 'admin'} // Prevent removing own admin access easily via UI here is safer
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="admin">Admin</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

// Products Management
const AdminProducts = ({ vendorMap }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let q = collection(db, 'products');
        if (filter !== 'all') {
            q = query(q, where('status', '==', filter));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sorted = data.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            setProducts(sorted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filter]);

    const handleStatusChange = async (productId, status) => {
        try {
            await updateProduct(productId, { status });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update product status');
        }
    };

    if (loading) return <Loading text="Loading products..." />;

    return (
        <div className="admin-products">
            <h2>Manage Products</h2>
            <div className="mb-4">
                <Button variant={filter === 'all' ? 'primary' : 'outline-primary'} size="sm" className="me-2" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'pending' ? 'primary' : 'outline-primary'} size="sm" className="me-2" onClick={() => setFilter('pending')}>Pending</Button>
                <Button variant={filter === 'approved' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('approved')}>Approved</Button>
            </div>

            <div className="mb-3">
                <Form.Control
                    type="search"
                    placeholder="Search products by name, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="data-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Vendor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products
                                .filter(p => {
                                    const search = searchTerm.toLowerCase();
                                    return p.name.toLowerCase().includes(search) ||
                                        p.category.toLowerCase().includes(search) ||
                                        (vendorMap[p.vendorId] || '').toLowerCase().includes(search) ||
                                        (p.vendorName || '').toLowerCase().includes(search);
                                })
                                .map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img src={product.images?.[0] || '/placeholder.png'} alt="" style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10 }} />
                                                {product.name}
                                            </div>
                                        </td>
                                        <td>{product.category}</td>
                                        <td>Rs. {product.price?.toLocaleString() || '0'}</td>
                                        <td>{vendorMap[product.vendorId] || product.vendorName || 'Unknown Shop'}</td>
                                        <td>
                                            <Badge bg={product.status === 'approved' ? 'success' : product.status === 'pending' ? 'warning' : 'danger'}>
                                                {product.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button variant="light" size="sm" as={Link} to={`/product/${product.id}`}><FiEye /></Button>
                                                {product.status === 'pending' && (
                                                    <>
                                                        <Button variant="success" size="sm" onClick={() => handleStatusChange(product.id, 'approved')} title="Approve"><FiCheck /></Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleStatusChange(product.id, 'rejected')} title="Reject"><FiX /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

// Orders Management
const AdminOrders = ({ vendorMap }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        if (window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
            try {
                await updateOrderStatus(orderId, newStatus);
                setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
                }
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        }
    };

    if (loading) return <Loading text="Loading orders..." />;

    return (
        <div className="admin-orders">
            <h2>Manage Orders</h2>

            <div className="mb-3">
                <Form.Control
                    type="search"
                    placeholder="Search orders by ID or Customer Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="data-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Vendor(s)</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .filter(o => {
                                    const search = searchTerm.toLowerCase();
                                    const vendorNames = o.vendorOrders?.map(vo => vendorMap[vo.vendorId] || vo.vendorName || '').join(' ').toLowerCase();
                                    return (o.orderId && o.orderId.toLowerCase().includes(search)) ||
                                        (o.customerName && o.customerName.toLowerCase().includes(search)) ||
                                        (o.shippingAddress?.name && o.shippingAddress.name.toLowerCase().includes(search)) ||
                                        (vendorNames && vendorNames.includes(search));
                                })
                                .map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.orderId}</td>
                                        <td>{order.shippingAddress?.name || order.customerName || 'Customer'}</td>
                                        <td>
                                            {order.vendorOrders?.map(vo => vendorMap[vo.vendorId] || vo.vendorName || 'Shop').join(', ') || 'Unknown'}
                                        </td>
                                        <td>Rs. {order.totalAmount?.toLocaleString()}</td>
                                        <td>
                                            <Badge bg={
                                                order.orderStatus === 'delivered' ? 'success' :
                                                    order.orderStatus === 'shipped' ? 'info' :
                                                        order.orderStatus === 'pending' ? 'warning' : 'secondary'
                                            }>
                                                {order.orderStatus}
                                            </Badge>
                                        </td>
                                        <td>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <FiEye /> View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Order Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Order #{selectedOrder?.orderId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            {/* Status Bar */}
                            <div className="mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="text-muted small text-uppercase">Current Status</span>
                                    <h5 className="mb-0 text-capitalize">{selectedOrder.orderStatus}</h5>
                                </div>
                                <div className="d-flex gap-2">
                                    {selectedOrder.orderStatus === 'pending' && (
                                        <Button variant="success" size="sm" onClick={() => handleStatusChange(selectedOrder.id, 'processing')}>
                                            Approve Order
                                        </Button>
                                    )}
                                    {selectedOrder.orderStatus === 'processing' && (
                                        <Button variant="info" size="sm" className="text-white" onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}>
                                            Ship Order
                                        </Button>
                                    )}
                                    {selectedOrder.orderStatus === 'shipped' && (
                                        <Button variant="primary" size="sm" onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}>
                                            Mark Delivered
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Row>
                                <Col md={8}>
                                    <h6 className="mb-3">Order Items</h6>
                                    <div className="border rounded p-3 mb-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="d-flex align-items-center mb-3 last:mb-0">
                                                <img
                                                    src={item.image || '/placeholder.png'}
                                                    alt={item.name}
                                                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                                                    className="me-3"
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-0">{item.name}</h6>
                                                    <small className="text-muted">Qty: {item.quantity} × Rs. {item.price}</small>
                                                </div>
                                                <div className="fw-bold">
                                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <h6 className="mb-3">Customer Info</h6>
                                    <Card className="mb-3 border-0 bg-light">
                                        <Card.Body>
                                            <p className="mb-1"><strong>{selectedOrder.customerName}</strong></p>
                                            <p className="mb-1 small">{selectedOrder.email}</p>
                                            <p className="mb-0 small">{selectedOrder.phone}</p>
                                        </Card.Body>
                                    </Card>

                                    <h6 className="mb-3">Shipping Address</h6>
                                    <Card className="mb-3 border-0 bg-light">
                                        <Card.Body className="small">
                                            {typeof selectedOrder.shippingAddress === 'object' ? (
                                                <>
                                                    <p className="mb-1">{selectedOrder.shippingAddress.address}</p>
                                                    <p className="mb-1">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.zip}</p>
                                                    <p className="mb-0">{selectedOrder.shippingAddress.country}</p>
                                                </>
                                            ) : (
                                                <p className="mb-0">{selectedOrder.shippingAddress || 'N/A'}</p>
                                            )}
                                        </Card.Body>
                                    </Card>

                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Subtotal</span>
                                            <span>Rs. {selectedOrder.subtotal?.toLocaleString() || selectedOrder.totalAmount?.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5">
                                            <span>Total</span>
                                            <span>Rs. {selectedOrder.totalAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

// Main Admin Dashboard
const AdminDashboard = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [allVendors, setAllVendors] = useState([]);
    const [vendorMap, setVendorMap] = useState({});

    useEffect(() => {
        // Real-time listener for ALL vendors to be used by all tabs
        const q = query(collection(db, 'vendors'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllVendors(data);

            const map = {};
            data.forEach(v => {
                let name = v.businessName || 'Unnamed Shop';
                const lower = name.toLowerCase();
                // Normalize for UI consistency across merged IDs
                if (lower.includes('artisan hub')) name = 'Artisan Hub';
                else if (lower.includes('dream light')) name = 'Dream Light';
                else if (lower.includes('dream big')) name = 'Dream Big';
                else if (lower.includes('colombo gift')) name = 'Colombo Gifts';
                else if (lower.includes('lanka craft')) name = 'Lanka Crafts';
                map[v.id] = name;
            });
            setVendorMap(map);
        });

        return () => unsubscribe();
    }, []);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar admin-sidebar">
                <div className="sidebar-brand">
                    <Link to="/admin/dashboard">
                        <span>AR ONE</span>
                        <small>Admin Panel</small>
                    </Link>
                </div>

                <Nav className="sidebar-nav">
                    <Nav.Link as={Link} to="/admin/dashboard" className={isActive('/admin/dashboard') && !location.pathname.includes('/admin/dashboard/') ? 'active' : ''}>
                        <FiHome /> Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/analytics" className={isActive('/admin/analytics') ? 'active' : ''}>
                        <FiTrendingUp /> Analytics
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
                        <FiUsers /> Users
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/vendors" className={isActive('/admin/vendors') ? 'active' : ''}>
                        <FiUsers /> Vendors
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
                        <FiPackage /> Products
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
                        <FiShoppingBag /> Orders
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/categories" className={isActive('/admin/categories') ? 'active' : ''}>
                        <FiTag /> Categories
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/coupons" className={isActive('/admin/coupons') ? 'active' : ''}>
                        <FiTag /> Coupons
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/reviews" className={isActive('/admin/reviews') ? 'active' : ''}>
                        <FiMessageSquare /> Reviews
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
                        <FiSettings /> Settings
                    </Nav.Link>
                    <Nav.Link as={Link} to="/account">
                        <FiUser /> My Buyer Account
                    </Nav.Link>
                </Nav>

                <div className="sidebar-footer">
                    <Button variant="link" onClick={handleLogout} className="logout-btn">
                        <FiLogOut /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main admin-main">
                <header className="admin-header">
                    <div className="admin-header-title">
                        {/* Title can be dynamic based on route if needed */}
                        <span>Admin Control Center</span>
                    </div>
                    <div className="admin-header-actions">
                        <Button variant="outline-danger" size="sm" onClick={handleLogout} className="top-logout-btn">
                            <FiLogOut className="me-2" /> Logout
                        </Button>
                    </div>
                </header>

                <div className="admin-content-area">
                    <Routes>
                        <Route index element={<AdminOverview vendorMap={vendorMap} />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="vendors" element={<AdminVendors />} />
                        <Route path="products" element={<AdminProducts vendorMap={vendorMap} />} />
                        <Route path="orders" element={<AdminOrders vendorMap={vendorMap} />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                        <Route path="reviews" element={<AdminReviews />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

// Vendor Dashboard Component
import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Button, Badge, Table, Form, Alert } from 'react-bootstrap';
import {
    FiHome, FiPackage, FiShoppingBag, FiDollarSign, FiStar,
    FiSettings, FiLogOut, FiPlus, FiEdit, FiTrash2, FiEye,
    FiTrendingUp, FiUsers, FiBarChart2, FiUser, FiMenu, FiX, FiUpload, FiImage
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getVendorById, getVendorStats, updateVendorProfile, processVendorPayout } from '../../services/vendorService';
import { getVendorProducts, createProduct, updateProduct, deleteProduct, getProductById } from '../../services/productService';
import { getVendorOrders } from '../../services/orderService';
import { getVendorReviews, updateReviewStatus, replyToReview } from '../../services/reviewService';
import { changePassword } from '../../services/userService';
import { uploadFile } from '../../services/uploadService';
import { compressImage } from '../../utils/imageUtils';
import Loading from '../../components/common/Loading';
import VendorCustomers from './VendorCustomers';
import VendorOrderDetail from './VendorOrderDetail';
import './VendorDashboard.css';

// Dashboard Overview Component
const DashboardOverview = ({ vendorId }) => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [vendorStats, orders] = await Promise.all([
                    getVendorStats(vendorId),
                    getVendorOrders(vendorId)
                ]);
                setStats(vendorStats);
                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) fetchStats();
    }, [vendorId]);

    const handleRequestPayout = async () => {
        const balance = stats?.availableBalance || 0;
        if (balance <= 0) {
            alert('No available balance to withdraw.');
            return;
        }

        if (window.confirm(`Request payout for Rs. ${balance.toLocaleString()}?`)) {
            try {
                setLoading(true);
                await processVendorPayout(vendorId, balance, { method: 'bank_transfer' });
                alert('Payout request submitted successfully!');
                // Refresh stats
                const newStats = await getVendorStats(vendorId);
                setStats(newStats);
            } catch (error) {
                alert('Payout request failed: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Demo stats for development
    const demoStats = {
        totalProducts: 24,
        activeProducts: 20,
        totalSales: 156,
        totalEarnings: 125000,
        availableBalance: 45000,
        pendingBalance: 12000,
        rating: 4.5,
        reviewCount: 89
    };

    const displayStats = stats || demoStats;

    if (loading) return <Loading text="Loading dashboard..." />;

    return (
        <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>

            <Row className="stats-cards">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card earnings">
                        <Card.Body>
                            <div className="stat-icon">
                                <FiDollarSign />
                            </div>
                            <div className="stat-info">
                                <h3>Rs. {displayStats.totalEarnings?.toLocaleString()}</h3>
                                <p>Total Earnings</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card orders">
                        <Card.Body>
                            <div className="stat-icon">
                                <FiShoppingBag />
                            </div>
                            <div className="stat-info">
                                <h3>{displayStats.totalSales}</h3>
                                <p>Total Orders</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card products">
                        <Card.Body>
                            <div className="stat-icon">
                                <FiPackage />
                            </div>
                            <div className="stat-info">
                                <h3>{displayStats.totalProducts}</h3>
                                <p>Total Products</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <Card className="stat-card rating">
                        <Card.Body>
                            <div className="stat-icon">
                                <FiStar />
                            </div>
                            <div className="stat-info">
                                <h3>{displayStats.rating} <small>({displayStats.reviewCount})</small></h3>
                                <p>Average Rating</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="dashboard-card">
                        <Card.Header>
                            <h4>Recent Orders</h4>
                            <Link to="/vendor/dashboard/orders">View All</Link>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive hover className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.orderId}</td>
                                                <td>{order.customerName}</td>
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
                                                <td>{order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <Button size="sm" variant="outline-primary" as={Link} to={`/vendor/dashboard/orders/${order.id}`}>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted">No orders yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="dashboard-card balance-card">
                        <Card.Header>
                            <h4>Balance</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="balance-item">
                                <span>Available Balance</span>
                                <strong>Rs. {displayStats.availableBalance?.toLocaleString()}</strong>
                            </div>
                            <div className="balance-item pending">
                                <span>Pending Balance</span>
                                <strong>Rs. {displayStats.pendingBalance?.toLocaleString()}</strong>
                            </div>
                            <Button
                                className="withdraw-btn"
                                onClick={handleRequestPayout}
                                disabled={loading || (stats?.availableBalance || 0) <= 0}
                            >
                                {loading ? 'Processing...' : 'Request Payout'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Products Management Component
// Products Management Component
const VendorProducts = ({ vendorId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const vendorProducts = await getVendorProducts(vendorId);
            setProducts(vendorProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorId) fetchProducts();
    }, [vendorId]);

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product.');
            }
        }
    };

    if (loading) return <Loading text="Loading products..." />;

    return (
        <div className="vendor-products">
            <div className="page-header">
                <h2>My Products</h2>
                <Button as={Link} to="/vendor/dashboard/products/add" className="add-btn">
                    <FiPlus /> Add Product
                </Button>
            </div>

            <Card className="products-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-cell">
                                                <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name} />
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>Rs. {product.price?.toLocaleString()}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <Badge bg={
                                                product.status === 'approved' ? 'success' :
                                                    product.status === 'pending' ? 'warning' : 'danger'
                                            }>
                                                {product.status}
                                            </Badge>
                                        </td>
                                        <td>{product.views || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Button variant="light" size="sm" as={Link} to={`/product/${product.id}`}><FiEye /></Button>
                                                <Button variant="light" size="sm" as={Link} to={`/vendor/dashboard/products/edit/${product.id}`}><FiEdit /></Button>
                                                <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(product.id)}><FiTrash2 /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">No products found. Add your first product!</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

// Vendor Orders Component
const VendorOrders = ({ vendorId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await getVendorOrders(vendorId);
            setOrders(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorId) fetchOrders();
    }, [vendorId]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) return <Loading text="Loading orders..." />;

    return (
        <div className="vendor-orders">
            <h2>Orders Management</h2>
            <Card className="data-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map(order => {
                                    // Find the vendor-specific part of the order
                                    const vendorPart = order.vendorOrders.find(vo => vo.vendorId === vendorId);
                                    if (!vendorPart) return null; // Should not happen if query is correct
                                    return (
                                        <tr key={order.id}>
                                            <td>#{order.orderId}</td>
                                            <td>
                                                <ul className="list-unstyled mb-0 small">
                                                    {vendorPart.items.map((item, idx) => (
                                                        <li key={idx}>{item.quantity}x {item.title}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>Rs. {vendorPart.subtotal?.toLocaleString()}</td>
                                            <td>
                                                <Badge bg={getStatusBadge(vendorPart.status)}>
                                                    {vendorPart.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <Button size="sm" variant="outline-primary" as={Link} to={`/vendor/dashboard/orders/${order.id}`}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

// Vendor Settings Component
const VendorSettings = ({ vendorId }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({
        businessName: '', businessEmail: '', businessPhone: '', businessDescription: '',
        businessAddress: '', logo: '', banner: '',
        bankName: '', accountName: '', accountNumber: '', ifscCode: '',
        notifications: {
            orders: true,
            reviews: true,
            marketing: false,
            newsletter: true
        }
    });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ logo: 0, banner: 0 });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (vendorId) loadDetails();
    }, [vendorId]);

    const loadDetails = async () => {
        try {
            const data = await getVendorById(vendorId);
            if (data) {
                setDetails({
                    ...details,
                    ...data,
                    ...data.bankDetails,
                    notifications: data.notifications || details.notifications
                });
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Instant Preview
        const localPreview = URL.createObjectURL(file);
        const originalValue = details[field];
        setDetails(prev => ({ ...prev, [field]: localPreview }));

        setSaving(true);
        setUploadProgress(prev => ({ ...prev, [field]: 0 }));
        setMessage({ type: 'info', text: `Optimizing and uploading ${field}...` });

        try {
            // 2. Faster Compression
            const compressionOps = field === 'logo'
                ? { maxWidth: 300, maxHeight: 300, quality: 0.7 }
                : { maxWidth: 1000, maxHeight: 350, quality: 0.6 };

            const compressedFile = await compressImage(file, compressionOps);

            // 3. Fast Upload
            const path = `vendors/${vendorId}/${field}`;
            const url = await uploadFile(compressedFile, path, (progress) => {
                setUploadProgress(prev => ({ ...prev, [field]: progress }));
            });

            setDetails(prev => ({ ...prev, [field]: url }));
            setMessage({ type: 'success', text: `${field.charAt(0).toUpperCase() + field.slice(1)} ready! Click Save Changes.` });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'danger', text: 'Upload failed: ' + error.message });
            setDetails(prev => ({ ...prev, [field]: originalValue })); // Revert
        } finally {
            setSaving(false);
            setUploadProgress(prev => ({ ...prev, [field]: 0 }));
        }
    };

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updates = {
                businessName: details.businessName,
                businessPhone: details.businessPhone,
                businessDescription: details.businessDescription,
                businessAddress: details.businessAddress,
                logo: details.logo,
                banner: details.banner,
                bankDetails: {
                    bankName: details.bankName,
                    accountName: details.accountName,
                    accountNumber: details.accountNumber,
                    ifscCode: details.ifscCode
                },
                notifications: details.notifications
            };

            await updateVendorProfile(vendorId, updates);

            // Handle Password Change if fields are filled
            if (passwords.current && passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    throw new Error('New passwords do not match');
                }
                await changePassword(passwords.current, passwords.new);
                setPasswords({ current: '', new: '', confirm: '' });
            }

            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            window.scrollTo(0, 0);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
            window.scrollTo(0, 0);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('CRITICAL: Are you sure you want to delete your account? This will suspend your store and products. Contact Admin to fully remove data.')) {
            updateVendorProfile(vendorId, { status: 'suspended' });
            alert('Your account has been suspended. Please contact admin for permanent deletion.');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="vendor-settings page-content">
            <h2 className="mb-4">Vendor Settings</h2>
            <p className="text-muted mb-4">Manage your account information, contact details, and shop preferences.</p>

            {message.text && <div className={`alert alert-${message.type} mb-4`}>{message.text}</div>}

            <Form onSubmit={handleSaveAll}>
                {/* Account Information */}
                <Card className="settings-section-card mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="mb-1">Account Information</h5>
                        <small className="text-muted">Update your personal account details.</small>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        <Row>
                            <Col md={12} className="mb-4">
                                <Form.Label>Profile Picture</Form.Label>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="settings-avatar-wrapper">
                                        <img
                                            src={details.logo || 'https://via.placeholder.com/150'}
                                            alt="Logo"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'logo')}
                                            disabled={saving}
                                        />
                                        {saving && uploadProgress.logo > 0 && (
                                            <div className="progress mt-2" style={{ height: '6px' }}>
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    role="progressbar"
                                                    style={{ width: `${uploadProgress.logo}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        <Form.Text className="text-muted">
                                            Recommended size: 400x400px. JPG, PNG or WEBP. Auto-optimized.
                                        </Form.Text>
                                    </div>
                                </div>
                            </Col>
                            <Col md={12} className="mb-4">
                                <Form.Label>Cover Picture (Banner)</Form.Label>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="settings-banner-wrapper">
                                        <img
                                            src={details.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'}
                                            alt="Banner"
                                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'banner')}
                                            disabled={saving}
                                        />
                                        {saving && uploadProgress.banner > 0 && (
                                            <div className="progress mt-2" style={{ height: '6px' }}>
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    role="progressbar"
                                                    style={{ width: `${uploadProgress.banner}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        <Form.Text className="text-muted">
                                            Recommended size: 1200x350px. JPG, PNG or WEBP. Auto-optimized.
                                        </Form.Text>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Shop Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={details.businessName}
                                        onChange={e => setDetails({ ...details, businessName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={details.businessEmail}
                                        disabled
                                        className="bg-light"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="password-section mt-3 p-3 bg-light rounded">
                            <h6 className="mb-3">Change Password</h6>
                            <Row>
                                <Col md={4}>
                                    <Form.Control
                                        type="password"
                                        placeholder="Current Password"
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="password"
                                        placeholder="New Password"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                </Card>

                {/* Contact Details */}
                <Card className="settings-section-card mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="mb-1">Contact Details</h5>
                        <small className="text-muted">Manage your contact information and business address.</small>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={details.businessPhone}
                                        onChange={e => setDetails({ ...details, businessPhone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Business Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={details.businessAddress}
                                        onChange={e => setDetails({ ...details, businessAddress: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Shop Preferences */}
                <Card className="settings-section-card mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="mb-1">Shop Preferences</h5>
                        <small className="text-muted">Customize your shop's appearance.</small>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        <Form.Group className="mb-3">
                            <Form.Label>Shop Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={details.businessDescription}
                                onChange={e => setDetails({ ...details, businessDescription: e.target.value })}
                                placeholder="Tell customers about your brand..."
                            />
                        </Form.Group>
                        <Form.Check
                            type="checkbox"
                            disabled
                            checked={true}
                            label="Make my shop publicly visible"
                            className="mt-2"
                        />
                    </Card.Body>
                </Card>

                {/* Notification Settings */}
                <Card className="settings-section-card mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="mb-1">Notification Settings</h5>
                        <small className="text-muted">Decide what email notifications you want to receive.</small>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        <Form.Check
                            type="checkbox"
                            label="Email me about new orders"
                            className="mb-2"
                            checked={details.notifications?.orders !== false}
                            onChange={(e) => setDetails({ ...details, notifications: { ...details.notifications, orders: e.target.checked } })}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Email me about new product reviews"
                            className="mb-2"
                            checked={details.notifications?.reviews !== false}
                            onChange={(e) => setDetails({ ...details, notifications: { ...details.notifications, reviews: e.target.checked } })}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Send me marketing and announcement emails"
                            className="mb-2"
                            checked={details.notifications?.marketing || false}
                            onChange={(e) => setDetails({ ...details, notifications: { ...details.notifications, marketing: e.target.checked } })}
                        />
                    </Card.Body>
                </Card>

                {/* Payment & Billing */}
                <Card className="settings-section-card mb-5">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                        <h5 className="mb-1">Payment & Billing</h5>
                        <small className="text-muted">Manage your bank details for payouts.</small>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bank Name</Form.Label>
                                    <Form.Control type="text" value={details.bankName} onChange={e => setDetails({ ...details, bankName: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Holder</Form.Label>
                                    <Form.Control type="text" value={details.accountName} onChange={e => setDetails({ ...details, accountName: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Number</Form.Label>
                                    <Form.Control type="text" value={details.accountNumber} onChange={e => setDetails({ ...details, accountNumber: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>IFSC / Branch Code</Form.Label>
                                    <Form.Control type="text" value={details.ifscCode} onChange={e => setDetails({ ...details, ifscCode: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-3 p-3 bg-light rounded text-muted small">
                            Currently, payments are processed via manual bank transfer. Please ensure these details are correct.
                        </div>
                    </Card.Body>
                </Card>

                {/* Sticky Save Bar */}
                <div className="settings-actions d-flex justify-content-end gap-2 pb-5">
                    <Button variant="outline-secondary" onClick={loadDetails}>Cancel Changes</Button>
                    <Button variant="primary" type="submit" disabled={saving} size="lg">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Form>



            <div className="mt-5 pt-5 border-top">
                <div className="text-danger">
                    <h5>Danger Zone</h5>
                    <p className="text-muted small">Once you delete your account, there is no going back.</p>
                    <Button variant="outline-danger" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
            </div>
        </div>
    );
};

// Vendor Product Form (Add/Edit)
const VendorProductForm = ({ vendorId, vendorName }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '', description: '', price: '', stock: '', category: 'gifts', status: 'pending',
        imageUrls: [''] // Array for multiple image URLs
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (isEdit) {
            getProductById(id).then(data => {
                if (data) {
                    setFormData({
                        name: data.name, description: data.description,
                        price: data.price, stock: data.stock, category: data.category,
                        status: data.status,
                        imageUrls: data.images && data.images.length > 0 ? data.images : ['']
                    });
                }
                setLoading(false);
            });
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vendorId) {
            alert('Error: User not authenticated properly. Please reload or log in again.');
            return;
        }

        setSaving(true);
        try {
            // Filter out empty image URLs
            const validImages = formData.imageUrls.filter(url => url && url.trim() !== '');

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                vendorId: vendorId,
                vendorName: vendorName || 'My Shop',
                images: validImages.length > 0 ? validImages : []
            };

            // Remove imageUrls from productData as we've converted it to images
            delete productData.imageUrls;

            if (isEdit) {
                await updateProduct(id, productData);
            } else {
                await createProduct(productData);
            }

            console.log('Product saved successfully');
            navigate('/vendor/dashboard/products');
        } catch (error) {
            console.error(error);
            alert('Error saving product: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleProductUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const currentUrls = formData.imageUrls.filter(u => u && u.trim() !== '');
        const validFiles = files.slice(0, 5 - currentUrls.length);

        if (validFiles.length < files.length) {
            alert('You can only add up to 5 images in total.');
        }

        if (validFiles.length === 0) return;

        setSaving(true);
        setUploadProgress(0);

        // Show local previews immediately
        const localPreviews = validFiles.map(f => URL.createObjectURL(f));
        setFormData(prev => ({
            ...prev,
            imageUrls: [...currentUrls, ...localPreviews]
        }));

        try {
            const uploadedUrls = [];
            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];
                // Faster Product Images
                const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.7 });

                // Fast Upload with summary progress
                const url = await uploadFile(compressed, `products/${vendorId}`, (p) => {
                    const overallProgress = ((i * 100) + p) / validFiles.length;
                    setUploadProgress(Math.round(overallProgress));
                });
                uploadedUrls.push(url);
            }

            // Replace local blob URLs with real Firebase URLs
            setFormData(prev => {
                const updatedUrls = [...prev.imageUrls];
                // Replace the last N items with the final URLs
                const startIndex = updatedUrls.length - uploadedUrls.length;
                for (let j = 0; j < uploadedUrls.length; j++) {
                    updatedUrls[startIndex + j] = uploadedUrls[j];
                }
                return { ...prev, imageUrls: updatedUrls };
            });
        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + error.message);
            // Revert back to previous URLs if needed (simpler to just let user remove them)
            setFormData(prev => ({ ...prev, imageUrls: currentUrls }));
        } finally {
            setSaving(false);
            setUploadProgress(0);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="product-form-page">
            <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <Card>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Price (Rs.)</Form.Label>
                                            <Form.Control type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Stock Quantity</Form.Label>
                                            <Form.Control type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="handmade-crafts">Handmade Crafts</option>
                                        <option value="home-decor">Home Decor</option>
                                        <option value="gift-boxes">Gift Boxes</option>
                                        <option value="party-favours">Party Favours</option>
                                        <option value="wedding">Wedding</option>
                                        <option value="personalized">Personalized Gifts</option>
                                        <option value="festivals">Festivals</option>
                                        <option value="corporate-gifts">Corporate Gifts</option>
                                        <option value="toys-games">Toys & Games</option>
                                        <option value="jewelry">Jewelry</option>
                                        <option value="art-paintings">Art & Paintings</option>
                                        <option value="stationery">Stationery</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Images (Max 5)</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {formData.imageUrls.filter(url => url && url.trim() !== '').map((url, index) => (
                                            <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                                <img
                                                    src={url}
                                                    alt="Product"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    style={{ position: 'absolute', top: -8, right: -8, width: '24px', height: '24px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => {
                                                        const newUrls = formData.imageUrls.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, imageUrls: newUrls });
                                                    }}
                                                >
                                                    <FiX size={12} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Form.Control
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleProductUpload}
                                        disabled={saving || formData.imageUrls.filter(u => u && u.trim() !== '').length >= 5}
                                    />
                                    {saving && uploadProgress > 0 && (
                                        <div className="progress mt-2" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                                role="progressbar"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                    <Form.Text className="text-muted">
                                        Upload product photos. JPG, PNG or WEBP. Auto-optimized.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

// Vendor Earnings Component
const VendorEarnings = ({ vendorId }) => {
    const [vendor, setVendor] = useState(null);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, year
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformFee: 0,
        netEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        totalPayouts: 0
    });

    useEffect(() => {
        fetchEarningsData();
    }, [vendorId, dateFilter]);

    const fetchEarningsData = async () => {
        if (!vendorId) return;

        setLoading(true);
        try {
            // Fetch vendor data
            const vendorData = await getVendorById(vendorId);
            setVendor(vendorData);

            // Fetch orders
            const ordersData = await getVendorOrders(vendorId);

            // Filter by date
            const filteredOrders = filterOrdersByDate(ordersData, dateFilter);
            setOrders(filteredOrders);

            // Calculate statistics
            calculateStats(filteredOrders, vendorData);

            // Create transaction history from orders
            const txns = createTransactionHistory(filteredOrders, vendorData);
            setTransactions(txns);

        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrdersByDate = (orders, filter) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(order => {
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);

            switch (filter) {
                case 'today':
                    return orderDate >= today;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return orderDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return orderDate >= monthAgo;
                case 'year':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    return orderDate >= yearAgo;
                default:
                    return true;
            }
        });
    };

    const calculateStats = (orders, vendorData) => {
        const commissionRate = vendorData?.commissionRate || 10;

        let totalRevenue = 0;
        let platformFee = 0;

        orders.forEach(order => {
            const vendorOrder = order.vendorOrders?.find(vo => vo.vendorId === vendorId);
            if (vendorOrder && vendorOrder.status === 'delivered') {
                const subtotal = vendorOrder.subtotal || 0;
                totalRevenue += subtotal;
                platformFee += (subtotal * commissionRate) / 100;
            }
        });

        const netEarnings = totalRevenue - platformFee;

        setStats({
            totalRevenue,
            platformFee,
            netEarnings,
            availableBalance: vendorData?.availableBalance || 0,
            pendingBalance: vendorData?.pendingBalance || 0,
            totalPayouts: vendorData?.totalPayouts || 0
        });
    };

    const createTransactionHistory = (orders, vendorData) => {
        const txns = [];

        orders.forEach(order => {
            const vendorOrder = order.vendorOrders?.find(vo => vo.vendorId === vendorId);
            if (vendorOrder) {
                const commissionRate = vendorData?.commissionRate || 10;
                const subtotal = vendorOrder.subtotal || 0;
                const fee = (subtotal * commissionRate) / 100;
                const net = subtotal - fee;

                txns.push({
                    id: order.id,
                    orderId: order.orderId,
                    date: order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt),
                    type: 'sale',
                    grossAmount: subtotal,
                    fee: fee,
                    netAmount: net,
                    status: vendorOrder.status,
                    customerName: order.shippingAddress?.name || 'Customer'
                });
            }
        });

        return txns.sort((a, b) => b.date - a.date);
    };

    const handlePayoutRequest = () => {
        if (stats.availableBalance < 1000) {
            alert('Minimum payout amount is Rs. 1,000');
            return;
        }
        alert('Payout request feature coming soon! Please contact support.');
    };

    if (loading) {
        return <Loading text="Loading earnings data..." />;
    }

    return (
        <div className="vendor-earnings">
            <div className="page-header">
                <h2>Earnings & Payouts</h2>
                <Form.Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                </Form.Select>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="stat-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">Total Revenue</p>
                                    <h3 className="mb-0">Rs. {stats.totalRevenue.toLocaleString()}</h3>
                                    <small className="text-muted">Gross sales</small>
                                </div>
                                <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.15)', color: '#28a745' }}>
                                    <FiTrendingUp size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="stat-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">Platform Fee ({vendor?.commissionRate || 10}%)</p>
                                    <h3 className="mb-0 text-danger">- Rs. {stats.platformFee.toLocaleString()}</h3>
                                    <small className="text-muted">Commission</small>
                                </div>
                                <div className="stat-icon" style={{ background: 'rgba(220, 53, 69, 0.15)', color: '#dc3545' }}>
                                    <FiDollarSign size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="stat-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1">Net Earnings</p>
                                    <h3 className="mb-0 text-success">Rs. {stats.netEarnings.toLocaleString()}</h3>
                                    <small className="text-muted">After fees</small>
                                </div>
                                <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.15)', color: '#28a745' }}>
                                    <FiDollarSign size={24} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Balance & Payout Section */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Balance Overview</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="balance-item mb-3 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Available Balance</span>
                                    <h4 className="mb-0 text-success">Rs. {stats.availableBalance.toLocaleString()}</h4>
                                </div>
                                <small className="text-muted">Ready for withdrawal</small>
                            </div>
                            <div className="balance-item mb-3 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Pending Balance</span>
                                    <h4 className="mb-0 text-warning">Rs. {stats.pendingBalance.toLocaleString()}</h4>
                                </div>
                                <small className="text-muted">Orders in progress</small>
                            </div>
                            <div className="balance-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Total Withdrawn</span>
                                    <h4 className="mb-0">Rs. {stats.totalPayouts.toLocaleString()}</h4>
                                </div>
                                <small className="text-muted">Lifetime payouts</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Payout Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <p className="mb-2"><strong>Bank Account:</strong></p>
                                {vendor?.bankDetails?.accountNumber ? (
                                    <>
                                        <p className="mb-1">{vendor.bankDetails.bankName}</p>
                                        <p className="mb-1">Account: ****{vendor.bankDetails.accountNumber.slice(-4)}</p>
                                        <p className="mb-0 text-muted small">{vendor.bankDetails.accountName}</p>
                                    </>
                                ) : (
                                    <Alert variant="warning" className="mb-0">
                                        Please add your bank details in Settings to receive payouts.
                                    </Alert>
                                )}
                            </div>
                            <hr />
                            <div className="mb-3">
                                <p className="mb-1"><strong>Minimum Payout:</strong> Rs. 1,000</p>
                                <p className="mb-0"><strong>Processing Time:</strong> 3-5 business days</p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-100"
                                onClick={handlePayoutRequest}
                                disabled={stats.availableBalance < 1000 || !vendor?.bankDetails?.accountNumber}
                            >
                                <FiDollarSign className="me-2" />
                                Request Payout
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Transaction History */}
            <Card>
                <Card.Header className="bg-white">
                    <h5 className="mb-0">Transaction History</h5>
                </Card.Header>
                <Card.Body>
                    {transactions.length > 0 ? (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Gross Amount</th>
                                    <th>Platform Fee</th>
                                    <th>Net Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(txn => (
                                    <tr key={txn.id}>
                                        <td>{txn.date.toLocaleDateString()}</td>
                                        <td><code>#{txn.orderId}</code></td>
                                        <td>{txn.customerName}</td>
                                        <td>Rs. {txn.grossAmount.toLocaleString()}</td>
                                        <td className="text-danger">- Rs. {txn.fee.toLocaleString()}</td>
                                        <td className="text-success"><strong>Rs. {txn.netAmount.toLocaleString()}</strong></td>
                                        <td>
                                            <Badge bg={
                                                txn.status === 'delivered' ? 'success' :
                                                    txn.status === 'shipped' ? 'info' :
                                                        txn.status === 'processing' ? 'primary' :
                                                            txn.status === 'pending' ? 'warning' : 'secondary'
                                            }>
                                                {txn.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <FiDollarSign size={50} className="mb-3 opacity-50" />
                            <p className="mb-0">No transactions found for the selected period.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

const VendorReviews = ({ vendorId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await getVendorReviews(vendorId);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendorId) fetchReviews();
    }, [vendorId]);

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        try {
            await replyToReview(reviewId, replyText);
            setReplyingTo(null);
            setReplyText('');
            await fetchReviews();
        } catch (error) {
            alert('Failed to send reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) return <Loading text="Loading reviews..." />;

    return (
        <div className="vendor-reviews">
            <div className="page-header mb-4">
                <h2>Customer Reviews</h2>
                <p className="text-muted">Manage feedback and ratings for your products.</p>
            </div>

            <Row>
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Product / Customer</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                        <th className="pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.length > 0 ? (
                                        reviews.map(review => (
                                            <tr key={review.id} className="align-middle">
                                                <td className="ps-4">
                                                    <div className="fw-bold">{review.productName || 'General Store Review'}</div>
                                                    <small className="text-muted">by {review.customerName}</small>
                                                </td>
                                                <td>
                                                    <div className="text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} size={14} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="review-comment-cell" style={{ maxWidth: '300px' }}>
                                                        <div className="fw-bold small mb-1">{review.title}</div>
                                                        <p className="mb-0 small text-truncate-2" title={review.comment}>
                                                            {review.comment}
                                                        </p>
                                                        {review.vendorReply && (
                                                            <div className="mt-2 p-2 bg-light rounded small border-start border-3 border-primary">
                                                                <strong>Your reply:</strong> {review.vendorReply.text}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                    </small>
                                                </td>
                                                <td className="pe-4">
                                                    {!review.vendorReply ? (
                                                        replyingTo === review.id ? (
                                                            <div className="reply-form" style={{ minWidth: '200px' }}>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={2}
                                                                    size="sm"
                                                                    placeholder="Type your reply..."
                                                                    className="mb-2"
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                />
                                                                <div className="d-flex gap-2">
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => handleReply(review.id)}
                                                                        disabled={submittingReply}
                                                                    >
                                                                        Send
                                                                    </Button>
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => setReplyingTo(review.id)}
                                                            >
                                                                Reply
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <Badge bg="success">Replied</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <FiStar size={48} className="mb-3 opacity-25" />
                                                <p>No reviews received yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Vendor Analytics Component
const VendorAnalytics = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalViews: 0,
        topProducts: [],
        salesLast7Days: [0, 0, 0, 0, 0, 0, 0],
        categoryDistribution: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.uid) fetchAnalytics();
    }, [currentUser]);

    const fetchAnalytics = async () => {
        try {
            const [products, orders] = await Promise.all([
                getVendorProducts(currentUser.uid),
                getVendorOrders(currentUser.uid)
            ]);

            // 1. Product Views & Top Products
            const sortedByViews = [...products].sort((a, b) => (b.views || 0) - (a.views || 0));
            const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
            const top5 = sortedByViews.slice(0, 5);

            // 2. Sales Last 7 Days
            const last7Days = [0, 0, 0, 0, 0, 0, 0];
            const today = new Date();
            orders.forEach(order => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                const diffTime = Math.abs(today - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 7) {
                    // Find index (0 = today, 6 = 7 days ago) - logic might need adjustment but simple bucket is fine
                    // or just map to day of week? Let's do T-minus days
                    const bucket = diffDays - 1; // 1 day ago -> index 0? No.
                    if (diffDays >= 0 && diffDays < 7) {
                        last7Days[6 - diffDays] += 1; // Count order
                    }
                }
            });

            // 3. Category Distribution
            const catDist = {};
            products.forEach(p => {
                catDist[p.category] = (catDist[p.category] || 0) + 1;
            });

            setStats({
                totalViews,
                topProducts: top5,
                salesLast7Days: last7Days,
                categoryDistribution: catDist
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading text="Loading analytics..." />;

    const maxSales = Math.max(...stats.salesLast7Days, 1); // Avoid div by 0

    return (
        <Card className="p-4">
            <h3 className="mb-4">Analytics Dashboard</h3>

            <Row className="mb-4">
                <Col md={3}>
                    <div className="p-3 border rounded bg-light text-center h-100">
                        <h6 className="text-muted">Total Product Views</h6>
                        <h2 className="text-primary mb-0">{stats.totalViews}</h2>
                    </div>
                </Col>
                <Col md={9}>
                    <div className="p-3 border rounded h-100">
                        <h6 className="text-muted mb-3">Sales Trend (Last 7 Days)</h6>
                        <div className="d-flex align-items-end justify-content-between" style={{ height: '100px' }}>
                            {stats.salesLast7Days.map((count, idx) => (
                                <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '12%' }}>
                                    <div
                                        className="bg-primary rounded-top"
                                        style={{
                                            width: '100%',
                                            height: `${(count / maxSales) * 100}%`,
                                            minHeight: count > 0 ? '4px' : '0'
                                        }}
                                    ></div>
                                    <small className="mt-1 text-muted" style={{ fontSize: '10px' }}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() - 6 + idx + 7) % 7]}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white"><h5>Top Viewed Products</h5></Card.Header>
                        <Card.Body>
                            {stats.topProducts.map(product => (
                                <div key={product.id} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-truncate" style={{ maxWidth: '70%' }}>{product.name}</span>
                                        <span className="fw-bold">{product.views || 0} views</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div
                                            className="progress-bar bg-info"
                                            role="progressbar"
                                            style={{ width: `${((product.views || 0) / (stats.topProducts[0]?.views || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-white"><h5>Product Categories</h5></Card.Header>
                        <Card.Body>
                            {Object.entries(stats.categoryDistribution).map(([cat, count], idx) => (
                                <div key={cat} className="d-flex align-items-center mb-2 justify-content-between border-bottom pb-2">
                                    <span className="text-capitalize">{cat}</span>
                                    <Badge bg="secondary" pill>{count}</Badge>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

// Main Vendor Dashboard Layout
const VendorDashboard = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            // Don't re-fetch if we've already successfully loaded vendor data
            if (vendor && hasChecked) {
                return;
            }

            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const vendorData = await getVendorById(currentUser.uid);

                if (!vendorData) {
                    // User is not a vendor
                    console.log('No vendor profile found for user:', currentUser.uid);
                    setError('No vendor profile found. Please register as a vendor.');
                    setHasChecked(true);
                } else {
                    setVendor(vendorData);
                    setError(null);
                    setHasChecked(true);
                }
            } catch (error) {
                console.error('Error fetching vendor:', error);
                setError('Failed to load vendor data: ' + error.message);
                setHasChecked(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVendor();
    }, [currentUser]); // Only depend on currentUser, not navigate or location

    if (loading) {
        return <Loading fullPage text="Loading dashboard..." />;
    }

    if (error && !vendor && hasChecked) {
        return (
            <div className="vendor-dashboard-error" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                padding: '20px',
                gap: '20px'
            }}>
                <h2>Vendor Profile Not Found</h2>
                <p style={{ textAlign: 'center', maxWidth: '500px' }}>
                    {error || 'You need to register as a vendor first.'}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button as={Link} to="/vendor/register" variant="primary">
                        Register as Vendor
                    </Button>
                    <Button as={Link} to="/vendor/quick-fix" variant="warning">
                        Quick Fix
                    </Button>
                    <Button as={Link} to="/" variant="secondary">
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="vendor-dashboard">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand d-flex justify-content-between align-items-center">
                    <Link to="/vendor/dashboard" onClick={() => setIsSidebarOpen(false)}>
                        <span>AR ONE</span>
                        <small>Vendor Portal</small>
                    </Link>
                    <Button variant="link" className="d-lg-none text-white p-0" onClick={() => setIsSidebarOpen(false)}>
                        <FiX size={24} />
                    </Button>
                </div>

                <div className="vendor-info">
                    <div className="vendor-avatar">
                        {vendor?.logo ? (
                            <img src={vendor.logo} alt={vendor.businessName} />
                        ) : (
                            <span>{vendor?.businessName?.[0] || 'V'}</span>
                        )}
                    </div>
                    <div className="vendor-details">
                        <h4>{vendor?.businessName || 'My Store'}</h4>
                        <Badge bg={vendor?.status === 'approved' ? 'success' : 'warning'}>
                            {vendor?.status || 'Pending'}
                        </Badge>
                    </div>
                </div>

                <Nav className="sidebar-nav">
                    <Nav.Link as={Link} to="/vendor/dashboard" className={isActive('/vendor/dashboard') && location.pathname === '/vendor/dashboard' ? 'active' : ''}>
                        <FiHome /> Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/products" className={isActive('/vendor/dashboard/products') ? 'active' : ''}>
                        <FiPackage /> Products
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/customers" className={isActive('/vendor/dashboard/customers') ? 'active' : ''}>
                        <FiUsers /> Customers
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/orders" className={isActive('/vendor/dashboard/orders') ? 'active' : ''}>
                        <FiShoppingBag /> Orders
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/earnings" className={isActive('/vendor/dashboard/earnings') ? 'active' : ''}>
                        <FiDollarSign /> Earnings
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/reviews" className={isActive('/vendor/dashboard/reviews') ? 'active' : ''}>
                        <FiStar /> Reviews
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/analytics" className={isActive('/vendor/dashboard/analytics') ? 'active' : ''}>
                        <FiBarChart2 /> Analytics
                    </Nav.Link>
                    <Nav.Link as={Link} to="/vendor/dashboard/settings" className={isActive('/vendor/dashboard/settings') ? 'active' : ''}>
                        <FiSettings /> Settings
                    </Nav.Link>

                    <hr className="my-3 mx-3 border-secondary" />

                    <Nav.Link as={Link} to={`/vendor/${currentUser.uid}`} target="_blank">
                        <FiEye /> View My Shop
                    </Nav.Link>
                    <Nav.Link as={Link} to="/account">
                        <FiUser /> My Buyer Account
                    </Nav.Link>
                </Nav>


            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Vendor Dashboard Header (Refactored to match Admin style) */}
                <header className="admin-header">
                    <div className="admin-header-title d-none d-lg-block">
                        <span>Vendor Control Center</span>
                    </div>
                    {/* Mobile Toggle inside header area for mobile */}
                    <div className="d-lg-none">
                        <Button variant="link" className="p-0 text-dark" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <FiMenu size={24} />
                        </Button>
                    </div>

                    <div className="admin-header-actions d-flex gap-2">
                        <Link to="/account" className="btn btn-outline-primary btn-sm d-flex align-items-center">
                            <FiUser className="me-2" /> Buyer Account
                        </Link>
                        <Button variant="outline-danger" size="sm" onClick={async () => { await logout(); navigate('/'); }} className="top-logout-btn">
                            <FiLogOut className="me-2" /> Logout
                        </Button>
                    </div>
                </header>

                <div className="admin-content-area">
                    <Routes>
                        <Route index element={<DashboardOverview vendorId={currentUser?.uid} />} />
                        <Route path="products" element={<VendorProducts vendorId={currentUser?.uid} />} />
                        <Route path="products/add" element={<VendorProductForm vendorId={currentUser?.uid} vendorName={vendor?.businessName} />} />
                        <Route path="products/edit/:id" element={<VendorProductForm vendorId={currentUser?.uid} vendorName={vendor?.businessName} />} />
                        <Route path="customers" element={<VendorCustomers />} />
                        <Route path="orders" element={<VendorOrders vendorId={currentUser?.uid} />} />
                        <Route path="orders/:id" element={<VendorOrderDetail />} />
                        <Route path="earnings" element={<VendorEarnings vendorId={currentUser?.uid} />} />
                        <Route path="reviews" element={<VendorReviews vendorId={currentUser?.uid} />} />
                        <Route path="analytics" element={<VendorAnalytics />} />
                        <Route path="settings" element={<VendorSettings vendorId={currentUser?.uid} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default VendorDashboard;

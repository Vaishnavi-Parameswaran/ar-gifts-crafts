// Functional Admin Pages Components
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import {
    getAllCategories, createCategory, updateCategory, deleteCategory
} from '../../services/categoryService';
import {
    getAllCoupons, createCoupon, updateCoupon, deleteCoupon
} from '../../services/couponService';
import {
    getAllReviews, updateReviewStatus, deleteReview
} from '../../services/reviewService';
import { changePassword } from '../../services/userService';
import Loading from '../../components/common/Loading';
import { getGlobalSettings, updateGlobalSettings } from '../../services/settingsService';
import { uploadFile } from '../../services/uploadService';

// --- Categories Management ---
export const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCat, setCurrentCat] = useState({ name: '', description: '', parentId: '' });
    const [imageUrl, setImageUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadFile(file, 'categories');
            setImageUrl(url);
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await updateCategory(currentCat.id, currentCat, imageUrl);
            } else {
                await createCategory(currentCat, imageUrl);
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            await deleteCategory(id);
            fetchCategories();
        }
    };

    const openModal = (cat = null) => {
        if (cat) {
            setEditMode(true);
            setCurrentCat(cat);
        } else {
            setEditMode(false);
            setCurrentCat({ name: '', description: '', parentId: '' });
        }
        setImageUrl(cat ? cat.image || '' : '');
        setShowModal(true);
    };

    if (loading) return <Loading text="Loading categories..." />;

    return (
        <div className="admin-page category-manager">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <Button onClick={() => openModal()}><FiPlus /> Add Category</Button>
            </div>

            <div className="mb-3">
                <Form.Control
                    type="search"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories
                                .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(cat => (
                                    <tr key={cat.id}>
                                        <td>
                                            <img src={cat.image || '/placeholder.png'} alt="" width="40" height="40" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                        </td>
                                        <td>{cat.name}</td>
                                        <td>{cat.slug}</td>
                                        <td>
                                            <Button variant="light" size="sm" onClick={() => openModal(cat)} className="me-2"><FiEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}><FiTrash2 /></Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Edit Category' : 'Add Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                value={currentCat.name}
                                onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={currentCat.description}
                                onChange={e => setCurrentCat({ ...currentCat, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                            {uploading && <div className="mt-1 small text-primary">Uploading image...</div>}
                            <InputGroup className="mt-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Or paste image URL"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                />
                            </InputGroup>
                            {imageUrl && <div className="mt-2"><img src={imageUrl} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} /></div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

// --- Coupons Management ---
export const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState({
        code: '',
        discountType: 'percentage', // or fixed
        discountValue: 0,
        expiryDate: '',
        minOrderAmount: 0,
        usageLimit: ''
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await getAllCoupons();
            setCoupons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert types if needed
            const data = {
                ...currentCoupon,
                discountValue: Number(currentCoupon.discountValue),
                minOrderAmount: Number(currentCoupon.minOrderAmount),
                usageLimit: currentCoupon.usageLimit ? Number(currentCoupon.usageLimit) : null,
                expiryDate: currentCoupon.expiryDate ? new Date(currentCoupon.expiryDate) : null
            };

            await createCoupon(data); // Simple version: create only for now
            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            alert('Failed to create coupon');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete coupon?')) {
            await deleteCoupon(id);
            fetchCoupons();
        }
    };

    return (
        <div className="admin-page">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Coupons</h2>
                <Button onClick={() => { setCurrentCoupon({ code: '', discountType: 'percentage', discountValue: 0 }); setShowModal(true); }}>
                    <FiPlus /> Create Coupon
                </Button>
            </div>
            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Expiry</th>
                                <th>Usage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.code}</strong></td>
                                    <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                                    <td>{c.expiryDate ? new Date(c.expiryDate.seconds * 1000).toLocaleDateString() : 'Never'}</td>
                                    <td>{c.usedCount || 0} / {c.usageLimit || '∞'}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}><FiTrash2 /></Button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No coupons found</td></tr>}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Create Coupon</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Coupon Code</Form.Label>
                            <Form.Control required type="text" value={currentCoupon.code} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })} />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select value={currentCoupon.discountType} onChange={e => setCurrentCoupon({ ...currentCoupon, discountType: e.target.value })}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (Rs)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Value</Form.Label>
                                    <Form.Control required type="number" value={currentCoupon.discountValue} onChange={e => setCurrentCoupon({ ...currentCoupon, discountValue: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Min Order Amount</Form.Label>
                            <Form.Control type="number" value={currentCoupon.minOrderAmount} onChange={e => setCurrentCoupon({ ...currentCoupon, minOrderAmount: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Expiry Date</Form.Label>
                            <Form.Control type="date" value={currentCoupon.expiryDate} onChange={e => setCurrentCoupon({ ...currentCoupon, expiryDate: e.target.value })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

// --- Reviews Management ---
export const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, approved

    const fetchReviews = async () => {
        const data = await getAllReviews(filter === 'all' ? null : filter);
        setReviews(data);
    };

    useEffect(() => { fetchReviews(); }, [filter]);

    const handleStatus = async (id, status) => {
        await updateReviewStatus(id, status);
        fetchReviews();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete review?')) {
            await deleteReview(id);
            fetchReviews();
        }
    };

    return (
        <div className="admin-page">
            <h2>Reviews Moderation</h2>
            <div className="mb-3">
                <Button variant={filter === 'all' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('all')} className="me-2">All</Button>
                <Button variant={filter === 'pending' ? 'warning' : 'outline-warning'} size="sm" onClick={() => setFilter('pending')} className="me-2">Pending</Button>
                <Button variant={filter === 'approved' ? 'success' : 'outline-success'} size="sm" onClick={() => setFilter('approved')}>Approved</Button>
            </div>
            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Type / Product</th>
                                <th>Vendor</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(r => (
                                <tr key={r.id}>
                                    <td>{r.productId ? r.productName || 'Product Review' : <Badge bg="info">Store Review</Badge>}</td>
                                    <td>{r.vendorName || r.vendorId || 'N/A'}</td>
                                    <td>{r.customerName}</td>
                                    <td>{r.rating} ★</td>
                                    <td>
                                        <div className="small" style={{ maxWidth: '200px' }}>{r.comment}</div>
                                    </td>
                                    <td>
                                        {r.moderationReason && (
                                            <Badge bg="light" text="dark" className="border">
                                                {r.moderationReason}
                                            </Badge>
                                        )}
                                    </td>
                                    <td><Badge bg={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>{r.status}</Badge></td>
                                    <td>
                                        {r.status === 'pending' && (
                                            <>
                                                <Button variant="success" size="sm" onClick={() => handleStatus(r.id, 'approved')} className="me-1"><FiCheck /></Button>
                                                <Button variant="danger" size="sm" onClick={() => handleStatus(r.id, 'rejected')} className="me-1"><FiX /></Button>
                                            </>
                                        )}
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(r.id)}><FiTrash2 /></Button>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && <tr><td colSpan="6" className="text-center">No reviews found</td></tr>}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

// --- Settings Management ---
export const AdminSettings = () => {
    // Branding & Preferences State
    const [settings, setSettings] = useState({
        siteName: 'AR ONE',
        logoUrl: '',
        primaryColor: '#e94560',
        secondaryColor: '#1a1a2e',
        emailNotifications: true,
        maintenanceMode: false,
        currency: 'USD',
        sessionTimeout: 30,
        contactEmail: '',
        contactPhone: '',
        address: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getGlobalSettings();
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setDataLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadFile(file, 'branding');
            setSettings(prev => ({ ...prev, logoUrl: url }));
        } catch (error) {
            console.error(error);
            alert('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveSettings = async (key) => {
        try {
            await updateGlobalSettings(settings);
            alert(`${key} saved successfully!`);
        } catch (error) {
            console.error(error);
            alert(`Failed to save ${key}`);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match");
            return;
        }
        try {
            setLoading(true);
            await changePassword(passwords.current, passwords.new);
            alert('Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            alert('Failed to update password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <Loading text="Loading settings..." />;

    return (
        <div className="admin-page">
            <h2>Admin Settings</h2>

            <Row>
                {/* Account Security Column */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">Account Security</h5>
                            <p className="text-muted small mb-4">Update your password for enhanced account security.</p>

                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Current Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                        required
                                        className="bg-light border-0"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        required
                                        className="bg-light border-0"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        required
                                        className="bg-light border-0"
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" className="text-white" disabled={loading}>
                                        {loading ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Contact Information (New Section) */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">Contact Information</h5>
                            <p className="text-muted small mb-4">Details displayed to users on contact pages.</p>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Contact Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="bg-light border-0"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={settings.contactPhone}
                                    onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                                    className="bg-light border-0"
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={settings.address}
                                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                                    className="bg-light border-0"
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="primary" className="text-white" onClick={() => handleSaveSettings('Contact Info')}>Save Contact Info</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Branding & Preferences Column */}
                <Col lg={6}>
                    {/* Site Branding */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">Site Branding</h5>
                            <p className="text-muted small mb-4">Customize your website's logo and primary color scheme.</p>

                            <Row className="mb-4">
                                <Col sm={12}>
                                    <Form.Label className="small fw-bold">Site Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.siteName}
                                        onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                        className="bg-light border-0 mb-3"
                                    />

                                    <Form.Label className="small fw-bold">Site Logo</Form.Label>
                                    <div className="d-flex gap-3 align-items-center mb-3">
                                        <div
                                            className="bg-light rounded d-flex align-items-center justify-content-center border"
                                            style={{ width: 80, height: 80 }}
                                        >
                                            {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <FiPlus size={24} className="text-muted" />}
                                        </div>
                                        <div className="flex-grow-1">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploading}
                                                className="mb-2"
                                            />
                                            {uploading && <div className="small text-primary mb-1">Uploading...</div>}
                                            <Form.Control
                                                type="text"
                                                placeholder="Or paste logo URL"
                                                value={settings.logoUrl}
                                                onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                                                className="bg-light border-0 small"
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col sm={6}>
                                    <Form.Label className="small fw-bold">Primary Color</Form.Label>
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                            className="p-1 border-0"
                                            style={{ width: 50 }}
                                        />
                                        <Form.Control
                                            type="text"
                                            value={settings.primaryColor}
                                            onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                            className="bg-light border-0"
                                        />
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <Form.Label className="small fw-bold">Secondary Color</Form.Label>
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control
                                            type="color"
                                            value={settings.secondaryColor}
                                            onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                                            className="p-1 border-0"
                                            style={{ width: 50 }}
                                        />
                                        <Form.Control
                                            type="text"
                                            value={settings.secondaryColor}
                                            onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                                            className="bg-light border-0"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <div className="d-grid">
                                <Button variant="primary" className="text-white" onClick={() => handleSaveSettings('Branding')}>Save Branding</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* System Preferences */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">System Preferences</h5>
                            <p className="text-muted small mb-4">Adjust general system-wide operational settings.</p>

                            <div className="mb-4">
                                <Form.Check
                                    type="switch"
                                    label="Email Notifications"
                                    checked={settings.emailNotifications}
                                    onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                    className="mb-3 fs-5"
                                />
                                <Form.Check
                                    type="switch"
                                    label="Maintenance Mode"
                                    checked={settings.maintenanceMode}
                                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="mb-3 fs-5"
                                />
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">Default Currency</Form.Label>
                                <Form.Select
                                    value={settings.currency}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                    className="bg-light border-0"
                                >
                                    <option value="USD">United States Dollar (USD)</option>
                                    <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">Session Timeout: {settings.sessionTimeout} minutes</Form.Label>
                                <Form.Range
                                    min={5}
                                    max={120}
                                    step={5}
                                    value={settings.sessionTimeout}
                                    onChange={e => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                />
                            </Form.Group>

                            <div className="d-grid">
                                <Button variant="primary" className="text-white" onClick={() => handleSaveSettings('Preferences')}>Save Preferences</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Account Page
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Tab } from 'react-bootstrap';
import { FiUser, FiPhone, FiMapPin, FiLock, FiLogOut, FiPackage, FiHeart, FiBell, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserAddresses, addAddress, updateAddress, deleteAddress, changePassword } from '../../services/userService';
import { uploadFile } from '../../services/uploadService';
import { compressImage } from '../../utils/imageUtils';
import Loading from '../../components/common/Loading';
import './Account.css';

const Account = () => {
    const { currentUser, userProfile, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [addresses, setAddresses] = useState([]);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        pincode: '',
        isDefault: false
    });

    const [showAddressForm, setShowAddressForm] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                displayName: userProfile.displayName || '',
                email: userProfile.email || currentUser?.email || '',
                phone: userProfile.phone || '',
                photoURL: userProfile.photoURL || ''
            });
        }

        const fetchAddresses = async () => {
            if (currentUser) {
                try {
                    const userAddresses = await getUserAddresses(currentUser.uid);
                    setAddresses(userAddresses);
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                }
            }
        };
        fetchAddresses();
    }, [currentUser, userProfile]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Instant Visual Feedback: Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        const originalPhotoURL = profileData.photoURL;
        setProfileData(prev => ({ ...prev, photoURL: localPreview }));

        setLoading(true);
        setUploadProgress(0);
        setMessage({ type: 'info', text: 'Optimizing and uploading...' });

        try {
            // 2. High-speed Compression: Smaller dimensions for profile pics (400x400)
            // This ensures the file is very small (<100KB) and uploads instantly.
            const compressedFile = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.7 });

            // 3. Fast Upload: Uses optimized upload service
            const url = await uploadFile(compressedFile, `profiles/${currentUser.uid}`, (progress) => {
                setUploadProgress(progress);
            });

            // Update with real URL once upload completes
            setProfileData(prev => ({ ...prev, photoURL: url }));
            setMessage({ type: 'success', text: 'Profile picture ready! Please Save Changes below to finalize.' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'danger', text: 'Upload failed: ' + error.message });
            // Revert preview on error
            setProfileData(prev => ({ ...prev, photoURL: originalPhotoURL }));
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUserProfile(currentUser.uid, profileData);
            await refreshProfile(); // Refresh context data
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'danger', text: 'New passwords do not match!' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'Password must be at least 6 characters!' });
            return;
        }

        setLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingAddressId) {
                await updateAddress(currentUser.uid, editingAddressId, newAddress);
                setMessage({ type: 'success', text: 'Address updated successfully!' });
            } else {
                await addAddress(currentUser.uid, newAddress);
                setMessage({ type: 'success', text: 'Address added successfully!' });
            }
            const updatedAddresses = await getUserAddresses(currentUser.uid);
            setAddresses(updatedAddresses);
            setNewAddress({ name: '', phone: '', address: '', city: '', province: '', pincode: '', isDefault: false });
            setShowAddressForm(false);
            setEditingAddressId(null);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to save address.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (address) => {
        setNewAddress({
            name: address.name || '',
            phone: address.phone || '',
            address: address.address,
            city: address.city,
            province: address.province || address.state,
            pincode: address.pincode,
            isDefault: address.isDefault || false
        });
        setEditingAddressId(address.id);
        setShowAddressForm(true);
        // Scroll to form if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(currentUser.uid, addressId);
                setAddresses(addresses.filter(a => a.id !== addressId));
                setMessage({ type: 'success', text: 'Address deleted successfully!' });
            } catch (error) {
                setMessage({ type: 'danger', text: 'Failed to delete address.' });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!currentUser) {
        return <Loading fullPage text="Loading..." />;
    }

    return (
        <div className="account-page">
            <Container>
                <h1 className="page-title">My Account</h1>

                <Row>
                    {/* Sidebar */}
                    <Col lg={3}>
                        <Card className="account-sidebar">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {userProfile?.photoURL ? (
                                        <img src={userProfile.photoURL} alt={profileData.displayName} />
                                    ) : (
                                        <FiUser />
                                    )}
                                </div>
                                <h4>{profileData.displayName || 'User'}</h4>
                                <p>{profileData.email}</p>
                            </div>

                            <Nav className="account-nav flex-column">
                                <Nav.Link as={Link} to="/orders"><FiPackage /> My Orders</Nav.Link>
                                <Nav.Link as={Link} to="/wishlist"><FiHeart /> Wishlist</Nav.Link>
                                <Nav.Link as={Link} to="/notifications"><FiBell /> Notifications</Nav.Link>
                                <Nav.Link onClick={handleLogout} className="logout-link"><FiLogOut /> Logout</Nav.Link>
                            </Nav>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col lg={9}>
                        {message.text && (
                            <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                                {message.text}
                            </Alert>
                        )}

                        <Tab.Container defaultActiveKey="profile">
                            <Card className="account-content">
                                <Card.Header>
                                    <Nav variant="tabs">
                                        <Nav.Item>
                                            <Nav.Link eventKey="profile"><FiUser /> Profile</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="addresses"><FiMapPin /> Addresses</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="security"><FiLock /> Security</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Card.Header>

                                <Card.Body>
                                    <Tab.Content>
                                        {/* Profile Tab */}
                                        <Tab.Pane eventKey="profile">
                                            <h3>Personal Information</h3>
                                            <Form onSubmit={handleProfileUpdate}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Full Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileData.displayName}
                                                                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                                                placeholder="Enter your name"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Email Address</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={profileData.email}
                                                                disabled
                                                                className="disabled-input"
                                                            />
                                                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="tel"
                                                                value={profileData.phone}
                                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                                placeholder="Enter your phone number"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Profile Picture</Form.Label>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="account-profile-preview">
                                                                    {profileData.photoURL ? (
                                                                        <img src={profileData.photoURL} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <div className="placeholder-preview" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <FiUser />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <Form.Control
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageUpload}
                                                                        disabled={loading}
                                                                    />
                                                                    {loading && uploadProgress > 0 && (
                                                                        <div className="upload-progress-container mt-2">
                                                                            <div className="progress" style={{ height: '8px' }}>
                                                                                <div
                                                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                                                    role="progressbar"
                                                                                    style={{ width: `${uploadProgress}%` }}
                                                                                    aria-valuenow={uploadProgress}
                                                                                    aria-valuemin="0"
                                                                                    aria-valuemax="100"
                                                                                ></div>
                                                                            </div>
                                                                            <small className="text-muted">{uploadProgress}% uploaded</small>
                                                                        </div>
                                                                    )}
                                                                    <Form.Text className="text-muted">Upload a profile photo. Auto-optimized for web.</Form.Text>
                                                                </div>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Button type="submit" className="save-btn" disabled={loading}>
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </Form>
                                        </Tab.Pane>

                                        {/* Addresses Tab */}
                                        <Tab.Pane eventKey="addresses">
                                            <div className="addresses-header">
                                                <h3>Saved Addresses</h3>
                                                <Button variant="outline-primary" onClick={() => {
                                                    setEditingAddressId(null);
                                                    setNewAddress({ name: '', phone: '', address: '', city: '', province: '', pincode: '', isDefault: false });
                                                    setShowAddressForm(!showAddressForm);
                                                }}>
                                                    <FiPlus /> Add New Address
                                                </Button>
                                            </div>

                                            {showAddressForm && (
                                                <Card className="address-form-card mb-4">
                                                    <Card.Body>
                                                        <h4>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h4>
                                                        <Form onSubmit={handleAddressSubmit}>
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Full Name</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={newAddress.name}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Phone Number</Form.Label>
                                                                        <Form.Control
                                                                            type="tel"
                                                                            value={newAddress.phone}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={12}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Address</Form.Label>
                                                                        <Form.Control
                                                                            as="textarea"
                                                                            rows={2}
                                                                            value={newAddress.address}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={4}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>City</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={newAddress.city}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={4}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Province</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={newAddress.province}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={4}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>PIN Code</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={newAddress.pincode}
                                                                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                            <Form.Check
                                                                type="checkbox"
                                                                label="Set as default address"
                                                                checked={newAddress.isDefault}
                                                                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                                className="mb-3"
                                                            />
                                                            <div className="d-flex gap-2">
                                                                <Button type="submit" className="save-btn" disabled={loading}>
                                                                    {loading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Add Address')}
                                                                </Button>
                                                                <Button variant="outline-secondary" onClick={() => {
                                                                    setShowAddressForm(false);
                                                                    setEditingAddressId(null);
                                                                    setNewAddress({ name: '', phone: '', address: '', city: '', province: '', pincode: '', isDefault: false });
                                                                }}>
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </Form>
                                                    </Card.Body>
                                                </Card>
                                            )}

                                            <Row>
                                                {addresses.length > 0 ? addresses.map((address) => (
                                                    <Col md={6} key={address.id} className="mb-3">
                                                        <Card className="address-card">
                                                            {address.isDefault && <span className="default-badge">Default</span>}
                                                            <Card.Body>
                                                                <h5>{address.name}</h5>
                                                                <p>{address.address}</p>
                                                                <p>{address.city}, {address.province || address.state} - {address.pincode}</p>
                                                                <p><FiPhone className="me-2" /> {address.phone}</p>
                                                                <div className="address-actions">
                                                                    <Button variant="link" size="sm" onClick={() => handleEditAddress(address)}>
                                                                        <FiEdit /> Edit
                                                                    </Button>
                                                                    <Button variant="link" size="sm" className="text-danger" onClick={() => handleDeleteAddress(address.id)}>
                                                                        <FiTrash2 /> Delete
                                                                    </Button>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                )) : (
                                                    <Col>
                                                        <p className="text-muted">No saved addresses. Add your first address above.</p>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Tab.Pane>

                                        {/* Security Tab */}
                                        <Tab.Pane eventKey="security">
                                            <h3>Change Password</h3>
                                            <Form onSubmit={handlePasswordUpdate} className="password-form">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Current Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>New Password</Form.Label>
                                                            <Form.Control
                                                                type="password"
                                                                value={passwordData.newPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Confirm New Password</Form.Label>
                                                            <Form.Control
                                                                type="password"
                                                                value={passwordData.confirmPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Button type="submit" className="save-btn" disabled={loading}>
                                                    {loading ? 'Updating...' : 'Update Password'}
                                                </Button>
                                            </Form>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Card.Body>
                            </Card>
                        </Tab.Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Account;

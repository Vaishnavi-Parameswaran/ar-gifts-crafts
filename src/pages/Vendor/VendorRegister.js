// Vendor Registration Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, ProgressBar } from 'react-bootstrap';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { registerVendor } from '../../services/vendorService';
import './VendorRegister.css';

const VendorRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Account Info
        email: '',
        password: '',
        confirmPassword: '',
        // Business Info
        businessName: '',
        businessDescription: '',
        businessType: '',
        businessEmail: '',
        businessPhone: '',
        // Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'Sri Lanka',
        // Bank Details
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: '',
        branchCode: '',
        swiftCode: '',
        // Tax
        taxId: ''
    });
    const [documents, setDocuments] = useState({
        businessLicense: '',
        nicCard: '',
        vatCertificate: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const { register, currentUser, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setDocuments({
            ...documents,
            [e.target.name]: e.target.files[0]
        });
    };

    const validateStep = () => {
        setError('');

        switch (step) {
            case 1:
                if (!currentUser) {
                    if (!formData.email || !formData.password || !formData.confirmPassword) {
                        setError('Please fill all required fields');
                        return false;
                    }
                    if (formData.password !== formData.confirmPassword) {
                        setError('Passwords do not match');
                        return false;
                    }
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters');
                        return false;
                    }
                }
                return true;
            case 2:
                if (!formData.businessName || !formData.businessType || !formData.businessEmail || !formData.businessPhone) {
                    setError('Please fill all required fields');
                    return false;
                }
                return true;
            case 3:
                if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
                    setError('Please fill all required fields');
                    return false;
                }
                return true;
            case 4:
                if (!formData.bankAccountName || !formData.bankAccountNumber || !formData.bankName || !formData.branchCode) {
                    setError('Please fill all required fields');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        setLoading(true);
        setStatusMessage('Checking eligibility...');
        setError('');

        try {
            // 1. CHECK IF CURRENT USER IS SUSPENDED
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.status === 'suspended') {
                        throw new Error('Your account has been suspended. You cannot register as a vendor.');
                    }
                }
            }

            // 2. CHECK FOR DUPLICATE BUSINESS DETAILS (Name, Phone, Email)
            const vendorsRef = collection(db, 'vendors');
            const checks = [
                { field: 'businessName', value: formData.businessName, label: 'Business Name' },
                { field: 'businessPhone', value: formData.businessPhone, label: 'Business Phone' },
                { field: 'businessEmail', value: formData.businessEmail, label: 'Business Email' }
            ];

            for (const check of checks) {
                const q = query(vendorsRef, where(check.field, '==', check.value));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    // Check if it's not the current user (if they somehow have a partial profile)
                    const isSelf = currentUser && snapshot.docs[0].id === currentUser.uid;
                    if (!isSelf) {
                        throw new Error(`A vendor with this ${check.label} already exists.`);
                    }
                }
            }

            let userId = currentUser?.uid;

            // Create account if not logged in
            if (!currentUser) {
                setStatusMessage('Creating user account...');
                const user = await register(formData.email, formData.password, {
                    displayName: formData.businessName,
                    phone: formData.businessPhone,
                    role: 'vendor'
                });
                userId = user.uid;
            }

            // 1. Create User Document if missing (for logged in users who missed it)
            // 2. FORCE UPDATE role to 'vendor' in Users collection
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { role: 'vendor' }, { merge: true });

            console.log('User role updated to Vendor in Firestore.');

            // 3. Register as vendor in Vendors collection
            setStatusMessage('Creating vendor profile...');
            await registerVendor(userId, {
                ...formData,
                businessAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: formData.country
                }
            }, documents);

            console.log('Vendor profile created.');

            // 4. Force refresh local profile state so UI updates immediately
            await refreshProfile();

            setStatusMessage('Success!');
            navigate('/vendor/dashboard', {
                state: { message: 'Registration successful! Your application is under review.' }
            });
        } catch (err) {
            console.error('Registration error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError(
                    <span>
                        This email ({formData.email}) is already registered! <br />
                        <strong className="d-block mt-2">Possible reasons:</strong>
                        <ul className="text-start mt-1 mb-2">
                            <li>You submitted the form once already.</li>
                            <li>Your account was suspended or disabled.</li>
                        </ul>
                        <strong className="d-block">Solution:</strong>
                        Please <Link to="/login">Log In</Link>. If you are suspended, you cannot register again.
                    </span>
                );
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const progress = (step / 5) * 100;

    return (
        <div className="vendor-register-page">
            <Container>
                <div className="register-header">
                    <Link to="/" className="back-link">
                        <FiArrowLeft /> Back to Home
                    </Link>
                    <h1>Become a Seller on AR ONE</h1>
                    <p>Start selling your products to millions of customers</p>
                </div>

                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Card className="register-card">
                            <Card.Body>
                                {/* Progress Bar */}
                                <div className="registration-progress">
                                    <ProgressBar now={progress} />
                                    <div className="step-indicators">
                                        {['Account', 'Business', 'Address', 'Bank', 'Documents'].map((label, index) => (
                                            <div
                                                key={index}
                                                className={`step-indicator ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
                                            >
                                                <div className="step-number">
                                                    {step > index + 1 ? <FiCheck /> : index + 1}
                                                </div>
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    {/* Step 1: Account Information */}
                                    {step === 1 && (
                                        <div className="form-step">
                                            <h3>Account Information</h3>
                                            {currentUser ? (
                                                <Alert variant="info">
                                                    You're logged in as {currentUser.email}. Your seller account will be linked to this account.
                                                </Alert>
                                            ) : (
                                                <>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email Address *</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            placeholder="your@email.com"
                                                            required={!currentUser}
                                                        />
                                                    </Form.Group>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Password *</Form.Label>
                                                                <Form.Control
                                                                    type="password"
                                                                    name="password"
                                                                    value={formData.password}
                                                                    onChange={handleChange}
                                                                    placeholder="Create a password"
                                                                    required={!currentUser}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Confirm Password *</Form.Label>
                                                                <Form.Control
                                                                    type="password"
                                                                    name="confirmPassword"
                                                                    value={formData.confirmPassword}
                                                                    onChange={handleChange}
                                                                    placeholder="Confirm password"
                                                                    required={!currentUser}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: Business Information */}
                                    {step === 2 && (
                                        <div className="form-step">
                                            <h3>Business Information</h3>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Business Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="businessName"
                                                    value={formData.businessName}
                                                    onChange={handleChange}
                                                    placeholder="Your store name"
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Business Type *</Form.Label>
                                                <Form.Select
                                                    name="businessType"
                                                    value={formData.businessType}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select business type</option>
                                                    <option value="individual">Individual / Sole Proprietor</option>
                                                    <option value="partnership">Partnership</option>
                                                    <option value="llp">LLP</option>
                                                    <option value="pvt_ltd">Private Limited</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Business Email *</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="businessEmail"
                                                            value={formData.businessEmail}
                                                            onChange={handleChange}
                                                            placeholder="business@email.com"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Business Phone *</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            name="businessPhone"
                                                            value={formData.businessPhone}
                                                            onChange={handleChange}
                                                            placeholder="+94 7X XXX XXXX"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Business Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="businessDescription"
                                                    value={formData.businessDescription}
                                                    onChange={handleChange}
                                                    placeholder="Describe your business and products..."
                                                />
                                            </Form.Group>
                                        </div>
                                    )}

                                    {/* Step 3: Address */}
                                    {step === 3 && (
                                        <div className="form-step">
                                            <h3>Business Address</h3>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Address *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Street address"
                                                    required
                                                />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>City *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            placeholder="City"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Province/District *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleChange}
                                                            placeholder="Province or District"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Postal Code *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="pincode"
                                                            value={formData.pincode}
                                                            onChange={handleChange}
                                                            placeholder="XXXXX"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Country</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleChange}
                                                            readOnly
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}

                                    {/* Step 4: Bank Details */}
                                    {step === 4 && (
                                        <div className="form-step">
                                            <h3>Bank Details</h3>
                                            <p className="text-muted mb-4">Enter your bank details for receiving payments</p>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Account Holder Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="bankAccountName"
                                                    value={formData.bankAccountName}
                                                    onChange={handleChange}
                                                    placeholder="Name as per bank account"
                                                    required
                                                />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Account Number *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="bankAccountNumber"
                                                            value={formData.bankAccountNumber}
                                                            onChange={handleChange}
                                                            placeholder="Bank account number"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Branch Code *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="branchCode"
                                                            value={formData.branchCode}
                                                            onChange={handleChange}
                                                            placeholder="Branch Code"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bank Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={handleChange}
                                                    placeholder="Bank name"
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>SWIFT Code (Optional)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="swiftCode"
                                                    value={formData.swiftCode}
                                                    onChange={handleChange}
                                                    placeholder="SWIFT/BIC Code"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>VAT/Tax Registration Number (Optional)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="taxId"
                                                    value={formData.taxId}
                                                    onChange={handleChange}
                                                    placeholder="TIN/VAT Number"
                                                />
                                            </Form.Group>
                                        </div>
                                    )}

                                    {/* Step 5: Documents */}
                                    {step === 5 && (
                                        <div className="form-step">
                                            <h3>Verification Documents</h3>
                                            <p className="text-muted mb-4">Upload documents for verification (optional but recommended)</p>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Business License / Registration Certificate URL</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="businessLicense"
                                                    value={documents.businessLicense || ''}
                                                    onChange={(e) => setDocuments({ ...documents, businessLicense: e.target.value })}
                                                    placeholder="https://drive.google.com/..."
                                                />
                                                <Form.Text className="text-muted">Link to your document (Drive, Dropbox, etc)</Form.Text>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>NIC (National Identity Card) URL</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="nicCard"
                                                    value={documents.nicCard || ''}
                                                    onChange={(e) => setDocuments({ ...documents, nicCard: e.target.value })}
                                                    placeholder="https://drive.google.com/..."
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>VAT Certificate URL (if applicable)</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="vatCertificate"
                                                    value={documents.vatCertificate || ''}
                                                    onChange={(e) => setDocuments({ ...documents, vatCertificate: e.target.value })}
                                                    placeholder="https://drive.google.com/..."
                                                />
                                            </Form.Group>
                                            <Form.Check
                                                type="checkbox"
                                                label={
                                                    <span>
                                                        I agree to the <Link to="/vendor-terms">Vendor Terms & Conditions</Link> and{' '}
                                                        <Link to="/vendor-policy">Seller Policy</Link>
                                                    </span>
                                                }
                                                required
                                                className="mt-4"
                                            />
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="form-navigation">
                                        {step > 1 && (
                                            <Button variant="outline-secondary" onClick={prevStep} disabled={loading}>
                                                <FiArrowLeft /> Previous
                                            </Button>
                                        )}
                                        {step < 5 ? (
                                            <Button className="next-btn" onClick={nextStep}>
                                                Next <FiArrowRight />
                                            </Button>
                                        ) : (
                                            <Button type="submit" className="submit-btn" disabled={loading}>
                                                {loading ? (
                                                    <span>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        {statusMessage || 'Registering...'}
                                                    </span>
                                                ) : 'Complete Registration'}
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default VendorRegister;

// Register Page Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, googleSignIn } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, {
                displayName: formData.displayName,
                phone: formData.phone,
                role: 'customer'
            });
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak. Please use a stronger password.');
                    break;
                default:
                    setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={5} md={7}>
                        <div className="auth-card">
                            <div className="auth-header">
                                <Link to="/" className="auth-logo">
                                    <span>AR ONE</span>
                                </Link>
                                <h1>Create Account</h1>
                                <p>Join us and start shopping</p>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <div className="input-with-icon">
                                        <FiUser className="input-icon" />
                                        <Form.Control
                                            type="text"
                                            name="displayName"
                                            placeholder="Enter your full name"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <div className="input-with-icon">
                                        <FiMail className="input-icon" />
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <div className="input-with-icon">
                                        <FiPhone className="input-icon" />
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <div className="input-with-icon">
                                        <FiLock className="input-icon" />
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <div className="input-with-icon">
                                        <FiLock className="input-icon" />
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Check
                                    type="checkbox"
                                    label={
                                        <span>
                                            I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                                            <Link to="/privacy">Privacy Policy</Link>
                                        </span>
                                    }
                                    className="mb-4"
                                    required
                                />

                                <Button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </Form>

                            <div className="auth-divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-auth">
                                <Button
                                    variant="outline-secondary"
                                    className="social-btn"
                                    onClick={async () => {
                                        try {
                                            await googleSignIn();
                                            // No cart transfer needed for register flow usually, but good practice
                                            navigate('/');
                                        } catch (error) {
                                            console.error("Google Sign In Failed", error);
                                            setError("Failed to sign in with Google.");
                                        }
                                    }}
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" />
                                    Google
                                </Button>
                            </div>

                            <p className="auth-footer">
                                Already have an account? <Link to="/login">Sign In</Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;

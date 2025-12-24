// Login Page Component
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, googleSignIn, fetchUserProfile } = useAuth();
    const { transferGuestCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            await transferGuestCart(user);

            // Check role and redirect
            // We need to wait a moment for the profile to be loaded in context or fetch it manually
            // Since login returns the firebase user, we can fetch profile immediately
            // But better to use the user object returned.
            // Note: login() only returns userCredential.user in AuthContext.js currently.

            // Fetch profile manually to decide where to go
            // We need to import getDoc/db here or use fetchUserProfile from context if exposed
            // Let's assume fetchUserProfile is exposed now or we import it

            // Actually, we can just use the role from the profile if we can get it.
            // Let's rely on the AuthContext's fetchUserProfile
            // But we don't have access to the raw function easily if it's not exported.
            // Let's modify AuthContext to return the profile on login OR just fetch it here.

            // Simpler: Just rely on default home redirect, BUT user wants specific dashboard.
            // Let's check the role.
            // We need to add `fetchUserProfile` to useAuth destructuring first.
            const profile = await fetchUserProfile(user.uid);

            if (profile?.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (profile?.role === 'vendor') {
                navigate('/vendor/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email address.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later.');
                    break;
                default:
                    setError('Failed to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Container>
                <div className="back-nav mb-4">
                    <Link to="/" className="back-btn">
                        <FiArrowLeft className="me-2" /> Back to Home
                    </Link>
                </div>
                <Row className="justify-content-center">
                    <Col lg={5} md={7}>
                        <div className="auth-card">
                            <div className="auth-header">
                                <Link to="/" className="auth-logo">
                                    <span>AR ONE</span>
                                </Link>
                                <h1>Welcome Back!</h1>
                                <p>Sign in to continue shopping</p>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <div className="input-with-icon">
                                        <FiMail className="input-icon" />
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <div className="input-with-icon">
                                        <FiLock className="input-icon" />
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        label="Remember me"
                                        className="remember-check"
                                    />
                                    <Link to="/forgot-password" className="forgot-link">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
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
                                            const user = await googleSignIn();
                                            await transferGuestCart(user);
                                            navigate(from, { replace: true });
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
                                Don't have an account? <Link to="/register">Create Account</Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;

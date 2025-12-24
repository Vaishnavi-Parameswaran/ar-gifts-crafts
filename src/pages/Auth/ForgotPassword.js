// Forgot Password Page Component
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
            setIsSuccess(true);
        } catch (err) {
            console.error('Reset password error:', err);
            // Enhanced error mapping for real Firebase projects
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection.');
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Container>
                {/* Back to Home Button */}
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
                                <h1>Forgot Password?</h1>
                                {!isSuccess ? (
                                    <p>Enter your email and we'll send you reset instructions</p>
                                ) : (
                                    <p className="text-success fw-bold">Success!</p>
                                )}
                            </div>

                            {error && <Alert variant="danger" className="py-3">{error}</Alert>}
                            {message && <Alert variant="success" className="py-3">{message}</Alert>}

                            {!isSuccess ? (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
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

                                    <Button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </Form>
                            ) : (
                                <div className="text-center mt-4">
                                    <p>Didn't receive the email? Check your spam folder or </p>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none"
                                        onClick={() => setIsSuccess(false)}
                                        style={{ color: 'var(--primary-color)', fontWeight: '600' }}
                                    >
                                        Try again
                                    </Button>
                                </div>
                            )}

                            <Link to="/login" className="back-to-login">
                                <FiArrowLeft /> Back to Login
                            </Link>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ForgotPassword;

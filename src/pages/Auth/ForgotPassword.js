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

    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            console.error('Reset password error:', err);
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email address.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                default:
                    setError('Failed to send reset email. Please try again.');
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
                                <h1>Forgot Password?</h1>
                                <p>Enter your email and we'll send you reset instructions</p>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {message && <Alert variant="success">{message}</Alert>}

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

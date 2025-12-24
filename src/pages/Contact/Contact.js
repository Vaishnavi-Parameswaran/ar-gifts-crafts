import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { submitContactMessage } from '../../services/contactService';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = ({ isEmbedded = false }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    // Auto-fill from state (e.g. from Order Detail "Need Help?")
    const initialSubject = location.state?.subject || '';
    const initialMessage = location.state?.message || '';

    const [formData, setFormData] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        subject: initialSubject,
        message: initialMessage
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || currentUser.displayName || '',
                email: prev.email || currentUser.email || ''
            }));
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // 1. Save to Database (Firestore)
            await submitContactMessage({
                ...formData,
                userId: currentUser?.uid || null,
                source: 'web_contact_page'
            });

            // 2. Send Real Email via EmailJS
            const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
            const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
            const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

            if (serviceId && templateId) {
                await emailjs.send(
                    serviceId,
                    templateId,
                    {
                        from_name: formData.name,
                        from_email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                        reply_to: formData.email,
                    },
                    publicKey
                );
            } else {
                console.warn('EmailJS keys not found in environment variables. Email not sent.');
            }

            setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });

            // Reset message only
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        } catch (error) {
            console.error(error);
            setStatus({ type: 'danger', message: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={isEmbedded ? "contact-section-embedded" : "contact-page"}>
            {!isEmbedded && (
                <div className="page-hero">
                    <Container>
                        <h1>Contact Us</h1>
                        <p>We'd love to hear from you</p>
                    </Container>
                </div>
            )}

            <Container className={isEmbedded ? "py-4" : "py-5"}>
                {isEmbedded && (
                    <div className="text-center mb-5">
                        <h2 style={{ fontWeight: 700 }}>Contact Us</h2>
                        <p className="text-muted">Have a question? Send us a message.</p>
                    </div>
                )}
                <Row>
                    <Col lg={5} className="mb-4">
                        <div className="contact-info">
                            <h2>Get in Touch</h2>
                            <p className="mb-4">Have questions regarding your order or our products? We're here to help.</p>

                            <div className="info-item">
                                <div className="icon"><FiPhone /></div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>+94 77 123 4567</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="icon"><FiMail /></div>
                                <div>
                                    <h4>Email</h4>
                                    <p>support@arone.com</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="icon"><FiMapPin /></div>
                                <div>
                                    <h4>Address</h4>
                                    <p>123 Galle Road, Colombo 03, Sri Lanka</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="icon"><FiClock /></div>
                                <div>
                                    <h4>Working Hours</h4>
                                    <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={7}>
                        <Card className="contact-form-card">
                            <Card.Body>
                                <h2>Send us a Message</h2>
                                {status.message && (
                                    <Alert variant={status.type} onClose={() => setStatus({ type: '', message: '' })} dismissible>
                                        {status.message}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Your Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Subject</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What is this about?"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Your message..."
                                            required
                                        />
                                    </Form.Group>
                                    <Button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? 'Sending...' : <><FiSend /> Send Message</>}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;

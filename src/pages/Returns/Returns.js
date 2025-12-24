import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import './Returns.css';

const Returns = () => {
    const [formData, setFormData] = useState({
        orderNumber: '',
        email: '',
        reason: '',
        images: null
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        // Just storing file name for demo, or actual files if we implemented upload
        setFormData(prev => ({ ...prev, images: e.target.files }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send this data to a backend or EmailJS
        console.log('Return Request Submitted:', formData);
        setSubmitted(true);
        // Reset form
        setFormData({ orderNumber: '', email: '', reason: '', images: null });
    };

    return (
        <div className="returns-page">
            <Container className="py-5">
                <h1 className="page-title">Return & Refund Policy</h1>

                <Row className="justify-content-center">
                    <Col lg={10}>
                        {/* Policy Section */}
                        <div className="policy-section">
                            <h3>Our Policy</h3>
                            <p>
                                We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, you may return eligible items within 30 days of receipt for a refund or exchange.
                            </p>

                            <h3>Eligibility Criteria:</h3>
                            <ul>
                                <li>Items must be in their original, unused condition, with all original packaging and tags intact.</li>
                                <li>Custom or personalized items are generally not eligible for return unless they arrive damaged or defective.</li>
                                <li>Returns initiated after 30 days from the delivery date will not be accepted.</li>
                                <li>Proof of purchase (order number or receipt) is required for all returns.</li>
                            </ul>

                            <h3>How to Initiate a Return:</h3>
                            <p>Once submitted, our team will review your request and contact you within 2-3 business days to provide instructions for the next steps.</p>

                            <h3>Refund Processing:</h3>
                            <p>
                                Once your returned item is received and thoroughly inspected, we will send you an email notification. We will then inform you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days. Shipping costs are non-refundable unless the return is due to a product defect or an error on our part.
                            </p>
                        </div>

                        {/* Request Form Section */}
                        <div className="request-form-container">
                            <h2>Submit a Return/Refund Request</h2>

                            {submitted && (
                                <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
                                    Request submitted successfully! We will contact you shortly.
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Order Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="orderNumber"
                                        placeholder="e.g., ARONE-123456789"
                                        value={formData.orderNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Your Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Reason for Return/Refund</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="reason"
                                        rows={4}
                                        placeholder="Please explain why you wish to return the item(s) and provide relevant details..."
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Upload Supporting Images (Optional)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <span className="upload-note">Max 5MB per image, up to 3 images.</span>
                                </Form.Group>

                                <Button type="submit" className="submit-btn">
                                    Submit Request
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Returns;

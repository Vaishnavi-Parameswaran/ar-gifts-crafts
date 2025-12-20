// Static Pages
import React from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import './Static.css';

// About Page
export const About = () => (
    <div className="static-page about-page">
        <div className="page-hero">
            <Container>
                <h1>About AR ONE Gifts & Crafts</h1>
                <p>Connecting artisans with art lovers since 2024</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="align-items-center mb-5">
                <Col lg={6}>
                    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600" alt="Our Story" className="about-image" />
                </Col>
                <Col lg={6}>
                    <h2>Our Story</h2>
                    <p>AR ONE Gifts & Crafts was born from a simple idea: connecting talented artisans across Sri Lanka with customers who appreciate the beauty and uniqueness of handmade products.</p>
                    <p>We believe every handcrafted item tells a story – of tradition, passion, and incredible skill passed down through generations. Our mission is to bring these stories to your home while supporting the livelihoods of thousands of artisans.</p>
                    <p>From ceramic vases to personalized gifts, from traditional artwork to modern home decor, every product on our platform is carefully curated to ensure quality, authenticity, and uniqueness.</p>
                </Col>
            </Row>
            <Row className="stats-section text-center">
                <Col md={3} sm={6} className="mb-4">
                    <div className="stat-box">
                        <h3>5000+</h3>
                        <p>Products</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-4">
                    <div className="stat-box">
                        <h3>500+</h3>
                        <p>Artisans</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-4">
                    <div className="stat-box">
                        <h3>50,000+</h3>
                        <p>Happy Customers</p>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-4">
                    <div className="stat-box">
                        <h3>100+</h3>
                        <p>Cities Served</p>
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
);



// FAQ Page
export const FAQ = () => (
    <div className="static-page faq-page">
        <div className="page-hero">
            <Container>
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>How do I place an order?</Accordion.Header>
                            <Accordion.Body>
                                Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or login to complete your purchase.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>What payment methods are accepted?</Accordion.Header>
                            <Accordion.Body>
                                We accept UPI payments (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and Cash on Delivery (COD) for eligible orders.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>How long does delivery take?</Accordion.Header>
                            <Accordion.Body>
                                Standard delivery takes 5-7 business days. Express delivery (1-3 days) is available for select locations at an additional cost.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Can I return or exchange products?</Accordion.Header>
                            <Accordion.Body>
                                Yes, we offer a 7-day return policy for most products. Items must be unused and in original packaging. Personalized items cannot be returned unless defective.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>How do I become a seller?</Accordion.Header>
                            <Accordion.Body>
                                Click on "Sell on AR ONE" and complete the registration process. You'll need to provide business details and verification documents. Our team will review your application within 2-3 business days.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>Is my payment information secure?</Accordion.Header>
                            <Accordion.Body>
                                Absolutely! We use industry-standard SSL encryption and secure payment gateways. Your payment information is never stored on our servers.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <div className="more-help text-center mt-5">
                        <h3>Still have questions?</h3>
                        <p>Our support team is here to help</p>
                        <Button as={Link} to="/contact" variant="primary">Contact Support</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
);

// Privacy Policy
export const Privacy = () => (
    <div className="static-page legal-page">
        <div className="page-hero">
            <Container>
                <h1>Privacy Policy</h1>
                <p>Last updated: December 2024</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="legal-content">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including name, email address, phone number, shipping address, and payment information when you make a purchase.</p>

                        <h2>2. How We Use Your Information</h2>
                        <p>We use the information we collect to process orders, communicate with you, improve our services, and send promotional content (with your consent).</p>

                        <h2>3. Information Sharing</h2>
                        <p>We share information with vendors only as necessary to fulfill your orders. We do not sell your personal information to third parties.</p>

                        <h2>4. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>

                        <h2>5. Your Rights</h2>
                        <p>You have the right to access, correct, or delete your personal information. Contact us at privacy@arone-gifts.com for such requests.</p>

                        <h2>6. Cookies</h2>
                        <p>We use cookies to enhance your browsing experience and analyze site traffic. You can control cookie settings in your browser.</p>

                        <h2>7. Contact Us</h2>
                        <p>For privacy-related questions, contact us at privacy@arone-gifts.com</p>
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
);

// Terms of Service
export const Terms = () => (
    <div className="static-page legal-page">
        <div className="page-hero">
            <Container>
                <h1>Terms of Service</h1>
                <p>Last updated: December 2024</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="legal-content">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using AR ONE Gifts & Crafts, you agree to be bound by these Terms of Service.</p>

                        <h2>2. Use of Service</h2>
                        <p>You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account.</p>

                        <h2>3. Products and Orders</h2>
                        <p>All products are sold by independent vendors. We act as a marketplace platform. Prices and availability are subject to change.</p>

                        <h2>4. Payment</h2>
                        <p>Payment must be made through approved payment methods. Prices include applicable taxes unless otherwise stated.</p>

                        <h2>5. Shipping and Delivery</h2>
                        <p>Delivery times are estimates. We are not responsible for delays caused by circumstances beyond our control.</p>

                        <h2>6. Returns and Refunds</h2>
                        <p>Returns are accepted within 7 days of delivery. Refunds will be processed within 5-7 business days after receipt of returned items.</p>

                        <h2>7. Limitation of Liability</h2>
                        <p>AR ONE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
);

// Shipping Info
export const Shipping = () => (
    <div className="static-page shipping-page">
        <div className="page-hero">
            <Container>
                <h1>Shipping Information</h1>
                <p>Everything you need to know about delivery</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="info-card mb-4">
                        <Card.Body>
                            <h3>Delivery Options</h3>
                            <table className="shipping-table">
                                <thead>
                                    <tr>
                                        <th>Delivery Type</th>
                                        <th>Time</th>
                                        <th>Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Standard Delivery</td>
                                        <td>5-7 Business Days</td>
                                        <td>Rs. 250 (Free above Rs. 5,000)</td>
                                    </tr>
                                    <tr>
                                        <td>Express Delivery</td>
                                        <td>2-3 Business Days</td>
                                        <td>Rs. 500</td>
                                    </tr>
                                    <tr>
                                        <td>Same Day Delivery</td>
                                        <td>Same Day</td>
                                        <td>Rs. 750 (Colombo only)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>

                    <Card className="info-card mb-4">
                        <Card.Body>
                            <h3>Tracking Your Order</h3>
                            <p>Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order on our website or through the courier's website.</p>
                        </Card.Body>
                    </Card>

                    <Card className="info-card">
                        <Card.Body>
                            <h3>Delivery Areas</h3>
                            <p>We deliver across Sri Lanka. Some remote areas may have extended delivery times. Check postal code availability at checkout.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </div>
);



// Track Order
export const TrackOrder = () => (
    <div className="static-page track-page">
        <div className="page-hero">
            <Container>
                <h1>Track Your Order</h1>
                <p>Enter your order details to track shipment</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={6}>
                    <Card className="track-card">
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Order ID</Form.Label>
                                    <Form.Control type="text" placeholder="Enter your order ID (e.g., AR2024XYZ123)" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control type="email" placeholder="Email used for the order" />
                                </Form.Group>
                                <Button type="submit" className="track-btn w-100">Track Order</Button>
                            </Form>
                            <div className="or-divider">
                                <span>OR</span>
                            </div>
                            <p className="text-center">
                                <Link to="/login">Login to your account</Link> to view all your orders
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </div>
);

// Help Center
export const Help = () => (
    <div className="static-page help-page">
        <div className="page-hero">
            <Container>
                <h1>Help Center</h1>
                <p>How can we help you today?</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/faq" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>📖 FAQs</h3>
                                <p>Find answers to frequently asked questions</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/track-order" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>📦 Track Order</h3>
                                <p>Track your shipment status</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/returns" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>↩️ Returns</h3>
                                <p>Learn about our return policy</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/shipping" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>🚚 Shipping</h3>
                                <p>Delivery options and costs</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/contact" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>📞 Contact Us</h3>
                                <p>Get in touch with support</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col lg={4} md={6} className="mb-4">
                    <Link to="/vendor/register" className="help-card">
                        <Card>
                            <Card.Body>
                                <h3>🏪 Sell With Us</h3>
                                <p>Become a seller on AR ONE</p>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container>
    </div>
);

// Static Pages
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion, Badge, ListGroup, ProgressBar, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FiMail, FiPhone, FiMapPin, FiClock, FiSend,
    FiPackage, FiTruck, FiCheckCircle, FiSearch, FiAlertCircle
} from 'react-icons/fi';
import { getOrderById } from '../../services/orderService';
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
export const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId || !email) return;

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            const order = await getOrderById(orderId.trim());
            // Verify email match for privacy
            if (order && (order.customerEmail?.toLowerCase() === email.trim().toLowerCase())) {
                setOrderData(order);
            } else {
                setError('Order not found or email does not match our records.');
            }
        } catch (err) {
            console.error('Tracking error:', err);
            setError('An error occurred while fetching order details.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            default: return 0;
        }
    };

    return (
        <div className="static-page track-page">
            <div className="page-hero">
                <Container>
                    <h1>Track Your Order</h1>
                    <p>Enter your order details to track shipment status</p>
                </Container>
            </div>
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        {!orderData ? (
                            <Card className="track-card border-0 shadow-sm">
                                <Card.Body className="p-4 p-md-5">
                                    <div className="text-center mb-4">
                                        <div className="track-icon-wrapper mb-3">
                                            <FiSearch size={32} />
                                        </div>
                                        <h3>Where is my order?</h3>
                                        <p className="text-muted">Enter the 12-digit Order ID found in your confirmation email.</p>
                                    </div>

                                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                                    <Form onSubmit={handleTrack}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small">Order ID</Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        placeholder="e.g. AR2024XYZ123"
                                                        value={orderId}
                                                        onChange={(e) => setOrderId(e.target.value)}
                                                        className="form-control-lg bg-light border-0"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small">Email Address</Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="form-control-lg bg-light border-0"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button
                                            type="submit"
                                            className="track-btn w-100 mt-3 btn-lg text-white"
                                            disabled={loading}
                                        >
                                            {loading ? 'Searching...' : 'Track My Order'}
                                        </Button>
                                    </Form>

                                    <div className="or-divider mt-5 mb-4">
                                        <span>OR</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-muted mb-0">
                                            Registered user? <Link to="/login" className="text-primary fw-bold">Sign In</Link> to view full order history.
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <div className="tracking-results animate-fade-in">
                                <Button
                                    variant="link"
                                    className="text-decoration-none p-0 mb-4 text-muted d-flex align-items-center gap-2"
                                    onClick={() => setOrderData(null)}
                                >
                                    <FiSearch /> Track another order
                                </Button>

                                <Card className="order-status-card border-0 shadow-sm mb-4">
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                                            <div>
                                                <h5 className="mb-1">Order #{orderData.orderId}</h5>
                                                <p className="text-muted small mb-0">Placed on {orderData.createdAt?.toDate ? new Date(orderData.createdAt.toDate()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                                            </div>
                                            <Badge bg={
                                                orderData.orderStatus === 'delivered' ? 'success' :
                                                    orderData.orderStatus === 'cancelled' ? 'danger' : 'warning'
                                            } className="px-3 py-2 text-capitalize fs-6">
                                                {orderData.orderStatus}
                                            </Badge>
                                        </div>

                                        <div className="tracking-progress-wrapper my-5">
                                            <div className="tracking-progress-steps">
                                                <div className={`step-item ${getStatusStep(orderData.orderStatus) >= 1 ? 'active' : ''} ${getStatusStep(orderData.orderStatus) > 1 ? 'completed' : ''}`}>
                                                    <div className="step-circle"><FiPackage /></div>
                                                    <div className="step-label">Ordered</div>
                                                </div>
                                                <div className={`step-item ${getStatusStep(orderData.orderStatus) >= 2 ? 'active' : ''} ${getStatusStep(orderData.orderStatus) > 2 ? 'completed' : ''}`}>
                                                    <div className="step-circle"><FiClock /></div>
                                                    <div className="step-label">Processing</div>
                                                </div>
                                                <div className={`step-item ${getStatusStep(orderData.orderStatus) >= 3 ? 'active' : ''} ${getStatusStep(orderData.orderStatus) > 3 ? 'completed' : ''}`}>
                                                    <div className="step-circle"><FiTruck /></div>
                                                    <div className="step-label">Shipped</div>
                                                </div>
                                                <div className={`step-item ${getStatusStep(orderData.orderStatus) >= 4 ? 'active' : ''}`}>
                                                    <div className="step-circle"><FiCheckCircle /></div>
                                                    <div className="step-label">Delivered</div>
                                                </div>
                                            </div>
                                            <div className="progress-bar-line">
                                                <ProgressBar
                                                    now={
                                                        orderData.orderStatus === 'pending' ? 12.5 :
                                                            orderData.orderStatus === 'processing' ? 37.5 :
                                                                orderData.orderStatus === 'shipped' ? 62.5 :
                                                                    orderData.orderStatus === 'delivered' ? 100 : 0
                                                    }
                                                    variant="primary"
                                                />
                                            </div>
                                        </div>

                                        <Row className="mt-4 pt-4 border-top">
                                            <Col md={6} className="mb-3 mb-md-0">
                                                <h6 className="fw-bold mb-3"><FiMapPin className="me-2" /> Delivery Address</h6>
                                                <div className="text-muted small">
                                                    {typeof orderData.shippingAddress === 'object' ? (
                                                        <>
                                                            <p className="mb-1 fw-bold text-dark">{orderData.shippingAddress.name}</p>
                                                            <p className="mb-1">{orderData.shippingAddress.address}</p>
                                                            <p className="mb-0">{orderData.shippingAddress.city}, {orderData.shippingAddress.zip}</p>
                                                        </>
                                                    ) : (
                                                        <p className="mb-0">{orderData.shippingAddress}</p>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <h6 className="fw-bold mb-3"><FiClock className="me-2" /> Estimated Arrival</h6>
                                                <p className="text-dark fw-bold mb-1">
                                                    {orderData.orderStatus === 'delivered' ? 'Delivered successfully' :
                                                        orderData.orderStatus === 'shipped' ? 'Coming in 2-3 business days' :
                                                            'Arrival within 5-7 business days'}
                                                </p>
                                                <p className="text-muted small">Tracking updates will be sent to {orderData.customerEmail}</p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <Card.Header className="bg-white border-0 py-3">
                                        <h6 className="mb-0 fw-bold">Items in this shipment</h6>
                                    </Card.Header>
                                    <ListGroup variant="flush">
                                        {orderData.items?.map((item, idx) => (
                                            <ListGroup.Item key={idx} className="py-3 px-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="item-img-placeholder">
                                                        <img
                                                            src={item.image || '/placeholder.png'}
                                                            alt=""
                                                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Product'; }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-0 small fw-bold">{item.name}</h6>
                                                        <span className="text-muted smaller">Qty: {item.quantity}</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="fw-bold small">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <Card.Footer className="bg-light border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">Total Amount</span>
                                        <h5 className="mb-0 text-primary fw-bold">Rs. {orderData.totalAmount?.toLocaleString()}</h5>
                                    </Card.Footer>
                                </Card>
                            </div>
                        )}

                        <div className="mt-5 text-center px-4">
                            <div className="help-box p-4 rounded-4 bg-white shadow-sm d-inline-block">
                                <FiAlertCircle className="text-primary mb-2" size={24} />
                                <h6 className="mb-2">Need Help with your order?</h6>
                                <p className="text-muted small mb-0">Our support team is available 24/7. <Link to="/contact">Contact Support</Link></p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

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

// Careers Page
export const Careers = () => (
    <div className="static-page careers-page">
        <div className="page-hero">
            <Container>
                <h1>Grow With Us</h1>
                <p>Build the future of handmade crafts in Sri Lanka</p>
            </Container>
        </div>
        <Container className="py-5">
            <Row className="mb-5">
                <Col lg={8} className="mx-auto text-center">
                    <h2>Why Join AR ONE?</h2>
                    <p className="lead">We're on a mission to empower local artisans and bring their unique creations to the global stage. If you're passionate about art, technology, and making an impact, we'd love to hear from you.</p>
                </Col>
            </Row>

            <Row className="mb-5">
                <Col md={4} className="mb-4">
                    <Card className="h-100 p-3 text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="mb-3 fs-1">🎨</div>
                            <h3>Creative Culture</h3>
                            <p>Work in an environment that celebrates creativity, innovation, and out-of-the-box thinking every single day.</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 p-3 text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="mb-3 fs-1">📈</div>
                            <h3>Growth & Development</h3>
                            <p>We invest in our people. From training workshops to mentorship, we help you reach your maximum potential.</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 p-3 text-center border-0 shadow-sm">
                        <Card.Body>
                            <div className="mb-3 fs-1">🌍</div>
                            <h3>Meaningful Impact</h3>
                            <p>Your work directly supports local artisans and helps preserve traditional Sri Lankan crafts for future generations.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="text-center p-5 bg-light rounded-4">
                <h2>Ready to Start Your Journey?</h2>
                <p>We are always looking for talented individuals in Technology, Marketing, Operations, and Customer Support.</p>
                <p>Send your CV to: <strong>careers@arone-gifts.com</strong></p>
                <Button as={Link} to="/contact" variant="outline-primary" className="mt-3">
                    Inquire About Openings
                </Button>
            </div>
        </Container>
    </div>
);

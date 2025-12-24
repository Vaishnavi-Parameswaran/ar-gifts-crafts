// Footer Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useSettings } from '../../contexts/SettingsContext';
import './Footer.css';

const Footer = () => {
    const { settings: rawSettings } = useSettings() || {};
    const settings = rawSettings || {};

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter subscription
        alert('Thank you for subscribing!');
    };

    return (
        <footer className="main-footer">
            {/* Newsletter Section */}
            <div className="newsletter-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <h4>Subscribe to our Newsletter</h4>
                            <p>Get exclusive offers, gift ideas, and updates delivered to your inbox.</p>
                        </Col>
                        <Col lg={6}>
                            <Form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email address"
                                    required
                                />
                                <Button type="submit">Subscribe</Button>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Footer Content */}
            <div className="footer-content">
                <Container>
                    <Row>
                        <Col lg={4} md={6} className="mb-4">
                            <div className="footer-brand">
                                <h3>{settings?.siteName || 'AR ONE'}</h3>
                                <span>Gifts & Crafts</span>
                            </div>
                            <p className="footer-about">
                                Your one-stop destination for unique handmade gifts and crafts.
                                We connect talented artisans with customers who appreciate quality craftsmanship.
                            </p>
                            <div className="footer-social">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FiFacebook />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <FiInstagram />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                    <FiTwitter />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                                    <FiYoutube />
                                </a>
                            </div>
                        </Col>

                        <Col lg={2} md={6} className="mb-4">
                            <h5>Quick Links</h5>
                            <ul className="footer-links">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/categories">All Categories</Link></li>
                                <li><Link to="/deals">Deals & Offers</Link></li>
                                <li><Link to="/new-arrivals">New Arrivals</Link></li>
                                <li><Link to="/best-sellers">Best Sellers</Link></li>
                            </ul>
                        </Col>

                        <Col lg={2} md={6} className="mb-4">
                            <h5>Customer Service</h5>
                            <ul className="footer-links">
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/track-order">Track Order</Link></li>
                                <li><Link to="/returns">Returns & Refunds</Link></li>
                                <li><Link to="/shipping">Shipping Info</Link></li>
                                <li><Link to="/faq">FAQs</Link></li>
                            </ul>
                        </Col>

                        <Col lg={2} md={6} className="mb-4">
                            <h5>Company</h5>
                            <ul className="footer-links">
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/vendor/register">Sell on AR ONE</Link></li>
                                <li><Link to="/careers">Careers</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                        </Col>

                        <Col lg={2} md={6} className="mb-4">
                            <h5>Contact Info</h5>
                            <ul className="footer-contact">
                                <li>
                                    <FiMapPin />
                                    <span>{settings?.address || '123 Galle Road, Colombo 03, Sri Lanka'}</span>
                                </li>
                                <li>
                                    <FiPhone />
                                    <span>{settings?.contactPhone || '+94 77 123 4567'}</span>
                                </li>
                                <li>
                                    <FiMail />
                                    <span>{settings?.contactEmail || 'support@arone.com'}</span>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Bottom Footer */}
            <div className="footer-bottom">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <p>&copy; {new Date().getFullYear()} {settings?.siteName || 'AR ONE'}. All rights reserved.</p>
                        </Col>
                        <Col md={6}>
                            <div className="footer-bottom-links">
                                <Link to="/privacy">Privacy Policy</Link>
                                <Link to="/terms">Terms of Service</Link>
                                <Link to="/cookies">Cookie Policy</Link>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;

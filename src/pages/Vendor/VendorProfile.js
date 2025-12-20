// Public Vendor Profile Page
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Tabs, Tab, Form, Badge, Alert } from 'react-bootstrap';
import { FiMapPin, FiMail, FiPhone, FiStar, FiShoppingBag, FiCheckCircle, FiUser } from 'react-icons/fi';
import { getVendorById } from '../../services/vendorService';
import { getVendorProducts } from '../../services/productService';
import { getStoreReviews, addReview } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import './VendorProfile.css';

const VendorProfile = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', title: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('products');

    const scrollToReviewForm = () => {
        setActiveTab('reviews');
        setTimeout(() => {
            const form = document.getElementById('review-form');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vendor first (Critical)
                const vendorData = await getVendorById(id);
                setVendor(vendorData);

                if (vendorData) {
                    // Fetch others safely (Non-critical) independently
                    // This creates promises that handle their own errors and always resolve
                    const productsPromise = getVendorProducts(id, 'approved')
                        .catch(err => {
                            console.error('Error fetching products (likely index missing):', err);
                            return [];
                        });

                    const reviewsPromise = getStoreReviews(id, currentUser?.uid)
                        .catch(err => {
                            console.error('Error fetching reviews:', err);
                            return [];
                        });

                    const [productsData, reviewsData] = await Promise.all([productsPromise, reviewsPromise]);

                    setProducts(productsData);
                    setReviews(reviewsData);
                }
            } catch (error) {
                console.error('Error fetching vendor profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, currentUser?.uid]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setReviewMessage({ type: 'danger', text: 'You must be logged in to review.' });
            return;
        }
        setSubmittingReview(true);
        try {
            await addReview({
                vendorId: id,
                vendorName: vendor?.businessName || 'Store Review',
                productId: null, // Vendor review
                customerId: currentUser.uid,
                customerName: currentUser.displayName || 'Customer',
                rating: parseInt(reviewForm.rating),
                title: reviewForm.title,
                comment: reviewForm.comment,
                images: []
            });
            setReviewMessage({ type: 'success', text: 'Review submitted successfully!' });
            setReviewForm({ rating: 5, comment: '', title: '' });
            // Refresh reviews
            const newReviews = await getStoreReviews(id, currentUser.uid);
            setReviews(newReviews);
        } catch (error) {
            console.error('Error submitting review:', error);
            setReviewMessage({ type: 'danger', text: 'Failed to submit review. Please try again.' });
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <Loading fullPage text="Loading store..." />;

    if (!vendor) {
        return (
            <Container className="py-5 text-center">
                <h3>Vendor not found</h3>
                <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
            </Container>
        );
    }

    return (
        <div className="vendor-profile-page">
            {/* Banner Section */}
            <div className="vendor-banner" style={{
                backgroundImage: vendor.banner ? `url(${vendor.banner})` : 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '350px'
            }}></div>

            <Container className="vendor-content">
                {/* Header Section (Logo + Title) */}
                <div className="vendor-header-section">
                    <div className="vendor-logo-wrapper">
                        <img
                            src={vendor.logo || 'https://via.placeholder.com/150?text=Logo'}
                            alt={vendor.businessName}
                        />
                    </div>
                    <div className="vendor-title-badge">
                        <h1>{vendor.businessName}</h1>
                        <div className="d-flex gap-2 align-items-center mt-2">
                            {vendor.status === 'approved' && (
                                <div className="text-success small me-3">
                                    <FiCheckCircle style={{ verticalAlign: 'middle' }} /> Verified Seller
                                </div>
                            )}
                            {currentUser && currentUser.uid === id && (
                                <>
                                    <Button as={Link} to="/vendor/dashboard" variant="outline-primary" size="sm">
                                        <FiUser className="me-1" /> Dashboard
                                    </Button>
                                    <Button as={Link} to="/account" variant="outline-secondary" size="sm">
                                        <FiUser className="me-1" /> My Account
                                    </Button>
                                </>
                            )}
                            {currentUser && currentUser.uid !== id && (
                                <Button variant="primary" size="sm" onClick={scrollToReviewForm}>
                                    <FiStar className="me-1" /> Write a Review
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <Row className="g-4 mb-5">
                    {/* About Shop */}
                    <Col md={6}>
                        <Card className="info-card h-100 p-4">
                            <h4>About Our Shop</h4>
                            <p className="text-muted mb-0">
                                {vendor.businessDescription || "Welcome to our shop! We specialize in unique, handcrafted items. Explore our collection for bespoke gifts and timeless decor that tell a story."}
                            </p>
                        </Card>
                    </Col>

                    {/* Vendor Rating */}
                    <Col md={2}>
                        <Card className="info-card h-100 justify-content-center align-items-center bg-white">
                            <div className="rating-display">
                                <h6>Vendor Rating</h6>
                                <div className="rating-number">{vendor.rating ? vendor.rating.toFixed(1) : '0.0'}</div>
                                <div className="rating-stars mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            fill={i < Math.round(vendor.rating || 0) ? "#ffc107" : "#e4e5e9"}
                                            stroke="none"
                                        />
                                    ))}
                                </div>
                                <div className="text-muted small mb-3">Based on {reviews.length} Reviews</div>
                                {currentUser && currentUser.uid !== id && (
                                    <Button
                                        variant="outline-dark"
                                        size="sm"
                                        onClick={scrollToReviewForm}
                                        className="rounded-pill"
                                    >
                                        Share Feedback
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Contact Information (Read Only) */}
                    <Col md={4}>
                        <Card className="info-card h-100 p-4">
                            <h4>Contact Information</h4>
                            <div className="contact-list">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted mb-1">Email Address</Form.Label>
                                    <Form.Control type="text" value={vendor.businessEmail} readOnly />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted mb-1">Phone Number</Form.Label>
                                    <Form.Control type="text" value={vendor.businessPhone} readOnly />
                                </Form.Group>
                                {vendor.businessAddress && (
                                    <Form.Group>
                                        <Form.Label className="small text-muted mb-1">Shop Address</Form.Label>
                                        <Form.Control type="text" value={vendor.businessAddress} readOnly />
                                    </Form.Group>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Products & Reviews Tabs */}
                <Row>
                    <Col className="text-center">
                        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="vendor-tabs">
                            <Tab eventKey="products" title={`Products (${products.length})`}>
                                {products.length > 0 ? (
                                    <Row className="g-5">
                                        {products.map(product => (
                                            <Col xs={12} sm={6} md={4} lg={3} key={product.id} className="d-flex">
                                                <ProductCard product={product} />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div className="text-center py-5">
                                        <FiShoppingBag size={50} className="text-muted mb-3" />
                                        <p className="lead text-muted">No products available yet.</p>
                                    </div>
                                )}
                            </Tab>

                            <Tab eventKey="reviews" title={`Customer Reviews (${reviews.length})`}>
                                <div className="review-header d-flex justify-content-between align-items-center">
                                    <h4>What customers are saying</h4>
                                    {currentUser && currentUser.uid !== id && <Button variant="dark" onClick={scrollToReviewForm}>Write a Review</Button>}
                                </div>

                                <Row className="masonry-grid">
                                    {reviews.length > 0 ? (
                                        reviews.map(review => (
                                            <Col md={6} key={review.id}>
                                                <div className="review-card">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${review.customerName}&background=random`}
                                                            alt={review.customerName}
                                                            className="review-avatar me-3"
                                                        />
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">{review.customerName}</h6>
                                                            <small className="text-muted">{new Date(review.createdAt?.toDate?.() || review.createdAt || Date.now()).toLocaleDateString()}</small>
                                                            {review.status === 'pending' && (
                                                                <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>Pending Approval</Badge>
                                                            )}
                                                        </div>
                                                        <div className="ms-auto text-warning">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <h6 className="fw-bold">{review.title}</h6>
                                                    <p className="text-muted">{review.comment}</p>
                                                </div>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col xs={12}>
                                            <div className="text-center py-5 bg-white rounded">
                                                <p className="text-muted">No reviews yet.</p>
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                                {currentUser && currentUser.uid !== id && (
                                    <Card className="border-0 shadow-sm mt-5" id="review-form">
                                        <Card.Body className="p-4">
                                            <h5 className="mb-4">Leave a Review</h5>
                                            {reviewMessage.text && (
                                                <Alert variant={reviewMessage.type} onClose={() => setReviewMessage({ type: '', text: '' })} dismissible>
                                                    {reviewMessage.text}
                                                </Alert>
                                            )}
                                            <Form onSubmit={handleReviewSubmit}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Rating</Form.Label>
                                                            <div className="d-flex gap-2">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <FiStar
                                                                        key={star}
                                                                        size={28}
                                                                        className={`cursor-pointer ${star <= reviewForm.rating ? 'text-warning' : 'text-muted'}`}
                                                                        fill={star <= reviewForm.rating ? "currentColor" : "none"}
                                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                                        style={{ cursor: 'pointer' }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Title</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Great experience!"
                                                                value={reviewForm.title}
                                                                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Your Review</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        placeholder="Share your thoughts about this store..."
                                                        value={reviewForm.comment}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Button variant="primary" type="submit" size="lg" disabled={submittingReview}>
                                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                </Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default VendorProfile;

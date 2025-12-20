// Product Detail Page Component
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Tab, Tabs, Form, Card, Alert } from 'react-bootstrap';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar, FiShare2, FiTruck, FiShield, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { getProductById, incrementProductViews, getProductsByCategory } from '../../services/productService';
import { getProductReviews, addReview } from '../../services/reviewService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', title: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const productData = await getProductById(id);
                setProduct(productData);

                if (productData) {
                    incrementProductViews(id);

                    const [reviewsData, related] = await Promise.all([
                        getProductReviews(id, currentUser?.uid),
                        getProductsByCategory(productData.category, 4)
                    ]);

                    setReviews(reviewsData);
                    setRelatedProducts(related.filter(p => p.id !== id));
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        setSelectedImage(0);
        setQuantity(1);
        window.scrollTo(0, 0);
    }, [id]);

    // Demo product for development
    const demoProduct = {
        id: '1',
        name: 'Handmade Ceramic Vase - Blue Ocean Collection',
        description: `
      <p>This stunning handmade ceramic vase is a masterpiece of Sri Lankan artisan craftsmanship. Each piece is individually crafted, ensuring that your vase is truly one-of-a-kind.</p>
      <h4>Features:</h4>
      <ul>
        <li>Handcrafted by skilled Sri Lankan artisans</li>
        <li>Premium quality ceramic material</li>
        <li>Unique blue ocean glaze finish</li>
        <li>Perfect for fresh or dried flowers</li>
        <li>Ideal as a standalone decorative piece</li>
      </ul>
      <h4>Dimensions:</h4>
      <p>Height: 30cm | Width: 15cm | Weight: 1.2kg</p>
    `,
        price: 2499,
        salePrice: 1999,
        images: [
            'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800',
            'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
            'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800'
        ],
        vendorId: 'vendor1',
        vendorName: 'Lanka Crafts',
        category: 'home-decor',
        rating: 4.5,
        reviewCount: 128,
        stock: 15,
        sku: 'CER-VASE-001',
        featured: true
    };

    const displayProduct = product || demoProduct;
    const inWishlist = isInWishlist(displayProduct?.id);
    const discount = displayProduct?.salePrice
        ? Math.round(((displayProduct.price - displayProduct.salePrice) / displayProduct.price) * 100)
        : 0;

    const handleAddToCart = async () => {
        try {
            await addToCart(displayProduct, quantity);
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCart(displayProduct, quantity);
            navigate('/checkout');
        } catch (error) {
            console.error('Buy now error:', error);
            alert('Failed to proceed to checkout. Please try again.');
        }
    };

    const handleWishlistToggle = async () => {
        if (!currentUser) {
            alert('Please login to add items to wishlist');
            return;
        }

        if (inWishlist) {
            await removeFromWishlist(displayProduct.id);
        } else {
            await addToWishlist(displayProduct);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && (newQuantity <= (displayProduct.stock || 1))) {
            setQuantity(newQuantity);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setReviewMessage({ type: 'danger', text: 'Please login to submit a review.' });
            return;
        }

        setSubmittingReview(true);
        try {
            await addReview({
                productId: id,
                productName: displayProduct.name,
                vendorId: displayProduct.vendorId,
                vendorName: displayProduct.vendorName,
                customerId: currentUser.uid,
                customerName: currentUser.displayName || 'Anonymous',
                rating: reviewForm.rating,
                title: reviewForm.title,
                comment: reviewForm.comment
            });
            setReviewMessage({ type: 'success', text: 'Review submitted successfully!' });
            setReviewForm({ rating: 5, comment: '', title: '' });
            // Refresh reviews with current user ID to see the pending one
            const updatedReviews = await getProductReviews(id, currentUser.uid);
            setReviews(updatedReviews);
        } catch (error) {
            console.error('Error submitting review:', error);
            setReviewMessage({ type: 'danger', text: 'Failed to submit review. Please try again.' });
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <Loading fullPage text="Loading product..." />;
    }

    if (!displayProduct) {
        return (
            <Container className="py-5 text-center">
                <h2>Product not found</h2>
                <Link to="/" className="btn btn-primary mt-3">Go to Home</Link>
            </Container>
        );
    }

    return (
        <div className="product-detail-page">
            <Container>
                <div className="mb-4">
                    <Button variant="outline-dark" size="sm" onClick={() => window.history.back()} className="d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                        <FiArrowLeft /> Back
                    </Button>
                </div>
                {/* Breadcrumb */}
                <nav className="breadcrumb-nav">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to={`/categories/${displayProduct.category}`}>{displayProduct.category}</Link>
                    <span>/</span>
                    <span>{displayProduct.name}</span>
                </nav>

                <Row>
                    {/* Product Images */}
                    <Col lg={6} className="mb-4">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img
                                    src={displayProduct.images?.[selectedImage] || '/placeholder-product.jpg'}
                                    alt={displayProduct.name}
                                />
                                {discount > 0 && (
                                    <Badge bg="danger" className="discount-badge">-{discount}%</Badge>
                                )}
                            </div>
                            {displayProduct.images?.length > 1 && (
                                <div className="thumbnail-list">
                                    {displayProduct.images.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img src={img} alt={`${displayProduct.name} ${index + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* Product Info */}
                    <Col lg={6}>
                        <div className="product-info">
                            <Link to={`/shop/${displayProduct.vendorId}`} className="vendor-link">
                                {displayProduct.vendorName}
                            </Link>

                            <h1 className="product-title">{displayProduct.name}</h1>

                            {displayProduct.reviewCount > 0 && (
                                <div className="product-rating">
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <FiStar
                                                key={star}
                                                className={star <= displayProduct.rating ? 'filled' : ''}
                                            />
                                        ))}
                                    </div>
                                    <a href="#reviews-section" className="rating-text text-decoration-none">
                                        {displayProduct.rating} ({displayProduct.reviewCount || reviews.length} reviews)
                                    </a>
                                </div>
                            )}

                            <div className="product-price">
                                {displayProduct.salePrice ? (
                                    <>
                                        <span className="current-price">Rs. {displayProduct.salePrice.toLocaleString()}</span>
                                        <span className="original-price">Rs. {displayProduct.price.toLocaleString()}</span>
                                        <span className="discount-tag">Save Rs. {(displayProduct.price - displayProduct.salePrice).toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span className="current-price">Rs. {displayProduct.price.toLocaleString()}</span>
                                )}
                            </div>

                            <div className="stock-status">
                                {displayProduct.stock > 0 ? (
                                    displayProduct.stock <= 5 ? (
                                        <span className="low-stock">Only {displayProduct.stock} left in stock!</span>
                                    ) : (
                                        <span className="in-stock">In Stock</span>
                                    )
                                ) : (
                                    <span className="out-of-stock">Out of Stock</span>
                                )}
                            </div>

                            {displayProduct.stock > 0 && (
                                <>
                                    <div className="quantity-selector">
                                        <label>Quantity:</label>
                                        <div className="quantity-controls">
                                            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                                <FiMinus />
                                            </button>
                                            <span>{quantity}</span>
                                            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= displayProduct.stock}>
                                                <FiPlus />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <Button className="add-to-cart-btn" onClick={handleAddToCart}>
                                            <FiShoppingCart /> Add to Cart
                                        </Button>
                                        <Button className="buy-now-btn" variant="dark" onClick={handleBuyNow}>
                                            Buy Now
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                                            onClick={handleWishlistToggle}
                                        >
                                            <FiHeart />
                                        </Button>
                                        <Button variant="outline-secondary" className="share-btn">
                                            <FiShare2 />
                                        </Button>
                                    </div>
                                </>
                            )}

                            <div className="product-features">
                                <div className="feature">
                                    <FiTruck />
                                    <div>
                                        <strong>Free Delivery</strong>
                                        <span>On orders over Rs. 5,000</span>
                                    </div>
                                </div>
                                <div className="feature">
                                    <FiRefreshCw />
                                    <div>
                                        <strong>Easy Returns</strong>
                                        <span>7 days return policy</span>
                                    </div>
                                </div>
                                <div className="feature">
                                    <FiShield />
                                    <div>
                                        <strong>Secure Payment</strong>
                                        <span>100% secure checkout</span>
                                    </div>
                                </div>
                            </div>

                            {displayProduct.sku && (
                                <p className="product-sku">SKU: {displayProduct.sku}</p>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Product Detailed Information Section */}
                <div className="product-detailed-info mt-5">
                    <Row>
                        <Col lg={8}>
                            {/* Description Section */}
                            <div className="mb-5">
                                <h3 className="section-title mb-4 pb-2 border-bottom">Description</h3>
                                <div
                                    className="product-description"
                                    dangerouslySetInnerHTML={{ __html: displayProduct.description }}
                                />
                            </div>

                            {/* Shipping & Returns Section */}
                            <div className="mb-5">
                                <h3 className="section-title mb-4 pb-2 border-bottom">Shipping & Returns</h3>
                                <div className="shipping-info">
                                    <p><strong>Shipping:</strong> We offer free shipping on all orders above Rs. 5,000. Standard delivery takes 5-7 business days. Express delivery is available at an additional cost.</p>
                                    <p><strong>Returns:</strong> We accept returns within 7 days of delivery. Items must be unused and in original packaging. Please contact our support team to initiate a return.</p>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div id="reviews-section" className="product-reviews-section">
                                <h3 className="section-title mb-4 pb-2 border-bottom">
                                    Customer Reviews ({reviews.length || displayProduct.reviewCount || 0})
                                </h3>

                                {reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {reviews.map(review => (
                                            <div key={review.id} className="review-item mb-4 pb-4 border-bottom">
                                                <div className="d-flex align-items-center mb-2">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${review.customerName}&background=random`}
                                                        alt={review.customerName}
                                                        className="rounded-circle me-3"
                                                        style={{ width: '40px', height: '40px' }}
                                                    />
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{review.customerName}</h6>
                                                        <div className="review-stars-small text-warning">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <FiStar key={star} fill={star <= review.rating ? "currentColor" : "none"} size={14} />
                                                            ))}
                                                            <small className="ms-2 text-muted">
                                                                {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                            </small>
                                                            {review.status === 'pending' && (
                                                                <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>Pending Approval</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold mt-2">{review.title}</h6>
                                                <p className="review-comment text-muted">{review.comment}</p>

                                                {review.vendorReply && (
                                                    <div className="vendor-reply mt-3 p-3 bg-light rounded border-start border-4 border-primary">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <strong>Seller Response</strong>
                                                            <small className="ms-2 text-muted">
                                                                {review.vendorReply.repliedAt?.toDate ? review.vendorReply.repliedAt.toDate().toLocaleDateString() : ''}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0">{review.vendorReply.text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 bg-light rounded border mb-4">
                                        <FiStar size={40} className="text-muted mb-3" />
                                        <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col lg={4}>
                            <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <h5 className="mb-4">Write a Review</h5>
                                        {reviewMessage.text && (
                                            <Alert variant={reviewMessage.type} onClose={() => setReviewMessage({ type: '', text: '' })} dismissible>
                                                {reviewMessage.text}
                                            </Alert>
                                        )}

                                        {currentUser ? (
                                            <Form onSubmit={handleReviewSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Rating</Form.Label>
                                                    <div className="d-flex gap-2 mb-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <FiStar
                                                                key={star}
                                                                size={24}
                                                                className={`cursor-pointer ${star <= reviewForm.rating ? 'text-warning' : 'text-muted'}`}
                                                                fill={star <= reviewForm.rating ? "currentColor" : "none"}
                                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        ))}
                                                    </div>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Review Title</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Summarize your experience"
                                                        value={reviewForm.title}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">Your Review</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        placeholder="What did you like or dislike?"
                                                        value={reviewForm.comment}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Button
                                                    variant="dark"
                                                    type="submit"
                                                    className="w-100 py-2 mt-2"
                                                    disabled={submittingReview}
                                                >
                                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                </Button>
                                            </Form>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-muted mb-3">You must be logged in to write a review.</p>
                                                <Button as={Link} to="/login" variant="outline-dark" className="w-100">Login Now</Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2>Related Products</h2>
                        <Row>
                            {relatedProducts.slice(0, 4).map(product => (
                                <Col lg={3} md={4} sm={6} key={product.id} className="mb-4">
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    </section>
                )}
            </Container>
        </div>
    );
};

export default ProductDetail;

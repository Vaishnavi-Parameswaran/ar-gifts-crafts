// Wishlist Page
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    const handleAddToCart = (item) => {
        addToCart({
            id: item.productId,
            name: item.name,
            price: item.price,
            images: [item.image],
            vendorId: item.vendorId,
            vendorName: item.vendorName
        }, 1);
    };

    if (!currentUser) {
        return (
            <div className="wishlist-page">
                <Container>
                    <div className="wishlist-empty">
                        <FiHeart className="empty-icon" />
                        <h2>Please Login</h2>
                        <p>Login to view your saved items</p>
                        <Button as={Link} to="/login" className="login-btn">
                            Login
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-page">
                <Container>
                    <div className="wishlist-empty">
                        <FiHeart className="empty-icon" />
                        <h2>Your Wishlist is Empty</h2>
                        <p>Start adding items you love to your wishlist</p>
                        <Button as={Link} to="/" className="shop-btn">
                            Start Shopping
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <Container>
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <span className="item-count">{wishlistItems.length} items</span>
                </div>

                <Row>
                    {wishlistItems.map((item) => (
                        <Col lg={3} md={4} sm={6} key={item.productId} className="mb-4">
                            <Card className="wishlist-card">
                                <Button
                                    variant="link"
                                    className="remove-btn"
                                    onClick={() => removeFromWishlist(item.productId)}
                                >
                                    <FiTrash2 />
                                </Button>

                                <Link to={`/product/${item.productId}`}>
                                    <div className="wishlist-image">
                                        <img src={item.image || '/placeholder-product.jpg'} alt={item.name} />
                                    </div>
                                </Link>

                                <Card.Body>
                                    <p className="vendor-name">{item.vendorName}</p>
                                    <Link to={`/product/${item.productId}`} className="product-name">
                                        {item.name}
                                    </Link>
                                    <div className="product-price">
                                        <span className="current-price">Rs. {item.price?.toLocaleString()}</span>
                                        {item.originalPrice > item.price && (
                                            <span className="original-price">Rs. {item.originalPrice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <Button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <FiShoppingCart /> Add to Cart
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Wishlist;

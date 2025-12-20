// Product Card Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { currentUser } = useAuth();

    const discount = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) {
            alert('Please login to add items to wishlist');
            return;
        }

        try {
            if (isInWishlist(product.id)) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    const inWishlist = isInWishlist(product.id);

    return (
        <Card className="product-card">
            <div className="product-image-container" onClick={() => window.location.href = `/product/${product.id}`} style={{ cursor: 'pointer' }}>
                <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="product-image"
                />

                {/* Badges */}
                <div className="product-badges">
                    {discount > 0 && (
                        <Badge bg="danger" className="discount-badge">
                            -{discount}%
                        </Badge>
                    )}
                    {product.featured && (
                        <Badge bg="warning" text="dark" className="featured-badge">
                            Featured
                        </Badge>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                        <Badge bg="warning" className="low-stock-badge">
                            Only {product.stock} left
                        </Badge>
                    )}
                    {product.stock === 0 && (
                        <Badge bg="secondary" className="out-of-stock-badge">
                            Out of Stock
                        </Badge>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="product-actions">
                    <Button
                        variant="light"
                        className={`action-btn wishlist-btn ${inWishlist ? 'active' : ''}`}
                        onClick={handleWishlistToggle}
                        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                        <FiHeart />
                    </Button>
                    <Button
                        variant="light"
                        className="action-btn view-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/product/${product.id}`;
                        }}
                        title="Quick View"
                    >
                        <FiEye />
                    </Button>
                </div>

                {/* Add to Cart Button */}
                {product.stock > 0 && (
                    <Button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                    >
                        <FiShoppingCart /> Add to Cart
                    </Button>
                )}
            </div>

            <Card.Body className="product-info" onClick={() => window.location.href = `/product/${product.id}`} style={{ cursor: 'pointer' }}>
                {/* Vendor Name */}
                <p className="product-vendor">{product.vendorName || 'AR ONE'}</p>

                {/* Product Name */}
                <h3 className="product-name">{product.name}</h3>

                {/* Rating */}
                {product.reviewCount > 0 && (
                    <div className="product-rating">
                        <FiStar className="star-icon" />
                        <span className="rating-value">{product.rating?.toFixed(1)}</span>
                        <span className="rating-count">({product.reviewCount})</span>
                    </div>
                )}

                {/* Price */}
                <div className="product-price">
                    {product.salePrice ? (
                        <>
                            <span className="sale-price">Rs. {Number(product.salePrice).toLocaleString()}</span>
                            <span className="original-price">Rs. {Number(product.price).toLocaleString()}</span>
                        </>
                    ) : (
                        <span className="current-price">Rs. {Number(product.price || 0).toLocaleString()}</span>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;

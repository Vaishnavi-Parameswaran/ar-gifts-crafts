// Cart Page Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, Alert, InputGroup } from 'react-bootstrap';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { validateCoupon } from '../../services/couponService';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Local state for coupon
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState(''); // { text: '', type: 'success' | 'danger' }

    const subtotal = getCartTotal() || 0;
    const shipping = subtotal >= 5000 ? 0 : 350;
    const total = subtotal + shipping - discount;

    const handleQuantityChange = (productId, currentQty, delta, variant) => {
        const newQty = currentQty + delta;
        updateQuantity(productId, newQty, variant);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setMessage('');
        try {
            const result = await validateCoupon(couponCode, subtotal, currentUser?.uid);
            if (result.valid) {
                setAppliedCoupon(result.coupon);
                setDiscount(result.discount);
                setMessage({ text: result.message, type: 'success' });
            } else {
                setMessage({ text: result.message, type: 'danger' });
                setAppliedCoupon(null);
                setDiscount(0);
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error applying coupon', type: 'danger' });
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode('');
        setMessage('');
    };

    const handleCheckout = () => {
        const state = {
            coupon: appliedCoupon,
            discount,
            total
        };

        if (!currentUser) {
            navigate('/login', { state: { from: { pathname: '/checkout' }, ...state } });
        } else {
            navigate('/checkout', { state });
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="empty-cart-page">
                <Container>
                    <Button variant="link" className="mb-3 text-dark text-decoration-none" onClick={() => navigate(-1)}>
                        <FiArrowLeft /> Back
                    </Button>
                    <div className="empty-cart-content">
                        <FiShoppingBag className="empty-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Button as={Link} to="/categories" className="continue-shopping-btn">
                            Start Shopping
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    // Group items by vendor
    const groupedItems = cartItems.reduce((groups, item) => {
        const vendorId = item.vendorId || 'unknown';
        if (!groups[vendorId]) {
            groups[vendorId] = {
                vendorName: item.vendorName || 'AR ONE',
                items: []
            };
        }
        groups[vendorId].items.push(item);
        return groups;
    }, {});

    return (
        <div className="cart-page">
            <Container>
                <div className="mb-3">
                    <Button variant="light" size="sm" onClick={() => navigate(-1)} className="d-flex align-items-center gap-2">
                        <FiArrowLeft /> Back
                    </Button>
                </div>
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                </div>

                <Row>
                    <Col lg={8}>
                        {Object.entries(groupedItems).map(([vendorId, group]) => (
                            <Card className="cart-vendor-card" key={vendorId}>
                                <Card.Header>
                                    <span className="vendor-name">Sold by: {group.vendorName}</span>
                                </Card.Header>
                                <Card.Body>
                                    {group.items.map((item) => (
                                        <div className="cart-item" key={`${item.productId}-${JSON.stringify(item.selectedVariant)}`}>
                                            <div className="item-image">
                                                <img src={item.image || '/placeholder-product.jpg'} alt={item.name} />
                                            </div>

                                            <div className="item-details">
                                                <Link to={`/product/${item.productId}`} className="item-name">
                                                    {item.name}
                                                </Link>
                                                {item.selectedVariant && (
                                                    <p className="item-variant">
                                                        {Object.entries(item.selectedVariant).map(([key, value]) => (
                                                            <span key={key}>{key}: {value}</span>
                                                        ))}
                                                    </p>
                                                )}
                                                <div className="item-price">
                                                    <span className="current-price">Rs. {Number(item.price).toLocaleString()}</span>
                                                    {item.originalPrice > item.price && (
                                                        <span className="original-price">Rs. {Number(item.originalPrice).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="item-quantity">
                                                <div className="quantity-controls">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity, -1, item.selectedVariant)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <FiMinus />
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity, 1, item.selectedVariant)}
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="item-total">
                                                Rs. {(item.price * item.quantity).toLocaleString()}
                                            </div>

                                            <button
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.productId, item.selectedVariant)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        ))}

                        <div className="cart-actions">
                            <Button as={Link} to="/categories" variant="outline-secondary" className="continue-btn">
                                <FiArrowLeft /> Continue Shopping
                            </Button>
                            <Button variant="outline-danger" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </div>
                    </Col>

                    <Col lg={4}>
                        <Card className="cart-summary-card">
                            <Card.Header>
                                <h3>Order Summary</h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="summary-row">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="summary-row text-success">
                                        <span>Discount ({appliedCoupon?.code})</span>
                                        <span>- Rs. {discount.toLocaleString()}</span>
                                    </div>
                                )}

                                <hr />

                                {shipping > 0 && (
                                    <p className="free-shipping-note">
                                        Add Rs. {(5000 - subtotal).toLocaleString()} more for free shipping!
                                    </p>
                                )}

                                <div className="coupon-section">
                                    {message && <Alert variant={message.type} className="py-2 fs-6">{message.text}</Alert>}

                                    {!appliedCoupon ? (
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text><FiTag /></InputGroup.Text>
                                            <Form.Control
                                                placeholder="Coupon Code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                            />
                                            <Button variant="outline-primary" onClick={handleApplyCoupon}>Apply</Button>
                                        </InputGroup>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                            <span className="text-success fw-bold">
                                                <FiTag /> {appliedCoupon.code} Applied
                                            </span>
                                            <Button variant="link" size="sm" className="text-danger p-0" onClick={handleRemoveCoupon}>
                                                <FiX /> Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span>Rs. {total.toLocaleString()}</span>
                                </div>

                                <Button
                                    className="checkout-btn"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </Button>

                                <div className="secure-checkout">
                                    <span>🔒 Secure Checkout</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Cart;

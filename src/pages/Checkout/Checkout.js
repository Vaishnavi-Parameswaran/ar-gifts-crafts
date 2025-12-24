// Checkout Page
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FiArrowLeft, FiMapPin, FiPlus, FiCheck, FiLock, FiTruck, FiTag } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAddresses } from '../../services/userService';
import { createOrder } from '../../services/orderService';
import { validateCoupon } from '../../services/couponService';
import Loading from '../../components/common/Loading';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useCart();
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [couponCode, setCouponCode] = useState(state?.coupon?.code || '');
    const [discount, setDiscount] = useState(state?.discount || 0);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAddresses = async () => {
            if (currentUser) {
                try {
                    const userAddresses = await getUserAddresses(currentUser.uid);
                    setAddresses(userAddresses);
                    const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];
                    if (defaultAddr) setSelectedAddress(defaultAddr);
                } catch (err) {
                    console.error('Error:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAddresses();
    }, [currentUser]);

    // Demo address for development
    const demoAddress = {
        id: '1',
        name: 'John Doe',
        phone: '+94 77 123 4567',
        address: '123, Galle Road, Kollupitiya',
        city: 'Colombo',
        state: 'Western Province',
        pincode: '00300',
        isDefault: true
    };

    const displayAddresses = addresses.length > 0 ? addresses : [demoAddress];
    const activeAddress = selectedAddress || displayAddresses[0];

    const subtotal = getCartTotal();
    const shipping = subtotal >= 5000 ? 0 : 350;
    const total = subtotal + shipping - discount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setError('');
        try {
            const result = await validateCoupon(couponCode, subtotal, currentUser?.uid);
            if (result.valid) {
                setDiscount(result.discount);
                setError('');
            } else {
                setError(result.message);
                setDiscount(0);
            }
        } catch (err) {
            console.error(err);
            setError('Error applying coupon');
        }
    };

    const handlePlaceOrder = async () => {
        if (!activeAddress) {
            setError('Please select a delivery address');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const orderData = {
                customerId: currentUser.uid,
                customerName: userProfile?.displayName || activeAddress.name,
                customerEmail: currentUser.email,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    vendorId: item.vendorId,
                    vendorName: item.vendorName,
                    selectedVariant: item.selectedVariant || null
                })),
                shippingAddress: activeAddress,
                subtotal,
                shippingCost: shipping,
                discount,
                totalAmount: total,
                paymentMethod,
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
                orderStatus: 'pending'
            };

            const result = await createOrder(orderData);
            await clearCart();
            navigate(`/orders/${result.id}`, {
                state: { success: true, message: 'Order placed successfully!' }
            });
        } catch (err) {
            console.error('Order error:', err);
            // Log deep object
            console.log(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            setError(('Failed to place order: ' + err.message) || 'Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading || cartLoading) return <Loading fullPage text="Loading checkout..." />;

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <Container>
                    <div className="empty-checkout">
                        <h2>Your cart is empty</h2>
                        <p>Add items to your cart before checkout</p>
                        <Button as={Link} to="/" className="shop-btn">Continue Shopping</Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Container>
                <Link to="/cart" className="back-link">
                    <FiArrowLeft /> Back to Cart
                </Link>

                <h1 className="checkout-title">Checkout</h1>

                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

                <Row>
                    <Col lg={8}>
                        {/* Delivery Address */}
                        <Card className="checkout-card mb-4">
                            <Card.Header>
                                <h3><FiMapPin /> Delivery Address</h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="address-grid">
                                    {displayAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`address-option ${activeAddress?.id === addr.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedAddress(addr)}
                                        >
                                            {activeAddress?.id === addr.id && <FiCheck className="check-icon" />}
                                            {addr.isDefault && <Badge bg="primary" className="default-badge">Default</Badge>}
                                            <h4>{addr.name}</h4>
                                            <p>{addr.address}</p>
                                            <p>{addr.city}, {addr.province || addr.state} - {addr.pincode}</p>
                                            <p className="phone">{addr.phone}</p>
                                        </div>
                                    ))}
                                    <Link to="/account?tab=addresses" className="add-address">
                                        <FiPlus />
                                        <span>Add New Address</span>
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Payment Method */}
                        <Card className="checkout-card">
                            <Card.Header>
                                <h3><FiLock /> Payment Method</h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="payment-options">
                                    <div
                                        className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('cod')}
                                    >
                                        <div className="radio-circle">{paymentMethod === 'cod' && <FiCheck />}</div>
                                        <div className="payment-info">
                                            <h4>Cash on Delivery</h4>
                                            <p>Pay when you receive your order</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        <div className="radio-circle">{paymentMethod === 'upi' && <FiCheck />}</div>
                                        <div className="payment-info">
                                            <h4>UPI Payment</h4>
                                            <p>Pay using Google Pay, PhonePe, Paytm, etc.</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="radio-circle">{paymentMethod === 'card' && <FiCheck />}</div>
                                        <div className="payment-info">
                                            <h4>Credit / Debit Card</h4>
                                            <p>All major cards accepted</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('netbanking')}
                                    >
                                        <div className="radio-circle">{paymentMethod === 'netbanking' && <FiCheck />}</div>
                                        <div className="payment-info">
                                            <h4>Net Banking</h4>
                                            <p>All major banks supported</p>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        {/* Order Summary */}
                        <Card className="summary-card">
                            <Card.Header>
                                <h3>Order Summary</h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="order-items-preview">
                                    {cartItems.slice(0, 3).map((item) => (
                                        <div key={item.productId} className="item-row">
                                            <img src={item.image || '/placeholder-product.jpg'} alt={item.name} />
                                            <div className="item-info">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-qty">Qty: {item.quantity}</span>
                                            </div>
                                            <span className="item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {cartItems.length > 3 && (
                                        <p className="more-items">+{cartItems.length - 3} more items</p>
                                    )}
                                </div>

                                <div className="coupon-section">
                                    <div className="coupon-input">
                                        <FiTag className="tag-icon" />
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <Button variant="outline-primary" onClick={handleApplyCoupon}>Apply</Button>
                                    </div>
                                    {discount > 0 && (
                                        <Alert variant="success" className="coupon-success">
                                            Coupon applied! You save Rs. {discount}
                                        </Alert>
                                    )}
                                </div>

                                <div className="summary-rows">
                                    <div className="summary-row">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span><FiTruck /> Shipping</span>
                                        <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="summary-row discount">
                                            <span>Discount</span>
                                            <span>-Rs. {discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span>Rs. {total.toLocaleString()}</span>
                                </div>

                                <Button
                                    className="place-order-btn"
                                    onClick={handlePlaceOrder}
                                    disabled={processing || !activeAddress}
                                >
                                    {processing ? 'Processing...' : 'Place Order'}
                                </Button>

                                <p className="secure-note">
                                    <FiLock /> Your payment information is secure
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Checkout;

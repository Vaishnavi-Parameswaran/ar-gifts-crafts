// Order Detail Page
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiMapPin, FiPhone, FiMail, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import Loading from '../../components/common/Loading';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth(); // Assuming useAuth exposes userRole or we fetch it
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (currentUser?.email?.includes('admin') || userRole === 'admin') { // Simple admin check or use proper role
            setIsAdmin(true);
        }
    }, [currentUser, userRole]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await getOrderById(id);
                setOrder(orderData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser && id) fetchOrder();
    }, [id, currentUser]);

    // Handlers
    const handleDownloadInvoice = () => {
        // In a real app, this would generate a PDF
        window.print();
    };

    const handleTrackShipment = () => {
        alert("Tracking system is currently in integration mode. Please check back later.");
    };

    const handleNeedHelp = () => {
        if (order) {
            navigate('/contact', {
                state: {
                    subject: `Help regarding Order #${order.orderId}`,
                    message: `Hi, I need help with my order ${order.orderId}. `
                }
            });
        }
    };

    const handleWriteReview = (productId) => {
        window.location.href = `/product/${productId}#reviews`;
    };

    const handleStatusChange = async (newStatus) => {
        if (!isAdmin) return;
        if (window.confirm(`Are you sure you want to update status to ${newStatus}?`)) {
            try {
                await updateOrderStatus(id, newStatus);
                setOrder({ ...order, orderStatus: newStatus });
                alert('Order status updated successfully');
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        }
    };

    if (loading) return <Loading fullPage text="Loading order details..." />;

    if (!order) {
        return (
            <Container className="py-5 text-center">
                <h2>Order not found</h2>
                <Button as={Link} to="/orders" variant="primary" className="mt-3">Back to Orders</Button>
            </Container>
        );
    }

    // Use the real order data
    const displayOrder = order;

    const getProgress = (status) => {
        switch (status) {
            case 'pending': // Start at 5% just like placed
            case 'placed': return 5;
            case 'confirmed': return 25;
            case 'processing': return 50;
            case 'shipped': return 75;
            case 'delivered': return 100;
            default: return 0;
        }
    };

    return (
        <div className="order-detail-page">
            <Container>
                {/* Automatic Status Message */}
                {['pending', 'placed', 'confirmed'].includes(displayOrder.orderStatus) && (
                    <Alert variant="success" className="mb-4" dismissible>
                        <Alert.Heading>
                            {(displayOrder.orderStatus === 'placed' || displayOrder.orderStatus === 'pending')
                                ? `Order #${displayOrder.orderId} Placed Successfully!`
                                : `Order #${displayOrder.orderId} Confirmed!`}
                        </Alert.Heading>
                        <p>
                            {(displayOrder.orderStatus === 'placed' || displayOrder.orderStatus === 'pending')
                                ? 'Thank you for your purchase. We have received your order.'
                                : 'Your order has been confirmed by the vendor and is being prepared.'}
                        </p>
                        <hr />
                        <div className="d-flex justify-content-end gap-2">
                            {/* "View Order Details" simply closes the alert since we are already on the detail page */}
                            <Button variant="outline-success" onClick={() => document.querySelector('.btn-close')?.click()}>
                                View Order Details
                            </Button>
                            <Button variant="success" as={Link} to="/">
                                Continue Shopping
                            </Button>
                        </div>
                    </Alert>
                )}

                <Link to="/orders" className="back-link">
                    <FiArrowLeft /> Back to Orders
                </Link>

                <div className="order-detail-header">
                    <div>
                        <h1>Order #{displayOrder.orderId}</h1>
                        <p>Placed on {displayOrder.createdAt?.toDate ? new Date(displayOrder.createdAt.toDate()).toLocaleDateString('en-LK', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : new Date(displayOrder.createdAt).toLocaleDateString('en-LK')}</p>
                    </div>
                    <Button variant="outline-primary" onClick={handleDownloadInvoice}>
                        <FiDownload /> Print Invoice
                    </Button>
                </div>

                <Row>
                    <Col lg={8}>
                        {/* Order Status */}
                        <Card className="order-status-card mb-4">
                            <Card.Body>
                                <div className="status-header">
                                    <h3>Order Status</h3>
                                    <Badge bg={displayOrder.orderStatus === 'delivered' ? 'success' : displayOrder.orderStatus === 'cancelled' ? 'danger' : 'info'}>
                                        {displayOrder.orderStatus.charAt(0).toUpperCase() + displayOrder.orderStatus.slice(1)}
                                    </Badge>
                                </div>

                                {displayOrder.orderStatus !== 'cancelled' && (
                                    <>
                                        {/* Progress Bar Container with relative positioning for labels if needed */}
                                        <div className="progress-container mb-4">
                                            <ProgressBar now={getProgress(displayOrder.orderStatus)} className="order-progress" variant="danger" />

                                            <div className="progress-labels">
                                                <span className="completed"><FiCheck /> Placed</span>
                                                <span className={['confirmed', 'processing', 'shipped', 'delivered'].includes(displayOrder.orderStatus) ? 'completed' : ''}><FiCheck /> Confirmed</span>
                                                <span className={['processing', 'shipped', 'delivered'].includes(displayOrder.orderStatus) ? 'completed' : ''}><FiPackage /> Processing</span>
                                                <span className={['shipped', 'delivered'].includes(displayOrder.orderStatus) ? 'completed' : ''}><FiTruck /> Shipped</span>
                                                <span className={displayOrder.orderStatus === 'delivered' ? 'completed' : ''}><FiCheck /> Delivered</span>
                                            </div>
                                        </div>

                                        {displayOrder.trackingNumber && (
                                            <div className="tracking-info">
                                                <strong>Tracking Number:</strong> {displayOrder.trackingNumber}
                                                <Button variant="link" size="sm" onClick={handleTrackShipment}>Track Shipment</Button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Timeline */}
                                <div className="order-timeline">
                                    <h4>Order Timeline</h4>
                                    {displayOrder.timeline?.map((event, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <strong>{event.description}</strong>
                                                <span>{new Date(event.date).toLocaleString('en-LK')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Order Items */}
                        <Card className="order-items-card">
                            <Card.Header>
                                <h3>Order Items</h3>
                            </Card.Header>
                            <Card.Body>
                                {displayOrder.items.map((item, index) => (
                                    <div key={index} className="order-item-detail">
                                        <Link to={`/product/${item.productId}`}>
                                            <img src={item.image || '/placeholder-product.jpg'} alt={item.name} />
                                        </Link>
                                        <div className="item-info">
                                            <Link to={`/product/${item.productId}`} className="item-name">{item.name}</Link>
                                            <p className="vendor-name">Sold by: {item.vendorName}</p>
                                            <p className="item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="item-price">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        {/* Shipping Address */}
                        <Card className="address-card mb-3">
                            <Card.Header>
                                <h3><FiMapPin /> Shipping Address</h3>
                            </Card.Header>
                            <Card.Body>
                                <h4 className="mb-1" style={{ fontSize: '1rem' }}>{displayOrder.shippingAddress.name}</h4>
                                <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                    {displayOrder.shippingAddress.address}, {displayOrder.shippingAddress.city}
                                </p>
                                <p className="mb-2" style={{ lineHeight: '1.4' }}>
                                    {displayOrder.shippingAddress.state} - {displayOrder.shippingAddress.pincode}
                                </p>
                                <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.85rem' }}>
                                    <span className="d-flex align-items-center gap-1 text-muted">
                                        <FiPhone size={14} /> {displayOrder.shippingAddress.phone}
                                    </span>
                                    <span className="d-flex align-items-center gap-1 text-muted">
                                        <FiMail size={14} /> {displayOrder.shippingAddress.email}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Payment Summary */}
                        <Card className="summary-card">
                            <Card.Header>
                                <h3>Payment Summary</h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>Rs. {displayOrder.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{displayOrder.shippingCost === 0 || displayOrder.shippingCost === undefined ? 'FREE' : `Rs. ${displayOrder.shippingCost}`}</span>
                                </div>
                                {displayOrder.discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount</span>
                                        <span>-Rs. {displayOrder.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="summary-total">
                                    <span>Total</span>
                                    <span>Rs. {displayOrder.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="payment-method">
                                    <span>Payment Method:</span>
                                    <Badge bg="secondary">{displayOrder.paymentMethod}</Badge>
                                    <Badge bg={displayOrder.paymentStatus === 'completed' ? 'success' : 'warning'}>
                                        {displayOrder.paymentStatus}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Actions */}
                        <div className="order-actions-card mt-4">
                            <Button variant="outline-secondary" className="w-100 mb-2" onClick={handleNeedHelp}>Need Help?</Button>
                            {displayOrder.orderStatus === 'delivered' && (
                                <Button variant="outline-primary" className="w-100" onClick={() => handleWriteReview(displayOrder.items[0]?.productId)}>Write a Review</Button>
                            )}
                            {isAdmin && (
                                <div className="admin-actions mt-3 pt-3 border-top">
                                    <h5>Admin Actions</h5>
                                    <div className="d-grid gap-2">
                                        {displayOrder.orderStatus === 'pending' && <Button variant="success" onClick={() => handleStatusChange('processing')}>Approve Order</Button>}
                                        {displayOrder.orderStatus === 'processing' && <Button variant="info" onClick={() => handleStatusChange('shipped')}>Mark as Shipped</Button>}
                                        {displayOrder.orderStatus === 'shipped' && <Button variant="success" onClick={() => handleStatusChange('delivered')}>Mark as Delivered</Button>}
                                        <Button as={Link} to="/admin/orders" variant="outline-dark">Back to Admin Panel</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OrderDetail;

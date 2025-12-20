import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, Form } from 'react-bootstrap';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiMapPin, FiPhone, FiMail, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import Loading from '../../components/common/Loading';

const VendorOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await getOrderById(id);
                setOrder(orderData);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Update status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            await updateOrderStatus(id, newStatus, currentUser.uid);
            // Refresh order data
            const orderData = await getOrderById(id);
            setOrder(orderData);
            alert('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Loading text="Loading order details..." />;

    if (!order) {
        return (
            <Container className="py-5 text-center">
                <h2>Order not found</h2>
                <Button as={Link} to="/vendor/dashboard/orders" variant="primary" className="mt-3">Back to Orders</Button>
            </Container>
        );
    }

    // Find vendor's part of the order
    const vendorPart = order.vendorOrders?.find(vo => vo.vendorId === currentUser.uid);

    if (!vendorPart) {
        return (
            <Container className="py-5 text-center">
                <h2>Access Denied</h2>
                <p>You do not have permission to view this order or no items in this order belong to your shop.</p>
                <Button as={Link} to="/vendor/dashboard/orders" variant="primary" className="mt-3">Back to Orders</Button>
            </Container>
        );
    }

    return (
        <div className="vendor-order-detail">
            <div className="mb-4">
                <Link to="/vendor/dashboard/orders" className="text-decoration-none d-flex align-items-center gap-2">
                    <FiArrowLeft /> Back to Orders
                </Link>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Order #{order.orderId}</h2>
                    <p className="text-muted mb-0">Placed on {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()} at {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-dark" onClick={() => window.print()}>
                        <FiDownload /> Print Details
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    {/* Items Section */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Ordered Items</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4">Product</th>
                                        <th className="border-0 text-center">Quantity</th>
                                        <th className="border-0 text-end pe-4">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorPart.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} className="me-3" />
                                                    <div>
                                                        <div className="fw-bold">{item.title}</div>
                                                        <small className="text-muted">ID: {item.productId}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center align-middle">{item.quantity}</td>
                                            <td className="text-end align-middle pe-4">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="text-end ps-4 py-3 fw-bold">Grand Total (Your Share):</td>
                                        <td className="text-end pe-4 py-3 fw-bold">Rs. {vendorPart.subtotal?.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Order Timeline or Notes could go here */}
                </Col>

                <Col lg={4}>
                    {/* Management Card */}
                    <Card className="border-0 shadow-sm mb-4 bg-light">
                        <Card.Body className="p-4">
                            <h5 className="mb-3">Order Management</h5>
                            <div className="mb-4">
                                <label className="text-muted small d-block mb-1">Current Status</label>
                                <Badge bg={
                                    vendorPart.status === 'delivered' ? 'success' :
                                        vendorPart.status === 'cancelled' ? 'danger' :
                                            vendorPart.status === 'pending' ? 'warning' : 'primary'
                                } className="fs-6 px-3 py-2">
                                    {vendorPart.status.toUpperCase()}
                                </Badge>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small">Update Status</Form.Label>
                                <div className="d-grid gap-2">
                                    {vendorPart.status === 'pending' && (
                                        <Button variant="primary" onClick={() => handleStatusUpdate('confirmed')} disabled={updating}>
                                            Confirm Order
                                        </Button>
                                    )}
                                    {(vendorPart.status === 'pending' || vendorPart.status === 'confirmed') && (
                                        <Button variant="info" className="text-white" onClick={() => handleStatusUpdate('processing')} disabled={updating}>
                                            Mark as Processing
                                        </Button>
                                    )}
                                    {vendorPart.status === 'processing' && (
                                        <Button variant="info" className="text-white" onClick={() => handleStatusUpdate('shipped')} disabled={updating}>
                                            Mark as Shipped
                                        </Button>
                                    )}
                                    {vendorPart.status === 'shipped' && (
                                        <Button variant="success" onClick={() => handleStatusUpdate('delivered')} disabled={updating}>
                                            Mark as Delivered
                                        </Button>
                                    )}
                                    {vendorPart.status !== 'delivered' && vendorPart.status !== 'cancelled' && (
                                        <Button variant="outline-danger" className="mt-2" onClick={() => handleStatusUpdate('cancelled')} disabled={updating}>
                                            Cancel Order
                                        </Button>
                                    )}
                                </div>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Shipping Details</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h6 className="mb-1">{order.shippingAddress.name}</h6>
                                <p className="mb-0 text-muted">{order.shippingAddress.address}</p>
                                <p className="mb-0 text-muted">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            </div>
                            <hr />
                            <div className="mb-2 d-flex align-items-center gap-2 small">
                                <FiMail className="text-muted" /> {order.shippingAddress.email}
                            </div>
                            <div className="d-flex align-items-center gap-2 small">
                                <FiPhone className="text-muted" /> {order.shippingAddress.phone}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorOrderDetail;

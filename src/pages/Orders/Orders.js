// Orders Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Badge, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { FiPackage, FiEye, FiRefreshCw, FiTruck, FiCheck, FiX, FiClock, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders } from '../../services/orderService';
import Loading from '../../components/common/Loading';
import './Orders.css';

const Orders = () => {
    // ... (rest of simple assignments)
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (currentUser) {
                try {
                    const customerOrders = await getCustomerOrders(currentUser.uid);
                    setOrders(customerOrders);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOrders();
    }, [currentUser]);

    const displayOrders = orders;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <FiCheck />;
            case 'shipped': return <FiTruck />;
            case 'processing': return <FiClock />;
            case 'cancelled': return <FiX />;
            default: return <FiPackage />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'shipped': return 'info';
            case 'processing': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const filteredOrders = displayOrders.filter(order => {
        const matchesFilter = filter === 'all' || order.orderStatus === filter;
        const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) return <Loading fullPage text="Loading orders..." />;

    const handleTrackOrder = (trackingNumber) => {
        // In a real app, this would open a carrier link or modal
        alert(`Tracking Number: ${trackingNumber}\nCarrier: Local Courier\nStatus: In Transit`);
    };

    return (
        <div className="orders-page">
            <Container>
                <div className="mb-4">
                    <Button variant="outline-dark" size="sm" onClick={() => window.history.back()} className="d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                        <FiArrowLeft /> Back
                    </Button>
                </div>
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <Form.Control
                            type="search"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs activeKey={filter} onSelect={(k) => setFilter(k)} className="orders-tabs mb-4">
                    <Tab eventKey="all" title="All Orders" />
                    <Tab eventKey="processing" title="Processing" />
                    <Tab eventKey="shipped" title="Shipped" />
                    <Tab eventKey="delivered" title="Delivered" />
                    <Tab eventKey="cancelled" title="Cancelled" />
                </Tabs>

                {filteredOrders.length > 0 ? (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <Card className="order-card" key={order.id}>
                                <Card.Header>
                                    <div className="order-meta">
                                        <div className="order-id">
                                            <span>Order</span>
                                            <strong>#{order.orderId}</strong>
                                        </div>
                                        <div className="order-date">
                                            Placed on {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('en-LK', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <Badge bg={getStatusColor(order.orderStatus)} className="order-status-badge">
                                        {getStatusIcon(order.orderStatus)} {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </Badge>
                                </Card.Header>

                                <Card.Body>
                                    <div className="order-items">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img src={item.image || '/placeholder-product.jpg'} alt={item.name} />
                                                <div className="item-details">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-total">
                                            <span>Total</span>
                                            <strong>Rs. {order.totalAmount.toLocaleString()}</strong>
                                        </div>

                                        <div className="order-actions">
                                            {order.trackingNumber && (
                                                <Button variant="outline-primary" size="sm" onClick={() => handleTrackOrder(order.trackingNumber)}>
                                                    <FiTruck /> Track Order
                                                </Button>
                                            )}
                                            <Button as={Link} to={`/orders/${order.id}`} variant="outline-secondary" size="sm">
                                                <FiEye /> View Details
                                            </Button>
                                            {order.orderStatus === 'delivered' && (
                                                <Button variant="outline-success" size="sm">
                                                    <FiRefreshCw /> Buy Again
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="no-orders">
                        <FiPackage className="no-orders-icon" />
                        <h3>No Orders Found</h3>
                        <p>{searchTerm ? 'Try a different search term' : 'You haven\'t placed any orders yet'}</p>
                        <Button as={Link} to="/categories" className="shop-btn">Start Shopping</Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Orders;

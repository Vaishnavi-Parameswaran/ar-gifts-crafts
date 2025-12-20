// Full Notifications Page
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { FiBell, FiTrash2, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../../services/notificationService';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Loading from '../../components/common/Loading';
import './Notifications.css';

const Notifications = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        // Real-time listener for ALL notifications (limit 50)
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by date desc
            notifs.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });

            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleMarkAllRead = async () => {
        if (notifications.length === 0) return;
        setActionLoading(true);
        try {
            await markAllAsRead(currentUser.uid);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return;
        setActionLoading(true);
        try {
            await deleteAllNotifications(currentUser.uid);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // check if it is a suspension/activation notification
        const isStatusNotification = notification.title === 'Account Suspended' || notification.title === 'Account Activated';

        if (notification.link && !isStatusNotification) {
            navigate(notification.link);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return '📦';
            case 'product': return '🎁';
            case 'system': return '⚙️';
            case 'promotion': return '🎉';
            default: return '🔔';
        }
    };

    if (loading) return <Loading text="Loading notifications..." />;

    return (
        <Container className="py-5" style={{ minHeight: '80vh' }}>
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={24} />
                </Button>
                <h2 className="mb-0">Notifications</h2>
            </div>

            <Row>
                <Col md={8} className="mx-auto">
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white p-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <span className="fw-bold me-2">All Notifications</span>
                                <Badge bg="primary" pill>{notifications.length}</Badge>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    disabled={notifications.length === 0 || actionLoading}
                                >
                                    <FiCheck className="me-1" /> Mark all read
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleDeleteAll}
                                    disabled={notifications.length === 0 || actionLoading}
                                >
                                    <FiTrash2 className="me-1" /> Clear all
                                </Button>
                            </div>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {notifications.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <FiBell size={48} className="mb-3 opacity-50" />
                                    <h5>No notifications</h5>
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <ListGroup.Item
                                        key={notif.id}
                                        action
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                                    >
                                        <div className="d-flex w-100 justify-content-between align-items-start">
                                            <div className="d-flex">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                        fontSize: '1.2rem'
                                                    }}
                                                >
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <h6 className="mb-0 fw-bold text-dark">{notif.title}</h6>
                                                        {!notif.read && (
                                                            <Badge bg="danger" className="ms-2 dot-badge" style={{ width: '8px', height: '8px', padding: 0, borderRadius: '50%' }}></Badge>
                                                        )}
                                                    </div>
                                                    <p className="mb-1 text-secondary">{notif.message}</p>
                                                    <small className="text-muted">{formatTime(notif.createdAt)}</small>
                                                </div>
                                            </div>
                                            <Button
                                                variant="link"
                                                className="text-muted p-0 ms-2"
                                                onClick={(e) => handleDelete(e, notif.id)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Notifications;

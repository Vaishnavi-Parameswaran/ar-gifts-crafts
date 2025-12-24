// Notification Bell Component
import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { FiBell, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../services/notificationService';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './NotificationBell.css';

const NotificationBell = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    // Real-time listener for notifications - With Safety Delay
    useEffect(() => {
        let unsubscribe = () => { };

        const setupListener = async () => {
            if (!currentUser) return;

            // Small delay to allow Auth/Firestore to stabilize
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                // Simple query without orderBy
                const q = query(
                    collection(db, 'notifications'),
                    where('userId', '==', currentUser.uid),
                    limit(50)
                );

                unsubscribe = onSnapshot(q,
                    (snapshot) => {
                        const notifs = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        // Sort in memory
                        notifs.sort((a, b) => {
                            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                            return bTime - aTime;
                        });

                        const latest = notifs.slice(0, 10);
                        setNotifications(latest);
                        setUnreadCount(notifs.filter(n => !n.read).length);
                    },
                    (error) => {
                        console.error("Notification Listener Error:", error);
                        // Don't crash the app, just stop listening
                    }
                );
            } catch (err) {
                console.error("Error setting up notification listener:", err);
            }
        };

        setupListener();

        return () => unsubscribe();
    }, [currentUser]);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            if (!notification.read) {
                await markAsRead(notification.id);
            }

            // check if it is a suspension/activation notification
            const isStatusNotification = notification.title === 'Account Suspended' || notification.title === 'Account Activated';

            // Navigate to link if exists AND it's not a status notification
            if (notification.link && !isStatusNotification) {
                navigate(notification.link);
            }

            // Close dropdown
            setShowDropdown(false);
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await markAllAsRead(currentUser.uid);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        try {
            await deleteNotification(notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            order: '📦',
            product: '🎁',
            system: '⚙️',
            promotion: '🎉'
        };
        return icons[type] || '🔔';
    };

    if (!currentUser) return null;

    return (
        <Dropdown
            show={showDropdown}
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            align="end"
            className="notification-bell-dropdown"
        >
            <Dropdown.Toggle
                variant="link"
                className="notification-bell-toggle nav-icon-item"
                id="notification-dropdown"
            >
                <div className="position-relative d-inline-block">
                    <FiBell size={22} />
                    {unreadCount > 0 && (
                        <Badge
                            bg="danger"
                            pill
                            className="notification-badge position-absolute top-0 start-100 translate-middle"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </div>
                <span className="nav-icon-label d-none d-md-inline ms-1">Notifications</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-dropdown-menu shadow-lg">
                <div className="notification-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-link btn-sm text-primary p-0"
                            onClick={handleMarkAllRead}
                            disabled={loading}
                        >
                            <FiCheck size={16} className="me-1" />
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="notification-list">
                    {notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FiBell size={40} className="mb-2 opacity-50" />
                            <p className="mb-0">No notifications yet</p>
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {notifications.map((notif) => (
                                <ListGroup.Item
                                    key={notif.id}
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="notification-icon me-2">
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="notification-content">
                                                    <h6 className="mb-1 fw-semibold">
                                                        {notif.title}
                                                    </h6>
                                                    <p className="mb-1 text-muted small">
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-link btn-sm text-danger p-0 ms-2"
                                                    onClick={(e) => handleDelete(e, notif.id)}
                                                    title="Delete notification"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!notif.read && (
                                        <div className="unread-indicator position-absolute top-50 start-0 translate-middle-y"></div>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="notification-footer text-center border-top py-2">
                        <button
                            className="btn btn-link btn-sm text-primary"
                            onClick={() => {
                                navigate('/notifications');
                                setShowDropdown(false);
                            }}
                        >
                            View All Notifications
                        </button>
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationBell;

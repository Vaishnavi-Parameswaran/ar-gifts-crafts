// Protected Route Component
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';

// Route that requires authentication
export const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullPage text="Checking authentication..." />;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Route that requires customer role
export const CustomerRoute = ({ children }) => {
    const { currentUser, userProfile, loading, isCustomer } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullPage text="Checking authentication..." />;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isCustomer() && userProfile?.role !== 'customer') {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Route that requires vendor role
export const VendorRoute = ({ children }) => {
    const { currentUser, userProfile, loading, isVendor } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullPage text="Checking authentication..." />;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // CHECK IF USER IS VENDOR AND NOT SUSPENDED
    if (userProfile) {
        // If user role is not vendor (e.g., changed to customer due to suspension)
        if (userProfile.role !== 'vendor') {
            if (userProfile.status === 'suspended') {
                // Show alert for suspended vendor
                setTimeout(() => {
                    alert('Your vendor account has been suspended by the admin. You can only use customer features.');
                }, 100);
            }
            return <Navigate to="/" replace />;
        }

        // If vendor role but account is suspended
        if (userProfile.status === 'suspended') {
            setTimeout(() => {
                alert('Your vendor account has been suspended by the admin. You can only use customer features.');
            }, 100);
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

// Route that requires admin role
export const AdminRoute = ({ children }) => {
    const { currentUser, userProfile, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullPage text="Checking authentication..." />;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin() && userProfile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Route only for guests (non-authenticated users)
export const GuestRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Loading fullPage text="Loading..." />;
    }

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;

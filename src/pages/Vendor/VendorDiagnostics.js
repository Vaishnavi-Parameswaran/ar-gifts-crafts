// Vendor Diagnostics - Testing page for vendor functionality
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getVendorById, getVendorStats } from '../../services/vendorService';
import { getVendorProducts } from '../../services/productService';
import { getVendorOrders } from '../../services/orderService';

const VendorDiagnostics = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [diagnostics, setDiagnostics] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const runDiagnostics = async () => {
        setLoading(true);
        setMessage('Running diagnostics...');
        const results = {};

        try {
            // 1. Check current user
            results.currentUser = {
                exists: !!currentUser,
                uid: currentUser?.uid,
                email: currentUser?.email,
                displayName: currentUser?.displayName
            };

            // 2. Check user profile
            results.userProfile = {
                exists: !!userProfile,
                role: userProfile?.role,
                status: userProfile?.status,
                data: userProfile
            };

            // 3. Check vendor profile
            if (currentUser) {
                try {
                    const vendor = await getVendorById(currentUser.uid);
                    results.vendorProfile = {
                        exists: !!vendor,
                        status: vendor?.status,
                        businessName: vendor?.businessName,
                        data: vendor
                    };
                } catch (err) {
                    results.vendorProfile = {
                        exists: false,
                        error: err.message
                    };
                }

                // 4. Check vendor stats
                if (results.vendorProfile.exists) {
                    try {
                        const stats = await getVendorStats(currentUser.uid);
                        results.vendorStats = stats;
                    } catch (err) {
                        results.vendorStats = { error: err.message };
                    }
                }

                // 5. Check vendor products
                if (results.vendorProfile.exists) {
                    try {
                        const products = await getVendorProducts(currentUser.uid);
                        results.vendorProducts = {
                            count: products.length,
                            products: products.map(p => ({
                                id: p.id,
                                name: p.name,
                                status: p.status,
                                price: p.price
                            }))
                        };
                    } catch (err) {
                        results.vendorProducts = { error: err.message };
                    }
                }

                // 6. Check vendor orders
                if (results.vendorProfile.exists) {
                    try {
                        const orders = await getVendorOrders(currentUser.uid);
                        results.vendorOrders = {
                            count: orders.length,
                            orders: orders.slice(0, 5).map(o => ({
                                id: o.id,
                                orderId: o.orderId,
                                status: o.status
                            }))
                        };
                    } catch (err) {
                        results.vendorOrders = { error: err.message };
                    }
                }
            }

            setDiagnostics(results);
            setMessage('Diagnostics complete!');
        } catch (error) {
            setMessage('Error running diagnostics: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshProfile = async () => {
        setMessage('Refreshing profile...');
        try {
            await refreshProfile();
            setMessage('Profile refreshed! Run diagnostics again.');
        } catch (error) {
            setMessage('Error refreshing profile: ' + error.message);
        }
    };

    useEffect(() => {
        if (currentUser) {
            runDiagnostics();
        }
    }, [currentUser]);

    return (
        <Container className="py-5">
            <h1 className="mb-4">Vendor Diagnostics</h1>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex gap-2 mb-3">
                        <Button onClick={runDiagnostics} disabled={loading}>
                            {loading ? 'Running...' : 'Run Diagnostics'}
                        </Button>
                        <Button variant="secondary" onClick={handleRefreshProfile}>
                            Refresh Profile
                        </Button>
                    </div>
                    {message && <Alert variant="info">{message}</Alert>}
                </Card.Body>
            </Card>

            {Object.keys(diagnostics).length > 0 && (
                <>
                    {/* Current User */}
                    <Card className="mb-3">
                        <Card.Header>
                            <strong>Current User</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr>
                                        <td><strong>Exists</strong></td>
                                        <td>
                                            <Badge bg={diagnostics.currentUser?.exists ? 'success' : 'danger'}>
                                                {diagnostics.currentUser?.exists ? 'YES' : 'NO'}
                                            </Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>UID</strong></td>
                                        <td><code>{diagnostics.currentUser?.uid || 'N/A'}</code></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email</strong></td>
                                        <td>{diagnostics.currentUser?.email || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Display Name</strong></td>
                                        <td>{diagnostics.currentUser?.displayName || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* User Profile */}
                    <Card className="mb-3">
                        <Card.Header>
                            <strong>User Profile (Firestore users collection)</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr>
                                        <td><strong>Exists</strong></td>
                                        <td>
                                            <Badge bg={diagnostics.userProfile?.exists ? 'success' : 'danger'}>
                                                {diagnostics.userProfile?.exists ? 'YES' : 'NO'}
                                            </Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Role</strong></td>
                                        <td>
                                            <Badge bg={
                                                diagnostics.userProfile?.role === 'vendor' ? 'primary' :
                                                    diagnostics.userProfile?.role === 'admin' ? 'danger' :
                                                        'secondary'
                                            }>
                                                {diagnostics.userProfile?.role || 'N/A'}
                                            </Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status</strong></td>
                                        <td>{diagnostics.userProfile?.status || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <details>
                                <summary>Full Data</summary>
                                <pre className="mt-2" style={{ fontSize: '0.75rem' }}>
                                    {JSON.stringify(diagnostics.userProfile?.data, null, 2)}
                                </pre>
                            </details>
                        </Card.Body>
                    </Card>

                    {/* Vendor Profile */}
                    <Card className="mb-3">
                        <Card.Header>
                            <strong>Vendor Profile (Firestore vendors collection)</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr>
                                        <td><strong>Exists</strong></td>
                                        <td>
                                            <Badge bg={diagnostics.vendorProfile?.exists ? 'success' : 'danger'}>
                                                {diagnostics.vendorProfile?.exists ? 'YES' : 'NO'}
                                            </Badge>
                                        </td>
                                    </tr>
                                    {diagnostics.vendorProfile?.exists && (
                                        <>
                                            <tr>
                                                <td><strong>Business Name</strong></td>
                                                <td>{diagnostics.vendorProfile?.businessName || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Status</strong></td>
                                                <td>
                                                    <Badge bg={
                                                        diagnostics.vendorProfile?.status === 'approved' ? 'success' :
                                                            diagnostics.vendorProfile?.status === 'pending' ? 'warning' :
                                                                'danger'
                                                    }>
                                                        {diagnostics.vendorProfile?.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    {diagnostics.vendorProfile?.error && (
                                        <tr>
                                            <td><strong>Error</strong></td>
                                            <td className="text-danger">{diagnostics.vendorProfile.error}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {diagnostics.vendorProfile?.data && (
                                <details>
                                    <summary>Full Data</summary>
                                    <pre className="mt-2" style={{ fontSize: '0.75rem' }}>
                                        {JSON.stringify(diagnostics.vendorProfile.data, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Vendor Stats */}
                    {diagnostics.vendorStats && (
                        <Card className="mb-3">
                            <Card.Header>
                                <strong>Vendor Statistics</strong>
                            </Card.Header>
                            <Card.Body>
                                {diagnostics.vendorStats.error ? (
                                    <Alert variant="danger">{diagnostics.vendorStats.error}</Alert>
                                ) : (
                                    <Table size="sm" bordered>
                                        <tbody>
                                            <tr>
                                                <td><strong>Total Products</strong></td>
                                                <td>{diagnostics.vendorStats.totalProducts}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Active Products</strong></td>
                                                <td>{diagnostics.vendorStats.activeProducts}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Total Sales</strong></td>
                                                <td>{diagnostics.vendorStats.totalSales}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Total Earnings</strong></td>
                                                <td>Rs. {diagnostics.vendorStats.totalEarnings?.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Rating</strong></td>
                                                <td>{diagnostics.vendorStats.rating} ({diagnostics.vendorStats.reviewCount} reviews)</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Vendor Products */}
                    {diagnostics.vendorProducts && (
                        <Card className="mb-3">
                            <Card.Header>
                                <strong>Vendor Products</strong>
                            </Card.Header>
                            <Card.Body>
                                {diagnostics.vendorProducts.error ? (
                                    <Alert variant="danger">{diagnostics.vendorProducts.error}</Alert>
                                ) : (
                                    <>
                                        <p><strong>Count:</strong> {diagnostics.vendorProducts.count}</p>
                                        {diagnostics.vendorProducts.count > 0 && (
                                            <Table size="sm" bordered striped>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {diagnostics.vendorProducts.products.map(p => (
                                                        <tr key={p.id}>
                                                            <td><code>{p.id}</code></td>
                                                            <td>{p.name}</td>
                                                            <td>
                                                                <Badge bg={
                                                                    p.status === 'approved' ? 'success' :
                                                                        p.status === 'pending' ? 'warning' : 'danger'
                                                                }>
                                                                    {p.status}
                                                                </Badge>
                                                            </td>
                                                            <td>Rs. {p.price?.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Vendor Orders */}
                    {diagnostics.vendorOrders && (
                        <Card className="mb-3">
                            <Card.Header>
                                <strong>Vendor Orders</strong>
                            </Card.Header>
                            <Card.Body>
                                {diagnostics.vendorOrders.error ? (
                                    <Alert variant="danger">{diagnostics.vendorOrders.error}</Alert>
                                ) : (
                                    <>
                                        <p><strong>Count:</strong> {diagnostics.vendorOrders.count}</p>
                                        {diagnostics.vendorOrders.count > 0 && (
                                            <Table size="sm" bordered striped>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Order ID</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {diagnostics.vendorOrders.orders.map(o => (
                                                        <tr key={o.id}>
                                                            <td><code>{o.id}</code></td>
                                                            <td>#{o.orderId}</td>
                                                            <td>{o.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default VendorDiagnostics;

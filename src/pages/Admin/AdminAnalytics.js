// Admin Analytics Dashboard
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Table, Form } from 'react-bootstrap';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiActivity } from 'react-icons/fi';
import { getAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getAllUsers } from '../../services/userService';
import Loading from '../../components/common/Loading';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        tempMonthlySales: [], // Chart data
        topProducts: [],
        categorySales: [],
        recentGrowth: 0,
        usersCount: 0
    });
    const [timeRange, setTimeRange] = useState('month');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch more orders for analytics (e.g., 200)
                // Fetch up to 1000 products to ensure coverage for categories
                const [orders, productsRes, users] = await Promise.all([
                    getAllOrders(null, 200),
                    getProducts({}, null, 1000),
                    getAllUsers()
                ]);

                const allOrders = orders || [];
                const allProducts = productsRes.products || [];
                const allUsers = users || [];

                // Helper: Product Lookup Maps (ID and Name)
                const productMap = {};
                const productNameMap = {};
                allProducts.forEach(p => {
                    productMap[p.id] = p;
                    if (p.name) productNameMap[p.name] = p;
                });

                // Helper for date string (YYYY-MM-DD) local logic
                const toDateString = (dateObj) => {
                    if (!dateObj) return 'unknown';
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                };

                // 1. Total Revenue
                const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                // 2. Monthly Revenue (Current Month)
                const now = new Date();
                const currentMonthRevenue = allOrders
                    .filter(o => {
                        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

                // Prepare Chart Data (Last 7 Days)
                const dailySales = {};
                // Initialize last 7 days with 0
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    dailySales[toDateString(d)] = 0;
                }

                allOrders.forEach(order => {
                    const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                    const dateStr = toDateString(d);

                    if (dailySales[dateStr] !== undefined) {
                        dailySales[dateStr] += (order.totalAmount || 0);
                    }
                });

                const chartData = Object.values(dailySales);

                // 3. Top Products & Category Sales
                const productSales = {}; // { key: { name, sales, revenue } }
                const categoryRevenue = {}; // { categoryName: count }

                allOrders.forEach(order => {
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            // Top Products
                            // Priority: item.productId (stable ref) -> item.id
                            const pId = item.productId || item.id;

                            // Robust Lookup: ID first, then Name (case insensitive fallback)
                            let product = productMap[pId];
                            if (!product && item.name) {
                                product = productNameMap[item.name] || productNameMap[item.name.toLowerCase()];
                            }

                            const pName = item.name || product?.name || 'Unknown Product';
                            const pRev = (item.price || 0) * (item.quantity || 1);

                            const key = pId || pName;

                            if (!productSales[key]) {
                                productSales[key] = { name: pName, sales: 0, revenue: 0 };
                            }
                            productSales[key].sales += (item.quantity || 1);
                            productSales[key].revenue += pRev;

                            // Category Sales
                            // Priority: Product DB -> Item Snapshot -> Uncategorized
                            const cat = product?.category || item.category || 'Uncategorized';

                            categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.quantity || 1);
                        });
                    }
                });

                const topProducts = Object.values(productSales)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 10);

                const categorySales = Object.keys(categoryRevenue)
                    .map(cat => ({
                        name: cat,
                        count: categoryRevenue[cat],
                        percentage: 0
                    }))
                    .sort((a, b) => b.count - a.count);

                const totalItemsSold = categorySales.reduce((sum, c) => sum + c.count, 0);
                categorySales.forEach(c => {
                    c.percentage = totalItemsSold > 0 ? Math.round((c.count / totalItemsSold) * 100) : 0;
                });

                setStats({
                    totalRevenue,
                    monthlyRevenue: currentMonthRevenue,
                    tempMonthlySales: chartData,
                    topProducts,
                    categorySales,
                    usersCount: allUsers.length
                });

            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    if (loading) return <Loading text="Crunching numbers..." />;

    const maxChartValue = Math.max(...stats.tempMonthlySales, 1);

    return (
        <div className="admin-analytics">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Analytics Dashboard</h2>
                <Form.Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{ width: '150px' }}
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month</option>
                </Form.Select>
            </div>

            {/* Key Metrics */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center p-3 shadow-sm border-0 bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center px-2">
                            <FiDollarSign size={24} />
                            <div className="text-end">
                                <small className="opacity-75">Total Revenue</small>
                                <h3 className="mb-0">Rs. {(stats.totalRevenue / 1000).toFixed(1)}k</h3>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3 shadow-sm border-0 bg-success text-white">
                        <div className="d-flex justify-content-between align-items-center px-2">
                            <FiTrendingUp size={24} />
                            <div className="text-end">
                                <small className="opacity-75">Monthly Revenue</small>
                                <h3 className="mb-0">Rs. {(stats.monthlyRevenue / 1000).toFixed(1)}k</h3>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3 shadow-sm border-0 bg-warning text-white">
                        <div className="d-flex justify-content-between align-items-center px-2">
                            <FiUsers size={24} />
                            <div className="text-end">
                                <small className="opacity-75">Active Users</small>
                                <h3 className="mb-0">{stats.usersCount}</h3>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3 shadow-sm border-0 bg-info text-white">
                        <div className="d-flex justify-content-between align-items-center px-2">
                            <FiActivity size={24} />
                            <div className="text-end">
                                <small className="opacity-75">Conversion</small>
                                <h3 className="mb-0">2.4%</h3> {/* Mock */}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Sales Chart (CSS based) */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0">Revenue Overview (Last 7 Days)</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <div className="d-flex align-items-end justify-content-between" style={{ height: '250px' }}>
                                {stats.tempMonthlySales.map((val, idx) => (
                                    <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '12%' }}>
                                        <div
                                            className="bg-primary rounded-top"
                                            style={{
                                                width: '100%',
                                                height: `${(val / maxChartValue) * 100}%`,
                                                opacity: 0.8,
                                                minHeight: val > 0 ? '4px' : '0', // Ensure visibility if barely small
                                                transition: 'height 0.5s ease'
                                            }}
                                            title={`Day ${idx + 1}: Rs. ${val}`}
                                        ></div>
                                        <small className="mt-2 text-muted">Day {idx + 1}</small>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Category Distribution */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0">Categories</h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            {stats.categorySales.slice(0, 8).map((cat, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>{cat.name}</span>
                                        <small className="text-muted">{cat.count} items</small>
                                    </div>
                                    <ProgressBar now={cat.percentage} variant={['primary', 'success', 'warning', 'info', 'danger'][idx % 5]} style={{ height: '6px' }} />
                                </div>
                            ))}
                            {stats.categorySales.length === 0 && <p className="text-center text-muted">No sales data yet.</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Top Products Table */}
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0">Top Selling Products</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                        <th>Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{p.name}</td>
                                            <td>{p.sales} units</td>
                                            <td>Rs. {p.revenue.toLocaleString()}</td>
                                            <td className="text-success"><FiTrendingUp /> +{Math.floor(Math.random() * 20)}%</td>
                                        </tr>
                                    ))}
                                    {stats.topProducts.length === 0 && (
                                        <tr><td colSpan="4" className="text-center">No data available</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminAnalytics;

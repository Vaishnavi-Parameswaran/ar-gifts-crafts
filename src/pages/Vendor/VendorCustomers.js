// Vendor Customers Component
import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getVendorCustomers } from '../../services/vendorService';
import Loading from '../../components/common/Loading';

const VendorCustomers = () => {
    const { currentUser } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            if (currentUser) {
                try {
                    const data = await getVendorCustomers(currentUser.uid);
                    setCustomers(data);
                } catch (error) {
                    console.error('Error fetching customers:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCustomers();
    }, [currentUser]);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loading text="Loading customers..." />;

    return (
        <div className="vendor-customers">
            <div className="page-header mb-4">
                <h2>My Customers</h2>
                <div className="search-bar">
                    <InputGroup>
                        <InputGroup.Text><FiSearch /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            <Card className="data-card">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Last Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="fw-bold">{customer.name}</div>
                                            <div className="text-muted small">ID: {customer.id}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center mb-1">
                                                <FiMail className="me-2 text-muted" /> {customer.email}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <FiPhone className="me-2 text-muted" /> {customer.phone}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FiMapPin className="me-2 text-muted" /> {customer.city}
                                            </div>
                                        </td>
                                        <td>{customer.totalOrders}</td>
                                        <td>Rs. {customer.totalSpent.toLocaleString()}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FiCalendar className="me-2 text-muted" />
                                                {new Date(customer.lastOrderDate?.toDate?.() || customer.lastOrderDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No customers found. Customers who buy your products will appear here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default VendorCustomers;

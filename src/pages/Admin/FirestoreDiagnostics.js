// Firestore Connection Diagnostic Tool
import React, { useState } from 'react';
import { Container, Card, Button, Alert, ListGroup, Table } from 'react-bootstrap';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const FirestoreDiagnostics = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics = {
            firebaseConfigured: false,
            productsCount: 0,
            categoriesCount: 0,
            vendorsCount: 0,
            sampleProducts: [],
            allCategories: [],
            categoryQueryTest: {},
            errors: []
        };

        try {
            // Check if Firebase is configured
            diagnostics.firebaseConfigured = !!db;

            // Check Products
            try {
                const productsSnap = await getDocs(collection(db, 'products'));
                diagnostics.productsCount = productsSnap.size;

                // Get ALL products to inspect
                diagnostics.sampleProducts = productsSnap.docs.slice(0, 10).map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Test category queries
                const testCategories = ['handmade-crafts', 'gifts', 'party-favours', 'home-decor'];
                for (const cat of testCategories) {
                    const catQuery = query(
                        collection(db, 'products'),
                        where('category', '==', cat)
                    );
                    const catSnap = await getDocs(catQuery);
                    diagnostics.categoryQueryTest[cat] = catSnap.size;
                }

                // Also test with status filter
                const approvedQuery = query(
                    collection(db, 'products'),
                    where('status', '==', 'approved')
                );
                const approvedSnap = await getDocs(approvedQuery);
                diagnostics.approvedCount = approvedSnap.size;

            } catch (err) {
                diagnostics.errors.push(`Products Error: ${err.message}`);
            }

            // Check Categories
            try {
                const categoriesSnap = await getDocs(collection(db, 'categories'));
                diagnostics.categoriesCount = categoriesSnap.size;
                diagnostics.allCategories = categoriesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (err) {
                diagnostics.errors.push(`Categories Error: ${err.message}`);
            }

            // Check Vendors
            try {
                const vendorsSnap = await getDocs(collection(db, 'vendors'));
                diagnostics.vendorsCount = vendorsSnap.size;
            } catch (err) {
                diagnostics.errors.push(`Vendors Error: ${err.message}`);
            }

        } catch (error) {
            diagnostics.errors.push(`General Error: ${error.message}`);
        }

        setResults(diagnostics);
        setLoading(false);
    };

    return (
        <Container className="py-5">
            <Card>
                <Card.Header>
                    <h3>Firestore Diagnostics</h3>
                </Card.Header>
                <Card.Body>
                    <Button
                        onClick={runDiagnostics}
                        disabled={loading}
                        className="mb-4"
                    >
                        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                    </Button>

                    {results && (
                        <>
                            <Alert variant={results.errors.length > 0 ? 'danger' : 'success'}>
                                <h5>Connection Status</h5>
                                <p>Firebase Configured: {results.firebaseConfigured ? '✅ Yes' : '❌ No'}</p>
                            </Alert>

                            <ListGroup className="mb-3">
                                <ListGroup.Item>
                                    <strong>Total Products:</strong> {results.productsCount}
                                    {results.productsCount === 0 && (
                                        <Alert variant="warning" className="mt-2 mb-0">
                                            No products found! Please run the seeder at <code>/admin/seed</code>
                                        </Alert>
                                    )}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Approved Products:</strong> {results.approvedCount || 0}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Categories in Database:</strong> {results.categoriesCount}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Vendors in Database:</strong> {results.vendorsCount}
                                </ListGroup.Item>
                            </ListGroup>

                            {results.categoryQueryTest && Object.keys(results.categoryQueryTest).length > 0 && (
                                <>
                                    <h5>Category Query Test</h5>
                                    <Table striped bordered size="sm" className="mb-4">
                                        <thead>
                                            <tr>
                                                <th>Category Slug</th>
                                                <th>Products Found</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(results.categoryQueryTest).map(([cat, count]) => (
                                                <tr key={cat}>
                                                    <td><code>{cat}</code></td>
                                                    <td><strong>{count}</strong></td>
                                                    <td>{count > 0 ? '✅ Working' : '❌ No products'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </>
                            )}

                            {results.allCategories.length > 0 && (
                                <>
                                    <h5>Categories in Database</h5>
                                    <ListGroup className="mb-4">
                                        {results.allCategories.map(cat => (
                                            <ListGroup.Item key={cat.id}>
                                                <strong>{cat.name}</strong> - <code>/categories/{cat.slug}</code>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </>
                            )}

                            {results.sampleProducts.length > 0 && (
                                <>
                                    <h5>Sample Products (First 10)</h5>
                                    <Table striped bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Featured</th>
                                                <th>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.sampleProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.name}</td>
                                                    <td><code>{product.category || 'MISSING'}</code></td>
                                                    <td><code>{product.status || 'MISSING'}</code></td>
                                                    <td>{product.featured ? '⭐' : '-'}</td>
                                                    <td>Rs. {product.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </>
                            )}

                            {results.errors.length > 0 && (
                                <>
                                    <h5 className="mt-4">Errors</h5>
                                    <Alert variant="danger">
                                        {results.errors.map((err, i) => (
                                            <div key={i}>{err}</div>
                                        ))}
                                    </Alert>
                                </>
                            )}

                            {results.productsCount > 0 && results.approvedCount === 0 && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>⚠️ Issue Found:</strong> You have {results.productsCount} products, but 0 are "approved".
                                    Check if products have <code>status: 'approved'</code> field.
                                </Alert>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FirestoreDiagnostics;

import React, { useState } from 'react';
import { Container, Card, Button, Alert, Table } from 'react-bootstrap';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const DebugCorporateGifts = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const runDebug = async () => {
        setLoading(true);
        const debug = {
            allProducts: [],
            corporateProducts: [],
            category: null,
            errors: []
        };

        try {
            // Get category
            const catQuery = query(
                collection(db, 'categories'),
                where('slug', '==', 'corporate-gifts')
            );
            const catSnap = await getDocs(catQuery);
            if (!catSnap.empty) {
                debug.category = { id: catSnap.docs[0].id, ...catSnap.docs[0].data() };
            } else {
                debug.errors.push('Category "corporate-gifts" not found!');
            }

            // Get ALL products to see their categories
            const allProdsQuery = query(collection(db, 'products'));
            const allProdsSnap = await getDocs(allProdsQuery);
            debug.allProducts = allProdsSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                category: doc.data().category,
                status: doc.data().status
            }));

            // Get products with category = 'corporate-gifts'
            const corpQuery = query(
                collection(db, 'products'),
                where('category', '==', 'corporate-gifts')
            );
            const corpSnap = await getDocs(corpQuery);
            debug.corporateProducts = corpSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            debug.errors.push(error.message);
        }

        setResults(debug);
        setLoading(false);
    };

    return (
        <Container className="py-5">
            <Card>
                <Card.Header>
                    <h3>Debug: Corporate Gifts Issue</h3>
                </Card.Header>
                <Card.Body>
                    <Button onClick={runDebug} disabled={loading} className="mb-4">
                        {loading ? 'Debugging...' : 'Run Debug'}
                    </Button>

                    {results && (
                        <>
                            {results.errors.length > 0 && (
                                <Alert variant="danger">
                                    {results.errors.map((err, i) => <div key={i}>{err}</div>)}
                                </Alert>
                            )}

                            <h5>Category Info:</h5>
                            {results.category ? (
                                <Alert variant="success">
                                    <strong>Name:</strong> {results.category.name}<br />
                                    <strong>Slug:</strong> {results.category.slug}<br />
                                    <strong>Status:</strong> {results.category.status}<br />
                                    <strong>ID:</strong> {results.category.id}
                                </Alert>
                            ) : (
                                <Alert variant="warning">Category not found!</Alert>
                            )}

                            <h5>Products with category = 'corporate-gifts': {results.corporateProducts.length}</h5>
                            {results.corporateProducts.length > 0 ? (
                                <Table striped bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.corporateProducts.slice(0, 10).map(p => (
                                            <tr key={p.id}>
                                                <td>{p.name}</td>
                                                <td><code>{p.category}</code></td>
                                                <td>{p.status}</td>
                                                <td>Rs. {p.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="warning">
                                    No products found with category='corporate-gifts'!
                                    <br />Check "All Products Categories" below to see what categories exist.
                                </Alert>
                            )}

                            <h5 className="mt-4">All Products - Category Breakdown (First 20):</h5>
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Category Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.allProducts.slice(0, 20).map(p => (
                                        <tr key={p.id} style={{
                                            backgroundColor: p.category === 'corporate-gifts' ? '#d4edda' : 'transparent'
                                        }}>
                                            <td>{p.name}</td>
                                            <td><code>{p.category || 'MISSING'}</code></td>
                                            <td>{p.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Alert variant="info" className="mt-3">
                                <strong>What to check:</strong>
                                <ul className="mb-0">
                                    <li>If "Products with category = 'corporate-gifts'" is 0, the seeder didn't create them correctly</li>
                                    <li>Look at the "Category Value" column - do you see 'corporate-gifts' anywhere?</li>
                                    <li>Green highlighted rows = products that SHOULD show on corporate-gifts page</li>
                                </ul>
                            </Alert>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DebugCorporateGifts;

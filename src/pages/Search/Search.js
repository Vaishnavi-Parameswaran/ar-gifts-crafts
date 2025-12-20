// Search Results Page
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { searchProducts } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import './Search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const results = await searchProducts(query);
                setProducts(results);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
        setSearchInput(query);
    }, [query]);

    // Demo products for development
    const demoProducts = query ? [
        {
            id: '1',
            name: `${query} - Handmade Ceramic Vase`,
            price: 2499,
            salePrice: 1999,
            images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400'],
            vendorName: 'Artisan Crafts',
            rating: 4.5,
            reviewCount: 128,
            stock: 15
        },
        {
            id: '2',
            name: `Custom ${query} Gift Box`,
            price: 1299,
            images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400'],
            vendorName: 'Gift Paradise',
            rating: 4.8,
            reviewCount: 256,
            stock: 20
        },
        {
            id: '3',
            name: `Personalized ${query} Frame`,
            price: 999,
            images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400'],
            vendorName: 'WoodWorks',
            rating: 4.7,
            reviewCount: 89,
            stock: 8
        }
    ] : [];

    const displayProducts = products.length > 0 ? products : demoProducts;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
        }
    };

    if (loading) return <Loading fullPage text="Searching..." />;

    return (
        <div className="search-page">
            <div className="search-header">
                <Container>
                    <Form onSubmit={handleSearch} className="search-form-large">
                        <FiSearch className="search-icon" />
                        <Form.Control
                            type="search"
                            placeholder="Search for gifts, crafts, home decor..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button type="submit">Search</Button>
                    </Form>
                </Container>
            </div>

            <Container className="py-4">
                {query ? (
                    <>
                        <div className="search-info">
                            <h2>Search Results for "{query}"</h2>
                            <p>{displayProducts.length} products found</p>
                        </div>

                        {displayProducts.length > 0 ? (
                            <Row>
                                {displayProducts.map((product) => (
                                    <Col lg={3} md={4} sm={6} key={product.id} className="mb-4">
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="no-results">
                                <FiSearch className="no-results-icon" />
                                <h3>No products found</h3>
                                <p>Try different keywords or browse our categories</p>
                                <Button as={Link} to="/categories" variant="primary">
                                    Browse Categories
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-query">
                        <FiSearch className="no-results-icon" />
                        <h3>Start Searching</h3>
                        <p>Enter a search term to find products</p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Search;

// Category Products Page
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import { FiGrid, FiList, FiFilter, FiChevronDown } from 'react-icons/fi';
import { getProductsByCategory, getFeaturedProducts, getProducts } from '../../services/productService';
import { getCategoryBySlug } from '../../services/categoryService';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import './CategoryProducts.css';

const CategoryProducts = (props) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [appliedPriceRange, setAppliedPriceRange] = useState({ min: '', max: '' });
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [minRating, setMinRating] = useState(0);

    // Redirect old/incorrect slugs
    useEffect(() => {
        if (slug === 'corporate') {
            navigate('/categories/corporate-gifts', { replace: true });
        }
    }, [slug, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (props.filter) {
                    // Handle special filters like featured, new-arrivals, deals
                    let productsData = [];
                    if (props.filter === 'featured') productsData = await getFeaturedProducts(100);
                    else if (props.filter === 'deals') productsData = await getProducts({ status: 'approved' }, null, 100);
                    else productsData = await getProducts({ status: 'approved', orderBy: 'createdAt' }, null, 100);

                    if (productsData.products) productsData = productsData.products; // Handle paginated response if any

                    setCategory({ name: props.title, description: `Explore our ${props.title.toLowerCase()}` });
                    setProducts(productsData);
                } else if (slug) {
                    // Handle normal category slug
                    console.log('Fetching category:', slug);
                    const [categoryData, productsData] = await Promise.all([
                        getCategoryBySlug(slug),
                        getProductsByCategory(slug, 100)
                    ]);
                    console.log('Category data:', categoryData);
                    console.log('Products data:', productsData);
                    console.log('Products count:', productsData?.length || 0);
                    setCategory(categoryData);
                    setProducts(productsData);
                }
            } catch (error) {
                console.error('Error fetching category products:', error);
                console.error('Error details:', error.message, error.code);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, props.filter, props.title]);

    const displayProducts = products;

    const sortProducts = (products) => {
        switch (sortBy) {
            case 'price-low':
                return [...products].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
            case 'price-high':
                return [...products].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
            case 'rating':
                return [...products].sort((a, b) => b.rating - a.rating);
            case 'newest':
            default:
                return products;
        }
    };

    // Filter products logic
    const filterProducts = (products) => {
        return products.filter(p => {
            // Price Filter
            const price = p.salePrice || p.price;
            if (appliedPriceRange.min && price < Number(appliedPriceRange.min)) return false;
            if (appliedPriceRange.max && price > Number(appliedPriceRange.max)) return false;

            // Availability Filter
            if (!showOutOfStock && p.stock <= 0) return false;

            // Rating Filter
            if (minRating > 0 && (p.rating || 0) < minRating) return false;

            return true;
        });
    };

    const applyFilters = () => {
        setAppliedPriceRange(priceRange);
    };

    const resetFilters = () => {
        setPriceRange({ min: '', max: '' });
        setAppliedPriceRange({ min: '', max: '' });
        setShowOutOfStock(false);
        setMinRating(0);
        setSortBy('newest');
    };

    const sortedProducts = sortProducts(filterProducts(displayProducts));

    if (loading) return <Loading fullPage text="Loading products..." />;

    const categoryName = category?.name || (slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Products');

    return (
        <div className="category-products-page">
            {/* Breadcrumb */}
            <div className="category-breadcrumb">
                <Container>
                    <Link to="/">Home</Link>
                    <span>/</span>
                    {slug ? <Link to="/categories">Categories</Link> : <span>Collections</span>}
                    <span>/</span>
                    <span>{categoryName}</span>
                </Container>
            </div>

            {/* Category Header */}
            <div className="category-header">
                <Container>
                    <h1>{categoryName}</h1>
                    <p>{category?.description || `Explore our ${categoryName.toLowerCase()} collection`}</p>
                </Container>
            </div>

            <Container className="py-4">
                <Row>
                    {/* Filters Sidebar */}
                    <Col lg={3} className="d-none d-lg-block">
                        <div className="filters-sidebar">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0">Filters</h4>
                                <Button variant="link" size="sm" onClick={resetFilters} className="text-danger p-0">
                                    Clear All
                                </Button>
                            </div>

                            <div className="filter-section">
                                <h5>Sort By</h5>
                                <Form.Check
                                    type="radio"
                                    label="Newest First"
                                    name="sort"
                                    checked={sortBy === 'newest'}
                                    onChange={() => setSortBy('newest')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Price: Low to High"
                                    name="sort"
                                    checked={sortBy === 'price-low'}
                                    onChange={() => setSortBy('price-low')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Price: High to Low"
                                    name="sort"
                                    checked={sortBy === 'price-high'}
                                    onChange={() => setSortBy('price-high')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Top Rated"
                                    name="sort"
                                    checked={sortBy === 'rating'}
                                    onChange={() => setSortBy('rating')}
                                />
                            </div>

                            <div className="filter-section">
                                <h5>Price Range</h5>
                                <div className="price-inputs">
                                    <Form.Control
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    />
                                    <span>to</span>
                                    <Form.Control
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    />
                                </div>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="mt-2 w-100"
                                    onClick={applyFilters}
                                >
                                    Apply Price
                                </Button>
                            </div>

                            <div className="filter-section">
                                <h5>Rating</h5>
                                {[4, 3, 2].map((stars) => (
                                    <Form.Check
                                        key={stars}
                                        type="radio"
                                        name="rating"
                                        label={`${stars}★ & above`}
                                        checked={minRating === stars}
                                        onChange={() => setMinRating(stars)}
                                        className="mb-2"
                                    />
                                ))}
                                <Form.Check
                                    type="radio"
                                    name="rating"
                                    label="Any Rating"
                                    checked={minRating === 0}
                                    onChange={() => setMinRating(0)}
                                />
                            </div>

                            <div className="filter-section">
                                <h5>Availability</h5>
                                <Form.Check
                                    type="checkbox"
                                    label="Show Out of Stock"
                                    checked={showOutOfStock}
                                    onChange={(e) => setShowOutOfStock(e.target.checked)}
                                />
                            </div>
                        </div>
                    </Col>

                    {/* Products Grid */}
                    <Col lg={9}>
                        {/* Toolbar */}
                        <div className="products-toolbar">
                            <div className="results-count">
                                Showing <strong>{sortedProducts.length}</strong> products
                            </div>

                            <div className="toolbar-actions">
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Rating'}
                                        <FiChevronDown />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => setSortBy('newest')}>Newest</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setSortBy('price-low')}>Price: Low to High</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setSortBy('price-high')}>Price: High to Low</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setSortBy('rating')}>Rating</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <div className="view-toggle">
                                    <Button
                                        variant={viewMode === 'grid' ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <FiGrid />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <FiList />
                                    </Button>
                                </div>

                                <Button variant="outline-secondary" size="sm" className="d-lg-none">
                                    <FiFilter /> Filters
                                </Button>
                            </div>
                        </div>

                        {/* Products */}
                        <Row className={viewMode === 'list' ? 'list-view' : ''}>
                            {sortedProducts.map((product) => (
                                <Col lg={4} md={4} sm={6} key={product.id} className="mb-4">
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>

                        {sortedProducts.length === 0 && (
                            <div className="no-products">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or browse other categories.</p>
                                <Button as={Link} to="/categories" variant="primary">Browse Categories</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CategoryProducts;

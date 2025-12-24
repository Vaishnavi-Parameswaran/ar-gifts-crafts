// Home Page Component
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import { getFeaturedProducts, getProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import Contact from '../Contact/Contact';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featured, newProducts, cats] = await Promise.all([
                    getFeaturedProducts(15),
                    getProducts({ status: 'approved', orderBy: 'createdAt' }, null, 15),
                    getAllCategories()
                ]);

                setFeaturedProducts(featured);
                setNewArrivals(newProducts.products);
                setCategories(cats.slice(0, 20)); // Show all categories
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Demo data for development
    const demoProducts = [
        {
            id: '1',
            name: 'Handmade Ceramic Vase - Blue Ocean',
            price: 2499,
            salePrice: 1999,
            images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400'],
            vendorName: 'Artisan Crafts',
            rating: 4.5,
            reviewCount: 128,
            featured: true,
            stock: 15
        },
        {
            id: '2',
            name: 'Personalized Wooden Photo Frame',
            price: 1299,
            images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400'],
            vendorName: 'WoodWorks',
            rating: 4.8,
            reviewCount: 256,
            stock: 20
        },
        {
            id: '3',
            name: 'Luxury Gift Box Set - Premium',
            price: 3999,
            salePrice: 2999,
            images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400'],
            vendorName: 'Gift Paradise',
            rating: 4.7,
            reviewCount: 89,
            featured: true,
            stock: 8
        },
        {
            id: '4',
            name: 'Hand-painted Canvas Art',
            price: 4999,
            images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'],
            vendorName: 'Art Gallery',
            rating: 4.9,
            reviewCount: 45,
            stock: 5
        }
    ];

    const demoCategories = [
        { id: '1', name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300' },
        { id: '2', name: 'Handmade Crafts', slug: 'handmade-crafts', image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300' },
        { id: '3', name: 'Gift Boxes', slug: 'gift-boxes', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300' },
        { id: '4', name: 'Personalized', slug: 'personalized', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=300' },
        { id: '5', name: 'Wedding', slug: 'wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300' },
        { id: '6', name: 'Festivals', slug: 'festivals', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300' },
        { id: '7', name: 'Party Favours', slug: 'party-favours', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300' }
    ];

    const displayedFeatured = featuredProducts.length > 0 ? featuredProducts : demoProducts;
    const displayedNewArrivals = newArrivals.length > 0 ? newArrivals : demoProducts;
    const displayCategories = categories.length > 0 ? categories : demoCategories;

    if (loading) {
        return <Loading fullPage text="Loading..." />;
    }

    return (
        <div className="home-page">
            {/* ... (previous sections unchanged) ... */}

            {/* Hero Section */}
            <section className="hero-section">
                <Carousel className="hero-carousel" fade>
                    <Carousel.Item>
                        <div className="hero-slide hero-slide-1">
                            <Container>
                                <div className="hero-content">
                                    <span className="hero-tag">New Collection 2024</span>
                                    <h1>Discover Unique<br />Handmade Treasures</h1>
                                    <p>Explore our curated collection of artisan gifts and crafts from talented creators across Sri Lanka.</p>
                                    <div className="hero-buttons">
                                        <Button as={Link} to="/categories" className="btn-primary-custom">
                                            Shop Now <FiArrowRight />
                                        </Button>
                                        <Button as={Link} to="/about" variant="outline-light">
                                            Learn More
                                        </Button>
                                    </div>
                                </div>
                            </Container>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="hero-slide hero-slide-2">
                            <Container>
                                <div className="hero-content">
                                    <span className="hero-tag">Up to 50% Off</span>
                                    <h1>Festival Special<br />Gift Collection</h1>
                                    <p>Make every celebration memorable with our exclusive festival gift sets.</p>
                                    <div className="hero-buttons">
                                        <Button as={Link} to="/deals" className="btn-primary-custom">
                                            View Deals <FiArrowRight />
                                        </Button>
                                    </div>
                                </div>
                            </Container>
                        </div>
                    </Carousel.Item>
                </Carousel>
            </section>

            {/* Features Bar */}
            <section className="features-bar">
                <Container>
                    <Row>
                        <Col md={3} sm={6} className="feature-item">
                            <FiTruck className="feature-icon" />
                            <div>
                                <h5>Free Shipping</h5>
                                <p>On orders over Rs. 5,000</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6} className="feature-item">
                            <FiShield className="feature-icon" />
                            <div>
                                <h5>Secure Payment</h5>
                                <p>100% protected</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6} className="feature-item">
                            <FiRefreshCw className="feature-icon" />
                            <div>
                                <h5>Easy Returns</h5>
                                <p>7 days return policy</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6} className="feature-item">
                            <FiHeadphones className="feature-icon" />
                            <div>
                                <h5>24/7 Support</h5>
                                <p>Dedicated support</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <Container>
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <Link to="/categories" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    <Row>
                        {displayCategories.slice(0, 6).map((category) => (
                            <Col lg={2} md={4} sm={6} xs={6} key={category.id} className="mb-4">
                                <Link to={`/categories/${category.slug}`} className="category-card">
                                    <div className="category-image">
                                        <img src={category.image || '/placeholder-category.jpg'} alt={category.name} />
                                    </div>
                                    <h4>{category.name}</h4>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Featured Products */}
            <section className="products-section">
                <Container>
                    <div className="section-header">
                        <h2>Featured Products</h2>
                        <Link to="/featured" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    <Row className="row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
                        {displayedFeatured.slice(0, 5).map((product) => (
                            <Col key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Banner Section */}
            <section className="promo-banner">
                <Container>
                    <Row>
                        <Col md={6} className="mb-4 mb-md-0">
                            <div className="banner-card banner-1">
                                <div className="banner-content">
                                    <span className="banner-tag">Trending Now</span>
                                    <h3>Handcrafted Home Decor</h3>
                                    <p>Transform your space with artisan pieces</p>
                                    <Button as={Link} to="/categories/home-decor" variant="dark">
                                        Shop Now
                                    </Button>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="banner-card banner-2">
                                <div className="banner-content">
                                    <span className="banner-tag">Limited Edition</span>
                                    <h3>Personalized Gifts</h3>
                                    <p>Create memories that last forever</p>
                                    <Button as={Link} to="/categories/personalized" variant="dark">
                                        Customize Now
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* New Arrivals */}
            <section className="products-section new-arrivals">
                <Container>
                    <div className="section-header">
                        <h2>New Arrivals</h2>
                        <Link to="/new-arrivals" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    <Row className="row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
                        {displayedNewArrivals.slice(0, 10).map((product) => (
                            <Col key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Contact Section */}
            <section className="contact-home-section" style={{ backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
                <Contact isEmbedded={true} />
            </section>

            {/* Become a Seller CTA */}
            <section className="seller-cta">
                <Container>
                    <div className="seller-cta-content">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <h2>Start Selling on AR ONE</h2>
                                <p>Join thousands of artisans and sellers. Reach millions of customers and grow your business with us.</p>
                            </Col>
                            <Col lg={4} className="text-lg-end">
                                <Button as={Link} to="/vendor/register" size="lg" className="btn-primary-custom">
                                    Become a Seller <FiArrowRight />
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Home;

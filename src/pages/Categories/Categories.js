// Categories Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FiArrowLeft } from 'react-icons/fi';
import { getCategoryTree } from '../../services/categoryService';
import Loading from '../../components/common/Loading';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Demo categories for development
    const demoCategories = [
        {
            id: '1',
            name: 'Home Decor',
            slug: 'home-decor',
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
            description: 'Beautiful items to decorate your home',
            productCount: 156
        },
        {
            id: '2',
            name: 'Handmade Crafts',
            slug: 'handmade-crafts',
            image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400',
            description: 'Unique handcrafted items',
            productCount: 234
        },
        {
            id: '3',
            name: 'Gift Boxes',
            slug: 'gift-boxes',
            image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
            description: 'Curated gift sets for any occasion',
            productCount: 89
        },
        {
            id: '4',
            name: 'Personalized Gifts',
            slug: 'personalized',
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400',
            description: 'Custom items with personal touch',
            productCount: 178
        },
        {
            id: '5',
            name: 'Wedding Collection',
            slug: 'wedding',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
            description: 'Special gifts for weddings',
            productCount: 67
        },
        {
            id: '6',
            name: 'Festival Specials',
            slug: 'festivals',
            image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400',
            description: 'Celebrate with unique festival gifts',
            productCount: 145
        },
        {
            id: '7',
            name: 'Corporate Gifts',
            slug: 'corporate-gifts',
            image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
            description: 'Professional gifts for businesses',
            productCount: 56
        },
        {
            id: '8',
            name: 'Art & Paintings',
            slug: 'art-paintings',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
            description: 'Original artwork and prints',
            productCount: 98
        }
    ];

    const displayCategories = categories.length > 0 ? categories : demoCategories;

    if (loading) return <Loading fullPage text="Loading categories..." />;

    return (
        <div className="categories-page">
            <div className="categories-hero">
                <Container>
                    <h1>Shop by Category</h1>
                    <p>Explore our curated collection of handmade gifts and crafts</p>
                </Container>
            </div>

            <Container className="py-5">
                <div className="mb-4">
                    <Button variant="outline-dark" size="sm" onClick={() => window.history.back()} className="d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                        <FiArrowLeft /> Back
                    </Button>
                </div>
                <Row>
                    {displayCategories.map((category) => (
                        <Col lg={3} md={4} sm={6} key={category.id} className="mb-4">
                            <Link to={`/categories/${category.slug}`} className="category-card-link">
                                <Card className="category-card">
                                    <div className="category-image">
                                        <img src={category.image || '/placeholder-category.jpg'} alt={category.name} />
                                    </div>
                                    <Card.Body>
                                        <h3>{category.name}</h3>
                                        <p>{category.description}</p>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Categories;

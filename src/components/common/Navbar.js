import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge, Form, Button, Offcanvas } from 'react-bootstrap';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getParentCategories } from '../../services/categoryService';
import NotificationBell from '../NotificationBell/NotificationBell';
import './Navbar.css';

const MainNavbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [categories, setCategories] = useState([]);
    const { currentUser, userProfile, logout, isAdmin, isVendor } = useAuth();
    const { getCartCount } = useCart();
    const { settings: rawSettings } = useSettings() || {};
    const settings = rawSettings || {};
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getParentCategories();
                setCategories(cats);
            } catch (error) {
                console.error('Error fetching navbar categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const cartCount = getCartCount();

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <Container>
                    <div className="top-bar-content">
                        <span>🎁 Free shipping on orders over Rs. 5,000</span>
                        <div className="top-bar-links">
                            <Link to="/track-order">Track Order</Link>
                            <Link to="/help">Help</Link>
                            {!currentUser && (
                                <>
                                    <Link to="/vendor/register">Sell on AR ONE</Link>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Navbar */}
            <Navbar expand="lg" className="main-navbar" sticky="top">
                <Container>
                    <Button
                        variant="link"
                        className="mobile-menu-btn d-lg-none"
                        onClick={() => setShowMobileMenu(true)}
                    >
                        <FiMenu size={24} />
                    </Button>

                    <Navbar.Brand as={Link} to="/" className="brand-logo d-flex align-items-center">
                        {settings?.logoUrl ? (
                            <img
                                src={settings.logoUrl}
                                alt={settings.siteName}
                                style={{ height: 40, marginRight: 10, objectFit: 'contain' }}
                            />
                        ) : null}
                        <div>
                            <span className="brand-text">{settings?.siteName || 'AR ONE'}</span>
                            <span className="brand-subtitle d-block" style={{ fontSize: '0.6em', lineHeight: 1 }}>Gifts & Crafts</span>
                        </div>
                    </Navbar.Brand>

                    {/* Search Bar */}
                    <Form className="search-form d-none d-lg-flex" onSubmit={handleSearch}>
                        <Form.Control
                            type="search"
                            placeholder="Search for gifts, crafts, home decor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <Button type="submit" className="search-btn">
                            <FiSearch />
                        </Button>
                    </Form>

                    {/* Nav Icons */}
                    <Nav className="nav-icons">
                        {currentUser ? (
                            <NavDropdown
                                title={
                                    <span className="nav-icon-item">
                                        <FiUser size={22} />
                                        <span className="nav-icon-label d-none d-md-inline">
                                            {userProfile?.displayName?.split(' ')[0] || 'Account'}
                                        </span>
                                    </span>
                                }
                                id="account-dropdown"
                                align="end"
                            >
                                {isVendor() ? (
                                    <>
                                        <NavDropdown.Header>Seller Console</NavDropdown.Header>
                                        <NavDropdown.Item as={Link} to="/vendor/dashboard">Vendor Dashboard</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to={`/vendor/${currentUser.uid}`}>My Shop Profile</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/vendor/settings">Store Settings</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Header>My Buyer Account</NavDropdown.Header>
                                        <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/wishlist">Wishlist</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/account">My Account</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                    </>
                                ) : (
                                    <>
                                        <NavDropdown.Item as={Link} to="/account">My Account</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/wishlist">Wishlist</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        {isAdmin() && (
                                            <NavDropdown.Item as={Link} to="/admin/dashboard">Admin Panel</NavDropdown.Item>
                                        )}
                                        {isAdmin() && <NavDropdown.Divider />}
                                        <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                    </>
                                )}
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login" className="nav-icon-item">
                                <FiUser size={22} />
                                <span className="nav-icon-label d-none d-md-inline">Login</span>
                            </Nav.Link>
                        )}

                        {currentUser && (
                            <NotificationBell />
                        )}

                        <Nav.Link as={Link} to="/wishlist" className="nav-icon-item">
                            <FiHeart size={22} />
                            <span className="nav-icon-label d-none d-md-inline">Wishlist</span>
                        </Nav.Link>

                        <Nav.Link as={Link} to="/cart" className="nav-icon-item cart-icon">
                            <FiShoppingCart size={22} />
                            {cartCount > 0 && (
                                <Badge bg="danger" pill className="cart-badge">
                                    {cartCount}
                                </Badge>
                            )}
                            <span className="nav-icon-label d-none d-md-inline">Cart</span>
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            {/* Main Navigation links (Desktop) */}
            {/* 1. Main Sections Navigation (Primary) */}
            <div className="primary-nav d-none d-lg-block">
                <Container>
                    <Nav className="category-nav-items justify-content-center">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/categories">All Categories</Nav.Link>
                        <Nav.Link as={Link} to="/about">About Us</Nav.Link>
                        <Nav.Link as={Link} to="/contact">Contact Us</Nav.Link>
                        <Nav.Link as={Link} to="/faq">FAQs</Nav.Link>
                        <Nav.Link as={Link} to="/careers">Careers</Nav.Link>
                        <Nav.Link as={Link} to="/returns">Return & Refund Policy</Nav.Link>
                        {!currentUser && (
                            <Nav.Link as={Link} to="/login" className="text-warning">Sign In</Nav.Link>
                        )}
                    </Nav>
                </Container>
            </div>

            {/* 2. Specific Category Navigation (Secondary) */}
            <div className="category-nav d-none d-lg-block">
                <Container>
                    <Nav className="category-nav-items">
                        {/* Render all categories as flat links */}
                        {categories.map((cat) => (
                            <Nav.Link
                                key={cat.id}
                                as={Link}
                                to={`/categories/${cat.slug}`}
                            >
                                {cat.name}
                            </Nav.Link>
                        ))}

                        <Nav.Link as={Link} to="/deals" className="deals-link">🔥 Deals</Nav.Link>
                    </Nav>
                </Container>
            </div>

            {/* Mobile Menu Offcanvas */}
            <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="start">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{settings?.siteName || 'AR ONE'}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {/* Mobile Search */}
                    <Form className="mb-4" onSubmit={(e) => { handleSearch(e); setShowMobileMenu(false); }}>
                        <Form.Control
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Form>

                    {/* Mobile Nav Links */}
                    <Nav className="flex-column mobile-nav">
                        {/* Main Sections */}
                        <div className="mb-3">
                            <h6 className="text-muted px-3 mb-2 small text-uppercase">Menu</h6>
                            <Nav.Link as={Link} to="/" onClick={() => setShowMobileMenu(false)}>Home</Nav.Link>
                            <Nav.Link as={Link} to="/categories" onClick={() => setShowMobileMenu(false)}>All Categories</Nav.Link>
                            <Nav.Link as={Link} to="/about" onClick={() => setShowMobileMenu(false)}>About Us</Nav.Link>
                            <Nav.Link as={Link} to="/contact" onClick={() => setShowMobileMenu(false)}>Contact Us</Nav.Link>
                            <Nav.Link as={Link} to="/faq" onClick={() => setShowMobileMenu(false)}>FAQs</Nav.Link>
                            <Nav.Link as={Link} to="/careers" onClick={() => setShowMobileMenu(false)}>Careers</Nav.Link>
                            <Nav.Link as={Link} to="/returns" onClick={() => setShowMobileMenu(false)}>Return & Refund Policy</Nav.Link>
                        </div>

                        <hr />

                        {/* Order Specific Categories */}
                        <div className="mb-3">
                            <h6 className="text-muted px-3 mb-2 small text-uppercase">Shop By Category</h6>
                            {categories.map((cat) => (
                                <Nav.Link
                                    key={cat.id}
                                    as={Link}
                                    to={`/categories/${cat.slug}`}
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    {cat.name}
                                </Nav.Link>
                            ))}
                            <Nav.Link as={Link} to="/deals" onClick={() => setShowMobileMenu(false)} className="text-danger fw-bold">🔥 Deals</Nav.Link>
                        </div>

                        <hr />

                        {currentUser ? (
                            <>
                                <h6 className="text-muted px-3 mb-2 small text-uppercase">Account</h6>
                                <Nav.Link as={Link} to="/account" onClick={() => setShowMobileMenu(false)}>My Account</Nav.Link>
                                <Nav.Link as={Link} to="/orders" onClick={() => setShowMobileMenu(false)}>My Orders</Nav.Link>
                                {isVendor() && (
                                    <Nav.Link as={Link} to="/vendor/dashboard" onClick={() => setShowMobileMenu(false)}>Vendor Dashboard</Nav.Link>
                                )}
                                {isAdmin() && (
                                    <Nav.Link as={Link} to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>Admin Panel</Nav.Link>
                                )}
                                <Nav.Link onClick={() => { handleLogout(); setShowMobileMenu(false); }}>Logout</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" onClick={() => setShowMobileMenu(false)}>Sign In</Nav.Link>
                                <Nav.Link as={Link} to="/register" onClick={() => setShowMobileMenu(false)}>Register</Nav.Link>
                                <Nav.Link as={Link} to="/vendor/register" onClick={() => setShowMobileMenu(false)}>Become a Seller</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default MainNavbar;

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Loader2,
    CheckCircle2,
    UtensilsCrossed,
    ShoppingBag,
    ShoppingCart,
    ArrowRight,
    AlertTriangle,
    Clock,
    Star,
    ChevronRight
} from 'lucide-react';
import { menuApi, cartApi, restaurantApi } from '../api/api';

const CATEGORIES = ['All', 'Starter', 'Main Course', 'Dessert', 'Drink', 'Sides'];

const Menu = () => {
    const { tableNumber } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Context Extraction
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const restaurantId = queryParams.get('restaurantId');

    // State Management
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [addingItemId, setAddingItemId] = useState(null);
    const [isCartLoading, setIsCartLoading] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        if (!restaurantId || !tableNumber) return;

        const initData = async () => {
            setLoading(true);
            try {
                const [resData, menuData] = await Promise.all([
                    restaurantApi.getById(restaurantId),
                    menuApi.getAll(restaurantId)
                ]);
                setRestaurant(resData.data.data);
                setMenuItems(menuData.data.data || []);
                await refreshCart();
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [restaurantId, tableNumber]);

    const refreshCart = async () => {
        if (!restaurantId || !tableNumber) return;
        try {
            const res = await cartApi.get(tableNumber, restaurantId);
            setCartItems(res.data.data?.items || []);
        } catch (err) {
            console.error("Cart refresh error:", err);
        }
    };

    const handleAddToCart = async (item) => {
        if (!item.isAvailable || addingItemId) return;

        console.log("Add to Cart Init:", {
            table: tableNumber,
            restaurant: restaurantId,
            item: item.name
        });

        setAddingItemId(item._id);
        setIsCartLoading(true);

        try {
            if (!tableNumber) {
                throw new Error("Invalid Table Number in your URL or Scanner.");
            }

            const payload = {
                tableNumber: tableNumber,
                restaurantId: restaurantId,
                menuItemId: item._id,
                quantity: 1
            };

            const response = await cartApi.add(payload);
            console.log("Add to Cart Success:", response.data);

            if (response.data.success) {
                await refreshCart();
                setTimeout(() => setAddingItemId(null), 1500);
            }
        } catch (err) {
            console.error("Add to Cart Error:", err);
            const msg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
            alert(msg);
            setAddingItemId(null);
        } finally {
            setIsCartLoading(false);
        }
    };

    // Filter Logic
    const displayedItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, activeCategory, searchQuery]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, curr) => acc + (curr.quantity * curr.menuItem.price), 0);
    }, [cartItems]);

    // Error Fallbacks
    if (!restaurantId) {
        return (
            <div className="landing" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="lp-container">
                    <AlertTriangle size={64} color="#7c3aed" style={{ marginBottom: '24px' }} />
                    <h2 className="lp-hero-title" style={{ fontSize: '2rem' }}>Oops! Missing Info</h2>
                    <p className="lp-hero-desc">We couldn't identify the restaurant. Please rescan the QR code on your table.</p>
                    <button className="lp-btn-primary" onClick={() => navigate('/')}>Return Home</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="landing" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" color="#7c3aed" />
                    <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Crafting your menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="landing menu-page-root" style={{ background: '#ffffff' }}>
            {/* Navbar — Exactly like Landing Page */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo" onClick={() => navigate('/')}>
                        <div className="lp-logo-icon">Q</div>
                        <span>QRder</span>
                    </div>
                    <div className="lp-nav-actions">
                        <div
                            onClick={() => navigate(`/cart/${tableNumber}?restaurantId=${restaurantId}`)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#7c3aed',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <ShoppingCart size={18} />
                            <span style={{ fontWeight: 800 }}>{cartItems.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(124, 58, 237, 0.08)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                            <ShoppingBag size={16} color="#7c3aed" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e' }}>Table {tableNumber}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section — Landing Page Vibe */}
            <header className="lp-hero" style={{ padding: '140px 0 60px' }}>
                <div className="lp-hero-gradient" />
                <div className="lp-container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="lp-label" style={{ marginBottom: '16px' }}>Welcome to</span>
                        <h1 className="lp-hero-title" style={{ marginBottom: '12px' }}>{restaurant?.name || 'Gourmet Dining'}</h1>
                        <p className="lp-hero-desc" style={{ marginBottom: '0', maxWidth: '100%' }}>
                            {restaurant?.address || 'Fresh ingredients, curated recipes, delivered to your table.'}
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Search & Categories */}
            <div className="sticky-controls" style={{ position: 'sticky', top: '68px', zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div className="lp-container">
                    {/* Search Bar */}
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                            <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search for your favorites..."
                                className="lp-input"
                                style={{ width: '100%', padding: '16px 16px 16px 56px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Scroll */}
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    padding: '10px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: activeCategory === cat ? '#7c3aed' : '#e2e8f0',
                                    background: activeCategory === cat ? '#7c3aed' : '#ffffff',
                                    color: activeCategory === cat ? '#ffffff' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <main className="lp-container" style={{ padding: '48px 24px 160px' }}>
                {displayedItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <UtensilsCrossed size={64} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#1a1a2e', fontSize: '1.25rem' }}>No items found</h3>
                        <p style={{ color: '#64748b' }}>Try adjusting your search or category.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {displayedItems.map((item, idx) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="lp-feature-card"
                                style={{ padding: '0', overflow: 'hidden', cursor: 'default' }}
                            >
                                <div style={{ height: '220px', background: '#f8fafc', position: 'relative' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UtensilsCrossed size={48} color="#e2e8f0" />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                                        {item.attributes?.isVeg && <span style={{ background: '#22c55e', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>VEG</span>}
                                        {item.attributes?.isSpicy && <span style={{ background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>SPICY</span>}
                                    </div>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: 700 }}>{item.name}</h3>
                                        <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.2rem' }}>₹{item.price}</span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>
                                        {item.description}
                                    </p>

                                    <button
                                        className={addingItemId === item._id ? 'lp-btn-outline' : 'lp-btn-primary'}
                                        style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px' }}
                                        onClick={() => handleAddToCart(item)}
                                        disabled={addingItemId === item._id || !item.isAvailable}
                                    >
                                        {!item.isAvailable ? (
                                            'Out of Stock'
                                        ) : addingItemId === item._id ? (
                                            <><CheckCircle2 size={18} /> Added to Tray</>
                                        ) : (
                                            <><Plus size={18} /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Cart Bar — Landing Page Premium Style */}
            <AnimatePresence>
                {cartItems.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: '32px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '500px',
                            zIndex: 1000,
                        }}
                    >
                        <div
                            className="lp-cta-card"
                            style={{
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                boxShadow: '0 20px 48px rgba(124, 58, 237, 0.4)'
                            }}
                            onClick={() => navigate(`/cart/${tableNumber}?restaurantId=${restaurantId}`)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: '#fff', color: '#7c3aed', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {cartItems.length}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>Review Tray</p>
                                    <p style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>₹{cartTotal.toFixed(2)} Total</p>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowRight size={20} color="#fff" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Menu;

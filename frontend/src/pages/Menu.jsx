import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Loader2,
    CheckCircle2,
    UtensilsCrossed,
    ShoppingCart,
    ArrowRight,
    ArrowLeft,
    AlertTriangle,
    Star,
    Heart,
    Home,
    User,
    History,
    SlidersHorizontal,
    Minus,
    X,
    Check,
    Clock
} from 'lucide-react';
import { menuApi, cartApi, restaurantApi } from '../api/api';
import '../styles/menu.css';

const Menu = () => {
    const _MOTION = motion;
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
    const [selectedAddOnsByItem, setSelectedAddOnsByItem] = useState({});
    const [activeTab, setActiveTab] = useState('home');
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailQty, setDetailQty] = useState(1);
    const [imageFrame, setImageFrame] = useState(0);
    const [detailImageIndex, setDetailImageIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);

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

    useEffect(() => {
        const timer = setInterval(() => {
            setImageFrame(prev => prev + 1);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setDetailImageIndex(0);
        setTouchStartX(null);
    }, [selectedItem?._id]);

    const refreshCart = async () => {
        if (!restaurantId || !tableNumber) return;
        try {
            const res = await cartApi.get(tableNumber, restaurantId);
            setCartItems(res.data.data?.items || []);
        } catch (err) {
            console.error("Cart refresh error:", err);
        }
    };

    const toggleAddOnSelection = (itemId, addOnName) => {
        setSelectedAddOnsByItem(prev => {
            const existing = prev[itemId] || [];
            const isSelected = existing.includes(addOnName);
            return {
                ...prev,
                [itemId]: isSelected
                    ? existing.filter(name => name !== addOnName)
                    : [...existing, addOnName]
            };
        });
    };

    const handleAddToCart = async (item, requestedQty = 1) => {
        if (!item.isAvailable || addingItemId) return;

        setAddingItemId(item._id);

        try {
            if (!tableNumber) {
                throw new Error("Invalid Table Number in your URL or Scanner.");
            }

            const parsedQty = Number(requestedQty);
            const payload = {
                tableNumber: tableNumber,
                restaurantId: restaurantId,
                menuItemId: item._id,
                quantity: Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1,
                addOns: (item.addOns || [])
                    .filter(addOn => addOn?.isAvailable !== false)
                    .filter(addOn => (selectedAddOnsByItem[item._id] || []).includes(addOn.name))
                    .map(addOn => ({ name: addOn.name }))
            };

            const response = await cartApi.add(payload);

            if (response.data.success) {
                await refreshCart();
                setSelectedAddOnsByItem(prev => ({ ...prev, [item._id]: [] }));
                setTimeout(() => setAddingItemId(null), 1500);
            }
        } catch (err) {
            console.error("Add to Cart Error:", err);
            const msg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
            alert(msg);
            setAddingItemId(null);
        }
    };

    // Filter Logic
    const displayedItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.size || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, activeCategory, searchQuery]);

    const categories = useMemo(() => {
        const dynamicCategories = menuItems
            .map(item => item.category)
            .filter(Boolean)
            .map(c => c.trim());
        return ['All', ...new Set(dynamicCategories)];
    }, [menuItems]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, curr) => {
            const base = Number(curr?.menuItem?.price) || 0;
            const addOnTotal = (curr?.addOns || []).reduce((sum, addOn) => sum + (Number(addOn?.price) || 0), 0);
            return acc + (curr.quantity * (base + addOnTotal));
        }, 0);
    }, [cartItems]);

    // Generate a random-ish rating for display
    const getRating = (item) => {
        const hash = item.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return (4.0 + (hash % 10) / 10).toFixed(1);
    };

    const getItemImages = (item) => {
        const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
        if (images.length > 0) return images;
        return item?.image ? [item.image] : [];
    };

    const goToNextDetailImage = (imagesLength) => {
        if (!imagesLength || imagesLength <= 1) return;
        setDetailImageIndex(prev => (prev + 1) % imagesLength);
    };

    const goToPrevDetailImage = (imagesLength) => {
        if (!imagesLength || imagesLength <= 1) return;
        setDetailImageIndex(prev => (prev - 1 + imagesLength) % imagesLength);
    };

    // Error Fallbacks
    if (!restaurantId) {
        return (
            <div className="menu-page-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ padding: '0 24px' }}>
                    <AlertTriangle size={64} color="#e63946" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px' }}>Oops! Missing Info</h2>
                    <p style={{ color: '#8b8b8b', marginBottom: '24px' }}>We couldn't identify the restaurant. Please rescan the QR code on your table.</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: '#e63946',
                            color: '#fff',
                            border: 'none',
                            padding: '14px 32px',
                            borderRadius: '14px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif'
                        }}
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="menu-page-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" color="#e63946" />
                    <p style={{ marginTop: '16px', color: '#8b8b8b', fontWeight: 600 }}>Crafting your menu...</p>
                </div>
            </div>
        );
    }

    const brandName = restaurant?.name || 'QRder';
    const menuUi = restaurant?.menuUi || {};
    const showRatings = menuUi.showRatings !== false;
    const showFavorites = menuUi.showFavorites !== false;
    const menuRootStyle = {
        '--menu-primary': menuUi.primaryColor || '#e63946',
        '--menu-primary-dark': menuUi.primaryColor || '#e63946',
        '--menu-primary-light': menuUi.primaryColor || '#e63946',
        '--menu-accent': menuUi.accentColor || '#f59e0b',
        '--menu-bg': menuUi.backgroundColor || '#fafafa',
        '--menu-card-radius': `${Number(menuUi.cardRadius) || 16}px`
    };

    return (
        <div className="menu-page-root" style={menuRootStyle}>
            {/* Brand Header — Foodgo Style */}
            <motion.div
                className="menu-brand-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="menu-brand-left">
                    <h1>{brandName}</h1>
                    <p>{menuUi.heroTagline || `Table #${tableNumber} — Order your favourite food!`}</p>
                </div>
                <div className="menu-brand-avatar">
                    {restaurant?.logo ? (
                        <img src={restaurant.logo} alt={brandName} />
                    ) : (
                        brandName.charAt(0)
                    )}
                </div>
            </motion.div>

            {/* Search Bar + Filter Button */}
            <motion.div
                className="menu-search-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="menu-search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="menu-filter-btn" aria-label="Filter">
                    <SlidersHorizontal size={20} />
                </button>
            </motion.div>

            {/* Category Pills */}
            <motion.div
                className="menu-categories-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <div className="menu-categories">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`menu-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Menu Grid */}
            <main className="menu-grid-container">
                <div className="menu-grid">
                    {displayedItems.length === 0 ? (
                        <div className="menu-empty">
                            <div className="menu-empty-icon">
                                <UtensilsCrossed size={36} color="#ddd" />
                            </div>
                            <h3>No items found</h3>
                            <p>Try adjusting your search or category.</p>
                        </div>
                    ) : (
                        displayedItems.map((item, idx) => {
                            const itemImages = getItemImages(item);
                            const primaryImage = itemImages.length > 0 ? itemImages[imageFrame % itemImages.length] : null;
                            const rating = getRating(item);
                            return (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04, duration: 0.35 }}
                                    className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}
                                    onClick={() => item.isAvailable && setSelectedItem(item)}
                                    style={{ cursor: item.isAvailable ? 'pointer' : 'default' }}
                                >
                                    {/* Image */}
                                    <div className="menu-card-image">
                                        {primaryImage ? (
                                            <img src={primaryImage} alt={item.name} loading="lazy" />
                                        ) : (
                                            <div className="menu-card-image-placeholder">
                                                <UtensilsCrossed size={36} />
                                            </div>
                                        )}
                                        {/* Badges */}
                                        <div className="menu-card-badges">
                                            {item.attributes?.isVeg && <span className="menu-badge menu-badge-veg">VEG</span>}
                                            {item.attributes?.isNonVeg && <span className="menu-badge menu-badge-nonveg">NON-VEG</span>}
                                            {item.attributes?.isSpicy && <span className="menu-badge menu-badge-spicy">SPICY</span>}
                                            {!item.isAvailable && <span className="menu-badge menu-badge-unavailable">SOLD OUT</span>}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="menu-card-body">
                                        <h3 className="menu-card-name">{item.name}</h3>
                                        <p className="menu-card-subtitle">{item.description}</p>

                                        {/* Price */}
                                        <div className="menu-card-price-tag">₹{Number(item.price).toFixed(0)}</div>

                                        {/* Rating & Heart */}
                                        {(showRatings || showFavorites) && (
                                            <div className="menu-card-footer">
                                                {showRatings ? (
                                                    <div className="menu-card-rating">
                                                        <Star size={14} className="star-icon" fill="#f59e0b" stroke="#f59e0b" />
                                                        <span>{rating}</span>
                                                    </div>
                                                ) : <div />}
                                                {showFavorites && (
                                                    <button
                                                        className="menu-card-heart"
                                                        aria-label="Favorite"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Heart size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* ===== Full-Screen Product Detail Page ===== */}
            <AnimatePresence>
                {selectedItem && (() => {
                    const item = selectedItem;
                    const itemImages = getItemImages(item);
                    const safeIndex = Math.min(detailImageIndex, Math.max(itemImages.length - 1, 0));
                    const primaryImage = itemImages.length > 0 ? itemImages[safeIndex] : null;
                    const hasAddOns = Array.isArray(item.addOns) && item.addOns.some(a => a?.isAvailable !== false);
                    const availableAddOns = (item.addOns || []).filter(a => a?.isAvailable !== false);
                    const isAdding = addingItemId === item._id;
                    const selectedAddOns = selectedAddOnsByItem[item._id] || [];
                    const addOnTotal = availableAddOns
                        .filter(a => selectedAddOns.includes(a.name))
                        .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
                    const itemTotal = (Number(item.price) + addOnTotal) * detailQty;

                    return (
                        <motion.div
                            className="product-detail-page"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        >
                            {/* Top Bar */}
                            <div className="pd-topbar">
                                <button
                                    className="fg-back-btn"
                                    onClick={() => { setSelectedItem(null); setDetailQty(1); }}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="fg-topbar-right">
                                    <Search size={20} />
                                </div>
                            </div>

                            {/* Product Image */}
                            <div
                                className="pd-image-section"
                                style={{ position: 'relative' }}
                                onTouchStart={(e) => setTouchStartX(e.changedTouches?.[0]?.clientX ?? null)}
                                onTouchEnd={(e) => {
                                    const endX = e.changedTouches?.[0]?.clientX;
                                    if (touchStartX === null || typeof endX !== 'number') return;
                                    const delta = endX - touchStartX;
                                    if (Math.abs(delta) < 35) return;
                                    if (delta < 0) goToNextDetailImage(itemImages.length);
                                    else goToPrevDetailImage(itemImages.length);
                                }}
                            >
                                {primaryImage ? (
                                    <img src={primaryImage} alt={item.name} />
                                ) : (
                                    <div className="pd-image-placeholder">
                                        <UtensilsCrossed size={56} color="#ddd" />
                                    </div>
                                )}
                                {itemImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Previous image"
                                            onClick={() => goToPrevDetailImage(itemImages.length)}
                                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.65)', color: '#fff', cursor: 'pointer', zIndex: 3 }}
                                        >
                                            {'<'}
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Next image"
                                            onClick={() => goToNextDetailImage(itemImages.length)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.65)', color: '#fff', cursor: 'pointer', zIndex: 3 }}
                                        >
                                            {'>'}
                                        </button>
                                        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 3, padding: '4px 8px', borderRadius: '999px', background: 'rgba(15,23,42,0.35)' }}>
                                            {itemImages.map((_, i) => (
                                                <button
                                                    key={`detail-dot-${i}`}
                                                    type="button"
                                                    aria-label={`Go to image ${i + 1}`}
                                                    onClick={() => setDetailImageIndex(i)}
                                                    style={{ width: '8px', height: '8px', borderRadius: '50%', border: i === safeIndex ? '1px solid #fff' : '1px solid rgba(255,255,255,0.6)', background: i === safeIndex ? '#ffffff' : 'rgba(255,255,255,0.45)', padding: 0, cursor: 'pointer' }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Product Body */}
                            <div className="pd-body">
                                <h1 className="pd-title">{item.name}</h1>

                                {/* Rating + Time */}
                                {showRatings && (
                                    <div className="pd-meta">
                                        <Star size={16} className="star" fill="#f59e0b" stroke="#f59e0b" />
                                        <span style={{ fontWeight: 700, color: '#1a1a2e' }}>{getRating(item)}</span>
                                        <span style={{ color: '#ccc' }}>—</span>
                                        <Clock size={14} />
                                        <span>20 mins</span>
                                    </div>
                                )}

                                {/* Description */}
                                <p className="pd-description">{item.description}</p>

                                {/* Badges */}
                                <div className="pd-badges">
                                    {item.attributes?.isVeg && <span className="pd-badge veg">VEG</span>}
                                    {item.attributes?.isNonVeg && <span className="pd-badge nonveg">NON-VEG</span>}
                                    {item.attributes?.isSpicy && <span className="pd-badge spicy">🌶 SPICY</span>}
                                    {item.size && <span className="pd-badge size">{item.size}</span>}
                                    {(item.mrp != null && Number(item.mrp) > Number(item.price)) && (
                                        <span className="pd-badge" style={{ background: 'rgba(22,163,106,0.08)', color: '#16a34a' }}>
                                            {Math.round(((Number(item.mrp) - Number(item.price)) / Number(item.mrp)) * 100)}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* Portion / Quantity Control */}
                                <div className="pd-controls-row">
                                    <div className="pd-control-group">
                                        <span className="pd-control-label">Portion</span>
                                        <div className="pd-qty-row">
                                            <button
                                                className="pd-qty-btn minus"
                                                onClick={() => setDetailQty(q => Math.max(1, q - 1))}
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="pd-qty-value">{detailQty}</span>
                                            <button
                                                className="pd-qty-btn plus"
                                                onClick={() => setDetailQty(q => q + 1)}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Add-ons — Horizontal Scrollable Cards (like Toppings) */}
                                {hasAddOns && (
                                    <div className="pd-addons-section">
                                        <h3 className="pd-addons-title">Customize</h3>
                                        <div className="pd-addons-grid">
                                            {availableAddOns.map((addOn, i) => {
                                                const isSelected = selectedAddOns.includes(addOn.name);
                                                return (
                                                    <div
                                                        key={`pd-addon-${i}`}
                                                        className={`pd-addon-card ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleAddOnSelection(item._id, addOn.name)}
                                                    >
                                                        {isSelected && (
                                                            <div className="pd-addon-check">
                                                                <Check size={12} />
                                                            </div>
                                                        )}
                                                        <div className="addon-icon">🍽</div>
                                                        <div className="addon-name">{addOn.name}</div>
                                                        <div className="addon-price">+₹{Number(addOn.price || 0).toFixed(0)}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Order Bar */}
                            <div className="pd-order-bar">
                                <div className="pd-price-display">
                                    ₹{itemTotal.toFixed(0)}
                                </div>
                                <button
                                    className={`pd-order-btn ${isAdding ? 'success' : ''}`}
                                    onClick={async () => {
                                        await handleAddToCart(item, detailQty);
                                    }}
                                    disabled={isAdding}
                                >
                                    {isAdding ? 'Added!' : 'Add to Cart'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Floating Cart Bar */}
            <AnimatePresence>
                {cartItems.length > 0 && (
                    <motion.div
                        className="menu-cart-bar"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                    >
                        <div
                            className="menu-cart-bar-inner"
                            onClick={() => navigate(`/cart/${tableNumber}?restaurantId=${restaurantId}`)}
                        >
                            <div className="menu-cart-left">
                                <div className="menu-cart-count">{cartItems.length}</div>
                                <div className="menu-cart-info">
                                    <span className="label">Review Order</span>
                                    <span className="total">₹{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="menu-cart-arrow">
                                <ArrowRight size={20} color="#fff" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Tab Bar */}
            <div className="menu-bottom-bar">
                <button
                    className={`menu-tab-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('home'); }}
                >
                    <Home size={22} />
                    <span>Menu</span>
                </button>
                <button
                    className={`menu-tab-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('history');
                        navigate(`/history/${tableNumber}?restaurantId=${restaurantId}`);
                    }}
                >
                    <History size={22} />
                    <span>Orders</span>
                </button>
            </div>

            {/* Floating + Button (center of bottom bar) — only when cart is empty */}
            {cartItems.length === 0 && (
                <motion.button
                    className="menu-fab"
                    onClick={() => navigate(`/cart/${tableNumber}?restaurantId=${restaurantId}`)}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0, x: '-50%' }}
                    animate={{ scale: 1, x: '-50%' }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                >
                    <ShoppingCart size={24} />
                </motion.button>
            )}
        </div>
    );
};

export default Menu;

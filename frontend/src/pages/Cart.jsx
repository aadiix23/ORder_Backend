import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft, Loader2, Minus, Plus, CreditCard, UtensilsCrossed, CheckCircle } from 'lucide-react';
import { cartApi, orderApi } from '../api/api';

const Cart = () => {
    const { tableNumber } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const restaurantId = queryParams.get('restaurantId');

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (restaurantId) fetchCart();
    }, [tableNumber, restaurantId]);

    const fetchCart = async () => {
        if (!restaurantId || !tableNumber) return;
        setLoading(true);
        console.log("Fetching Cart for TrayReview:", tableNumber, restaurantId);
        try {
            const res = await cartApi.get(tableNumber, restaurantId);
            console.log("Cart fetched:", res.data.data);
            setCart(res.data.data);
        } catch (err) {
            console.error("Cart fetch error:", err);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (menuItemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;
        try {
            await cartApi.update({
                tableNumber: tableNumber,
                restaurantId,
                menuItemId,
                quantity: newQty
            });
            fetchCart();
        } catch (err) {
            console.error('Update Qty Error:', err);
        }
    };

    const removeItem = async (menuItemId) => {
        try {
            await cartApi.remove({
                tableNumber: tableNumber,
                restaurantId,
                menuItemId
            });
            fetchCart();
        } catch (err) {
            console.error('Remove Item Error:', err);
        }
    };

    const handlePlaceOrder = async () => {
        if (!restaurantId || !tableNumber) {
            alert('Missing context. Please scan the QR code again.');
            return;
        }

        if (!tableNumber) {
            alert('Invalid table number.');
            return;
        }

        setPlacingOrder(true);
        try {
            await orderApi.place({
                tableNumber: tableNumber,
                restaurantId
            });
            setOrderSuccess(true);
            setTimeout(() => {
                navigate(`/menu/${tableNumber}?restaurantId=${restaurantId}`);
            }, 3000);
        } catch (err) {
            console.error('Order Placement Error:', err);
            alert(err.response?.data?.message || 'Error placing order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return (
        <div className="db-panel db-state" style={{ height: '100vh', background: 'var(--bg-dark)' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary)" />
            <p>Loading your tray...</p>
        </div>
    );

    if (orderSuccess) return (
        <div className="db-panel db-state" style={{ height: '100vh', background: 'var(--bg-dark)' }}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass"
                style={{ padding: '60px', textAlign: 'center' }}
            >
                <div style={{ backgroundColor: '#22c55e', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={48} color="white" />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Order Placed!</h1>
                <p style={{ color: 'var(--text-muted)' }}>The chef is starting on your delicious meal.</p>
                <div style={{ marginTop: '30px', color: '#fbbf24', fontWeight: 'bold' }}>
                    Redirecting to menu...
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="cart-page fade-in">
            <nav className="cart-nav">
                <div className="menu-nav-inner">
                    <div className="menu-logo" onClick={() => navigate('/')}>
                        <div className="menu-logo-icon">Q</div>
                        <span>QRder</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(124, 58, 237, 0.1)', padding: '6px 14px', borderRadius: '50px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                        <ShoppingBag size={14} color="#7c3aed" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Tray Review</span>
                    </div>
                </div>
            </nav>

            <header className="cart-header">
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '12px', minWidth: 'auto', borderRadius: '14px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Finalize <span>Order</span></h1>
            </header>

            {!cart || !cart?.items?.length ? (
                <div className="glass" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <ShoppingBag size={80} color="rgba(255,255,255,0.05)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Your tray is empty</h2>
                    <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.3)' }}>Add some delicious items from the menu to get started.</p>
                    <button
                        onClick={() => navigate(`/menu/${tableNumber}?restaurantId=${restaurantId}`)}
                        className="btn btn-primary"
                        style={{ marginTop: '40px', padding: '15px 40px' }}
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-grid">
                        <AnimatePresence>
                            {cart.items.map(item => (
                                <motion.div
                                    key={item.menuItem._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass cart-card"
                                >
                                    {item.menuItem && (
                                        <>
                                            {item.menuItem.image ? (
                                                <img src={item.menuItem.image} alt={item.menuItem.name} className="cart-item-img" />
                                            ) : (
                                                <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <UtensilsCrossed size={32} color="rgba(0,0,0,0.1)" />
                                                </div>
                                            )}

                                            <div className="cart-item-info">
                                                <h3>{item.menuItem.name}</h3>
                                                <p>₹{item.menuItem.price}</p>
                                            </div>

                                            <div className="cart-qty-wrap">
                                                <button className="qty-btn" onClick={() => updateQuantity(item.menuItem._id, item.quantity, -1)}>
                                                    <Minus size={18} />
                                                </button>
                                                <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center', color: '#1a1a2e' }}>{item.quantity}</span>
                                                <button className="qty-btn" onClick={() => updateQuantity(item.menuItem._id, item.quantity, 1)}>
                                                    <Plus size={18} />
                                                </button>
                                            </div>

                                            <button className="cart-remove-btn" onClick={() => removeItem(item.menuItem._id)}>
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <footer className="cart-footer">
                        <div className="summary-row">
                            <span>Table Number</span>
                            <span style={{ color: '#1a1a2e', fontWeight: 'bold' }}>#{tableNumber}</span>
                        </div>
                        <div className="summary-row">
                            <span>Total Items</span>
                            <span style={{ color: '#1a1a2e', fontWeight: 'bold' }}>{cart.items.length}</span>
                        </div>
                        <div className="summary-total">
                            <span>To Pay</span>
                            <span style={{ color: '#fbbf24' }}>₹{cart.totalPrice?.toFixed(2)}</span>
                        </div>

                        <button
                            className="btn btn-primary place-order-btn"
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                        >
                            {placingOrder ? (
                                <><Loader2 size={24} className="animate-spin" /> Processing...</>
                            ) : (
                                <><CreditCard size={24} /> Place Order</>
                            )}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                            By placing this order, you agree to the restaurant's terms of service.
                        </p>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Cart;

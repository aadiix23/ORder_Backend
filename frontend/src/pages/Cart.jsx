import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    ShoppingBag,
    ArrowLeft,
    Loader2,
    Minus,
    Plus,
    CheckCircle,
    UtensilsCrossed,
    Search,
    Clock
} from 'lucide-react';
import { cartApi, orderApi } from '../api/api';
import '../styles/cart.css';

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
    const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
    const [paymentStep, setPaymentStep] = useState('choose');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('qrderCustomerName');
        const storedPhone = localStorage.getItem('qrderCustomerPhone');
        if (storedName) setCustomerName(storedName);
        if (storedPhone) setCustomerPhone(storedPhone);
    }, []);

    useEffect(() => {
        if (restaurantId) fetchCart();
    }, [tableNumber, restaurantId]);

    const fetchCart = async () => {
        if (!restaurantId || !tableNumber) return;
        setLoading(true);
        try {
            const res = await cartApi.get(tableNumber, restaurantId);
            setCart(res.data.data);
        } catch (err) {
            console.error("Cart fetch error:", err);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, menuItemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;
        try {
            await cartApi.update({
                tableNumber,
                restaurantId,
                cartItemId,
                menuItemId,
                quantity: newQty
            });
            fetchCart();
        } catch (err) {
            console.error('Update Qty Error:', err);
        }
    };

    const removeItem = async (cartItemId, menuItemId) => {
        try {
            await cartApi.remove({
                tableNumber,
                restaurantId,
                cartItemId,
                menuItemId
            });
            fetchCart();
        } catch (err) {
            console.error('Remove Item Error:', err);
        }
    };

    const handlePlaceOrder = async (paymentMethod = 'counter') => {
        if (!restaurantId || !tableNumber) {
            alert('Missing context. Please scan the QR code again.');
            return;
        }

        setPlacingOrder(true);
        try {
            await orderApi.place({
                tableNumber,
                restaurantId,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                paymentMethod
            });

            if (customerName) localStorage.setItem('qrderCustomerName', customerName);
            if (customerPhone) localStorage.setItem('qrderCustomerPhone', customerPhone);

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

    // Compute totals for detailed bill preview
    const itemBaseTotal = cart?.items?.reduce((acc, item) => {
        const base = Number(item?.menuItem?.price) || 0;
        return acc + (item.quantity * base);
    }, 0) || 0;

    const addOnsTotal = cart?.items?.reduce((acc, item) => {
        const addOnTotal = (item?.addOns || []).reduce((sum, a) => sum + (Number(a?.price) || 0), 0);
        return acc + (item.quantity * addOnTotal);
    }, 0) || 0;

    const mrpTotal = cart?.items?.reduce((acc, item) => {
        const base = Number(item?.menuItem?.price) || 0;
        const mrp = Number(item?.menuItem?.mrp);
        const effectiveMrp = Number.isFinite(mrp) && mrp > base ? mrp : base;
        return acc + (item.quantity * effectiveMrp);
    }, 0) || 0;

    const subtotal = itemBaseTotal + addOnsTotal;
    const totalSavings = Math.max(mrpTotal - itemBaseTotal, 0);
    const taxPercent = Number(cart?.billingSettings?.taxPercent) || 0;
    const otherCharges = Number(cart?.billingSettings?.otherCharges) || 0;
    const otherChargesLabel = cart?.billingSettings?.otherChargesLabel || 'Other Charges';
    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount + otherCharges;

    const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const paymentQrCode = cart?.paymentQrCode || '';

    // Loading
    if (loading) return (
        <div className="cart-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 size={42} className="animate-spin" color="#e63946" />
                <p style={{ marginTop: '16px', color: '#999', fontWeight: 600 }}>Loading your order...</p>
            </div>
        </div>
    );

    // Order Success
    if (orderSuccess) return (
        <motion.div
            className="order-success-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="success-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <CheckCircle size={48} color="white" />
            </motion.div>
            <h1>Order Placed!</h1>
            <p>The chef is starting on your delicious meal.</p>
            <p>Table #{tableNumber}</p>
            <div className="redirect-text">Redirecting to menu...</div>
        </motion.div>
    );

    return (
        <div className="cart-page">
            {/* Top Bar */}
            <div className="fg-topbar">
                <button className="fg-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <span className="fg-topbar-title">Your Cart</span>
                <div className="fg-topbar-right">
                    <ShoppingBag size={20} />
                </div>
            </div>

            {!cart || !cart?.items?.length ? (
                /* Empty Cart */
                <div className="cart-empty-state">
                    <div className="cart-empty-icon">
                        <ShoppingBag size={40} color="#ddd" />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items from the menu to get started.</p>
                    <button
                        className="cart-browse-btn"
                        onClick={() => navigate(`/menu/${tableNumber}?restaurantId=${restaurantId}`)}
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <>
                    {/* Cart Items */}
                    <div className="cart-items-list">
                        <AnimatePresence>
                            {cart.items.map(item => {
                                const img = (item.menuItem?.images?.[0]) || item.menuItem?.image;
                                const base = Number(item.menuItem?.price) || 0;
                                const addOnTotal = (item.addOns || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
                                const lineTotal = item.quantity * (base + addOnTotal);

                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="cart-item-card"
                                    >
                                        {item.menuItem && (
                                            <>
                                                {img ? (
                                                    <img src={img} alt={item.menuItem.name} className="cart-item-img" />
                                                ) : (
                                                    <div className="cart-item-img-placeholder">
                                                        <UtensilsCrossed size={24} color="#ddd" />
                                                    </div>
                                                )}

                                                <div className="cart-item-details">
                                                    <p className="cart-item-name">{item.menuItem.name}</p>
                                                    {(item.addOns || []).length > 0 && (
                                                        <p className="cart-item-addons-text">
                                                            + {item.addOns.map(a => a.name).join(', ')}
                                                        </p>
                                                    )}
                                                    <p className="cart-item-price">₹{lineTotal.toFixed(0)}</p>
                                                </div>

                                                <div className="cart-qty-controls">
                                                    <button
                                                        className="cart-qty-btn minus"
                                                        onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity, -1)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="cart-qty-value">{item.quantity}</span>
                                                    <button
                                                        className="cart-qty-btn plus"
                                                        onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity, 1)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                <button
                                                    className="cart-remove-btn"
                                                    onClick={() => removeItem(item._id, item.menuItem._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Order summary</h3>
                        <div className="summary-line">
                            <span className="label">Order ({totalItems} items)</span>
                            <span className="value">₹{subtotal.toFixed(0)}</span>
                        </div>
                        <div className="summary-line">
                            <span className="label">Table</span>
                            <span className="value">#{tableNumber}</span>
                        </div>
                        <hr className="summary-divider" />
                        <h4 className="summary-subtitle">Bill details</h4>
                        {(cart.items || []).map((item) => {
                            const base = Number(item?.menuItem?.price) || 0;
                            const addOnTotal = (item?.addOns || []).reduce((sum, a) => sum + (Number(a?.price) || 0), 0);
                            const unitPrice = base + addOnTotal;
                            const lineTotal = unitPrice * item.quantity;
                            return (
                                <div className="summary-line summary-item-line" key={`bill-item-${item._id}`}>
                                    <span className="label">
                                        {item.quantity} x {item?.menuItem?.name || 'Item'}
                                    </span>
                                    <span className="value">₹{lineTotal.toFixed(0)}</span>
                                </div>
                            );
                        })}
                        <div className="summary-line">
                            <span className="label">Add-ons</span>
                            <span className="value">₹{addOnsTotal.toFixed(0)}</span>
                        </div>
                        {totalSavings > 0 && (
                            <div className="summary-line summary-line-positive">
                                <span className="label">Savings</span>
                                <span className="value">-₹{totalSavings.toFixed(0)}</span>
                            </div>
                        )}
                        <div className="summary-line summary-line-muted">
                            <span className="label">Tax {taxPercent > 0 ? `(${taxPercent.toFixed(2)}%)` : ''}</span>
                            <span className="value">₹{taxAmount.toFixed(0)}</span>
                        </div>
                        <div className="summary-line summary-line-muted">
                            <span className="label">{otherChargesLabel}</span>
                            <span className="value">₹{otherCharges.toFixed(0)}</span>
                        </div>
                        <hr className="summary-divider" />
                        <div className="summary-total-line">
                            <span className="label">Total:</span>
                            <span className="value">₹{grandTotal.toFixed(0)}</span>
                        </div>
                        <div className="summary-delivery-time">
                            <span>Estimated preparation:</span>
                            <span>15 - 30 mins</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="customer-info-section">
                        <h3>Your details</h3>
                        <input
                            type="text"
                            className="fg-input"
                            placeholder="Your Name (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <input
                            type="tel"
                            className="fg-input"
                            placeholder="Phone Number (For Re-Ordering)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    {/* Spacer for bottom bar */}
                    <div style={{ height: '100px' }} />

                    {/* Bottom Order Bar */}
                    <div className="cart-order-bar">
                        <div className="cart-order-price">
                            <div className="total-label">Total price</div>
                            <div className="total-value">₹{grandTotal.toFixed(0)}</div>
                        </div>
                        <button
                            className="cart-order-btn"
                            onClick={() => {
                                setShowPaymentPrompt(true);
                                setPaymentStep('choose');
                            }}
                            disabled={placingOrder}
                        >
                            {placingOrder ? (
                                <><Loader2 size={20} className="animate-spin" /> Processing...</>
                            ) : (
                                'ORDER NOW'
                            )}
                        </button>
                    </div>
                </>
            )}

            <AnimatePresence>
                {showPaymentPrompt && (
                    <motion.div
                        className="payment-sheet-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !placingOrder && setShowPaymentPrompt(false)}
                    >
                        <motion.div
                            className="payment-sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sheet-handle" />

                            {paymentStep === 'choose' ? (
                                <>
                                    <h3>Choose Payment Option</h3>
                                    <p>Do you want to pay at the counter or pay online by scanning QR code?</p>
                                    <div className="payment-sheet-actions">
                                        <button
                                            className="lp-btn-outline"
                                            type="button"
                                            disabled={placingOrder}
                                            onClick={() => {
                                                setShowPaymentPrompt(false);
                                                handlePlaceOrder('counter');
                                            }}
                                        >
                                            Pay At Counter
                                        </button>
                                        <button
                                            className="lp-btn-primary"
                                            type="button"
                                            disabled={placingOrder}
                                            onClick={() => setPaymentStep('online')}
                                        >
                                            Pay Online
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>Pay Online</h3>
                                    <p>Scan this QR code to pay, then confirm to place your order.</p>

                                    <div className="payment-qr-container">
                                        {paymentQrCode ? (
                                            <img
                                                src={paymentQrCode}
                                                alt="Payment QR Code"
                                                style={{
                                                    width: '200px',
                                                    height: '200px',
                                                    objectFit: 'contain',
                                                    borderRadius: '16px',
                                                    border: '1px solid #f0f0f0'
                                                }}
                                            />
                                        ) : (
                                            <p style={{ color: '#e63946', fontWeight: 600 }}>
                                                Payment QR code is not available. Please pay at counter.
                                            </p>
                                        )}
                                    </div>

                                    <div className="payment-sheet-actions">
                                        <button
                                            className="lp-btn-outline"
                                            type="button"
                                            disabled={placingOrder}
                                            onClick={() => setPaymentStep('choose')}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className="lp-btn-primary"
                                            type="button"
                                            disabled={placingOrder || !paymentQrCode}
                                            onClick={() => {
                                                setShowPaymentPrompt(false);
                                                handlePlaceOrder('online');
                                            }}
                                        >
                                            I've Paid, Place Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Cart;

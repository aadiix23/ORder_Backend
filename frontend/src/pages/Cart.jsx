import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowLeft, Loader2, Minus, Plus } from 'lucide-react';
import { cartApi } from '../api/api';

const Cart = () => {
    const { tableNumber } = useParams();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, [tableNumber]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await cartApi.get(tableNumber);
            setCart(res.data.data);
        } catch (err) {
            console.error(err);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (menuItemId, newQty) => {
        if (newQty < 1) return;
        try {
            await cartApi.update({
                tableNumber: parseInt(tableNumber),
                menuItemId,
                quantity: newQty
            });
            fetchCart();
        } catch (err) {
            alert('Error updating quantity');
        }
    };

    const removeItem = async (menuItemId) => {
        try {
            await cartApi.remove({
                tableNumber: parseInt(tableNumber),
                menuItemId
            });
            fetchCart();
        } catch (err) {
            alert('Error removing item');
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Clear all items from your cart?')) return;
        try {
            await cartApi.clear(tableNumber);
            setCart(null);
        } catch (err) {
            alert('Error clearing cart');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary)" />
        </div>
    );

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '2.5rem' }}>Your <span style={{ color: 'var(--primary)' }}>Order</span></h1>
            </div>

            {!cart || cart.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <ShoppingBag size={80} color="var(--glass-border)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Your cart is empty</h2>
                    <button onClick={() => navigate(`/menu/${tableNumber}`)} className="btn btn-primary" style={{ marginTop: '30px' }}>
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <AnimatePresence>
                            {cart.items.map(item => (
                                <motion.div
                                    key={item.menuItem._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="glass"
                                    style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                                            {item.menuItem.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem' }}>{item.menuItem.name}</h3>
                                            <p style={{ color: 'var(--primary)', fontWeight: '600' }}>${item.menuItem.price}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '10px' }}>
                                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={18} /></button>
                                            <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={18} /></button>
                                        </div>
                                        <button onClick={() => removeItem(item.menuItem._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button onClick={clearCart} style={{ alignSelf: 'start', color: '#ef4444', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px' }}>
                            <Trash2 size={18} /> Clear Entire Cart
                        </button>
                    </div>

                    <div className="glass" style={{ padding: '30px', position: 'sticky', top: '120px' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>Summary</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Table</span>
                                <span>#{tableNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Items</span>
                                <span>{cart.items.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '700', marginTop: '10px' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>${cart.totalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>
                            Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;

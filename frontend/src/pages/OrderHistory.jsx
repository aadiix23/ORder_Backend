import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, History, AlertTriangle, AlertCircle } from 'lucide-react';
import { orderApi } from '../api/api';

const OrderHistory = () => {
    const { tableNumber } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const restaurantId = queryParams.get('restaurantId');
    const customerPhone = localStorage.getItem('qrderCustomerPhone');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [phoneInput, setPhoneInput] = useState(customerPhone || '');
    const [hasAttempted, setHasAttempted] = useState(false);

    useEffect(() => {
        if (restaurantId && customerPhone && !hasAttempted) {
            fetchHistory(customerPhone);
            setHasAttempted(true);
        } else if (!customerPhone) {
            setLoading(false);
        }
    }, [restaurantId]);

    const fetchHistory = async (phoneToSearch) => {
        if (!phoneToSearch) return;
        setLoading(true);
        setError('');
        try {
            const res = await orderApi.getHistory(phoneToSearch, restaurantId);
            setOrders(res.data.data || []);
            localStorage.setItem('qrderCustomerPhone', phoneToSearch);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHistory(phoneInput);
    };

    return (
        <div className="cart-page fade-in">
            <nav className="cart-nav">
                <div className="menu-nav-inner">
                    <div className="menu-logo" onClick={() => navigate('/')}>
                        <div className="menu-logo-icon">Q</div>
                        <span>QRder</span>
                    </div>
                </div>
            </nav>

            <header className="cart-header" style={{ marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '12px', minWidth: 'auto', borderRadius: '14px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Order <span>History</span></h1>
            </header>

            <div className="cart-container" style={{ display: 'block', maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '0 20px' }}>
                    <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Enter phone number to view history..."
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', borderRadius: '12px' }}>
                        Search
                    </button>
                </form>

                {loading ? (
                    <div className="db-panel db-state" style={{ height: '50vh', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <Loader2 size={42} className="animate-spin" color="var(--primary)" />
                    </div>
                ) : error ? (
                    <div className="db-panel db-state" style={{ height: '50vh', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <AlertCircle size={42} color="#ef4444" />
                        <p style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="db-panel db-state" style={{ height: '50vh', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <History size={60} color="rgba(0,0,0,0.1)" />
                        <p style={{ color: '#64748b' }}>No orders found for this number.</p>
                    </div>
                ) : (
                    <div className="cart-grid" style={{ padding: '0 20px 40px' }}>
                        {orders.map((order, i) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass cart-card"
                                style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: '99px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        background: (order.status || 'Pending') === 'Completed' ? 'rgba(5, 150, 105, 0.1)' :
                                            (order.status || 'Pending') === 'Cancelled' ? 'rgba(220, 38, 38, 0.1)' :
                                                (order.status || 'Pending') === 'Preparing' ? 'rgba(217, 119, 6, 0.1)' :
                                                    (order.status || 'Pending') === 'Ready' ? 'rgba(37, 99, 235, 0.1)' :
                                                        (order.status || 'Pending') === 'Served' ? 'rgba(13, 148, 136, 0.1)' :
                                                            'rgba(124, 58, 237, 0.1)',
                                        color: (order.status || 'Pending') === 'Completed' ? '#059669' :
                                            (order.status || 'Pending') === 'Cancelled' ? '#dc2626' :
                                                (order.status || 'Pending') === 'Preparing' ? '#d97706' :
                                                    (order.status || 'Pending') === 'Ready' ? '#2563eb' :
                                                        (order.status || 'Pending') === 'Served' ? '#0d9488' : '#7c3aed'
                                    }}>
                                        {order.status || 'Pending'}
                                    </div>
                                </div>
                                <div style={{ width: '100%' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                                            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{item.quantity}x {item.menuItem?.name || 'Item deleted'}</span>
                                            <span style={{ color: '#475569' }}>₹{(item.priceAtOrderTime * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
                                    <strong style={{ fontSize: '1.2rem', color: '#1a1a2e' }}>Total</strong>
                                    <strong style={{ fontSize: '1.2rem', color: '#7c3aed' }}>₹{order.totalPrice?.toFixed(2)}</strong>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;

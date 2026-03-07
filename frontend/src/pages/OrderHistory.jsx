import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Loader2,
    History,
    AlertCircle,
    Search
} from 'lucide-react';
import { orderApi } from '../api/api';
import '../styles/cart.css';

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

    const getStatusClass = (status) => {
        const s = (status || 'Pending').toLowerCase();
        if (s === 'completed') return 'completed';
        if (s === 'cancelled') return 'cancelled';
        if (s === 'preparing') return 'preparing';
        if (s === 'ready') return 'ready';
        if (s === 'served') return 'served';
        return 'pending';
    };

    return (
        <div className="history-page">
            {/* Top Bar */}
            <div className="fg-topbar">
                <button className="fg-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <span className="fg-topbar-title">Order History</span>
                <div className="fg-topbar-right">
                    <History size={20} />
                </div>
            </div>

            {/* Phone Search */}
            <form className="history-search-form" onSubmit={handleSearch}>
                <input
                    type="tel"
                    className="fg-input"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter phone number..."
                    required
                    style={{ marginBottom: 0 }}
                />
                <button type="submit" className="history-search-btn">
                    Search
                </button>
            </form>

            {/* Content */}
            {loading ? (
                <div className="history-empty-state">
                    <Loader2 size={42} className="animate-spin" color="#e63946" />
                </div>
            ) : error ? (
                <div className="history-empty-state">
                    <AlertCircle size={42} color="#ef4444" style={{ marginBottom: '12px' }} />
                    <p style={{ color: '#ef4444' }}>{error}</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="history-empty-state">
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <History size={36} color="#ddd" />
                    </div>
                    <p>No orders found for this number.</p>
                </div>
            ) : (
                <div className="history-list">
                    {orders.map((order, i) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="history-card"
                        >
                            <div className="history-card-top">
                                <span className="history-date">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className={`history-status ${getStatusClass(order.status)}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>

                            <div className="history-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="history-item-row">
                                        <span className="name">
                                            {item.quantity}x {item.menuItem?.name || 'Item deleted'}
                                        </span>
                                        <span className="price">
                                            ₹{(item.priceAtOrderTime * item.quantity).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="history-total-row">
                                <span className="label">Total</span>
                                <span className="value">₹{order.totalPrice?.toFixed(0)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;

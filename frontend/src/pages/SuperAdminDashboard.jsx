import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Store, Users, LogOut, RefreshCw,
    Shield, Loader2, IndianRupee, ShoppingBag, TrendingUp, AlertCircle,
    ArrowLeft, Phone, MapPin, Link2, UtensilsCrossed, BadgeCheck, BadgeX,
    ClipboardList
} from 'lucide-react';
import { superadminApi } from '../api/api';
import '../styles/superadmin.css';

// ─── Route Guard ──────────────────────────────────────────────────────────────
const useSAGuard = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('sa_token');
        const role = localStorage.getItem('sa_role');
        if (!token || role !== 'superadmin') navigate('/superadmin');
    }, [navigate]);
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: Store },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
];

const Sidebar = ({ active, setActive, onLogout }) => (
    <aside className="sa-sidebar">
        <div>
            <div className="sa-brand">
                <div className="sa-brand-icon">
                    <Shield size={20} />
                </div>
                <div>
                    <div className="sa-brand-name">QRder SA</div>
                    <div className="sa-brand-sub">Super Admin</div>
                </div>
            </div>

            <nav className="sa-nav">
                <span className="sa-nav-section-label">Control Center</span>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`sa-nav-btn ${active === tab.id ? 'active' : ''}`}
                        onClick={() => setActive(tab.id)}
                    >
                        {React.createElement(tab.icon, { size: 17 })}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="sa-sidebar-footer">
            <button className="sa-logout-btn" onClick={onLogout}>
                <LogOut size={16} /> Sign Out
            </button>
        </div>
    </aside>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await superadminApi.getStats();
            setStats(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load stats.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const CARDS = stats ? [
        {
            label: 'Total Restaurants', value: stats.totalRestaurants,
            icon: Store, color: 'indigo', sub: 'Registered on platform'
        },
        {
            label: 'Total Users', value: stats.totalUsers,
            icon: Users, color: 'green', sub: 'Admins & Chefs'
        },
        {
            label: 'Total Orders', value: stats.totalOrders,
            icon: ShoppingBag, color: 'amber', sub: 'All time'
        },
        {
            label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: IndianRupee, color: 'rose', sub: 'Across all restaurants'
        },
    ] : [];

    return (
        <div className="sa-animate">
            <div className="sa-topbar">
                <div>
                    <h1>Platform Overview</h1>
                    <p>High-level metrics across all restaurants and users.</p>
                </div>
                <div className="sa-topbar-right">
                    <button className="sa-btn sa-btn-ghost" onClick={fetchStats} disabled={loading}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="sa-state">
                    <Loader2 size={36} color="#6366f1" className="animate-spin" />
                    <p>Loading platform stats…</p>
                </div>
            ) : error ? (
                <div className="sa-state">
                    <AlertCircle size={32} color="#f87171" />
                    <p style={{ color: '#f87171' }}>{error}</p>
                </div>
            ) : (
                <>
                    <div className="sa-stats-grid">
                        {CARDS.map((card) => (
                            <div key={card.label} className={`sa-stat-card ${card.color}`}>
                                <div className={`sa-stat-icon ${card.color}`}>
                                    {React.createElement(card.icon, { size: 19 })}
                                </div>
                                <div>
                                    <div className="sa-stat-label">{card.label}</div>
                                    <div className="sa-stat-value">{card.value}</div>
                                    <div className="sa-stat-sub">{card.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sa-panel">
                        <div className="sa-panel-header">
                            <div>
                                <div className="sa-panel-title">Welcome, Super Admin 👋</div>
                                <div className="sa-panel-sub">Use the sidebar to navigate and manage the platform.</div>
                            </div>
                            <TrendingUp size={20} color="#6366f1" />
                        </div>
                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {[
                                { label: '🏪 Restaurants', desc: 'View, inspect and delete registered restaurants.' },
                                { label: '👤 Users', desc: 'Manage admin and chef accounts across the platform.' },
                                { label: '📦 Orders', desc: 'Coming soon — cross-platform order feed.' },
                                { label: '💳 Plans', desc: 'Coming soon — subscription management.' },
                            ].map(({ label, desc }) => (
                                <div key={label} style={{
                                    background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)',
                                    borderRadius: '12px', padding: '16px'
                                }}>
                                    <div style={{ fontWeight: 700, color: '#c7d2fe', marginBottom: '6px', fontSize: '0.95rem' }}>{label}</div>
                                    <div className="sa-text-muted">{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Restaurants Tab ──────────────────────────────────────────────────────────
const RestaurantsTab = ({ onViewDetail }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await superadminApi.getRestaurants();
            setRestaurants(res.data.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load restaurants.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete "${name}" and all its data? This CANNOT be undone.`)) return;
        try {
            await superadminApi.deleteRestaurant(id);
            setRestaurants(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert(err?.response?.data?.message || 'Delete failed.');
        }
    };

    const filtered = restaurants.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.owner?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="sa-animate">
            <div className="sa-topbar">
                <div>
                    <h1>Restaurants</h1>
                    <p>All registered restaurants on the platform.</p>
                </div>
                <button className="sa-btn sa-btn-ghost" onClick={fetch} disabled={loading}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            <div className="sa-panel">
                <div className="sa-panel-header">
                    <div>
                        <div className="sa-panel-title">{filtered.length} Restaurant{filtered.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="sa-search-wrap" style={{ maxWidth: '280px' }}>
                        <Store size={15} className="sa-search-icon" />
                        <input
                            className="sa-search-input"
                            placeholder="Search by name or owner…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="sa-state"><Loader2 size={32} color="#6366f1" className="animate-spin" /><p>Loading…</p></div>
                ) : error ? (
                    <div className="sa-state"><AlertCircle size={28} color="#f87171" /><p style={{ color: '#f87171' }}>{error}</p></div>
                ) : filtered.length === 0 ? (
                    <div className="sa-state"><Store size={36} color="#374151" /><p>No restaurants found.</p></div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Owner Email</th>
                                <th>Slug</th>
                                <th>Created</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => onViewDetail(r._id)}>
                                    <td className="sa-text-muted">{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {r.logo && <img src={r.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />}
                                            <div>
                                                <span className="sa-text-white">{r.name}</span>
                                                {r.address && <div className="sa-text-muted">{r.address.slice(0, 40)}{r.address.length > 40 ? '…' : ''}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="sa-text-muted">{r.owner?.email || '—'}</td>
                                    <td>
                                        <span className="sa-badge slate">{r.slug}</span>
                                    </td>
                                    <td className="sa-text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button
                                                className="sa-icon-btn"
                                                onClick={() => onViewDetail(r._id)}
                                                title="View details"
                                                style={{ color: '#818cf8', borderColor: 'rgba(99,102,241,0.2)' }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="sa-icon-btn"
                                                onClick={() => handleDelete(r._id, r.name)}
                                                title="Delete restaurant"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await superadminApi.getUsers();
            setUsers(res.data.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleToggle = async (user) => {
        const newDisabled = !user.disabled;
        // Optimistic update
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, disabled: newDisabled } : u));
        setTogglingId(user._id);
        try {
            await superadminApi.toggleUser(user._id, newDisabled);
        } catch (err) {
            // Revert on failure
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, disabled: !newDisabled } : u));
            alert(err?.response?.data?.message || 'Failed to update user status.');
        } finally {
            setTogglingId(null);
        }
    };

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase()) ||
        u.restaurant?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = filtered.filter(u => !u.disabled).length;
    const disabledCount = filtered.filter(u => u.disabled).length;

    const roleColor = (role) => role === 'admin' ? 'indigo' : 'amber';

    return (
        <div className="sa-animate">
            <div className="sa-topbar">
                <div>
                    <h1>Users</h1>
                    <p>Enable or disable admin and chef access across the platform.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {!loading && (
                        <>
                            <span className="sa-badge green">{activeCount} Active</span>
                            {disabledCount > 0 && <span className="sa-badge red">{disabledCount} Disabled</span>}
                        </>
                    )}
                    <button className="sa-btn sa-btn-ghost" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            <div className="sa-panel">
                <div className="sa-panel-header">
                    <div>
                        <div className="sa-panel-title">{filtered.length} User{filtered.length !== 1 ? 's' : ''}</div>
                        <div className="sa-panel-sub">Toggle the switch to block or restore dashboard access</div>
                    </div>
                    <div className="sa-search-wrap" style={{ maxWidth: '280px' }}>
                        <Users size={15} className="sa-search-icon" />
                        <input
                            className="sa-search-input"
                            placeholder="Search by email, role or restaurant…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="sa-state"><Loader2 size={32} color="#6366f1" className="animate-spin" /><p>Loading…</p></div>
                ) : error ? (
                    <div className="sa-state"><AlertCircle size={28} color="#f87171" /><p style={{ color: '#f87171' }}>{error}</p></div>
                ) : filtered.length === 0 ? (
                    <div className="sa-state"><Users size={36} color="#374151" /><p>No users found.</p></div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Restaurant</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th style={{ textAlign: 'right' }}>Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <tr key={u._id} style={{ opacity: u.disabled ? 0.55 : 1, transition: 'opacity 0.2s' }}>
                                    <td className="sa-text-muted">{i + 1}</td>
                                    <td>
                                        <span style={{ color: u.disabled ? '#64748b' : '#f1f5f9', fontWeight: 600 }}>
                                            {u.email}
                                        </span>
                                    </td>
                                    <td><span className={`sa-badge ${roleColor(u.role)}`}>{u.role}</span></td>
                                    <td className="sa-text-muted">{u.restaurant?.name || '—'}</td>
                                    <td>
                                        <span className={`sa-badge ${u.disabled ? 'red' : 'green'}`}>
                                            {u.disabled ? '🔒 Disabled' : '✓ Active'}
                                        </span>
                                    </td>
                                    <td className="sa-text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleToggle(u)}
                                            disabled={togglingId === u._id}
                                            title={u.disabled ? 'Enable this user' : 'Disable this user'}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                                                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem',
                                                border: 'none', transition: 'all 0.2s ease',
                                                background: u.disabled
                                                    ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                                                color: u.disabled ? '#4ade80' : '#f87171',
                                                opacity: togglingId === u._id ? 0.6 : 1,
                                            }}
                                        >
                                            {togglingId === u._id
                                                ? <Loader2 size={13} className="animate-spin" />
                                                : u.disabled
                                                    ? <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        Enable
                                                      </>
                                                    : <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        Disable
                                                      </>
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Restaurant Detail View ────────────────────────────────────────────────────
const RestaurantDetailView = ({ restaurantId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await superadminApi.getRestaurantDetail(restaurantId);
            setData(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load restaurant details.');
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => { fetch(); }, [fetch]);

    if (loading) return (
        <div className="sa-animate">
            <button className="sa-btn sa-btn-ghost" onClick={onBack} style={{ marginBottom: 24 }}>
                <ArrowLeft size={15} /> Back to Restaurants
            </button>
            <div className="sa-state"><Loader2 size={36} color="#6366f1" className="animate-spin" /><p>Loading restaurant…</p></div>
        </div>
    );

    if (error) return (
        <div className="sa-animate">
            <button className="sa-btn sa-btn-ghost" onClick={onBack} style={{ marginBottom: 24 }}>
                <ArrowLeft size={15} /> Back to Restaurants
            </button>
            <div className="sa-state"><AlertCircle size={32} color="#f87171" /><p style={{ color: '#f87171' }}>{error}</p></div>
        </div>
    );

    const { restaurant: r, users, stats, recentOrders } = data;
    const statusColors = { Pending: '#f59e0b', Preparing: '#6366f1', Ready: '#3b82f6', Served: '#14b8a6', Completed: '#22c55e' };

    return (
        <div className="sa-animate">
            {/* Back + Header */}
            <div className="sa-topbar">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <button className="sa-btn sa-btn-ghost" onClick={onBack} style={{ marginTop: 4, flexShrink: 0 }}>
                        <ArrowLeft size={15} />
                    </button>
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {r.logo && <img src={r.logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />}
                            {r.name}
                            <span className={`sa-badge ${r.isActive ? 'green' : 'red'}`}>
                                {r.isActive ? <><BadgeCheck size={11} /> Active</> : <><BadgeX size={11} /> Inactive</>}
                            </span>
                        </h1>
                        <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
                            {r.address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{r.address}</span>}
                            {r.contactNumber && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} />{r.contactNumber}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Link2 size={13} />{r.slug}</span>
                        </p>
                    </div>
                </div>
                <button className="sa-btn sa-btn-ghost" onClick={fetch} style={{ flexShrink: 0 }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Menu Items',   value: stats.menuCount,   icon: UtensilsCrossed, color: 'indigo' },
                    { label: 'Total Orders', value: stats.orderCount,  icon: ShoppingBag,     color: 'amber' },
                    { label: 'Revenue',      value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee, color: 'green' },
                    { label: 'Team Members', value: stats.userCount,   icon: Users,           color: 'rose' },
                ].map(card => (
                    <div key={card.label} className={`sa-stat-card ${card.color}`}>
                        <div className={`sa-stat-icon ${card.color}`}>
                            {React.createElement(card.icon, { size: 17 })}
                        </div>
                        <div>
                            <div className="sa-stat-label">{card.label}</div>
                            <div className="sa-stat-value" style={{ fontSize: '1.4rem' }}>{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Owner + Team */}
                <div className="sa-panel">
                    <div className="sa-panel-header">
                        <div className="sa-panel-title">Team</div>
                        <Users size={16} color="#6366f1" />
                    </div>
                    {users.length === 0 ? (
                        <div className="sa-state" style={{ minHeight: 120 }}><p>No team members found.</p></div>
                    ) : (
                        <table className="sa-table">
                            <thead><tr><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td className="sa-text-white">{u.email}</td>
                                        <td><span className={`sa-badge ${u.role === 'admin' ? 'indigo' : 'amber'}`}>{u.role}</span></td>
                                        <td className="sa-text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Info Card */}
                <div className="sa-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="sa-panel-title" style={{ marginBottom: 4 }}>Restaurant Info</div>
                    {[
                        { label: 'Owner', value: r.owner?.email || '—' },
                        { label: 'Created', value: new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                        { label: 'Primary Color', value: r.menuUi?.primaryColor || '—', swatch: r.menuUi?.primaryColor },
                        { label: 'Tax %', value: r.billingSettings?.taxPercent != null ? `${r.billingSettings.taxPercent}%` : '—' },
                        { label: 'Other Charges', value: r.billingSettings?.otherCharges ? `₹${r.billingSettings.otherCharges} (${r.billingSettings.otherChargesLabel || ''})` : '—' },
                        { label: 'Payment QR', value: r.paymentQrCode ? 'Uploaded ✓' : 'Not set' },
                    ].map(({ label, value, swatch }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 12 }}>
                            <span className="sa-text-muted">{label}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#cbd5e1', fontSize: '0.88rem' }}>
                                {swatch && <span style={{ width: 14, height: 14, borderRadius: '50%', background: swatch, display: 'inline-block', border: '2px solid rgba(255,255,255,0.15)' }} />}
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="sa-panel" style={{ marginTop: 20 }}>
                <div className="sa-panel-header">
                    <div>
                        <div className="sa-panel-title">Recent Orders</div>
                        <div className="sa-panel-sub">Last 10 orders for this restaurant</div>
                    </div>
                    <ShoppingBag size={16} color="#f59e0b" />
                </div>
                {recentOrders.length === 0 ? (
                    <div className="sa-state" style={{ minHeight: 120 }}><ShoppingBag size={32} color="#374151" /><p>No orders yet.</p></div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Table</th>
                                <th>Items</th>
                                <th>Payment</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Placed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td className="sa-text-white">#{order.tableNumber}</td>
                                    <td className="sa-text-muted">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                                    <td>
                                        <span className={`sa-badge ${order.paymentMethod === 'online' ? 'indigo' : 'slate'}`}>
                                            {order.paymentMethod === 'online' ? 'Online' : 'Counter'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#4ade80' }}>₹{Number(order.totalPrice).toFixed(2)}</td>
                                    <td>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                                            background: `${statusColors[order.status] || '#64748b'}18`,
                                            color: statusColors[order.status] || '#94a3b8'
                                        }}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="sa-text-muted">{new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const STATUS_OPTS = ['All', 'Pending', 'Preparing', 'Ready', 'Served', 'Completed'];
const STATUS_COLORS = { Pending: '#f59e0b', Preparing: '#6366f1', Ready: '#3b82f6', Served: '#14b8a6', Completed: '#22c55e' };

const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 50;

    const fetchOrders = useCallback(async (pg = 1, status = statusFilter) => {
        setLoading(true); setError('');
        try {
            const params = { page: pg, limit: PAGE_SIZE };
            if (status !== 'All') params.status = status;
            const res = await superadminApi.getOrders(params);
            setOrders(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        setPage(1);
        fetchOrders(1, statusFilter);
    }, [statusFilter, fetchOrders]);

    const filtered = search
        ? orders.filter(o =>
            o.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerPhone?.includes(search)
        )
        : orders;

    const totalRevenue = filtered.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const handlePage = (p) => {
        setPage(p);
        fetchOrders(p, statusFilter);
    };

    return (
        <div className="sa-animate">
            <div className="sa-topbar">
                <div>
                    <h1>Platform Orders</h1>
                    <p>All orders across every restaurant — {total.toLocaleString()} total.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {!loading && <span className="sa-badge green">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} shown</span>}
                    <button className="sa-btn sa-btn-ghost" onClick={() => fetchOrders(page)} disabled={loading}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {STATUS_OPTS.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        style={{
                            padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                            background: statusFilter === s
                                ? (s === 'All' ? '#6366f1' : STATUS_COLORS[s] || '#6366f1')
                                : 'rgba(255,255,255,0.05)',
                            color: statusFilter === s ? '#fff' : '#64748b',
                            transition: 'all 0.15s ease',
                            boxShadow: statusFilter === s ? '0 4px 12px rgba(0,0,0,0.25)' : 'none'
                        }}
                    >{s}</button>
                ))}
            </div>

            <div className="sa-panel">
                <div className="sa-panel-header">
                    <div>
                        <div className="sa-panel-title">{filtered.length} order{filtered.length !== 1 ? 's' : ''} shown</div>
                        <div className="sa-panel-sub">Page {page} of {totalPages || 1} — {PAGE_SIZE}/page</div>
                    </div>
                    <div className="sa-search-wrap" style={{ maxWidth: '280px' }}>
                        <ClipboardList size={15} className="sa-search-icon" />
                        <input
                            className="sa-search-input"
                            placeholder="Search restaurant, table, customer…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="sa-state"><Loader2 size={32} color="#6366f1" className="animate-spin" /><p>Loading orders…</p></div>
                ) : error ? (
                    <div className="sa-state"><AlertCircle size={28} color="#f87171" /><p style={{ color: '#f87171' }}>{error}</p></div>
                ) : filtered.length === 0 ? (
                    <div className="sa-state"><ClipboardList size={36} color="#374151" /><p>No orders found.</p></div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Restaurant</th>
                                <th>Table</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Payment</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Placed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, i) => (
                                <tr key={o._id}>
                                    <td className="sa-text-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                    <td><span className="sa-text-white">{o.restaurant?.name || '—'}</span></td>
                                    <td className="sa-text-muted">#{o.tableNumber}</td>
                                    <td>
                                        {o.customerName
                                            ? <><span style={{ color: '#e2e8f0', fontWeight: 600 }}>{o.customerName}</span>{o.customerPhone && <div className="sa-text-muted">{o.customerPhone}</div>}</>
                                            : <span className="sa-text-muted">—</span>
                                        }
                                    </td>
                                    <td className="sa-text-muted">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                                    <td>
                                        <span className={`sa-badge ${o.paymentMethod === 'online' ? 'indigo' : 'slate'}`}>
                                            {o.paymentMethod === 'online' ? 'Online' : 'Counter'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#4ade80' }}>₹{Number(o.totalPrice).toFixed(2)}</td>
                                    <td>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                                            background: `${STATUS_COLORS[o.status] || '#64748b'}1a`,
                                            color: STATUS_COLORS[o.status] || '#94a3b8'
                                        }}>{o.status || 'Pending'}</span>
                                    </td>
                                    <td className="sa-text-muted" style={{ whiteSpace: 'nowrap' }}>
                                        {new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && !loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            className="sa-btn sa-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            onClick={() => handlePage(page - 1)} disabled={page === 1}
                        >← Prev</button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                            const p = idx + 1;
                            return (
                                <button key={p} onClick={() => handlePage(p)}
                                    style={{
                                        padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                                        background: page === p ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                        color: page === p ? '#fff' : '#64748b'
                                    }}
                                >{p}</button>
                            );
                        })}
                        <button
                            className="sa-btn sa-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            onClick={() => handlePage(page + 1)} disabled={page === totalPages}
                        >Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
    useSAGuard();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_role');
        navigate('/superadmin');
    };

    const handleTabChange = (tab) => {
        setSelectedRestaurantId(null);
        setActiveTab(tab);
    };

    const renderTab = () => {
        if (activeTab === 'restaurants' && selectedRestaurantId) {
            return <RestaurantDetailView restaurantId={selectedRestaurantId} onBack={() => setSelectedRestaurantId(null)} />;
        }
        switch (activeTab) {
            case 'overview':    return <OverviewTab />;
            case 'restaurants': return <RestaurantsTab onViewDetail={setSelectedRestaurantId} />;
            case 'users':       return <UsersTab />;
            case 'orders':      return <OrdersTab />;
            default:            return <OverviewTab />;
        }
    };

    return (
        <div className="sa-wrapper">
            <Sidebar active={activeTab} setActive={handleTabChange} onLogout={handleLogout} />
            <main className="sa-content">
                {renderTab()}
            </main>
        </div>
    );
};

export default SuperAdminDashboard;

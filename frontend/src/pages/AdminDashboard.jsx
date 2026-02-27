import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    UtensilsCrossed,
    Settings,
    RefreshCw,
    Loader2,
    AlertCircle,
    LogOut,
    ShoppingBag,
    CircleDollarSign,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Check,
    Upload,
    ImagePlus,
    QrCode
} from 'lucide-react';
import { orderApi, menuApi, uploadApi, restaurantApi } from '../api/api';

const CATEGORIES = ['Starter', 'Main', 'Main Course', 'Dessert', 'Drink', 'Sides'];

const getStatusClass = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'completed') return 'status-completed';
    if (s === 'cancelled') return 'status-cancelled';
    return 'status-pending';
};

const STATUSES = ["Pending", "Preparing", "Ready", "Served", "Completed"];

/* ============================
   OVERVIEW TAB
   ============================ */
const OverviewTab = ({ orders, loading, error, stats, fetchOrders, updateOrderStatus }) => (
    <>
        <div className="db-topbar">
            <div>
                <h1>Orders Dashboard</h1>
                <p>Track all restaurant orders in real time.</p>
            </div>
            <button className="lp-btn-primary" onClick={fetchOrders}>
                <RefreshCw size={16} /> Refresh
            </button>
        </div>

        <div className="db-stats-grid">
            <div className="db-stat-card">
                <div className="db-stat-icon"><ShoppingBag size={18} /></div>
                <p className="db-stat-label">Total Orders</p>
                <h3>{stats.totalOrders}</h3>
            </div>
            <div className="db-stat-card">
                <div className="db-stat-icon"><ClipboardList size={18} /></div>
                <p className="db-stat-label">Pending/Active</p>
                <h3>{stats.pendingOrders}</h3>
            </div>
            <div className="db-stat-card">
                <div className="db-stat-icon"><CircleDollarSign size={18} /></div>
                <p className="db-stat-label">Revenue</p>
                <h3>₹{stats.revenue.toFixed(2)}</h3>
            </div>
        </div>

        {loading ? (
            <div className="db-panel db-state">
                <Loader2 size={42} className="animate-spin" color="#7c3aed" />
                <p>Loading orders...</p>
            </div>
        ) : error ? (
            <div className="db-panel db-state db-error">
                <AlertCircle size={22} />
                <p>{error}</p>
            </div>
        ) : orders.length === 0 ? (
            <div className="db-panel db-state">
                <ClipboardList size={42} color="#cbd5e1" />
                <p>No orders found.</p>
            </div>
        ) : (
            <div className="db-orders-grid">
                {orders.map((order) => (
                    <article key={order._id} className="db-order-card">
                        <div className="db-order-head">
                            <h3>Table #{order.tableNumber}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select
                                    className={`db-status-pill ${getStatusClass(order.status)}`}
                                    value={order.status || 'Pending'}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    style={{
                                        cursor: 'pointer',
                                        border: 'none',
                                        outline: 'none',
                                        appearance: 'none',
                                        padding: '4px 12px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <p className="db-order-meta">Order ID: {order._id}</p>
                        <p className="db-order-meta">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                        <div className="db-order-items">
                            {order.items?.map((item, idx) => (
                                <div key={`${order._id}-${idx}`} className="db-order-item-row">
                                    <span>{item?.menuItem?.name || 'Item'} x {item.quantity}</span>
                                    <strong>₹{((item.priceAtOrderTime || 0) * item.quantity).toFixed(2)}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="db-order-total">
                            <span>Total</span>
                            <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
                        </div>
                    </article>
                ))}
            </div>
        )}
    </>
);

/* ============================
   MENU TAB
   ============================ */
const emptyForm = {
    name: '',
    description: '',
    category: 'Starter',
    price: '',
    image: '',
    isAvailable: true,
    attributes: { isVeg: false, isSpicy: false }
};

const MenuTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Retrieve restaurant ID
    const restaurantId = localStorage.getItem('restaurantId');

    useEffect(() => {
        if (restaurantId) fetchMenu();
        else setError('Restaurant ID not found. Please log out and log in again.');
    }, [restaurantId]);

    const fetchMenu = async () => {
        if (!restaurantId) return;
        setLoading(true);
        setError('');
        try {
            const res = await menuApi.getAll(restaurantId);
            setItems(res?.data?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load menu items.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const q = searchTerm.toLowerCase();
        return items.filter(i =>
            i.name?.toLowerCase().includes(q) ||
            i.category?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
        );
    }, [items, searchTerm]);

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (item) => {
        setForm({
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'Starter',
            price: item.price || '',
            image: item.image || '',
            isAvailable: item.isAvailable !== false,
            attributes: {
                isVeg: item.attributes?.isVeg || false,
                isSpicy: item.attributes?.isSpicy || false
            }
        });
        setEditingId(item._id);
        setFormError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormError('');
        setUploading(false);
        setUploadProgress(0);
        setDragActive(false);
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setFormError('Please select an image file (jpg, png, webp, etc.)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setFormError('Image must be under 10 MB.');
            return;
        }
        setUploading(true);
        setUploadProgress(0);
        setFormError('');
        try {
            const res = await uploadApi.image(file, setUploadProgress);
            setForm(prev => ({ ...prev, image: res.data.url }));
        } catch (err) {
            setFormError(err.message || 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        handleImageUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'isVeg' || name === 'isSpicy') {
            setForm(prev => ({ ...prev, attributes: { ...prev.attributes, [name]: checked } }));
        } else if (name === 'isAvailable') {
            setForm(prev => ({ ...prev, isAvailable: checked }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');

        if (!restaurantId) {
            setFormError('Session Error: Restaurant ID not found. Please log out and log in again to sync your account.');
            setSaving(false);
            return;
        }

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                restaurant: restaurantId
            };
            if (editingId) {
                await menuApi.update(editingId, payload);
                flash('Item updated successfully!');
            } else {
                await menuApi.create(payload);
                flash('Item created successfully!');
            }
            closeForm();
            fetchMenu();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Operation failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await menuApi.delete(id, restaurantId);
            flash('Item deleted.');
            fetchMenu();
        } catch (err) {
            setError(err?.response?.data?.message || 'Delete failed.');
        }
    };

    const flash = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <>
            {/* Header */}
            <div className="db-topbar">
                <div>
                    <h1>Menu Management</h1>
                    <p>Create, edit, and manage your restaurant menu items.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="lp-btn-outline" onClick={fetchMenu}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button
                        className="lp-btn-primary"
                        onClick={openCreate}
                        disabled={!restaurantId}
                        title={!restaurantId ? "Please log in again to link your restaurant" : ""}
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>
            </div>

            {successMsg && (
                <div className="db-success-toast">
                    <Check size={16} /> {successMsg}
                </div>
            )}

            {/* Search */}
            <div className="db-menu-search">
                <Search size={18} className="db-search-icon" />
                <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="db-search-input"
                />
            </div>

            {/* Modal */}
            {showForm && (
                <div className="db-modal-overlay" onClick={closeForm}>
                    <div className="db-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="db-modal-header">
                            <h2>{editingId ? 'Edit Item' : 'Create New Item'}</h2>
                            <button className="db-modal-close" onClick={closeForm}><X size={20} /></button>
                        </div>
                        {formError && <div className="auth-error" style={{ margin: '0 0 16px' }}>{formError}</div>}
                        <form onSubmit={handleSubmit} className="db-menu-form">
                            <div className="db-form-row">
                                <div className="db-form-field">
                                    <label>Name</label>
                                    <input name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={200} placeholder="e.g. Paneer Tikka" />
                                </div>
                                <div className="db-form-field">
                                    <label>Category</label>
                                    <select name="category" value={form.category} onChange={handleChange}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="db-form-field">
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} required minLength={15} maxLength={500} rows={3} placeholder="Describe the dish (min 15 chars)" />
                            </div>
                            <div className="db-form-field">
                                <label>Price (₹)</label>
                                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="0.00" />
                            </div>
                            <div className="db-form-field">
                                <label>Image</label>
                                <div
                                    className={`db-upload-zone ${dragActive ? 'drag-active' : ''} ${form.image ? 'has-preview' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    // Use drop on the container, but input covers the clicking
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(false);
                                        const file = e.dataTransfer?.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                >
                                    {/* Invisible native input covering the zone */}
                                    {!uploading && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            title=""
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: 'pointer',
                                                zIndex: 10
                                            }}
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleImageUpload(e.target.files[0]);
                                                }
                                                e.target.value = '';
                                            }}
                                        />
                                    )}

                                    {uploading ? (
                                        <div className="db-upload-progress">
                                            <Loader2 size={24} className="animate-spin" color="#7c3aed" />
                                            <p>Uploading... {uploadProgress}%</p>
                                            <div className="db-progress-bar">
                                                <div className="db-progress-fill" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    ) : form.image ? (
                                        <div className="db-upload-preview">
                                            <img src={form.image} alt="Preview" />
                                            <div className="db-upload-overlay">
                                                <ImagePlus size={20} />
                                                <span>Click or drag to replace</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="db-upload-placeholder">
                                            <Upload size={28} color="#94a3b8" />
                                            <p><strong>Click to upload</strong> or drag & drop</p>
                                            <span>JPG, PNG, WebP — max 10 MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="db-form-checks">
                                <label className="db-check-label">
                                    <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
                                    <span>Available</span>
                                </label>
                                <label className="db-check-label">
                                    <input type="checkbox" name="isVeg" checked={form.attributes.isVeg} onChange={handleChange} />
                                    <span>Veg</span>
                                </label>
                                <label className="db-check-label">
                                    <input type="checkbox" name="isSpicy" checked={form.attributes.isSpicy} onChange={handleChange} />
                                    <span>Spicy</span>
                                </label>
                            </div>
                            <div className="db-form-actions">
                                <button type="button" className="lp-btn-outline" onClick={closeForm}>Cancel</button>
                                <button type="submit" className="lp-btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingId ? 'Update Item' : 'Create Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="db-panel db-state">
                    <Loader2 size={42} className="animate-spin" color="#7c3aed" />
                    <p>Loading menu...</p>
                </div>
            ) : error ? (
                <div className="db-panel db-state db-error">
                    <AlertCircle size={22} />
                    <p>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="db-panel db-state">
                    <UtensilsCrossed size={42} color="#cbd5e1" />
                    <p>{searchTerm ? 'No items match your search.' : 'No menu items yet. Add your first item!'}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Tags</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item._id}>
                                    <td>
                                        <img src={item.image} alt={item.name} className="db-menu-img" />
                                    </td>
                                    <td>
                                        <strong className="db-menu-name">{item.name}</strong>
                                        <p className="db-menu-desc">{item.description?.slice(0, 60)}{item.description?.length > 60 ? '...' : ''}</p>
                                    </td>
                                    <td><span className="db-cat-pill">{item.category}</span></td>
                                    <td className="db-price">₹{Number(item.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`db-avail-dot ${item.isAvailable !== false ? 'avail-yes' : 'avail-no'}`}>
                                            {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="db-tags">
                                            {item.attributes?.isVeg && <span className="db-tag tag-veg">Veg</span>}
                                            {item.attributes?.isSpicy && <span className="db-tag tag-spicy">Spicy</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="db-actions">
                                            <button className="db-icon-btn edit" onClick={() => openEdit(item)} title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <button className="db-icon-btn delete" onClick={() => handleDelete(item._id, item.name)} title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

/* ============================
   QR GENERATOR TAB
   ============================ */
const QRTab = () => {
    const [mode, setMode] = useState('single'); // 'single' or 'bulk'
    const [tableNumber, setTableNumber] = useState('');
    const [startTable, setStartTable] = useState('');
    const [endTable, setEndTable] = useState('');
    const [bulkCodes, setBulkCodes] = useState([]);

    // Retrieve restaurantId
    const restaurantId = localStorage.getItem('restaurantId');

    const qrUrl = tableNumber ? `${window.location.origin}/menu/${tableNumber}?restaurantId=${restaurantId}` : '';
    const qrImageSource = tableNumber ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}` : '';

    const handleGenerateBulk = (e) => {
        e.preventDefault();
        const start = parseInt(startTable);
        const end = parseInt(endTable);
        if (isNaN(start) || isNaN(end) || start > end) {
            alert('Please enter a valid range');
            return;
        }
        if (end - start > 100) {
            alert('Maximum 100 codes at once');
            return;
        }

        const codes = [];
        for (let i = start; i <= end; i++) {
            const url = `${window.location.origin}/menu/${i}?restaurantId=${restaurantId}`;
            codes.push({
                num: i,
                url: url,
                src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
            });
        }
        setBulkCodes(codes);
    };

    return (
        <div className="qr-tab-container">
            <div className="db-topbar">
                <div>
                    <h1>QR Generator</h1>
                    <p>Generate QR codes for tables to access the menu.</p>
                </div>
            </div>

            <div className="qr-mode-switcher" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                    className={`lp-btn-${mode === 'single' ? 'primary' : 'outline'}`}
                    onClick={() => setMode('single')}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                    Single QR
                </button>
                <button
                    className={`lp-btn-${mode === 'bulk' ? 'primary' : 'outline'}`}
                    onClick={() => setMode('bulk')}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                    Bulk Generate
                </button>
            </div>

            {mode === 'single' ? (
                <div className="db-panel db-state" style={{ padding: '40px', minHeight: 'auto' }}>
                    <div style={{ maxWidth: '400px', width: '100%', textAlign: 'left' }}>
                        <div className="db-form-field">
                            <label>Table Number</label>
                            <input
                                type="number"
                                placeholder="e.g. 5"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="db-search-input"
                                style={{ paddingLeft: '14px' }}
                            />
                        </div>
                    </div>

                    {tableNumber && (
                        <div className="qr-result-area" style={{ marginTop: '32px', textAlign: 'center', animation: 'dbFadeIn 0.4s ease' }}>
                            <div className="qr-card printable-card" style={{
                                background: '#fff',
                                padding: '24px',
                                borderRadius: '20px',
                                display: 'inline-block',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <img
                                    src={qrImageSource}
                                    alt={`QR Code for Table ${tableNumber}`}
                                    style={{ width: '250px', height: '250px', borderRadius: '12px' }}
                                />
                                <div style={{ marginTop: '16px' }}>
                                    <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: '1.2rem' }}>Table #{tableNumber}</h3>
                                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Scan to Order</p>
                                </div>
                            </div>

                            <div className="no-print" style={{ marginTop: '24px' }}>
                                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
                                    URL: <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{qrUrl}</code>
                                </p>
                                <button
                                    className="lp-btn-primary"
                                    onClick={() => window.print()}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <QrCode size={16} /> Print QR Code
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="db-panel" style={{ padding: '32px' }}>
                    <form onSubmit={handleGenerateBulk} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '32px' }}>
                        <div className="db-form-field" style={{ minWidth: '120px' }}>
                            <label>Start Table</label>
                            <input
                                type="number"
                                value={startTable}
                                onChange={e => setStartTable(e.target.value)}
                                placeholder="1"
                                className="db-search-input"
                                style={{ paddingLeft: '14px' }}
                                required
                            />
                        </div>
                        <div className="db-form-field" style={{ minWidth: '120px' }}>
                            <label>End Table</label>
                            <input
                                type="number"
                                value={endTable}
                                onChange={e => setEndTable(e.target.value)}
                                placeholder="10"
                                className="db-search-input"
                                style={{ paddingLeft: '14px' }}
                                required
                            />
                        </div>
                        <button type="submit" className="lp-btn-primary" style={{ height: '44px' }}>
                            Generate Range
                        </button>
                        {bulkCodes.length > 0 && (
                            <button
                                type="button"
                                className="lp-btn-outline"
                                style={{ height: '44px' }}
                                onClick={() => window.print()}
                            >
                                <Plus size={16} /> Print All ({bulkCodes.length})
                            </button>
                        )}
                    </form>

                    {bulkCodes.length > 0 && (
                        <div className="bulk-qr-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '20px'
                        }}>
                            {bulkCodes.map((card) => (
                                <div key={card.num} className="qr-card printable-card" style={{
                                    background: '#fff',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    border: '1px solid #f1f5f9',
                                    animation: 'dbFadeIn 0.3s ease'
                                }}>
                                    <img
                                        src={card.src}
                                        alt={`Table ${card.num}`}
                                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                    />
                                    <div style={{ marginTop: '12px' }}>
                                        <h4 style={{ margin: 0, color: '#1a1a2e' }}>Table #{card.num}</h4>
                                        <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>Scan to Order</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @media print {
                    .db-sidebar, .db-topbar, .qr-mode-switcher, .no-print, nav, button, form {
                        display: none !important;
                    }
                    .db-content {
                        margin-left: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .db-panel {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .printable-card {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        page-break-inside: avoid;
                        margin-bottom: 20px;
                    }
                    .bulk-qr-grid {
                        display: block !important;
                    }
                    .bulk-qr-grid .printable-card {
                        display: inline-block !important;
                        width: 45% !important;
                        margin: 2% !important;
                        vertical-align: top;
                    }
                }
            `}</style>
        </div>
    );
};

/* ============================
   MAIN DASHBOARD
   ============================ */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [restaurantName, setRestaurantName] = useState('QRder Admin');

    useEffect(() => {
        fetchOrders();
        fetchRestaurantName();
    }, []);

    const fetchRestaurantName = async () => {
        const id = localStorage.getItem('restaurantId');
        if (!id) return;
        try {
            const res = await restaurantApi.getById(id);
            if (res?.data?.data?.name) {
                setRestaurantName(res.data.data.name);
            }
        } catch (err) {
            console.error('Failed to fetch restaurant details:', err);
        }
    };

    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o) => (o.status || 'Pending') !== 'Completed').length;
        const revenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
        return { totalOrders, pendingOrders, revenue };
    }, [orders]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await orderApi.getAll();
            setOrders(res?.data?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to fetch orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await orderApi.updateStatus(id, status);
            fetchOrders(); // Refresh after update
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order status');
        }
    }

    const role = localStorage.getItem('role');

    // Filter sidebar based on role
    const sidebarItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', key: 'overview', allowed: ['admin', 'chef'] },
        { icon: <UtensilsCrossed size={18} />, label: 'Menu', key: 'menu', allowed: ['admin'] },
        { icon: <QrCode size={18} />, label: 'QR Generator', key: 'qr', allowed: ['admin'] },
        { icon: <Settings size={18} />, label: 'Settings', key: 'settings', allowed: ['admin'] }
    ].filter(item => item.allowed.includes(role));

    return (
        <div className="dashboard-page">
            <aside className="db-sidebar">
                <div>
                    <div className="db-brand">
                        <div className="db-brand-icon">{restaurantName.charAt(0).toUpperCase()}</div>
                        <div>
                            <p className="db-brand-name">{restaurantName}</p>
                            <p className="db-brand-sub">Control Center</p>
                        </div>
                    </div>

                    <nav className="db-nav">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.label}
                                className={`db-nav-btn ${activeTab === item.key ? 'is-active' : ''}`}
                                onClick={() => setActiveTab(item.key)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <button className="db-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </aside>

            <section className="db-content">
                {activeTab === 'overview' && (
                    <OverviewTab
                        orders={orders}
                        loading={loading}
                        error={error}
                        stats={stats}
                        fetchOrders={fetchOrders}
                        updateOrderStatus={updateOrderStatus}
                    />
                )}
                {activeTab === 'menu' && <MenuTab />}
                {activeTab === 'qr' && <QRTab />}
                {activeTab === 'settings' && (
                    <div className="db-panel db-state">
                        <Settings size={42} color="#cbd5e1" />
                        <p>Settings coming soon.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;

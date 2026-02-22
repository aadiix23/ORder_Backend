import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { menuApi, cartApi } from '../api/api';

const Menu = () => {
    const { tableNumber } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [addedId, setAddedId] = useState(null);

    const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

    useEffect(() => {
        fetchMenu();
    }, [category]);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            let res;
            if (category === 'All') {
                res = await menuApi.getAll();
            } else {
                res = await menuApi.getByCategory(category);
            }
            setItems(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearch(val);
        if (val.length > 2) {
            const res = await menuApi.search(val);
            setItems(res.data.data);
        } else if (val === '') {
            fetchMenu();
        }
    };

    const addToCart = async (item) => {
        try {
            await cartApi.add({
                tableNumber: parseInt(tableNumber),
                menuItemId: item._id,
                quantity: 1,
                notes: ''
            });
            setAddedId(item._id);
            setTimeout(() => setAddedId(null), 2000);
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to cart');
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Menu for <span style={{ color: 'var(--primary)' }}>Table {tableNumber}</span></h1>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '5px 20px', flex: 1, minWidth: '300px' }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search for dishes..."
                            value={search}
                            onChange={handleSearch}
                            style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            ) : (
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '25px'
                    }}
                >
                    <AnimatePresence>
                        {items.map(item => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass"
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ height: '200px', background: `linear-gradient(45deg, #1e293b, #334155)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Ideally an image tag here */}
                                    <UtensilsCrossed size={64} color="rgba(255,255,255,0.1)" />
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.2rem' }}>{item.name}</h3>
                                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>${item.price}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>{item.description}</p>

                                    <button
                                        onClick={() => addToCart(item)}
                                        className={`btn ${addedId === item._id ? 'btn-outline' : 'btn-primary'}`}
                                        style={{ width: '100%', gap: '10px' }}
                                        disabled={addedId === item._id}
                                    >
                                        {addedId === item._id ? (
                                            <>Added <CheckCircle2 size={18} /></>
                                        ) : (
                                            <>Add to Cart <Plus size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!loading && items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                    <p>No items found in this category.</p>
                </div>
            )}
        </div>
    );
};

// Simple UtensilsCrossed icon for local use if lucide-react Import fails (though it shouldn't)
const UtensilsCrossed = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path>
        <path d="M15 21 3.3 9.3a2 2 0 0 1 0-2.8l2.1-2.1a2 2 0 0 1 2.8 0L20 16"></path>
        <path d="m3 21 7-7"></path>
    </svg>
);

export default Menu;

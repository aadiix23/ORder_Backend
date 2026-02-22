import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const Home = () => {
    const [table, setTable] = useState('');
    const navigate = useNavigate();

    const handleStart = (e) => {
        e.preventDefault();
        if (table) {
            navigate(`/menu/${table}`);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Welcome to <span style={{ color: 'var(--primary)' }}>ORder</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>Premium Dining Experience, Simplified.</p>

                <form onSubmit={handleStart} className="glass" style={{
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Enter Table Number</h2>
                    <input
                        type="number"
                        placeholder="e.g. 5"
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        style={{ fontSize: '1.2rem', textAlign: 'center', padding: '15px' }}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
                        Browse Menu <LogIn size={20} />
                    </button>
                </form>
            </motion.div>

            <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                {[
                    { title: 'Easy Ordering', desc: 'Browse our extensive menu with just a few taps.' },
                    { title: 'Live Updates', desc: 'Track your cart and total in real-time.' },
                    { title: 'Secure & Fast', desc: 'Direct communication with our kitchen staff.' }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="glass"
                        style={{ padding: '20px', textAlign: 'left' }}
                    >
                        <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;

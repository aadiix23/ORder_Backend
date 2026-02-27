import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/api';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        role: 'admin',
        restaurantName: '',
        restaurantDescription: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authApi.register(form);
            navigate('/login');
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-logo" onClick={() => navigate('/')}>
                        <div className="auth-logo-icon">Q</div>
                        <span>QRder</span>
                    </div>
                    <h1>Get started</h1>
                    <p>Create your account and start managing your restaurant digitally.</p>
                </div>
            </div>
            <div className="auth-right">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '450px' }}
                >
                    <button className="auth-back" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Fill in your details to register</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="auth-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="auth-field">
                                <label>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="admin">Admin</option>
                                    <option value="chef">Chef</option>
                                </select>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-pass-wrap">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {form.role === 'admin' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}
                            >
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Restaurant Details</p>
                                <div className="auth-field">
                                    <label>Restaurant Name</label>
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        placeholder="e.g. Pizza Palace"
                                        value={form.restaurantName}
                                        onChange={handleChange}
                                        required={form.role === 'admin'}
                                    />
                                </div>
                                <div className="auth-field">
                                    <label>Short Description</label>
                                    <input
                                        type="text"
                                        name="restaurantDescription"
                                        placeholder="e.g. Best Italian pizza in town"
                                        value={form.restaurantDescription}
                                        onChange={handleChange}
                                        required={form.role === 'admin'}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {form.role === 'chef' && (
                            <div className="auth-field">
                                <label>Restaurant ID (Ask your Admin)</label>
                                <input
                                    type="text"
                                    name="restaurantId"
                                    placeholder="Enter your restaurant's unique ID"
                                    value={form.restaurantId || ''}
                                    onChange={handleChange}
                                    required={form.role === 'chef'}
                                />
                            </div>
                        )}

                        <button type="submit" className="lp-btn-primary lp-btn-full lp-btn-lg" disabled={loading} style={{ marginTop: '12px' }}>
                            {loading ? 'Creating account...' : 'Create Account'} {!loading && <UserPlus size={18} />}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;

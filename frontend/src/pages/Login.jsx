import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
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
            const res = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error('Server error. Please make sure the backend is running.');
            }
            if (!res.ok) throw new Error(data.message || 'Login failed');

            if (!data.restaurantId && data.role !== 'staff') { // Allow login without restaurant only for specific global roles if any
                throw new Error('This account is not linked to any restaurant. Please use a valid restaurant admin account.');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('restaurantId', data.restaurantId || '');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
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
                    <h1>Welcome back</h1>
                    <p>Sign in to manage your restaurant, menus, and orders.</p>
                </div>
            </div>
            <div className="auth-right">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button className="auth-back" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2>Sign In</h2>
                    <p className="auth-subtitle">Enter your credentials to access your account</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@restaurant.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-pass-wrap">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="lp-btn-primary lp-btn-full lp-btn-lg" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'} {!loading && <LogIn size={18} />}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

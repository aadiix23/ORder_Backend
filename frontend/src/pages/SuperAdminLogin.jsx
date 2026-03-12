import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { superadminApi } from '../api/api';
import '../styles/superadmin.css';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };
            console.log('[SA Login] attempting login for:', payload.email);
            const res = await superadminApi.login(payload);
            console.log('[SA Login] response role:', res.data.role);

            if (res.data.role !== 'superadmin') {
                setError('Access denied. This portal is for Super Admins only.');
                setLoading(false);
                return;
            }

            localStorage.setItem('sa_token', res.data.token);
            localStorage.setItem('sa_role', res.data.role);
            navigate('/superadmin/dashboard');
        } catch (err) {
            console.error('[SA Login] error:', err?.response?.data);
            setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sa-login-page">
            <div className="sa-login-card sa-animate">
                <div className="sa-login-icon">
                    <Shield size={30} color="#fff" />
                </div>
                <h1 className="sa-login-title">Super Admin</h1>
                <p className="sa-login-sub">Platform control center — restricted access only</p>

                {error && <div className="sa-login-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="sa-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@devhorizon.in"
                            value={form.email}
                            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="sa-field">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                style={{
                                    position: 'absolute', right: '14px', top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', color: '#64748b', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="sa-login-submit" disabled={loading}>
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : <>
                            <Shield size={18} /> Access Control Center
                        </>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminLogin;

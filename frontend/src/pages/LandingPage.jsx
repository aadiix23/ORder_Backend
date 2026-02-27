import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    QrCode,
    Smartphone,
    ChefHat,
    Zap,
    Clock,
    Shield,
    Star,
    ArrowRight,
    Utensils,
    ScanLine,
    Bell,
    CheckCircle,
    BarChart3,
    Users,
    MonitorSmartphone,
    Layers,
    CreditCard,
    Globe
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
        })
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    const features = [
        {
            icon: <QrCode size={28} />,
            title: 'QR Code Menus',
            desc: 'Generate unique QR codes for each table. Customers scan and browse your full menu instantly.'
        },
        {
            icon: <MonitorSmartphone size={28} />,
            title: 'Real-Time Orders',
            desc: 'Orders go straight to your kitchen display. No miscommunication, no paper tickets.'
        },
        {
            icon: <Bell size={28} />,
            title: 'Live Notifications',
            desc: 'Get instant alerts for new orders, updates, and customer requests via WebSocket.'
        },
        {
            icon: <BarChart3 size={28} />,
            title: 'Admin Dashboard',
            desc: 'Manage menus, track orders, and view analytics — all from one powerful control panel.'
        },
        {
            icon: <Layers size={28} />,
            title: 'Menu Management',
            desc: 'Add, edit, and organize menu items with categories, pricing, and availability toggles.'
        },
        {
            icon: <Shield size={28} />,
            title: 'Secure & Reliable',
            desc: 'JWT authentication, role-based access, and encrypted data keep your restaurant safe.'
        }
    ];

    const howSteps = [
        {
            num: '01',
            icon: <Globe size={32} />,
            title: 'Register Your Restaurant',
            desc: 'Create an account, set up your restaurant profile, and configure your digital presence.'
        },
        {
            num: '02',
            icon: <Utensils size={32} />,
            title: 'Build Your Menu',
            desc: 'Add dishes, set prices, upload images, and organize everything into categories.'
        },
        {
            num: '03',
            icon: <ScanLine size={32} />,
            title: 'Deploy QR Codes',
            desc: 'Print unique QR codes for each table. Customers scan to access your digital menu.'
        },
        {
            num: '04',
            icon: <Zap size={32} />,
            title: 'Start Receiving Orders',
            desc: 'Orders flow in real-time to your kitchen. Manage everything from your admin panel.'
        }
    ];

    const stats = [
        { value: '50%', label: 'Faster Service' },
        { value: '40%', label: 'More Efficiency' },
        { value: '99.9%', label: 'Uptime' },
        { value: '0', label: 'Paper Menus Needed' }
    ];

    return (
        <div className="landing">
            {/* ===== NAVBAR ===== */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo" onClick={() => navigate('/')}>
                        <div className="lp-logo-icon">Q</div>
                        <span>QRder</span>
                    </div>

                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="lp-nav-actions">
                        <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="lp-btn-primary" onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="lp-hero">
                <div className="lp-hero-gradient" />
                <div className="lp-container">
                    <motion.div
                        className="lp-hero-content"
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                    >
                        <motion.h1 variants={fadeUp} custom={0} className="lp-hero-title">
                            Revolutionize Your Restaurant with{' '}
                            <span className="lp-highlight">Digital Menus</span> and{' '}
                            <span className="lp-highlight">Table Ordering</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} custom={1} className="lp-hero-desc">
                            Transform your dining experience with QRder. Create beautiful digital menus, enable
                            seamless tableside ordering, and keep your staff updated with real-time notifications — all
                            from one powerful platform.
                        </motion.p>

                        <motion.div variants={fadeUp} custom={2} className="lp-hero-actions">
                            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate('/register')}>
                                Get started for free! <ArrowRight size={18} />
                            </button>
                            <button className="lp-btn-outline lp-btn-lg" onClick={() => {
                                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                View Pricing
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <section className="lp-stats">
                <div className="lp-container">
                    <div className="lp-stats-grid">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                className="lp-stat"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <span className="lp-stat-value">{s.value}</span>
                                <span className="lp-stat-label">{s.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="lp-features">
                <div className="lp-container">
                    <motion.div
                        className="lp-section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                    >
                        <motion.span variants={fadeUp} className="lp-label">Features</motion.span>
                        <motion.h2 variants={fadeUp} custom={1}>
                            Everything you need to run a <span className="lp-highlight">modern restaurant</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2}>
                            From digital menus to real-time kitchen communication, QRder gives you the tools to
                            deliver exceptional dining experiences.
                        </motion.p>
                    </motion.div>

                    <div className="lp-features-grid">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                className="lp-feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            >
                                <div className="lp-feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="lp-how">
                <div className="lp-container">
                    <motion.div
                        className="lp-section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                    >
                        <motion.span variants={fadeUp} className="lp-label">How It Works</motion.span>
                        <motion.h2 variants={fadeUp} custom={1}>
                            Get up and running in <span className="lp-highlight">minutes</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2}>
                            Setting up QRder for your restaurant is simple. Follow these four steps and start
                            accepting digital orders today.
                        </motion.p>
                    </motion.div>

                    <div className="lp-steps-grid">
                        {howSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                className="lp-step-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <div className="lp-step-num">{step.num}</div>
                                <div className="lp-step-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" className="lp-pricing">
                <div className="lp-container">
                    <motion.div
                        className="lp-section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                    >
                        <motion.span variants={fadeUp} className="lp-label">Pricing</motion.span>
                        <motion.h2 variants={fadeUp} custom={1}>
                            Simple, transparent <span className="lp-highlight">pricing</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2}>
                            Start for free and scale as your restaurant grows. No hidden fees, ever.
                        </motion.p>
                    </motion.div>

                    <div className="lp-pricing-grid">
                        {[
                            {
                                name: 'Starter',
                                price: 'Free',
                                period: 'forever',
                                desc: 'Perfect for trying out QRder',
                                features: ['Up to 5 tables', 'Basic menu management', 'QR code generation', 'Order notifications'],
                                cta: 'Get Started',
                                popular: false
                            },
                            {
                                name: 'Professional',
                                price: '₹999',
                                period: '/month',
                                desc: 'For growing restaurants',
                                features: ['Unlimited tables', 'Advanced menu builder', 'Real-time analytics', 'Priority support', 'Custom branding'],
                                cta: 'Start Free Trial',
                                popular: true
                            },
                            {
                                name: 'Enterprise',
                                price: 'Custom',
                                period: '',
                                desc: 'For restaurant chains',
                                features: ['Multi-location support', 'API access', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
                                cta: 'Contact Sales',
                                popular: false
                            }
                        ].map((plan, i) => (
                            <motion.div
                                key={i}
                                className={`lp-price-card ${plan.popular ? 'lp-price-popular' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.5 }}
                            >
                                {plan.popular && <div className="lp-popular-badge">Most Popular</div>}
                                <h3>{plan.name}</h3>
                                <div className="lp-price">
                                    <span className="lp-price-amount">{plan.price}</span>
                                    {plan.period && <span className="lp-price-period">{plan.period}</span>}
                                </div>
                                <p className="lp-price-desc">{plan.desc}</p>
                                <ul className="lp-price-features">
                                    {plan.features.map((f, j) => (
                                        <li key={j}><CheckCircle size={16} /> {f}</li>
                                    ))}
                                </ul>
                                <button
                                    className={plan.popular ? 'lp-btn-primary lp-btn-full' : 'lp-btn-outline lp-btn-full'}
                                    onClick={() => navigate('/register')}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="lp-cta">
                <div className="lp-container">
                    <motion.div
                        className="lp-cta-card"
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Ready to transform your restaurant?</h2>
                        <p>Join hundreds of restaurants already using QRder to deliver smarter dining experiences.</p>
                        <div className="lp-cta-actions">
                            <button className="lp-btn-white lp-btn-lg" onClick={() => navigate('/register')}>
                                Create Free Account <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer id="contact" className="lp-footer">
                <div className="lp-container">
                    <div className="lp-footer-grid">
                        <div className="lp-footer-brand">
                            <div className="lp-logo">
                                <div className="lp-logo-icon">Q</div>
                                <span>QRder</span>
                            </div>
                            <p>Redefining the restaurant experience with smart, contactless ordering technology.</p>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#how-it-works">How It Works</a>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#contact">Contact</a>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <p>© 2026 QRder. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

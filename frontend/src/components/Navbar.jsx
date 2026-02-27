import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Home } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    // Try to extract tableNumber from path
    const pathParts = location.pathname.split('/');
    const tableNumber = pathParts[2];

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '1200px',
            zIndex: 1000,
            padding: '15px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--primary)' }}>
                <UtensilsCrossed size={32} />
                <span style={{ fontWeight: '700', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>ORder</span>
            </Link>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/" className="btn-outline" style={{ padding: '8px 15px', borderRadius: '10px' }}>
                    <Home size={20} />
                </Link>

                {tableNumber && (
                    <>
                        <Link to={`/menu/${tableNumber}`} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '10px' }}>
                            Menu
                        </Link>
                        <Link to={`/cart/${tableNumber}`} className="btn-outline" style={{ padding: '8px 15px', borderRadius: '10px', position: 'relative' }}>
                            <ShoppingCart size={20} />
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

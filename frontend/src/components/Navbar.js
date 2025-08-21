import React from 'react';
// This one line imports everything you need
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ... (styles remain the same)
const navStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  padding: '1rem 2rem', 
  background: '#fff', 
  borderBottom: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};
const linkStyle = { 
  textDecoration: 'none', 
  color: '#333', 
  margin: '0 15px',
  fontWeight: '500'
};
const brandStyle = { 
  ...linkStyle, 
  fontWeight: 'bold',
  fontSize: '1.5rem',
  color: '#007bff'
};
const buttonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#007bff',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  padding: '0',
  margin: '0 15px'
};
// --- NEW: Style for the welcome message ---
const welcomeStyle = {
  marginRight: '20px',
  color: '#555',
  fontWeight: 'bold'
};

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Using a more structured JSX for the navbar
    return (
        <nav style={{ background: '#333', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav-logo">
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}> Symbiosis </Link>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
                {currentUser ? (
                    <>
                        <li><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
                        <li><Link to="/threat-radar" style={{ color: 'white', textDecoration: 'none' }}>Threat Radar</Link></li>
                        <li><Link to="/submit-report" style={{ color: 'white', textDecoration: 'none' }}>Submit Report</Link></li>
                        <li><Link to="/data-feed" style={{ color: 'white', textDecoration: 'none' }}>Data Feed</Link></li>
                        <li><Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link></li>
                        <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>Log Out</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link></li>
                        <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Log In</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}


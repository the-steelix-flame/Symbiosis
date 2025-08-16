import React from 'react';
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
  // --- UPDATED: Get userProfile from the context ---
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={brandStyle}>EcoSynth</Link>
      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        {currentUser ? (
          <>
            {/* --- NEW: Personalized Welcome Message --- */}
            <span style={welcomeStyle}>
              Welcome, {userProfile ? userProfile.name : 'User'}
            </span>
            <Link to="/dashboard" style={linkStyle}>My War Room</Link>
            <Link to="/submit-report" style={linkStyle}>Submit Report</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <button onClick={handleLogout} style={buttonStyle}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={linkStyle}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
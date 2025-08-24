import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
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
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Symbiosis
                </Link>
                <div className="nav-menu">
                    {currentUser && userProfile ? (
                        <>
                            <span className="nav-welcome-text">Welcome, {userProfile.name}</span>
                            <Link to="/dashboard" className="nav-link-dashboard">
                                Unity Desk
                            </Link>
                            {/* --- THIS IS THE FIX: Replaced style={} with className --- */}
                            <Link to="/threat-radar" className="nav-link-dashboard">Threat Radar</Link>
                            <Link to="/eco-uploads" className="nav-link-dashboard">Eco-Uploads</Link>
                            <Link to="/create-content" className="nav-link-creator">
                                Creator Section
                            </Link>
                            <Link to="/track-sdg" className="nav-link-dashboard">Track SDG</Link>
                            <Link to="/analysis" className="nav-link-dashboard">Analysis</Link>
                            <Link to="/profile" className="nav-link-dashboard">Profile</Link>
                            <button onClick={handleLogout} className="nav-link-logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link-login">
                                Login
                            </Link>
                            <Link to="/signup" className="nav-link-register">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
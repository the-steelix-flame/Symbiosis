import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../pages/frontpage/Footer';
import '../pages/new.css';

// --- UNIQUE STYLING VARIABLES FOR LOGIN PAGE ---
const loginPageUI = {
  // Layout wrapper
  loginScreenWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundImage: `url(/LOGIN.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  // Centered content (fixed for full centering)
  loginContentBox: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',   // ensures vertical centering
    padding: '0',         // remove padding that pushed it down
  },
  // Card container
  loginFormBox: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 30px',
    backgroundColor: 'rgba(13, 31, 51, 0.85)',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  // Title
  loginHeadingText: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Input wrapper
  loginFieldWrapper: {
    marginBottom: '20px',
  },
  // Label
  loginFieldLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  // Input
  loginTextInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #4A5568',
    backgroundColor: '#1A202C',
    color: '#FFFFFF',
    boxSizing: 'border-box',
  },
  // Button
  loginActionButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  // Hover
  loginActionButtonHover: {
    backgroundColor: '#16A34A',
  },
  // Error
  loginErrorText: {
    color: '#F56565',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Signup link section
  loginSignupSection: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#A0AEC0',
  },
  // Signup link text
  loginSignupLink: {
    color: '#22C55E',
    fontWeight: 'bold',
    textDecoration: 'none',
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={loginPageUI.loginScreenWrapper}>
      <main style={loginPageUI.loginContentBox}>
        <div style={loginPageUI.loginFormBox}>
          <h2 style={loginPageUI.loginHeadingText}>Log In to EcoSynth</h2>
          {error && <p style={loginPageUI.loginErrorText}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={loginPageUI.loginFieldWrapper}>
              <label style={loginPageUI.loginFieldLabel} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={loginPageUI.loginTextInput}
                required
              />
            </div>
            
            <div style={loginPageUI.loginFieldWrapper}>
              <label style={loginPageUI.loginFieldLabel} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={loginPageUI.loginTextInput}
                required
              />
            </div>
            
            <button
              disabled={loading}
              style={isHovered ? { ...loginPageUI.loginActionButton, ...loginPageUI.loginActionButtonHover } : loginPageUI.loginActionButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              type="submit"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <div style={loginPageUI.loginSignupSection}>
            Need an account? <Link to="/signup" style={loginPageUI.loginSignupLink}>Sign Up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

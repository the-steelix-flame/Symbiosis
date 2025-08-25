import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../pages/frontpage/Footer';
import '../pages/new.css';

// --- SHARED STYLING WITH LOGIN PAGE ---
const signupPageUI = {
  // Layout wrapper
  screenWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundImage: `url(/LOGIN.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  // Centered content
  contentBox: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px', // ⬅️ ensures gap from navbar (top)
  },
  // Card container
  formBox: {
    width: '100%',
    maxWidth: '520px', // ⬅️ increased from 420px to 520px
    padding: '45px 35px',
    backgroundColor: 'rgba(13, 31, 51, 0.9)',
    borderRadius: '14px',
    boxShadow: '0 10px 35px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  headingText: {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '22px',
  },
  fieldWrapper: { marginBottom: '20px' },
  fieldLabel: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#E2E8F0' },
  textInput: {
    width: '100%',
    padding: '13px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #4A5568',
    backgroundColor: '#1A202C',
    color: '#FFFFFF',
    boxSizing: 'border-box',
  },
  actionButton: {
    width: '100%',
    padding: '15px',
    fontSize: '17px',
    fontWeight: 'bold',
    backgroundColor: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'background-color 0.3s ease',
  },
  actionButtonHover: { backgroundColor: '#16A34A' },
  errorText: {
    color: '#F56565',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: '500',
  },
  loginSection: { textAlign: 'center', marginTop: '25px', color: '#A0AEC0' },
  loginLink: { color: '#22C55E', fontWeight: 'bold', textDecoration: 'none' },
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email, password, role, name, phoneNo);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account. The email might already be in use.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={signupPageUI.screenWrapper}>
      <main style={signupPageUI.contentBox}>
        <div style={signupPageUI.formBox}>
          <h2 style={signupPageUI.headingText}>Create Your EcoSynth Account</h2>
          {error && <p style={signupPageUI.errorText}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={signupPageUI.fieldWrapper}>
              <label style={signupPageUI.fieldLabel} htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                style={signupPageUI.textInput}
                required
              />
            </div>
            
            <div style={signupPageUI.fieldWrapper}>
              <label style={signupPageUI.fieldLabel} htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="Enter your phone number"
                style={signupPageUI.textInput}
              />
            </div>

            <div style={signupPageUI.fieldWrapper}>
              <label style={signupPageUI.fieldLabel} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={signupPageUI.textInput}
                required
              />
            </div>
            
            <div style={signupPageUI.fieldWrapper}>
              <label style={signupPageUI.fieldLabel} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min. 6 characters)"
                style={signupPageUI.textInput}
                required
              />
            </div>
            
            <div style={signupPageUI.fieldWrapper}>
              <label style={signupPageUI.fieldLabel} htmlFor="role-select">I am a:</label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={signupPageUI.textInput}
              >
                <option value="student">Student</option>
                <option value="community">Community Member</option>
                <option value="researcher">Researcher</option>
                <option value="ngo">NGO</option>
                <option value="gov">Government Body</option>
              </select>
            </div>
            
            <button
              disabled={loading}
              style={isHovered ? { ...signupPageUI.actionButton, ...signupPageUI.actionButtonHover } : signupPageUI.actionButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              type="submit"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div style={signupPageUI.loginSection}>
            Already have an account? <Link to="/login" style={signupPageUI.loginLink}>Log In</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

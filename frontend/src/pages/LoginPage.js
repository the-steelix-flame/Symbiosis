import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// We use the same styles object for a consistent look and feel
const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' },
  card: { width: '100%', maxWidth: '420px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
  error: { color: 'red', marginBottom: '10px', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '20px' }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Log In to EcoSynth</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>
          
          <button disabled={loading} style={styles.button} type="submit">
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div style={styles.link}>
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
  container: { display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  input: { marginBottom: '10px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
  button: { padding: '12px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '10px', textAlign: 'center' },
  label: { marginBottom: '5px', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: '15px' }
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
      <h2 style={{ textAlign: 'center' }}>Log In</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        
        <button disabled={loading} style={styles.button} type="submit">
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      <div style={styles.link}>
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
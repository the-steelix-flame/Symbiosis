import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Basic styling for demonstration purposes
const styles = {
  container: { display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  input: { marginBottom: '10px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
  select: { marginBottom: '20px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
  button: { padding: '12px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '10px', textAlign: 'center' },
  label: { marginBottom: '5px', fontWeight: 'bold' }
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email, password, role);
      navigate('/dashboard'); // Redirect to dashboard on successful signup
    } catch (err) {
      setError('Failed to create an account. The email might already be in use.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>Create Your EcoSynth Account</h2>
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
          placeholder="Choose a password (min. 6 characters)"
          style={styles.input}
          required
        />
        
        <label style={styles.label} htmlFor="role-select">I am a:</label>
        {/* This dropdown allows users to select their role during signup  */}
        <select 
          id="role-select" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          style={styles.select}
        >
          <option value="student">Student</option>
          <option value="community">Community Member</option>
          <option value="researcher">Researcher</option>
          <option value="ngo">NGO</option>
          <option value="gov">Government Body</option>
        </select>
        
        <button disabled={loading} style={styles.button} type="submit">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
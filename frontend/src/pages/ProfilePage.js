import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// ... (styles remain the same)
const styles = {
  container: { maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  infoGroup: { marginBottom: '20px' },
  label: { fontWeight: 'bold', color: '#555' },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px 0' },
  skillTag: { background: '#007bff', color: 'white', padding: '5px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center' },
  removeBtn: { marginLeft: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px' },
  inputGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  input: { flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' },
  textarea: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px', marginTop: '5px' },
  button: { padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState(''); // State for editing bio
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user data from Firestore
  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setBio(data.bio || ''); // Set bio from fetched data
          } else { setError('User data not found.'); }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch user data.');
          setLoading(false);
        });
    }
  }, [currentUser]);

  const handleBioSave = async () => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { bio: bio });
      alert('Bio updated successfully!');
    } catch (err) {
      setError('Failed to save bio.');
    }
  };

  // ... (handleAddSkill and handleRemoveSkill functions are the same)
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill || (userData.skills && userData.skills.includes(newSkill))) return;
    const updatedSkills = [...(userData.skills || []), newSkill];
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      setUserData({ ...userData, skills: updatedSkills });
      setNewSkill('');
    } catch (err) { console.error(err); setError('Failed to update skills.'); }
  };
  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = userData.skills.filter(skill => skill !== skillToRemove);
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      setUserData({ ...userData, skills: updatedSkills });
    } catch (err) { console.error(err); setError('Failed to update skills.'); }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2>My Profile</h2>
      {userData && (
        <>
          <div style={styles.infoGroup}>
            {/* --- NEW DISPLAY ORDER --- */}
            <p><span style={styles.label}>Name:</span> {userData.name}</p>
            <p><span style={styles.label}>Role:</span> {userData.role}</p>
            <p><span style={styles.label}>Phone No:</span> {userData.phoneNo}</p>
            <p><span style={styles.label}>Email:</span> {userData.email}</p>
          </div>
          
          {/* --- NEW EDITABLE BIO SECTION --- */}
          <div style={styles.infoGroup}>
            <label htmlFor="bio" style={styles.label}>Bio:</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={styles.textarea} />
            <button onClick={handleBioSave} style={{...styles.button, marginTop: '10px' }}>Save Bio</button>
          </div>

          <div style={styles.infoGroup}>
            {/* ... (skills section is the same) ... */}
            <p style={styles.label}>My Skills:</p>
            <div style={styles.skillsContainer}>
              {userData.skills && userData.skills.length > 0 ? (
                userData.skills.map(skill => (
                  <span key={skill} style={styles.skillTag}>
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} style={styles.removeBtn}>x</button>
                  </span>
                ))
              ) : ( <p>You haven't added any skills yet.</p> )}
            </div>
            <form onSubmit={handleAddSkill} style={styles.inputGroup}>
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a new skill" style={styles.input} />
              <button type="submit" style={styles.button}>Add Skill</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
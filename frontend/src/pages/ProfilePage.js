import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Leaderboard from '../components/Leaderboard';
import './ProfilePage.css';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setBio(data.bio || '');
          } else {
            setError('User data not found.');
          }
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

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim() || (userData.skills && userData.skills.includes(newSkill.trim()))) {
      setNewSkill('');
      return;
    }
    const updatedSkills = [...(userData.skills || []), newSkill.trim()];
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      setUserData({ ...userData, skills: updatedSkills });
      setNewSkill('');
    } catch (err) {
      console.error(err);
      setError('Failed to update skills.');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = userData.skills.filter(skill => skill !== skillToRemove);
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      setUserData({ ...userData, skills: updatedSkills });
    } catch (err) {
      console.error(err);
      setError('Failed to update skills.');
    }
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="profile-page-container">
      {/* THIS IS THE CHANGE: Added a wrapper to center the content */}
      <div className="profile-content-wrapper">
        <h2>My Profile</h2>
        {userData && (
          <>
            <div className="info-group">
              <p><span className="info-label">Name:</span> {userData.name}</p>
              <p><span className="info-label">Role:</span> {userData.role}</p>
              <p><span className="info-label">Points:</span> {userData.points || 0}</p>
              <p><span className="info-label">Phone No:</span> {userData.phoneNo}</p>
              <p><span className="info-label">Email:</span> {userData.email}</p>
            </div>

            <div className="info-group">
              <label htmlFor="bio" className="info-label">Bio:</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bio-textarea"
                placeholder="Tell us about yourself..."
              />
              <button onClick={handleBioSave} className="profile-button" style={{ marginTop: '10px' }}>
                Save Bio
              </button>
            </div>

            <div className="info-group">
              <p className="info-label">My Skills:</p>
              <div className="skills-container">
                {userData.skills && userData.skills.length > 0 ? (
                  userData.skills.map(skill => (
                    <span key={skill} className="skill-tag">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="remove-skill-btn">x</button>
                    </span>
                  ))
                ) : (
                  <p>You haven't added any skills yet.</p>
                )}
              </div>
              <form onSubmit={handleAddSkill} className="input-group">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  className="skill-input"
                />
                <button type="submit" className="profile-button">Add Skill</button>
              </form>
            </div>
          </>
        )}
        <Leaderboard />
      </div>
    </div>
  );
}
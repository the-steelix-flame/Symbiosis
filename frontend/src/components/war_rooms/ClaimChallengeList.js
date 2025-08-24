import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Import Link
import './ClaimChallengeList.css'; 

export default function ClaimChallengeList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      const q = query(collection(db, "claims"), where("status", "==", "available"));
      const snapshot = await getDocs(q);
      setClaims(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchClaims();
  }, []);

  if (loading) return <p>Loading challenges...</p>;

  return (
    <div className="claims-list-container">
      <h3>Science Communicator Challenges</h3>
      {claims.length > 0 ? claims.map(claim => (
        <div key={claim.id} className="claim-card">
          <p>"{claim.claimText}"</p>
          <small>From a paper by: {claim.creatorName}</small>
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            {/* --- BUTTONS UPDATED --- */}
            <Link to={'/create-content/${claim.id}'} state={{ type: 'Short' }} className="claim-action-button">
              Create Shorts for this Claim
            </Link>
            <Link to={'/create-content/${claim.id}'} state={{ type: 'Meme' }} className="claim-action-button" style={{backgroundColor: '#dd6b20'}}>
              Create Meme for this Claim
            </Link>
          </div>
        </div>
      )) : <p>No new claims available. Check back soon!</p>}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
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
          
          {/* --- THIS IS THE FIX: Buttons are now in the correct two-row layout --- */}
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* First Row: View Paper Button */}
            <div>
              <a 
                href={claim.sourcePaperURL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="claim-action-button"
                style={{ width: '100%' }} // Make the button full-width
              >
                View Supporting Paper
              </a>
            </div>

            {/* Second Row: Create Content Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/create-content/${claim.id}`} state={{ type: 'Short' }} className="claim-action-button" style={{ flex: 1 }}>
                Create Shorts for this Claim
              </Link>
              <Link to={`/create-content/${claim.id}`} state={{ type: 'Meme' }} className="claim-action-button" style={{ flex: 1 }}>
                Create Meme for this Claim
              </Link>
            </div>

          </div>
        </div>
      )) : <p>No new claims available. Check back soon!</p>}
    </div>
  );
}
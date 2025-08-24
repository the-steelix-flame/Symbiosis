import React from 'react';
import './MyClaimsList.css'; // Import the new stylesheet

// Component now accepts an onDeleteClaim function prop
export default function MyClaimsList({ claims, loading, onDeleteClaim }) {
  
  if (loading) {
    return <p>Loading your claims...</p>;
  }

  return (
    <div className="my-claims-container">
      <h3>My Submissions</h3>
      {claims.length > 0 ? (
        claims.map(claim => (
          <div key={claim.id} className="my-claim-item">
            {/* FIX: Changed claim.title to claim.claimText */}
            <p className="my-claim-title">"{claim.claimText}"</p>
            
            <a href={claim.sourcePaperURL} target="_blank" rel="noopener noreferrer" className="my-claim-source-link">
              Source
            </a>
            <br />
            <button onClick={() => onDeleteClaim(claim.id)} className="delete-claim-button">
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>You have not created any claims yet.</p>
      )}
    </div>
  );
}
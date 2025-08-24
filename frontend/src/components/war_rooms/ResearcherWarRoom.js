import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import ClaimCreator from './ClaimCreator';
import MyClaimsList from './MyClaimsList';
import MyProjectsList from './MyProjectsList';
import ActiveProjectsList from './ActiveProjectsList';
import ClaimChallengeList from './ClaimChallengeList';
import QuizGame from '../gamification/QuizGame'; // 1. Import the QuizGame component
import './WarRoom.css';

export default function ResearcherWarRoom() {
  const { currentUser } = useAuth();
  const [myClaims, setMyClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  const fetchMyClaims = useCallback(async () => {
    if (!currentUser) return;
    setLoadingClaims(true);
    try {
      const q = query(
        collection(db, "claims"), 
        where("createdBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const claimsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyClaims(claimsData);
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
    setLoadingClaims(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyClaims();
  }, [fetchMyClaims]);
  
  const handleClaimCreated = (newClaim) => {
    setMyClaims(prevClaims => [newClaim, ...prevClaims]);
  };

  const handleDeleteClaim = async (claimId) => {
    if (window.confirm("Are you sure you want to permanently delete this claim?")) {
      try {
        await deleteDoc(doc(db, "claims", claimId));
        setMyClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimId));
      } catch (error) {
        console.error("Error deleting claim: ", error);
        alert("Failed to delete the claim. Please try again.");
      }
    }
  };

  return (
    <div className="war-room-container">
      <h1>Researcher Unity Desk</h1>
      <p>
        Create new claims for science communication, review your past submissions, and collaborate on active environmental projects.
      </p>
      
      <h2 className="section-title">Science Communication</h2>
      <div className="claims-container">
        <ClaimCreator onClaimCreated={handleClaimCreated} />
        <MyClaimsList 
          claims={myClaims} 
          loading={loadingClaims} 
          onDeleteClaim={handleDeleteClaim} 
        />
      </div>

      <ClaimChallengeList />
      
      <h2 className="section-title">Project Collaboration</h2>
      <MyProjectsList />
      <ActiveProjectsList />

      {/* 2. Add the QuizGame component here */}
      <QuizGame />
    </div>
  );
}
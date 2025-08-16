import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  // --- THIS WAS MISSING. WE ARE ADDING IT BACK. ---
  const [currentUserRole, setCurrentUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  async function signup(email, password, role, name, phoneNo) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const profileData = {
      uid: user.uid,
      name: name,
      phoneNo: phoneNo || '',
      email: user.email,
      role: role,
      bio: '',
      skills: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, "users", user.uid), profileData);
    
    setUserProfile(profileData);
    // --- THIS WAS MISSING. SET THE ROLE ON SIGNUP. ---
    setCurrentUserRole(role); 
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data();
          setUserProfile(profileData);
          // --- THIS WAS MISSING. SET THE ROLE ON LOGIN. ---
          setCurrentUserRole(profileData.role); 
        }
      } else {
        setUserProfile(null);
        // --- THIS WAS MISSING. CLEAR THE ROLE ON LOGOUT. ---
        setCurrentUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    currentUserRole, // --- THIS WAS MISSING. EXPORT THE ROLE. ---
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADzVWEzHlpIkOuhTV7-3CcilmlslPOr1Y",
  authDomain: "ecosynth-hackathon.firebaseapp.com",
  projectId: "ecosynth-hackathon",
  storageBucket: "ecosynth-hackathon.firebasestorage.app",
  messagingSenderId: "314791917034",
  appId: "1:314791917034:web:47c5aae053aba796486e93"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
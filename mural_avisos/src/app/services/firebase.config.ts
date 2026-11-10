import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBVF_y3ug6V8HveU697c40VShBFILPzamg",
  authDomain: "mural-avisos-88373.firebaseapp.com",
  projectId: "mural-avisos-88373",
  storageBucket: "mural-avisos-88373.firebasestorage.app",
  messagingSenderId: "263043834791",
  appId: "1:263043834791:web:a0c89e336ecfdc6549cc82"
};

export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);


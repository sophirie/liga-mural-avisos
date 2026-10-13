import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBYSvowMRWSI1DezIamPfxMgbUq4YkCSg",
  authDomain: "mural-git.firebaseapp.com",
  projectId: "mural-git",
  storageBucket: "mural-git.firebasestorage.app",
  messagingSenderId: "932475626190",
  appId: "1:932475626190:web:f22dc6f77fc534c2d7a69f"
};

export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);


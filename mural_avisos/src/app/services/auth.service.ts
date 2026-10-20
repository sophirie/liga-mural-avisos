import { Injectable } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  async login(email: string, pass: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  }

  async registrar(email: string, pass: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    return credential.user;
  }

  async loginComGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Observa o estado do usuário em tempo real
  observarUsuario(callback: (user: User | null) => void) {
    onAuthStateChanged(auth, callback);
  }
}
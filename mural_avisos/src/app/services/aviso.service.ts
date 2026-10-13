import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase.config';

export interface AvisoFirebase {
  id?: string;
  titulo: string;
  fixado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AvisoService {

  constructor() {}

  async getAvisos(): Promise<AvisoFirebase[]> {
    const querySnapshot = await getDocs(collection(db, 'avisos'));
    const avisos: AvisoFirebase[] = [];
    querySnapshot.forEach((docSnap) => {
      avisos.push({ id: docSnap.id, ...docSnap.data() } as AvisoFirebase);
    });
    return avisos;
  }

  async adicionarAviso(titulo: string, fixado: boolean): Promise<void> {
    await addDoc(collection(db, 'avisos'), { titulo, fixado });
  }

  async atualizarFixado(id: string, fixado: boolean): Promise<void> {
    const avisoDocRef = doc(db, 'avisos', id);
    await updateDoc(avisoDocRef, { fixado });
  }
}
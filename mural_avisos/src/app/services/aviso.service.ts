import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.config';

export interface AvisoFirebase {
  id?: string;
  titulo: string;
  fixado: boolean;
  autor: 'direcao' | 'gremio' | 'coordenacao' | 'secretaria' | 'professor';
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

  async adicionarAviso(titulo: string, fixado: boolean, autor: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'avisos'), { titulo, fixado, autor });
    return docRef.id;
  }

  async atualizarFixado(id: string, fixado: boolean): Promise<void> {
    const avisoDocRef = doc(db, 'avisos', id);
    await updateDoc(avisoDocRef, { fixado });
  }

  // Função para resetar e popular o banco com os novos avisos oficiais do app
  async resetarEPopularAvisos(avisosIniciais: Omit<AvisoFirebase, 'id'>[]): Promise<AvisoFirebase[]> {
    const querySnapshot = await getDocs(collection(db, 'avisos'));
    
    // Deleta os antigos do Firestore para limpar de vez
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, 'avisos', docSnap.id));
    }

    // Adiciona os novos oficiais e guarda seus IDs reais do Firestore
    const novosAvisos: AvisoFirebase[] = [];
    for (const item of avisosIniciais) {
      const id = await this.adicionarAviso(item.titulo, item.fixado, item.autor);
      novosAvisos.push({ id, ...item });
    }

    return novosAvisos;
  }
}
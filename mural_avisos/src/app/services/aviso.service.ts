import { Injectable, computed, signal } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.config';

export type AutorAviso = 'direcao' | 'gremio' | 'coordenacao' | 'secretaria' | 'professor';

export interface AvisoFirebase {
  id?: string;
  titulo: string;
  fixado: boolean;
  autor: AutorAviso;
}

export const LIMITE_FIXADOS = 2;

// Avisos oficiais do app. Se o Firestore não tiver exatamente esta quantidade,
// a coleção é resetada e populada novamente com esta lista.
const AVISOS_OFICIAIS: Omit<AvisoFirebase, 'id'>[] = [
  { titulo: 'Manutenção no laboratório de informática', fixado: false, autor: 'direcao' },
  { titulo: 'Campeonato de ping-pong no intervalo', fixado: false, autor: 'gremio' },
  { titulo: 'Prazo final para entrega do Projeto Integrador', fixado: false, autor: 'coordenacao' },
  { titulo: 'Atualização de dados cadastrais na secretaria', fixado: false, autor: 'secretaria' },
  { titulo: 'Entrega da lista de exercícios de Física', fixado: false, autor: 'professor' },
  { titulo: 'Simulado geral preparatório para o SEPEI', fixado: false, autor: 'direcao' },
  { titulo: 'Campanha de doação de agasalhos', fixado: false, autor: 'gremio' },
  { titulo: 'Recuperação paralela da disciplina de Matemática', fixado: false, autor: 'professor' }
];

@Injectable({
  providedIn: 'root'
})
export class AvisoService {

  // ---- Estado compartilhado entre as páginas (Home e Avisos Fixados) ----
  private readonly _avisos = signal<AvisoFirebase[]>([]);

  readonly avisos = this._avisos.asReadonly();
  readonly fixados = computed(() => this._avisos().filter(a => a.fixado));
  readonly totalFixados = computed(() => this.fixados().length);

  private carregamento: Promise<void> | null = null;

  constructor() {}

  /**
   * Carrega os avisos do Firestore uma única vez. Pode ser chamado por várias
   * páginas: todas aguardam a mesma carga (evita ler/popular o banco duas vezes).
   */
  carregar(): Promise<void> {
    if (!this.carregamento) {
      this.carregamento = this.sincronizarComFirestore().catch((erro) => {
        this.carregamento = null; // permite tentar de novo numa próxima visita
        throw erro;
      });
    }
    return this.carregamento;
  }

  private async sincronizarComFirestore(): Promise<void> {
    let dadosRemotos = await this.getAvisos();

    if (dadosRemotos.length !== AVISOS_OFICIAIS.length) {
      dadosRemotos = await this.resetarEPopularAvisos(AVISOS_OFICIAIS);
    }

    this._avisos.set(dadosRemotos);
  }

  /**
   * Fixa/desafixa um aviso. Retorna uma mensagem de erro para exibir na tela,
   * ou null quando deu tudo certo.
   */
  async alternarFixar(aviso: AvisoFirebase): Promise<string | null> {
    if (!aviso || !aviso.id) return null;

    const id = aviso.id;
    const novoEstado = !aviso.fixado;

    if (novoEstado && this.totalFixados() >= LIMITE_FIXADOS) {
      return `Máximo de ${LIMITE_FIXADOS} avisos fixados. Desafixe um para fixar outro.`;
    }

    // Atualiza otimisticamente na tela
    this.definirFixado(id, novoEstado);

    try {
      await this.atualizarFixado(id, novoEstado);
      return null;
    } catch (error) {
      console.error('Erro ao atualizar no Firestore:', error);
      this.definirFixado(id, !novoEstado); // Reverte se falhar
      return 'Não foi possível atualizar o aviso. Tente novamente.';
    }
  }

  private definirFixado(id: string, fixado: boolean): void {
    this._avisos.update(lista => lista.map(a => (a.id === id ? { ...a, fixado } : a)));
  }

  // ---- Acesso ao Firestore ----

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

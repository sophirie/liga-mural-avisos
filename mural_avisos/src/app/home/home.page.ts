import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar,
  IonCard,
  IonCardContent
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AvisoService, AvisoFirebase } from '../services/aviso.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonCard,
    IonCardContent
  ],
})
export class HomePage implements OnInit {
  
  private avisoService = inject(AvisoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuarioNome: string = 'Usuário';

  avisos: AvisoFirebase[] = [];

  filtroGeral: string = 'todos';
  filtroFixados: string = 'todos';
  mensagemErro: string = '';

  ngOnInit() {
    this.authService.observarUsuario((user) => {
      if (user && user.email) {
        this.usuarioNome = user.email.split('@')[0];
      } else {
        this.usuarioNome = 'Visitante';
      }
      this.cdr.detectChanges();
    });

    this.sincronizarComFirestore();
  }

  async sincronizarComFirestore() {
    try {
      let dadosRemotos = await this.avisoService.getAvisos();

      // Se o banco estiver vazio ou ainda tiver os dados antigos (menos de 8 itens ou sem o novo formato),
      // nós populamos automaticamente com os novos avisos oficiais no Firestore.
      const listaOficial = [
        { titulo: 'Manutenção no laboratório de informática', fixado: false, autor: 'direcao' as const },
        { titulo: 'Campeonato de ping-pong no intervalo', fixado: false, autor: 'gremio' as const },
        { titulo: 'Prazo final para entrega do Projeto Integrador', fixado: false, autor: 'coordenacao' as const },
        { titulo: 'Atualização de dados cadastrais na secretaria', fixado: false, autor: 'secretaria' as const },
        { titulo: 'Entrega da lista de exercícios de Física', fixado: false, autor: 'professor' as const },
        { titulo: 'Simulado geral preparatório para o SEPEI', fixado: false, autor: 'direcao' as const },
        { titulo: 'Campanha de doação de agasalhos', fixado: false, autor: 'gremio' as const },
        { titulo: 'Recuperação paralela da disciplina de Matemática', fixado: false, autor: 'professor' as const }
      ];

      if (dadosRemotos.length !== 8) {
        // Reseta e popula o Firestore de verdade com os novos
        dadosRemotos = await this.avisoService.resetarEPopularAvisos(listaOficial);
      }

      this.avisos = dadosRemotos;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao sincronizar com o Firestore:', error);
    }
  }

  avisosFiltrados(): AvisoFirebase[] {
    if (this.filtroGeral === 'todos') {
      return this.avisos;
    }
    return this.avisos.filter(a => a.autor === this.filtroGeral);
  }

  avisosFixadosFiltrados(): AvisoFirebase[] {
    const fixados = this.avisos.filter(a => a.fixado);
    if (this.filtroFixados === 'todos') {
      return fixados;
    }
    return fixados.filter(a => a.autor === this.filtroFixados);
  }

  contarFixados(): number {
    return this.avisos.filter(a => a.fixado).length;
  }

  async alternarFixar(aviso: AvisoFirebase) {
    if (!aviso || !aviso.id) return;

    this.mensagemErro = '';
    const novoEstado = !aviso.fixado;

    if (novoEstado) {
      if (this.contarFixados() >= 2) {
        this.mensagemErro = 'Máximo de 2 avisos fixados. Desafixe um para fixar outro.';
        this.cdr.detectChanges();
        return;
      }
    }

    // Atualiza otimisticamente na tela
    aviso.fixado = novoEstado;
    this.cdr.detectChanges();

    try {
      // Salva a alteração direto no documento correto do Firestore
      await this.avisoService.atualizarFixado(aviso.id, novoEstado);
    } catch (error) {
      console.error('Erro ao atualizar no Firestore:', error);
      aviso.fixado = !novoEstado; // Reverte se falhar
      this.cdr.detectChanges();
    }
  }

  async sair() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}
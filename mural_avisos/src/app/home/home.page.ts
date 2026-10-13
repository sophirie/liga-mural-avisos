import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular';
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
    IonContent
  ],
})
export class HomePage implements OnInit {
  
  // Lista inicial padrão para aparecer IMEDIATAMENTE na tela
  avisos: AvisoFirebase[] = [
    { id: '1', titulo: 'Prova adiada', fixado: true },
    { id: '2', titulo: 'Lista 3 no Moodle', fixado: false },
    { id: '3', titulo: 'Reuniao de pais', fixado: false },
    { id: '4', titulo: 'Doacao de sangue', fixado: true },
    { id: '5', titulo: 'Saida antecipada', fixado: false }
  ];

  mensagemErro: string = '';

  constructor(
    private avisoService: AvisoService, 
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Tenta carregar do Firestore em segundo plano para atualizar se houver dados salvos
    this.sincronizarComFirestore();
  }

  async sincronizarComFirestore() {
    try {
      const dadosRemotos = await this.avisoService.getAvisos();
      if (dadosRemotos && dadosRemotos.length > 0) {
        this.avisos = dadosRemotos;
      } else {
        // Se o Firestore estiver vazio, salva os padrões lá para futuras sessões
        for (const item of this.avisos) {
          await this.avisoService.adicionarAviso(item.titulo, item.fixado);
        }
        this.avisos = await this.avisoService.getAvisos();
      }
    } catch (error) {
      console.error('Erro ao sincronizar com o Firestore (usando padrão local):', error);
    }
  }

  contarFixados(): number {
    return this.avisos.filter(a => a.fixado).length;
  }

  avisosFixados(): AvisoFirebase[] {
    return this.avisos.filter(a => a.fixado);
  }

  async alternarFixar(aviso: AvisoFirebase) {
    this.mensagemErro = '';

    if (!aviso.fixado) {
      if (this.contarFixados() >= 2) {
        this.mensagemErro = 'Max. 2 avisos fixados. Desafixe um para fixar outro.';
        return;
      }
      aviso.fixado = true;
    } else {
      aviso.fixado = false;
    }

    // Salva a alteração no Firestore se tiver ID válido
    if (aviso.id) {
      try {
        await this.avisoService.atualizarFixado(aviso.id, aviso.fixado);
      } catch (error) {
        console.error('Erro ao atualizar no Firestore:', error);
      }
    }
  }

  // Botão de sair funcional
  async sair() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}
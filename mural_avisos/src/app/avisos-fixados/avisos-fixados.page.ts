import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardContent,
  NavController
} from '@ionic/angular';
import { AvisoService, AvisoFirebase, LIMITE_FIXADOS } from '../services/aviso.service';
import { BarraUsuarioComponent } from '../components/barra-usuario/barra-usuario.component';
import { FILTROS_AUTOR, FiltroAutor, filtrarPorAutor } from '../shared/filtros';

@Component({
  selector: 'app-avisos-fixados',
  templateUrl: './avisos-fixados.page.html',
  styleUrls: ['./avisos-fixados.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    BarraUsuarioComponent
  ],
})
export class AvisosFixadosPage implements OnInit {

  private avisoService = inject(AvisoService);
  private navCtrl = inject(NavController);

  readonly filtros = FILTROS_AUTOR;
  readonly limiteFixados = LIMITE_FIXADOS;

  filtro = signal<FiltroAutor>('todos');
  mensagemErro = signal('');

  avisosFixadosFiltrados = computed(() =>
    filtrarPorAutor(this.avisoService.fixados(), this.filtro())
  );
  totalFixados = this.avisoService.totalFixados;

  ngOnInit() {
    // Se o usuário abrir /avisos-fixados direto (ex.: F5), carrega por aqui.
    // Se já veio da Home, os dados já estão em memória e nada é recarregado.
    this.avisoService.carregar().catch((error) => {
      console.error('Erro ao sincronizar com o Firestore:', error);
    });
  }

  async desafixar(aviso: AvisoFirebase) {
    this.mensagemErro.set('');
    const erro = await this.avisoService.alternarFixar(aviso);
    if (erro) {
      this.mensagemErro.set(erro);
    }
  }

  voltar() {
    this.navCtrl.navigateBack('/home');
  }
}

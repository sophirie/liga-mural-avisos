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
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    BarraUsuarioComponent
  ],
})
export class HomePage implements OnInit {

  private avisoService = inject(AvisoService);
  private navCtrl = inject(NavController);

  readonly filtros = FILTROS_AUTOR;
  readonly limiteFixados = LIMITE_FIXADOS;

  filtro = signal<FiltroAutor>('todos');
  mensagemErro = signal('');

  avisosFiltrados = computed(() =>
    filtrarPorAutor(this.avisoService.avisos(), this.filtro())
  );
  totalFixados = this.avisoService.totalFixados;

  ngOnInit() {
    this.avisoService.carregar().catch((error) => {
      console.error('Erro ao sincronizar com o Firestore:', error);
    });
  }

  async alternarFixar(aviso: AvisoFirebase) {
    this.mensagemErro.set('');
    const erro = await this.avisoService.alternarFixar(aviso);
    if (erro) {
      this.mensagemErro.set(erro);
    }
  }

  verAvisosFixados() {
    this.navCtrl.navigateForward('/avisos-fixados');
  }
}

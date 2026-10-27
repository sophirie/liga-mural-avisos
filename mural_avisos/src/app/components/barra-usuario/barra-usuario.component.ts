import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra-usuario',
  templateUrl: './barra-usuario.component.html',
  styleUrls: ['./barra-usuario.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar],
})
export class BarraUsuarioComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  usuarioNome: string = 'Usuário';

  private pararDeObservar?: () => void;

  ngOnInit() {
    this.pararDeObservar = this.authService.observarUsuario((user) => {
      if (user && user.email) {
        this.usuarioNome = user.email.split('@')[0];
      } else {
        this.usuarioNome = 'Visitante';
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.pararDeObservar?.();
  }

  async sair() {
    try {
      await this.authService.logout();
      // navigateRoot limpa a pilha de páginas (Home / Avisos Fixados),
      // assim o botão "voltar" não leva de volta para telas autenticadas.
      await this.navCtrl.navigateRoot('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}

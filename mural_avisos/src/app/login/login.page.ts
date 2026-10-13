import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent]
})
export class LoginPage {
  email: string = '';
  senha: string = '';
  mensagemErro: string = '';

  constructor(private authService: AuthService) {}

  async entrar() {
    this.mensagemErro = '';
    try {
      await this.authService.login(this.email, this.senha);
      window.location.href = '/home';
    } catch (error: any) {
      this.mensagemErro = error.message || 'Erro ao iniciar sessão. Verifique os dados.';
    }
  }

  async entrarComGoogle() {
    this.mensagemErro = '';
    try {
      await this.authService.loginComGoogle();
      window.location.href = '/home';
    } catch (error: any) {
      this.mensagemErro = error.message || 'Erro ao autenticar com o Google.';
    }
  }
}
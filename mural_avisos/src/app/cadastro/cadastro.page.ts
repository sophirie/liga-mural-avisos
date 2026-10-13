import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent]
})
export class CadastroPage {
  email: string = '';
  senha: string = '';
  mensagemErro: string = '';
  mensagemSucesso: string = '';

  constructor(private authService: AuthService) {}

  async registrar() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    try {
      await this.authService.registrar(this.email, this.senha);
      this.mensagemSucesso = 'Conta criada com sucesso! Redirecionando para o login...';
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error: any) {
      this.mensagemErro = error.message || 'Erro ao criar conta. Verifique os dados.';
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
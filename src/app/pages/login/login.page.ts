import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async onLogin() {
    this.loading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/tabs/dashboard']);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'An error occurred';
      this.showToast(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
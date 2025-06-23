import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit, OnDestroy {
  email: string = '';
  private authSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación si lo expones como observable
    // O hacer un chequeo puntual:
    this.authService.getCurrentUser()
      .then(user => {
        this.email = user.email;
      })
      .catch(() => {
        // Si no está logueado, redirigir a login
        this.router.navigate(['/login']);
      });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  async onLogout() {
    try {
      await this.authService.logout();
      const toast = await this.toastCtrl.create({
        message: 'Sesión cerrada correctamente',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
      this.router.navigate(['/login']);
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Error al cerrar sesión',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
    }
  }
}

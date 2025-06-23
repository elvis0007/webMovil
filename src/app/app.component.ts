import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.authService.getCurrentUser().then(user => {
        if (user) {
          this.router.navigate(['/tabs/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      }).catch(() => {
        this.router.navigate(['/login']);
      });
    });
  }
}
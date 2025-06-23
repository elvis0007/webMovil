import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, map, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Adjust the path if needed

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // convierte la promesa en observable
    return from(this.auth.getCurrentUser()).pipe(
      switchMap(user => {
        if (user) return of(true);
        this.router.navigate(['/login']);
        return of(false);
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
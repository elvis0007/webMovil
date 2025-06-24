import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { FirebaseError } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private storage: Storage,
    private firestore: AngularFirestore,
    private alertCtrl: AlertController
  ) {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    await this.storage.create();
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (!user) throw new Error('User not found after sign in');

      const mappedUser: User = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        photoURL: user.photoURL ?? ''
      };

      await this.storage.set('user', mappedUser);
      return mappedUser;

    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      await this.storage.remove('user');
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en AuthService.logout:', error);
      throw error;
    }
  }

  async register(userData: { email: string; password: string; displayName?: string }): Promise<User | null> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(userData.email, userData.password);
      if (!user) throw new Error('No se pudo crear el usuario');

      if (userData.displayName) {
        await user.updateProfile({ displayName: userData.displayName });
      }

      await this.createUserProfile(user.uid, userData);

      const mappedUser: User = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        photoURL: user.photoURL ?? ''
      };

      await this.storage.set('user', mappedUser);
      return mappedUser;

    } catch (error) {
      await this.handleAuthError(error);
      return null;
    }
  }

  private async handleAuthError(error: unknown): Promise<void> {
    let errorMessage = 'Ocurrió un error durante el registro';

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
      }
    }

    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: errorMessage,
      buttons: ['OK']
    });

    await alert.present();
  }

  getCurrentUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.afAuth.onAuthStateChanged(user => {
        if (user) {
          const mappedUser: User = {
            uid: user.uid,
            email: user.email ?? '',
            displayName: user.displayName ?? '',
            photoURL: user.photoURL ?? ''
          };
          resolve(mappedUser);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  private async createUserProfile(uid: string, userData: any): Promise<void> {
    const userProfile = {
      uid,
      email: userData.email,
      displayName: userData.displayName || '',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await this.firestore.doc(`users/${uid}`).set(userProfile);
  }
}

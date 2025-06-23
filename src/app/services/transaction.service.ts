import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {}

  // Cambiado a 'movements'
 getTransactions(): Observable<Transaction[]> {
  return new Observable(observer => {
    this.authService.getCurrentUser()
      .then(user => {
        if (!user) {
          observer.error('Usuario no autenticado');
          return;
        }
        this.afs.collection<Transaction>('movements', ref =>
          ref.where('userId', '==', user.uid)
            .orderBy('date', 'desc')
        ).snapshotChanges().subscribe(actions => {
          const transactions = actions.map(a => {
            const data = a.payload.doc.data() as Transaction;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
          observer.next(transactions);
        }, err => observer.error(err));
      })
      .catch(err => observer.error(err));
  });
}



  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
  const user = await this.authService.getCurrentUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const transactionWithUser = {
    ...transaction,
    userId: user.uid,
    date: transaction.date || new Date().toISOString()
  };

  await this.afs.collection('movements').add(transactionWithUser);
}


  deleteTransaction(id: string): Promise<void> {
    return this.afs.doc(`movements/${id}`).delete();
  }
}

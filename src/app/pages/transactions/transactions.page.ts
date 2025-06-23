import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: false
})
export class TransactionsPage implements OnInit, OnDestroy {
  form: FormGroup;
  transactions: Transaction[] = [];
  private transactionsSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      type: ['expense', Validators.required], // 'expense' or 'income'
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      date: [new Date().toISOString(), Validators.required]
    });
  }

  ngOnInit() {
    this.transactionsSub = this.transactionService.getTransactions().subscribe({
      next: (transactions) => this.transactions = transactions,
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error al cargar transacciones',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  ngOnDestroy() {
    this.transactionsSub?.unsubscribe();
  }

  async saveMovement() {
    if (this.form.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const userId = 'CURRENT_USER_ID'; // Replace with actual user ID retrieval logic
    const transaction: Omit<Transaction, 'id'> = {
      type: this.form.value.type,
      amount: this.form.value.amount,
      description: this.form.value.description,
      category: this.form.value.category,
      date: this.form.value.date,
      userId: userId
    };


    try {
      await this.transactionService.addTransaction(transaction);
      const toast = await this.toastCtrl.create({
        message: 'Movimiento guardado correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.form.reset({
        type: 'expense',
        date: new Date().toISOString()
      });
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar el movimiento',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async confirmDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Seguro que deseas eliminar esta transacción?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => this.deleteTransaction(id) }
      ]
    });
    await alert.present();
  }

  async deleteTransaction(id: string) {
    try {
      await this.transactionService.deleteTransaction(id);
      const toast = await this.toastCtrl.create({
        message: 'Transacción eliminada',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Error al eliminar la transacción',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
}

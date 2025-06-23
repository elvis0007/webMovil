import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, OnDestroy {
  @ViewChild('pieChart') pieChartRef!: { nativeElement: HTMLCanvasElement };
  @ViewChild('barChart') barChartRef!: { nativeElement: HTMLCanvasElement };

  pieChart?: Chart<'pie'>;
  barChart?: Chart<'bar'>;

  totalIncome: number = 0;
  totalExpense: number = 0;
  balance: number = 0;
  userCurrency: string = 'USD';
  transactions: Transaction[] = [];
  private transactionsSub?: Subscription;

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser(); // ✅ aquí todo bien
this.transactionsSub = this.transactionService.getTransactions().subscribe({

      next: transactions => {
          this.transactions = transactions;
          this.calculateTotals();
          this.updateCharts();
        },
        error: err => console.error('Error loading transactions:', err)
      });
    } catch (error) {
    }
  }

  ngOnDestroy() {
    this.transactionsSub?.unsubscribe();
    this.pieChart?.destroy();
    this.barChart?.destroy();
  }

  private calculateTotals() {
    this.totalIncome = this.sumTransactionsByType('income');
    this.totalExpense = this.sumTransactionsByType('expense');
    this.balance = this.totalIncome - this.totalExpense;
  }

  private sumTransactionsByType(type: 'income' | 'expense'): number {
    return this.transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private createCharts() {
    if (!this.pieChart && this.pieChartRef) {
      this.pieChart = this.createPieChart();
    }

    if (!this.barChart && this.barChartRef) {
      this.barChart = this.createBarChart();
    }
  }

  private createPieChart(): Chart<'pie'> {
    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Gastos por categoría' }
        }
      }
    };
    return new Chart(this.pieChartRef.nativeElement, config);
  }

  private createBarChart(): Chart<'bar'> {
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ingresos',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Gastos',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Resumen mensual' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
    return new Chart(this.barChartRef.nativeElement, config);
  }

  private updateCharts() {
    this.createCharts();
    this.updatePieChart();
    this.updateBarChart();
  }

  private updatePieChart() {
    if (!this.pieChart) return;

    const categories = [...new Set(
      this.transactions.filter(t => t.type === 'expense').map(t => t.category)
    )];

    const categoryData = categories.map(cat =>
      this.transactions
        .filter(t => t.category === cat && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    );

    this.pieChart.data.labels = categories;
    this.pieChart.data.datasets[0].data = categoryData;
    this.pieChart.data.datasets[0].backgroundColor = this.generateColors(categories.length);
    this.pieChart.update();
  }

  private updateBarChart() {
    if (!this.barChart) return;

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();

    const incomeData = months.map((_, i) =>
      this.sumMonthlyTransactions(i, currentYear, 'income'));

    const expenseData = months.map((_, i) =>
      this.sumMonthlyTransactions(i, currentYear, 'expense'));

    this.barChart.data.labels = months;
    this.barChart.data.datasets[0].data = incomeData;
    this.barChart.data.datasets[1].data = expenseData;
    this.barChart.update();
  }

  private sumMonthlyTransactions(month: number, year: number, type: 'income' | 'expense'): number {
    return this.transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month &&
               date.getFullYear() === year &&
               t.type === type;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private generateColors(count: number): string[] {
    return Array.from({ length: count }, (_, i) =>
      `hsl(${(i * 360) / count}, 70%, 50%)`
    );
  }
}

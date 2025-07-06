import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

// NEW: Import and register Chart.js components
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PieController,
  LineController,
  BarController,
} from 'chart.js';

import {
  FinancialData,
  Transaction,
  BudgetProgress,
} from '../../services/financial-data';

// Register Chart.js components
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PieController,
  LineController,
  BarController
);

/**
 * Enhanced Dashboard Component - Now with visual analytics and charts
 *
 * This component demonstrates:
 * - Chart.js integration for data visualization
 * - Real-time chart updates when data changes
 * - Multiple chart types (pie, line, bar)
 * - Budget progress visualization
 * - Professional dashboard layout
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, and built-in pipes
    BaseChartDirective, // Chart directive for rendering charts
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  // Existing properties
  totalIncome = 0;
  totalExpenses = 0;
  recentTransactions: Transaction[] = [];

  // NEW: Chart data properties
  budgetProgress: BudgetProgress[] = [];

  // NEW: Expense breakdown pie chart data
  expenseChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#f56565',
          '#4299e1',
          '#9f7aea',
          '#ed8936',
          '#38b2ac',
          '#fc8181',
          '#4fd1c7',
          '#63b3ed',
          '#68d391',
          '#a0aec0',
        ],
      },
    ],
  };

  // NEW: Income vs Expenses trend chart data
  trendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [],
        borderColor: '#f56565',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // NEW: Chart configuration options
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = ((value / this.totalExpenses) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Subscriptions array to manage memory and prevent leaks
  private subscriptions: Subscription[] = [];

  // Computed property - shows how TypeScript getters work with live data
  get totalSavings(): number {
    return this.totalIncome - this.totalExpenses;
  }

  // NEW: Get budget health status
  get budgetHealthStatus(): string {
    if (this.budgetProgress.length === 0) return 'No Goals Set';

    const overBudgetCount = this.budgetProgress.filter(
      (p) => p.isOverBudget
    ).length;
    const warningCount = this.budgetProgress.filter(
      (p) => p.percentageUsed >= 80 && !p.isOverBudget
    ).length;

    if (overBudgetCount > 0) return 'Over Budget';
    if (warningCount > 0) return 'Warning';
    return 'On Track';
  }

  // NEW: Get budget health color
  get budgetHealthColor(): string {
    switch (this.budgetHealthStatus) {
      case 'Over Budget':
        return '#f56565';
      case 'Warning':
        return '#ed8936';
      case 'On Track':
        return '#48bb78';
      default:
        return '#a0aec0';
    }
  }

  constructor(private financialDataService: FinancialData) {
    console.log('Enhanced Dashboard component initialized with charts');
  }

  ngOnInit(): void {
    this.setupDataSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Dashboard subscriptions cleaned up');
  }

  /**
   * Set up subscriptions to our financial data service
   * Now includes chart data updates
   */
  private setupDataSubscriptions(): void {
    // Subscribe to total income changes
    const incomeSubscription = this.financialDataService
      .getTotalIncome()
      .subscribe({
        next: (total) => {
          this.totalIncome = total;
          this.updateTrendChart(); // Update charts when data changes
          console.log('Dashboard: Total income updated to', total);
        },
        error: (error) => {
          console.error('Error getting total income:', error);
        },
      });

    // Subscribe to total expenses changes
    const expensesSubscription = this.financialDataService
      .getTotalExpenses()
      .subscribe({
        next: (total) => {
          this.totalExpenses = total;
          this.updateTrendChart(); // Update charts when data changes
          console.log('Dashboard: Total expenses updated to', total);
        },
        error: (error) => {
          console.error('Error getting total expenses:', error);
        },
      });

    // Subscribe to recent transactions changes
    const transactionsSubscription = this.financialDataService
      .getRecentTransactions()
      .subscribe({
        next: (transactions) => {
          this.recentTransactions = transactions;
          console.log('Dashboard: Recent transactions updated', transactions);
        },
        error: (error) => {
          console.error('Error getting recent transactions:', error);
        },
      });

    // NEW: Subscribe to expenses for expense breakdown chart
    const expensesDataSubscription =
      this.financialDataService.expenses$.subscribe({
        next: (expenses) => {
          this.updateExpenseChart(expenses);
        },
        error: (error) => {
          console.error('Error getting expenses data:', error);
        },
      });

    // NEW: Subscribe to budget progress
    const budgetSubscription = this.financialDataService
      .getBudgetProgress()
      .subscribe({
        next: (progress) => {
          this.budgetProgress = progress;
          console.log('Dashboard: Budget progress updated', progress);
        },
        error: (error) => {
          console.error('Error getting budget progress:', error);
        },
      });

    // Store subscriptions for cleanup
    this.subscriptions.push(
      incomeSubscription,
      expensesSubscription,
      transactionsSubscription,
      expensesDataSubscription,
      budgetSubscription
    );
  }

  /**
   * NEW: Update expense breakdown pie chart
   */
  private updateExpenseChart(expenses: any[]): void {
    // Group expenses by category for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    // Calculate totals by category
    const categoryTotals: { [key: string]: number } = {};
    currentMonthExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Update chart data
    this.expenseChartData = {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            '#f56565',
            '#4299e1',
            '#9f7aea',
            '#ed8936',
            '#38b2ac',
            '#fc8181',
            '#4fd1c7',
            '#63b3ed',
            '#68d391',
            '#a0aec0',
          ],
        },
      ],
    };
  }

  /**
   * NEW: Update income vs expenses trend chart - Now shows monthly trends
   */
  private updateTrendChart(): void {
    // Calculate last 6 months of data for meaningful trends
    const monthsToShow = 6;
    const monthLabels: string[] = [];
    const monthlyIncomeData: number[] = [];
    const monthlyExpenseData: number[] = [];

    // Get current date
    const currentDate = new Date();

    // Loop through the last 6 months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const targetDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthLabel = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      monthLabels.push(monthLabel);

      // Calculate income for this month
      const monthlyIncome = this.calculateMonthlyTotal('income', targetDate);
      monthlyIncomeData.push(monthlyIncome);

      // Calculate expenses for this month
      const monthlyExpenses = this.calculateMonthlyTotal(
        'expenses',
        targetDate
      );
      monthlyExpenseData.push(monthlyExpenses);
    }

    // Update the chart data with monthly trends
    this.trendChartData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: monthlyIncomeData,
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          fill: true, // Add area fill for better visual
        },
        {
          label: 'Expenses',
          data: monthlyExpenseData,
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          tension: 0.4,
          fill: true, // Add area fill for better visual
        },
      ],
    };

    console.log('Trend chart updated with monthly data:', {
      labels: monthLabels,
      income: monthlyIncomeData,
      expenses: monthlyExpenseData,
    });
  }

  /**
   * NEW: Helper method to calculate monthly totals for income or expenses
   */
  private calculateMonthlyTotal(
    type: 'income' | 'expenses',
    targetDate: Date
  ): number {
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    if (type === 'income') {
      // Get current income data from the service
      const currentIncome = this.financialDataService.getCurrentIncome();
      return currentIncome
        .filter((income) => {
          const incomeDate = new Date(income.date);
          return (
            incomeDate.getMonth() === targetMonth &&
            incomeDate.getFullYear() === targetYear
          );
        })
        .reduce((sum, income) => sum + income.amount, 0);
    } else {
      // Get current expense data from the service
      const currentExpenses = this.financialDataService.getCurrentExpenses();
      return currentExpenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getMonth() === targetMonth &&
            expenseDate.getFullYear() === targetYear
          );
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
    }
  }

  // Existing event handler methods
  onAddIncome(): void {
    console.log('Add Income clicked - this would open an income form');
    alert(
      'Add Income feature - this could open the Income page or a quick-add form!'
    );
  }

  onAddExpense(): void {
    console.log('Add Expense clicked - this would open an expense form');
    alert(
      'Add Expense feature - this could open the Expenses page or a quick-add form!'
    );
  }

  onViewReports(): void {
    console.log('View Reports clicked - this would navigate to reports page');
    alert('Reports feature coming soon!');
  }

  // Method to get the icon for each transaction type
  getTransactionIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? '💵' : '💳';
  }

  // Method to get CSS class for styling different transaction types
  getTransactionClass(amount: number): string {
    return amount > 0 ? 'positive' : 'negative';
  }
}

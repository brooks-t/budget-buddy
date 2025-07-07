import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Add Router import
import { Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

// Import Chart.js components
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
  Filler,
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
  BarController,
  Filler
);

/**
 * Enhanced Dashboard Component - Complete financial overview
 *
 * This component demonstrates:
 * - Professional dashboard layout with real-time data
 * - Advanced chart integration with Chart.js
 * - Responsive design and mobile optimization
 * - Navigation integration with Angular Router
 * - Enterprise-level data visualization
 * - Real-time updates and data synchronization
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
  // Core financial data properties
  totalIncome = 0;
  totalExpenses = 0;
  recentTransactions: Transaction[] = [];
  budgetProgress: BudgetProgress[] = [];

  // Chart data properties
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

  trendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: [],
        borderColor: '#f56565',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart configuration options
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

  // Subscriptions for memory management
  private subscriptions: Subscription[] = [];

  // Computed properties for dynamic data
  get totalSavings(): number {
    return this.totalIncome - this.totalExpenses;
  }

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

  // Inject both the financial service and router for navigation
  constructor(
    private financialDataService: FinancialData,
    private router: Router // Add router injection
  ) {
    console.log('Enhanced Dashboard component initialized with navigation');
  }

  ngOnInit(): void {
    this.setupDataSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Dashboard subscriptions cleaned up');
  }

  /**
   * Set up subscriptions to financial data with real-time updates
   */
  private setupDataSubscriptions(): void {
    // Subscribe to total income changes
    const incomeSubscription = this.financialDataService
      .getTotalIncome()
      .subscribe({
        next: (total) => {
          this.totalIncome = total;
          this.updateTrendChart();
          console.log('Dashboard: Total income updated to', total);
        },
        error: (error) => console.error('Error getting total income:', error),
      });

    // Subscribe to total expenses changes
    const expensesSubscription = this.financialDataService
      .getTotalExpenses()
      .subscribe({
        next: (total) => {
          this.totalExpenses = total;
          this.updateTrendChart();
          console.log('Dashboard: Total expenses updated to', total);
        },
        error: (error) => console.error('Error getting total expenses:', error),
      });

    // Subscribe to recent transactions
    const transactionsSubscription = this.financialDataService
      .getRecentTransactions()
      .subscribe({
        next: (transactions) => {
          this.recentTransactions = transactions;
          console.log('Dashboard: Recent transactions updated', transactions);
        },
        error: (error) =>
          console.error('Error getting recent transactions:', error),
      });

    // Subscribe to expense data for charts
    const expensesDataSubscription =
      this.financialDataService.expenses$.subscribe({
        next: (expenses) => {
          this.updateExpenseChart(expenses);
        },
        error: (error) => console.error('Error getting expenses data:', error),
      });

    // Subscribe to budget progress
    const budgetSubscription = this.financialDataService
      .getBudgetProgress()
      .subscribe({
        next: (progress) => {
          this.budgetProgress = progress;
          console.log('Dashboard: Budget progress updated', progress);
        },
        error: (error) =>
          console.error('Error getting budget progress:', error),
      });

    // Store all subscriptions for cleanup
    this.subscriptions.push(
      incomeSubscription,
      expensesSubscription,
      transactionsSubscription,
      expensesDataSubscription,
      budgetSubscription
    );
  }

  /**
   * Update expense breakdown pie chart with current month data
   */
  private updateExpenseChart(expenses: any[]): void {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    // Group by category
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
   * Update income vs expenses trend chart with 6-month history
   */
  private updateTrendChart(): void {
    const monthsToShow = 6;
    const monthLabels: string[] = [];
    const monthlyIncomeData: number[] = [];
    const monthlyExpenseData: number[] = [];
    const currentDate = new Date();

    // Generate data for last 6 months
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

      // Calculate monthly totals
      const monthlyIncome = this.calculateMonthlyTotal('income', targetDate);
      const monthlyExpenses = this.calculateMonthlyTotal(
        'expenses',
        targetDate
      );

      monthlyIncomeData.push(monthlyIncome);
      monthlyExpenseData.push(monthlyExpenses);
    }

    // Update chart data
    this.trendChartData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: monthlyIncomeData,
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Expenses',
          data: monthlyExpenseData,
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }

  /**
   * Calculate monthly total for income or expenses
   */
  private calculateMonthlyTotal(
    type: 'income' | 'expenses',
    targetDate: Date
  ): number {
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    if (type === 'income') {
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

  // Navigation methods - now with proper Angular Router integration
  onAddIncome(): void {
    console.log('Navigating to Income page');
    this.router.navigate(['/income']);
  }

  onAddExpense(): void {
    console.log('Navigating to Expenses page');
    this.router.navigate(['/expenses']);
  }

  onViewReports(): void {
    console.log('Navigating to Reports page');
    this.router.navigate(['/reports']);
  }

  onManageGoals(): void {
    console.log('Navigating to Goals page');
    this.router.navigate(['/goals']);
  }

  // Utility methods for template
  getTransactionIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? '💵' : '💳';
  }

  getTransactionClass(amount: number): string {
    return amount > 0 ? 'positive' : 'negative';
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

// Import Chart.js components for advanced charts
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  PieController,
  LineController,
  BarController,
} from 'chart.js';

import {
  FinancialData,
  IncomeEntry,
  ExpenseEntry,
  BudgetGoal,
} from '../../services/financial-data';

// Register Chart.js components for reports
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  PieController,
  LineController,
  BarController
);

/**
 * Reports & Analytics Component
 *
 * This component demonstrates:
 * - Advanced data filtering and date range selection
 * - Multiple chart types for comprehensive analysis
 * - Data export functionality
 * - Professional reporting interface
 * - Time-based financial analysis
 */
@Component({
  selector: 'app-reports',
  imports: [
    CommonModule, // For *ngFor, *ngIf, pipes
    FormsModule, // For form controls and ngModel
    BaseChartDirective, // For chart rendering
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit, OnDestroy {
  // Data properties
  private subscriptions: Subscription[] = [];
  allIncome: IncomeEntry[] = [];
  allExpenses: ExpenseEntry[] = [];
  budgetGoals: BudgetGoal[] = [];

  // Filter properties
  selectedTimeRange: string = 'last3months';
  customStartDate: string = '';
  customEndDate: string = '';
  selectedCategory: string = 'all';

  // Available categories for filtering
  availableCategories: string[] = [];

  // Computed data for charts
  filteredIncome: IncomeEntry[] = [];
  filteredExpenses: ExpenseEntry[] = [];

  // Chart data properties
  monthlyTrendChart: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  categoryBreakdownChart: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  incomeSourceChart: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#48bb78',
          '#4299e1',
          '#9f7aea',
          '#ed8936',
          '#38b2ac',
          '#fc8181',
          '#4fd1c7',
          '#63b3ed',
        ],
      },
    ],
  };

  // Chart configuration options
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Income vs Expenses Trend',
      },
      legend: {
        position: 'top',
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
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Spending by Category',
      },
      legend: {
        display: false,
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
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Income Sources',
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  constructor(private financialDataService: FinancialData) {
    console.log('Reports component initialized');
  }

  ngOnInit(): void {
    this.loadFinancialData();
    this.initializeDateRange();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Reports subscriptions cleaned up');
  }

  /**
   * Load all financial data from the service
   */
  private loadFinancialData(): void {
    // Subscribe to income data
    const incomeSubscription = this.financialDataService.income$.subscribe({
      next: (income) => {
        this.allIncome = income;
        this.updateReports();
      },
      error: (error) => {
        console.error('Error loading income data:', error);
      },
    });

    // Subscribe to expense data
    const expenseSubscription = this.financialDataService.expenses$.subscribe({
      next: (expenses) => {
        this.allExpenses = expenses;
        this.extractCategories();
        this.updateReports();
      },
      error: (error) => {
        console.error('Error loading expense data:', error);
      },
    });

    // Subscribe to budget goals
    const budgetSubscription = this.financialDataService.budgetGoals$.subscribe(
      {
        next: (goals) => {
          this.budgetGoals = goals;
        },
        error: (error) => {
          console.error('Error loading budget goals:', error);
        },
      }
    );

    this.subscriptions.push(
      incomeSubscription,
      expenseSubscription,
      budgetSubscription
    );
  }

  /**
   * Extract unique categories from expenses for filter dropdown
   */
  private extractCategories(): void {
    const categories = new Set(
      this.allExpenses.map((expense) => expense.category)
    );
    this.availableCategories = ['all', ...Array.from(categories)];
  }

  /**
   * Initialize default date range (last 3 months)
   */
  private initializeDateRange(): void {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    this.customStartDate = this.formatDateForInput(threeMonthsAgo);
    this.customEndDate = this.formatDateForInput(today);
  }

  /**
   * Format date for HTML date input
   */
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Handle time range selection change
   */
  onTimeRangeChange(): void {
    const today = new Date();

    switch (this.selectedTimeRange) {
      case 'last30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        this.customStartDate = this.formatDateForInput(thirtyDaysAgo);
        this.customEndDate = this.formatDateForInput(today);
        break;

      case 'last3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        this.customStartDate = this.formatDateForInput(threeMonthsAgo);
        this.customEndDate = this.formatDateForInput(today);
        break;

      case 'last6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        this.customStartDate = this.formatDateForInput(sixMonthsAgo);
        this.customEndDate = this.formatDateForInput(today);
        break;

      case 'lastyear':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        this.customStartDate = this.formatDateForInput(oneYearAgo);
        this.customEndDate = this.formatDateForInput(today);
        break;

      case 'custom':
        // Keep existing custom dates
        break;
    }

    this.updateReports();
  }

  /**
   * Handle custom date range or category filter changes
   */
  onFilterChange(): void {
    this.updateReports();
  }

  /**
   * Filter data based on selected criteria and update all charts
   */
  private updateReports(): void {
    this.filterData();
    this.updateMonthlyTrendChart();
    this.updateCategoryBreakdownChart();
    this.updateIncomeSourceChart();
  }

  /**
   * Filter income and expense data based on date range and category
   */
  private filterData(): void {
    const startDate = new Date(this.customStartDate);
    const endDate = new Date(this.customEndDate);

    // Filter income by date range
    this.filteredIncome = this.allIncome.filter((income) => {
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });

    // Filter expenses by date range and category
    this.filteredExpenses = this.allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const inDateRange = expenseDate >= startDate && expenseDate <= endDate;
      const inCategory =
        this.selectedCategory === 'all' ||
        expense.category === this.selectedCategory;
      return inDateRange && inCategory;
    });
  }

  /**
   * Update monthly trend line chart
   */
  private updateMonthlyTrendChart(): void {
    // Group data by month
    const monthlyData: { [key: string]: { income: number; expenses: number } } =
      {};

    // Process income data
    this.filteredIncome.forEach((income) => {
      const monthKey = new Date(income.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      monthlyData[monthKey].income += income.amount;
    });

    // Process expense data
    this.filteredExpenses.forEach((expense) => {
      const monthKey = new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      monthlyData[monthKey].expenses += expense.amount;
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a + ' 1').getTime() - new Date(b + ' 1').getTime();
    });

    this.monthlyTrendChart = {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Income',
          data: sortedMonths.map((month) => monthlyData[month].income),
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Expenses',
          data: sortedMonths.map((month) => monthlyData[month].expenses),
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }

  /**
   * Update category breakdown bar chart
   */
  private updateCategoryBreakdownChart(): void {
    // Group expenses by category
    const categoryTotals: { [key: string]: number } = {};

    this.filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    this.categoryBreakdownChart = {
      labels: categories,
      datasets: [
        {
          label: 'Amount Spent',
          data: amounts,
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
   * Update income source pie chart
   */
  private updateIncomeSourceChart(): void {
    // Group income by source
    const sourceTotals: { [key: string]: number } = {};

    this.filteredIncome.forEach((income) => {
      sourceTotals[income.source] =
        (sourceTotals[income.source] || 0) + income.amount;
    });

    this.incomeSourceChart = {
      labels: Object.keys(sourceTotals),
      datasets: [
        {
          data: Object.values(sourceTotals),
          backgroundColor: [
            '#48bb78',
            '#4299e1',
            '#9f7aea',
            '#ed8936',
            '#38b2ac',
            '#fc8181',
            '#4fd1c7',
            '#63b3ed',
          ],
        },
      ],
    };
  }

  /**
   * Calculate summary statistics for the filtered data
   */
  get summaryStats() {
    const totalIncome = this.filteredIncome.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const totalExpenses = this.filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const netSavings = totalIncome - totalExpenses;
    const averageMonthlyIncome = this.calculateAverageMonthly(
      this.filteredIncome
    );
    const averageMonthlyExpenses = this.calculateAverageMonthly(
      this.filteredExpenses
    );

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0,
    };
  }

  /**
   * Calculate average monthly amount for a dataset
   */
  private calculateAverageMonthly(
    data: (IncomeEntry | ExpenseEntry)[]
  ): number {
    if (data.length === 0) return 0;

    const months = new Set(
      data.map((item) =>
        new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
        })
      )
    ).size;

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    return months > 0 ? total / months : total;
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(): void {
    console.log('Exporting data to CSV...');
    alert(
      'CSV Export feature - In a real app, this would download a CSV file with your financial data!'
    );
  }

  /**
   * Generate and download PDF report
   */
  generatePDFReport(): void {
    console.log('Generating PDF report...');
    alert(
      'PDF Report feature - In a real app, this would generate and download a comprehensive PDF report!'
    );
  }

  /**
   * Print the current report
   */
  printReport(): void {
    console.log('Printing report...');
    window.print();
  }
}

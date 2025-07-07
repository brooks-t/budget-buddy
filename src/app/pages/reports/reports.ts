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
  Filler, // 🔧 ADD this missing plugin!
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
  BarController,
  Filler // 🔧 ADD this missing plugin!
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
  selectedTimeRange: string = 'alltime'; // Changed from 'last3months'
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

    // TEMPORARY: Add this debugging code
    console.log('Testing service access...');
    const allIncome = this.financialDataService.getCurrentIncome();
    const allExpenses = this.financialDataService.getCurrentExpenses();

    console.log('Income data:', allIncome);
    console.log('Expense data:', allExpenses);

    // NEW: Calculate totals for comparison
    const totalIncomeAmount = allIncome.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenseAmount = allExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    console.log('🔢 SERVICE TOTALS (should match Dashboard):');
    console.log('  Total Income:', totalIncomeAmount);
    console.log('  Total Expenses:', totalExpenseAmount);
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
        console.log('Income data loaded:', income.length, 'entries');
        this.allIncome = income;
        this.checkAndUpdateReports(); // NEW: Check if all data is loaded
      },
      error: (error) => {
        console.error('Error loading income data:', error);
      },
    });

    // Subscribe to expense data
    const expenseSubscription = this.financialDataService.expenses$.subscribe({
      next: (expenses) => {
        console.log('Expense data loaded:', expenses.length, 'entries');
        this.allExpenses = expenses;
        this.extractCategories();
        this.checkAndUpdateReports(); // NEW: Check if all data is loaded
      },
      error: (error) => {
        console.error('Error loading expense data:', error);
      },
    });

    // Subscribe to budget goals
    const budgetSubscription = this.financialDataService.budgetGoals$.subscribe(
      {
        next: (goals) => {
          console.log('Budget goals loaded:', goals.length, 'entries');
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
   * NEW: Only update reports when we have both income and expense data
   */
  private checkAndUpdateReports(): void {
    if (this.allIncome.length > 0 && this.allExpenses.length > 0) {
      console.log('All data loaded, updating reports...');

      // IMPORTANT: Initialize date range AFTER data is loaded
      if (!this.customStartDate || !this.customEndDate) {
        this.initializeDateRangeFromData();
      }

      this.updateReports();
    }
  }

  /**
   * Initialize date range based on actual loaded data
   */
  private initializeDateRangeFromData(): void {
    const allDates: Date[] = [];

    // Collect all dates from income and expenses
    this.allIncome.forEach((income) => allDates.push(new Date(income.date)));
    this.allExpenses.forEach((expense) =>
      allDates.push(new Date(expense.date))
    );

    if (allDates.length > 0) {
      // Find the actual min and max dates in the data
      const oldestDate = new Date(
        Math.min(...allDates.map((d) => d.getTime()))
      );
      const newestDate = new Date(
        Math.max(...allDates.map((d) => d.getTime()))
      );

      // Add 1 day padding to ensure we include all data
      const startDate = new Date(oldestDate);
      startDate.setDate(startDate.getDate() - 1); // Go back 1 day

      const endDate = new Date(newestDate);
      endDate.setDate(endDate.getDate() + 1); // Go forward 1 day

      this.customStartDate = this.formatDateForInput(startDate);
      this.customEndDate = this.formatDateForInput(endDate);

      console.log('📅 Auto-detected date range from data (with padding):');
      console.log(
        '  Data spans:',
        oldestDate.toLocaleDateString(),
        'to',
        newestDate.toLocaleDateString()
      );
      console.log(
        '  Filter set to:',
        this.customStartDate,
        'to',
        this.customEndDate
      );
    }
  }

  /**
   * Initialize default date range (fallback only)
   */
  private initializeDateRange(): void {
    // Only set fallback if no dates are set yet
    if (!this.customStartDate || !this.customEndDate) {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      this.customStartDate = this.formatDateForInput(sixMonthsAgo);
      this.customEndDate = this.formatDateForInput(today);

      console.log(
        '📅 Using fallback date range:',
        this.customStartDate,
        'to',
        this.customEndDate
      );
    }
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
      case 'alltime':
        // Set a very wide range to capture all data
        this.customStartDate = '2020-01-01';
        this.customEndDate = this.formatDateForInput(today);
        break;

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
   * Handle category filter changes
   * This method is called when the user selects a different category filter
   */
  onCategoryChange(): void {
    console.log('📂 Category filter changed to:', this.selectedCategory);

    // Update the reports when category selection changes
    this.updateReports();
  }

  /**
   * Filter data based on selected criteria and update all charts
   */
  private updateReports(): void {
    console.log('🔄 Starting updateReports...');
    this.filterData();

    console.log('📊 After filtering:', {
      income: this.filteredIncome.length,
      expenses: this.filteredExpenses.length,
      incomeTotal: this.filteredIncome.reduce((sum, i) => sum + i.amount, 0),
      expenseTotal: this.filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    });

    this.updateMonthlyTrendChart();
    this.updateCategoryBreakdownChart();
    this.updateIncomeSourceChart();

    console.log('📈 Charts updated with data:', {
      trendLabels: this.monthlyTrendChart.labels?.length,
      categoryLabels: this.categoryBreakdownChart.labels?.length,
      incomeLabels: this.incomeSourceChart.labels?.length,
    });
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

    // NEW: Add detailed debugging for expense totals
    console.log('💰 EXPENSE TOTAL COMPARISON:');
    console.log('  All expenses count:', this.allExpenses.length);
    console.log('  Filtered expenses count:', this.filteredExpenses.length);
    console.log(
      '  All expenses total:',
      this.allExpenses.reduce((sum, e) => sum + e.amount, 0)
    );
    console.log('  Filtered expenses total:', totalExpenses);
    console.log(
      '  Date range:',
      this.customStartDate,
      'to',
      this.customEndDate
    );
    console.log('  Selected category:', this.selectedCategory);

    // Show which expenses are being filtered out
    const excludedExpenses = this.allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(this.customStartDate);
      const endDate = new Date(this.customEndDate);
      const inDateRange = expenseDate >= startDate && expenseDate <= endDate;
      const inCategory =
        this.selectedCategory === 'all' ||
        expense.category === this.selectedCategory;
      return !(inDateRange && inCategory);
    });

    console.log('  Excluded expenses count:', excludedExpenses.length);
    console.log(
      '  Excluded expenses total:',
      excludedExpenses.reduce((sum, e) => sum + e.amount, 0)
    );

    // Show sample excluded expenses
    if (excludedExpenses.length > 0) {
      console.log('  Sample excluded expenses:');
      excludedExpenses.slice(0, 3).forEach((expense, index) => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(this.customStartDate);
        const endDate = new Date(this.customEndDate);

        console.log(`    Expense ${index + 1}:`, {
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          formattedDate: expenseDate.toLocaleDateString(),
          category: expense.category,
          dateType: typeof expense.date,
          isBeforeStart: expenseDate < startDate,
          isAfterEnd: expenseDate > endDate,
          startDateFormatted: startDate.toLocaleDateString(),
          endDateFormatted: endDate.toLocaleDateString(),
        });
      });
    }

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
   * Export filtered data to CSV format
   * This demonstrates real file download functionality
   */
  exportToCSV(): void {
    console.log('🔄 Generating CSV export...');

    try {
      // Prepare data for CSV export
      const csvData = this.prepareCsvData();

      // Create CSV content
      const csvContent = this.convertToCSV(csvData);

      // Create and download the file
      this.downloadFile(csvContent, 'financial-report.csv', 'text/csv');

      console.log('✅ CSV export completed successfully');
      this.showSuccessMessage('CSV file downloaded successfully!');
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      this.showErrorMessage('Failed to export CSV file. Please try again.');
    }
  }

  /**
   * Generate a comprehensive PDF report
   * In a real app, this would use a library like jsPDF
   */
  generatePDFReport(): void {
    console.log('🔄 Generating PDF report...');

    try {
      // Prepare report data
      const reportData = this.prepareReportData();

      // In a real implementation, you would use jsPDF or similar
      const pdfContent = this.generatePDFContent(reportData);

      // For demonstration, we'll download as text file
      // In production, this would be a proper PDF
      this.downloadFile(pdfContent, 'financial-report.pdf', 'application/pdf');

      console.log('✅ PDF report generated successfully');
      this.showSuccessMessage('PDF report downloaded successfully!');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      this.showErrorMessage('Failed to generate PDF report. Please try again.');
    }
  }

  /**
   * Print the current report
   * Opens browser print dialog with optimized layout
   */
  printReport(): void {
    console.log('🔄 Preparing report for printing...');

    try {
      // Create a printable version of the report
      const printContent = this.preparePrintContent();

      // Open new window with print-optimized content
      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };

        console.log('✅ Print dialog opened successfully');
        this.showSuccessMessage('Print dialog opened!');
      } else {
        throw new Error('Failed to open print window');
      }
    } catch (error) {
      console.error('❌ Error printing report:', error);
      this.showErrorMessage(
        'Failed to open print dialog. Please check your browser settings.'
      );
    }
  }

  /**
   * Share report functionality
   * In a real app, this could integrate with social media or email
   */
  shareReport(): void {
    console.log('🔄 Preparing report for sharing...');

    try {
      // Prepare shareable summary
      const shareData = this.prepareShareData();

      // Check if native sharing is available (mobile devices)
      if (navigator.share) {
        navigator
          .share({
            title: 'My Financial Report',
            text: shareData.summary,
            url: window.location.href,
          })
          .then(() => {
            console.log('✅ Report shared successfully');
          })
          .catch((error) => {
            console.log('❌ Error sharing:', error);
            this.fallbackShare(shareData);
          });
      } else {
        // Fallback for desktop browsers
        this.fallbackShare(shareData);
      }
    } catch (error) {
      console.error('❌ Error sharing report:', error);
      this.showErrorMessage('Failed to share report. Please try again.');
    }
  }

  /**
   * Helper method: Prepare data for CSV export
   */
  private prepareCsvData(): any[] {
    const csvData: any[] = [];

    // Add header row
    csvData.push({
      Date: 'Date',
      Type: 'Type',
      Description: 'Description',
      Category: 'Category/Source',
      Amount: 'Amount',
    });

    // Add income data
    this.filteredIncome.forEach((income) => {
      csvData.push({
        Date: income.date.toLocaleDateString(),
        Type: 'Income',
        Description: income.description,
        Category: income.source,
        Amount: income.amount,
      });
    });

    // Add expense data
    this.filteredExpenses.forEach((expense) => {
      csvData.push({
        Date: expense.date.toLocaleDateString(),
        Type: 'Expense',
        Description: expense.description,
        Category: expense.category,
        Amount: -expense.amount, // Negative for expenses
      });
    });

    return csvData;
  }

  /**
   * Helper method: Convert data array to CSV string
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...data.slice(1).map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV data
            if (
              typeof value === 'string' &&
              (value.includes(',') || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Helper method: Download file to user's computer
   */
  private downloadFile(
    content: string,
    filename: string,
    contentType: string
  ): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper method: Prepare comprehensive report data
   */
  private prepareReportData(): any {
    return {
      title: 'Financial Report',
      dateRange: this.getDateRangeText(),
      summary: this.summaryStats,
      transactions: {
        income: this.filteredIncome,
        expenses: this.filteredExpenses,
      },
      charts: {
        monthlyTrend: this.monthlyTrendChart,
        categoryBreakdown: this.categoryBreakdownChart,
        incomeSource: this.incomeSourceChart,
      },
    };
  }

  /**
   * Helper method: Generate PDF content (simplified for demonstration)
   */
  private generatePDFContent(reportData: any): string {
    return `
FINANCIAL REPORT
================

Report Period: ${reportData.dateRange}
Generated: ${new Date().toLocaleDateString()}

SUMMARY STATISTICS
------------------
Total Income: $${reportData.summary.totalIncome.toFixed(2)}
Total Expenses: $${reportData.summary.totalExpenses.toFixed(2)}
Net Savings: $${reportData.summary.netSavings.toFixed(2)}
Savings Rate: ${reportData.summary.savingsRate.toFixed(1)}%

TRANSACTION DETAILS
-------------------
${reportData.transactions.income
  .map(
    (income: any) =>
      `${income.date.toLocaleDateString()} | Income | ${income.description} | ${
        income.source
      } | $${income.amount.toFixed(2)}`
  )
  .join('\n')}

${reportData.transactions.expenses
  .map(
    (expense: any) =>
      `${expense.date.toLocaleDateString()} | Expense | ${
        expense.description
      } | ${expense.category} | -$${expense.amount.toFixed(2)}`
  )
  .join('\n')}

---
Report generated by Budget Buddy
`;
  }

  /**
   * Helper method: Prepare content for printing
   */
  private preparePrintContent(): string {
    const reportData = this.prepareReportData();

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Financial Report - Budget Buddy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .summary { margin: 20px 0; }
    .summary-item { display: inline-block; margin: 10px 20px; padding: 10px; border: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .positive { color: green; }
    .negative { color: red; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Financial Report</h1>
    <p>Period: ${reportData.dateRange}</p>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
  </div>
  
  <div class="summary">
    <h2>Summary Statistics</h2>
    <div class="summary-item">
      <strong>Total Income</strong><br>
      $${reportData.summary.totalIncome.toFixed(2)}
    </div>
    <div class="summary-item">
      <strong>Total Expenses</strong><br>
      $${reportData.summary.totalExpenses.toFixed(2)}
    </div>
    <div class="summary-item">
      <strong>Net Savings</strong><br>
      <span class="${
        reportData.summary.netSavings >= 0 ? 'positive' : 'negative'
      }">
        $${reportData.summary.netSavings.toFixed(2)}
      </span>
    </div>
  </div>
  
  <h2>Transaction Details</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.transactions.income
        .map(
          (income: any) => `
        <tr>
          <td>${income.date.toLocaleDateString()}</td>
          <td>Income</td>
          <td>${income.description}</td>
          <td>${income.source}</td>
          <td class="positive">$${income.amount.toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
      ${reportData.transactions.expenses
        .map(
          (expense: any) => `
        <tr>
          <td>${expense.date.toLocaleDateString()}</td>
          <td>Expense</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td class="negative">-$${expense.amount.toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
  }

  /**
   * Helper method: Prepare data for sharing
   */
  private prepareShareData(): any {
    return {
      summary: `My financial summary: Income $${this.summaryStats.totalIncome.toFixed(
        2
      )}, Expenses $${this.summaryStats.totalExpenses.toFixed(
        2
      )}, Savings Rate ${this.summaryStats.savingsRate.toFixed(1)}%`,
      url: window.location.href,
    };
  }

  /**
   * Helper method: Fallback sharing for desktop browsers
   */
  private fallbackShare(shareData: any): void {
    // Copy summary to clipboard
    navigator.clipboard
      .writeText(shareData.summary)
      .then(() => {
        this.showSuccessMessage('Financial summary copied to clipboard!');
      })
      .catch(() => {
        // If clipboard fails, show the data in an alert
        alert(`Financial Summary:\n\n${shareData.summary}`);
      });
  }

  /**
   * Helper method: Get readable date range text
   */
  private getDateRangeText(): string {
    switch (this.selectedTimeRange) {
      case 'last30days':
        return 'Last 30 Days';
      case 'last3months':
        return 'Last 3 Months';
      case 'last6months':
        return 'Last 6 Months';
      case 'lastyear':
        return 'Last Year';
      case 'alltime':
        return 'All Time';
      default:
        return 'Custom Range';
    }
  }

  /**
   * Helper method: Show success message to user
   */
  private showSuccessMessage(message: string): void {
    // In a real app, you might use a toast notification service
    // For now, we'll use a simple alert
    alert(`✅ ${message}`);
  }

  /**
   * Helper method: Show error message to user
   */
  private showErrorMessage(message: string): void {
    // In a real app, you might use a toast notification service
    alert(`❌ ${message}`);
  }

  /**
   * Extract unique categories from expense data for the filter dropdown
   * This builds the list of available categories for filtering
   */
  private extractCategories(): void {
    // Get unique categories from all expenses
    const uniqueCategories = [
      ...new Set(this.allExpenses.map((expense) => expense.category)),
    ];

    // Add 'all' option at the beginning for showing all categories
    this.availableCategories = ['all', ...uniqueCategories.sort()];

    console.log(
      '📂 Extracted categories for filtering:',
      this.availableCategories
    );

    // If no category is selected yet, default to 'all'
    if (!this.selectedCategory) {
      this.selectedCategory = 'all';
    }
  }
}

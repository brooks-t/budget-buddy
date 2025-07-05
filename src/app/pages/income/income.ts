import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FinancialData, IncomeEntry } from '../../services/financial-data';

/**
 * Income Component - Now connected to the shared financial data service
 *
 * This component demonstrates:
 * - Using the same service as Dashboard for data consistency
 * - Real-time updates that affect other components
 * - Proper subscription management
 * - Service-based CRUD operations
 * - Better UX with proper form reset and success feedback
 */
@Component({
  selector: 'app-income',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes
    FormsModule, // Enables ngModel for form binding
  ],
  templateUrl: './income.html',
  styleUrl: './income.scss',
})
export class Income implements OnInit, OnDestroy {
  // ViewChild to access the form directly for proper reset
  @ViewChild('incomeForm') incomeForm!: NgForm;

  // Form data for adding new income - now with proper typing
  newIncome: {
    description: string;
    amount: number;
    source: string;
    frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly';
    date: string;
  } = {
    description: '',
    amount: 0,
    source: '',
    frequency: 'one-time',
    date: new Date().toISOString().split('T')[0],
  };

  // Success state for showing feedback to user
  showSuccessMessage = false;
  successMessage = '';

  // Income sources/categories for easy selection
  incomeSources = [
    'Salary',
    'Freelance Work',
    'Business Income',
    'Investment Returns',
    'Rental Income',
    'Side Hustle',
    'Bonus',
    'Gift/Prize',
    'Other',
  ];

  // Frequency options for recurring income - with proper typing
  frequencyOptions: Array<{
    value: 'one-time' | 'weekly' | 'monthly' | 'yearly';
    label: string;
  }> = [
    { value: 'one-time', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Data from the service - these will be populated by subscriptions
  incomeEntries: IncomeEntry[] = [];

  // Filter properties
  selectedSource = 'All';
  selectedFrequency = 'All';
  searchTerm = '';

  // Subscription management
  private subscriptions: Subscription[] = [];

  // Computed property - calculates total income from service data
  get totalIncome(): number {
    return this.filteredIncome.reduce((sum, income) => sum + income.amount, 0);
  }

  // Computed property - returns filtered income based on filters
  get filteredIncome() {
    let filtered = this.incomeEntries;

    // Filter by source
    if (this.selectedSource && this.selectedSource !== 'All') {
      filtered = filtered.filter(
        (income) => income.source === this.selectedSource
      );
    }

    // Filter by frequency
    if (this.selectedFrequency && this.selectedFrequency !== 'All') {
      filtered = filtered.filter(
        (income) => income.frequency === this.selectedFrequency
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(
        (income) =>
          income.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          income.source.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Constructor - Inject the shared financial data service
   */
  constructor(private financialDataService: FinancialData) {
    console.log('Income component initialized with financial service');
  }

  /**
   * OnInit - Set up subscription to income data from the service
   */
  ngOnInit(): void {
    // Subscribe to income data changes from the service
    const incomeSubscription = this.financialDataService.income$.subscribe({
      next: (incomeData) => {
        this.incomeEntries = incomeData;
        console.log('Income component: Data updated from service', incomeData);
      },
      error: (error) => {
        console.error('Error getting income data:', error);
      },
    });

    this.subscriptions.push(incomeSubscription);
  }

  /**
   * OnDestroy - Clean up subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Income component subscriptions cleaned up');
  }

  // Method to add a new income entry using the service
  addIncome(): void {
    // Basic form validation
    if (!this.newIncome.description.trim()) {
      this.showErrorMessage('Please enter a description');
      return;
    }

    if (this.newIncome.amount <= 0) {
      this.showErrorMessage('Please enter a valid amount');
      return;
    }

    if (!this.newIncome.source) {
      this.showErrorMessage('Please select an income source');
      return;
    }

    // Use the service to add income - Pass the date STRING, not a Date object
    // Let the service handle the timezone conversion
    this.financialDataService.addIncome({
      description: this.newIncome.description.trim(),
      amount: this.newIncome.amount,
      source: this.newIncome.source,
      frequency: this.newIncome.frequency,
      date: this.newIncome.date as any, // Pass the string directly, service will convert it
    });

    // Show success message
    this.showSuccessIndicator();

    // Reset the form properly
    this.resetForm();

    console.log(
      'Income added through service - Dashboard will update automatically!'
    );
  }

  // Method to delete an income entry using the service
  deleteIncome(id: number): void {
    // Use the service to delete income - this will automatically update Dashboard too!
    this.financialDataService.deleteIncome(id);
    console.log(
      'Income deleted through service - Dashboard will update automatically!'
    );
  }

  // Method to properly reset the form without validation errors
  resetForm(): void {
    // Reset the data
    this.newIncome = {
      description: '',
      amount: 0,
      source: '',
      frequency: 'one-time',
      date: new Date().toISOString().split('T')[0],
    };

    // Reset the form state to remove validation errors
    // We need to wait for the next tick to ensure the form is updated
    setTimeout(() => {
      if (this.incomeForm) {
        this.incomeForm.resetForm(this.newIncome);
      }
    }, 0);
  }

  // Method to show success indicator
  private showSuccessIndicator(): void {
    this.successMessage = `✅ Income added successfully! Your dashboard has been updated.`;
    this.showSuccessMessage = true;

    // Hide the success message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // Method to show error messages (replaces alert for better UX)
  private showErrorMessage(message: string): void {
    // You could enhance this with a proper toast notification system
    alert(message); // For now, keeping the alert but we could improve this
  }

  // Method to get source color for visual distinction
  getSourceColor(source: string): string {
    const colors: { [key: string]: string } = {
      Salary: '#48bb78',
      'Freelance Work': '#4299e1',
      'Business Income': '#9f7aea',
      'Investment Returns': '#ed8936',
      'Rental Income': '#38b2ac',
      'Side Hustle': '#fc8181',
      Bonus: '#4fd1c7',
      'Gift/Prize': '#63b3ed',
      Other: '#a0aec0',
    };
    return colors[source] || '#a0aec0';
  }

  // Method to get frequency display text
  getFrequencyDisplay(frequency: string): string {
    const displays: { [key: string]: string } = {
      'one-time': 'One-time',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return displays[frequency] || frequency;
  }
}

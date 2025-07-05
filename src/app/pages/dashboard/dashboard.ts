import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FinancialData, Transaction } from '../../services/financial-data';

/**
 * Dashboard Component - Now connected to real data through our service
 * 
 * This component demonstrates:
 * - Service injection using Angular's Dependency Injection
 * - Subscribing to Observable data streams
 * - Automatic UI updates when data changes
 * - Proper subscription management to prevent memory leaks
 * - Real-time financial calculations
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, and built-in pipes
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  
  // Properties to hold our financial data
  totalIncome = 0;
  totalExpenses = 0;
  recentTransactions: Transaction[] = [];
  
  // Subscriptions array to manage memory and prevent leaks
  private subscriptions: Subscription[] = [];

  // Computed property - shows how TypeScript getters work with live data
  get totalSavings(): number {
    return this.totalIncome - this.totalExpenses;
  }

  /**
   * Constructor - Angular will automatically inject our FinancialData service
   * This is called Dependency Injection - Angular provides the service instance
   */
  constructor(private financialDataService: FinancialData) {
    console.log('Dashboard component initialized with financial service');
  }

  /**
   * OnInit lifecycle hook - runs after component is initialized
   * This is where we set up our data subscriptions
   */
  ngOnInit(): void {
    this.setupDataSubscriptions();
  }

  /**
   * OnDestroy lifecycle hook - runs when component is destroyed
   * This is where we clean up subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    // Unsubscribe from all observables to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('Dashboard subscriptions cleaned up');
  }

  /**
   * Set up subscriptions to our financial data service
   * This makes the dashboard automatically update when data changes
   */
  private setupDataSubscriptions(): void {
    
    // Subscribe to total income changes
    const incomeSubscription = this.financialDataService.getTotalIncome().subscribe({
      next: (total) => {
        this.totalIncome = total;
        console.log('Dashboard: Total income updated to', total);
      },
      error: (error) => {
        console.error('Error getting total income:', error);
      }
    });

    // Subscribe to total expenses changes
    const expensesSubscription = this.financialDataService.getTotalExpenses().subscribe({
      next: (total) => {
        this.totalExpenses = total;
        console.log('Dashboard: Total expenses updated to', total);
      },
      error: (error) => {
        console.error('Error getting total expenses:', error);
      }
    });

    // Subscribe to recent transactions changes
    const transactionsSubscription = this.financialDataService.getRecentTransactions().subscribe({
      next: (transactions) => {
        this.recentTransactions = transactions;
        console.log('Dashboard: Recent transactions updated', transactions);
      },
      error: (error) => {
        console.error('Error getting recent transactions:', error);
      }
    });

    // Store subscriptions for cleanup
    this.subscriptions.push(incomeSubscription, expensesSubscription, transactionsSubscription);
  }

  // Event handler methods - these can now interact with the service
  onAddIncome(): void {
    console.log('Add Income clicked - this would open an income form');
    
    // Example: Add a sample income (you could open a modal form instead)
    // this.financialDataService.addIncome({
    //   description: 'Sample Income',
    //   amount: 100,
    //   source: 'Other',
    //   frequency: 'one-time',
    //   date: new Date()
    // });
    
    alert('Add Income feature - this could open the Income page or a quick-add form!');
  }

  onAddExpense(): void {
    console.log('Add Expense clicked - this would open an expense form');
    
    // Example: Add a sample expense
    // this.financialDataService.addExpense({
    //   description: 'Sample Expense',
    //   amount: 50,
    //   category: 'Other',
    //   date: new Date()
    // });
    
    alert('Add Expense feature - this could open the Expenses page or a quick-add form!');
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

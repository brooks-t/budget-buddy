import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FinancialData,
  BudgetGoal,
  BudgetProgress,
} from '../../services/financial-data';

/**
 * Goals Component - Budget Goal Management
 *
 * This component demonstrates:
 * - Creating and managing budget goals per expense category
 * - Real-time budget progress tracking
 * - Visual progress indicators
 * - Form validation for budget limits
 * - Integration with existing expense data
 */
@Component({
  selector: 'app-goals',
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes
    FormsModule, // Enables ngModel for form binding
  ],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals implements OnInit, OnDestroy {
  // ViewChild to access the form for proper reset
  @ViewChild('goalForm') goalForm!: NgForm;

  // Form data for adding new budget goals
  newGoal = {
    category: '',
    monthlyLimit: 0,
  };

  // Data arrays populated from service
  budgetGoals: BudgetGoal[] = [];
  budgetProgress: BudgetProgress[] = [];

  // Available expense categories (same as in Expenses component)
  expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Groceries',
    'Other',
  ];

  // Success/error state management
  showSuccessMessage = false;
  successMessage = '';

  // Subscription management for memory cleanup
  private subscriptions: Subscription[] = [];

  // Computed property - get categories that don't have active goals yet
  get availableCategories(): string[] {
    const categoriesWithGoals = this.budgetGoals
      .filter((goal) => goal.isActive)
      .map((goal) => goal.category);

    return this.expenseCategories.filter(
      (category) => !categoriesWithGoals.includes(category)
    );
  }

  // NEW: Add computed properties for template use
  get activeGoalsCount(): number {
    return this.budgetGoals.filter((goal) => goal.isActive).length;
  }

  get onTrackGoalsCount(): number {
    return this.budgetProgress.filter(
      (progress) => progress.percentageUsed < 80
    ).length;
  }

  get overBudgetGoalsCount(): number {
    return this.budgetProgress.filter((progress) => progress.isOverBudget)
      .length;
  }

  constructor(private financialDataService: FinancialData) {
    console.log('Goals component initialized');
  }

  ngOnInit(): void {
    // Subscribe to budget goals data
    const goalsSubscription = this.financialDataService.budgetGoals$.subscribe({
      next: (goals) => {
        this.budgetGoals = goals;
        console.log('Goals component: Budget goals updated', goals);
      },
      error: (error) => {
        console.error('Error getting budget goals:', error);
      },
    });

    // Subscribe to budget progress calculations
    const progressSubscription = this.financialDataService
      .getBudgetProgress()
      .subscribe({
        next: (progress) => {
          this.budgetProgress = progress;
          console.log('Goals component: Budget progress updated', progress);
        },
        error: (error) => {
          console.error('Error getting budget progress:', error);
        },
      });

    this.subscriptions.push(goalsSubscription, progressSubscription);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    console.log('Goals component subscriptions cleaned up');
  }

  /**
   * Add a new budget goal
   */
  addGoal(): void {
    // Form validation
    if (!this.newGoal.category) {
      this.showErrorMessage('Please select a category');
      return;
    }

    if (this.newGoal.monthlyLimit <= 0) {
      this.showErrorMessage('Please enter a valid budget amount');
      return;
    }

    // Use the service to add the budget goal
    this.financialDataService.addBudgetGoal({
      category: this.newGoal.category,
      monthlyLimit: this.newGoal.monthlyLimit,
      isActive: true,
    });

    // Show success message
    this.showSuccessIndicator();

    // Reset the form
    this.resetForm();

    console.log('Budget goal added successfully');
  }

  /**
   * Delete a budget goal
   */
  deleteGoal(goalId: number): void {
    this.financialDataService.deleteBudgetGoal(goalId);
    console.log('Budget goal deleted:', goalId);
  }

  /**
   * Toggle goal active status
   */
  toggleGoal(goalId: number, isActive: boolean): void {
    this.financialDataService.updateBudgetGoal(goalId, { isActive });
    console.log('Budget goal toggled:', goalId, isActive);
  }

  /**
   * Reset the form to initial state
   */
  resetForm(): void {
    this.newGoal = {
      category: '',
      monthlyLimit: 0,
    };

    // Reset form validation state
    setTimeout(() => {
      if (this.goalForm) {
        this.goalForm.resetForm(this.newGoal);
      }
    }, 0);
  }

  /**
   * Show success message with auto-hide
   */
  private showSuccessIndicator(): void {
    this.successMessage = '✅ Budget goal added successfully!';
    this.showSuccessMessage = true;

    // Hide message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  /**
   * Show error message to user
   */
  private showErrorMessage(message: string): void {
    // For now using alert, could be enhanced with toast notifications
    alert(message);
  }

  /**
   * Get progress bar color based on percentage used
   */
  getProgressColor(progress: BudgetProgress): string {
    if (progress.isOverBudget) {
      return '#f56565'; // Red for over budget
    } else if (progress.percentageUsed >= 80) {
      return '#ed8936'; // Orange for warning (80%+)
    } else if (progress.percentageUsed >= 60) {
      return '#ecc94b'; // Yellow for caution (60%+)
    } else {
      return '#48bb78'; // Green for safe zone
    }
  }

  /**
   * Get status text for budget progress
   */
  getStatusText(progress: BudgetProgress): string {
    if (progress.isOverBudget) {
      return 'Over Budget';
    } else if (progress.percentageUsed >= 80) {
      return 'Near Limit';
    } else if (progress.percentageUsed >= 60) {
      return 'Caution';
    } else {
      return 'On Track';
    }
  }

  /**
   * Get category color for visual consistency with expenses
   */
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food & Dining': '#f56565',
      Transportation: '#4299e1',
      Shopping: '#9f7aea',
      Entertainment: '#ed8936',
      'Bills & Utilities': '#38b2ac',
      Healthcare: '#fc8181',
      Travel: '#4fd1c7',
      Education: '#63b3ed',
      Groceries: '#68d391',
      Other: '#a0aec0',
    };
    return colors[category] || '#a0aec0';
  }
}

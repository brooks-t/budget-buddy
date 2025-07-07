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

  // Smart recommendations based on spending patterns
  get recommendedGoals(): {
    category: string;
    suggestedLimit: number;
    reason: string;
  }[] {
    // Analyze spending patterns and suggest budget limits
    const recommendations = this.expenseCategories
      .filter(
        (category) =>
          !this.budgetGoals.some(
            (goal) => goal.category === category && goal.isActive
          )
      )
      .map((category) => {
        const categoryExpenses = this.getRecentExpensesForCategory(category);
        const averageSpending =
          this.calculateAverageMonthlySpending(categoryExpenses);

        return {
          category,
          suggestedLimit: Math.ceil(averageSpending * 1.1), // 10% buffer
          reason: `Based on your average ${category.toLowerCase()} spending`,
        };
      })
      .filter((rec) => rec.suggestedLimit > 0)
      .sort((a, b) => b.suggestedLimit - a.suggestedLimit);

    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  // Goal performance insights
  get goalInsights(): {
    type: 'success' | 'warning' | 'danger';
    message: string;
  }[] {
    const insights: {
      type: 'success' | 'warning' | 'danger';
      message: string;
    }[] = [];

    this.budgetProgress.forEach((progress) => {
      if (progress.isOverBudget) {
        insights.push({
          type: 'danger',
          message: `You're ${Math.round(
            progress.percentageUsed - 100
          )}% over budget for ${progress.category}`,
        });
      } else if (progress.percentageUsed >= 80) {
        insights.push({
          type: 'warning',
          message: `You're approaching your ${
            progress.category
          } budget limit (${Math.round(progress.percentageUsed)}%)`,
        });
      } else if (progress.percentageUsed <= 50 && progress.currentSpent > 0) {
        insights.push({
          type: 'success',
          message: `Great job staying under budget for ${progress.category}!`,
        });
      }
    });

    return insights;
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
   * Quick goal setup for common categories
   * This allows users to automatically set up budget goals with one click
   */
  setupQuickGoal(
    category: string,
    limitType: 'conservative' | 'moderate' | 'flexible'
  ): void {
    console.log(
      `🔄 Setting up quick goal for ${category} with ${limitType} limit...`
    );

    try {
      // Get recent expenses for this category to calculate a smart limit
      const categoryExpenses = this.getRecentExpensesForCategory(category);
      const averageSpending =
        this.calculateAverageMonthlySpending(categoryExpenses);

      // Calculate suggested limit based on the selected type
      let multiplier = 1.0;
      switch (limitType) {
        case 'conservative':
          multiplier = 0.8; // 20% less than average (strict budget)
          break;
        case 'moderate':
          multiplier = 1.0; // Same as average (balanced approach)
          break;
        case 'flexible':
          multiplier = 1.3; // 30% more than average (relaxed budget)
          break;
      }

      // Ensure minimum budget of $50
      const suggestedLimit = Math.max(
        50,
        Math.ceil(averageSpending * multiplier)
      );

      // Use the existing service to add the budget goal
      this.financialDataService.addBudgetGoal({
        category,
        monthlyLimit: suggestedLimit,
        isActive: true,
      });

      // Show success message with details
      this.showSuccessIndicator();
      console.log(
        `✅ Quick goal created: ${category} - $${suggestedLimit} (${limitType})`
      );
    } catch (error) {
      console.error('❌ Error setting up quick goal:', error);
      this.showErrorMessage('Failed to set up quick goal. Please try again.');
    }
  }

  /**
   * Enhanced success message that shows the specific goal details
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

  // Helper methods for calculations
  private getRecentExpensesForCategory(category: string): any[] {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return this.financialDataService
      .getCurrentExpenses()
      .filter(
        (expense) =>
          expense.category === category &&
          new Date(expense.date) >= threeMonthsAgo
      );
  }

  private calculateAverageMonthlySpending(expenses: any[]): number {
    if (expenses.length === 0) return 0;

    const totalSpending = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const monthsOfData = Math.max(1, Math.ceil(expenses.length / 10)); // Rough estimate

    return totalSpending / monthsOfData;
  }
}

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Main App Component - The root component that holds our entire Budget Buddy application
 * This component provides:
 * - Navigation header with links to different sections
 * - Router outlet where different pages will be displayed
 * - Consistent layout and styling across the entire app
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, // Enables <router-outlet> for displaying routed components
    RouterLink, // Enables [routerLink] directive for navigation links
    RouterLinkActive, // Enables [routerLinkActive] for highlighting active nav items
    CommonModule, // Provides common Angular directives like *ngIf, *ngFor
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Budget Buddy';

  /**
   * Navigation items for our main menu
   * Each item has a path (for routing) and label (for display)
   */
  navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/income', label: 'Income', icon: '💵' },
    { path: '/expenses', label: 'Expenses', icon: '💳' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];
}

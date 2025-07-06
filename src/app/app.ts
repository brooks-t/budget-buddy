import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Main App Component - The root component that holds our entire Budget Buddy application
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
export class App implements OnInit {
  title = 'Budget Buddy';

  /**
   * Navigation items for our main menu
   */
  navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/income', label: 'Income', icon: '💵' },
    { path: '/expenses', label: 'Expenses', icon: '💳' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  // Inject the router for debugging
  constructor(private router: Router) {}

  ngOnInit() {
    // Debug: Log current route
    console.log('App component initialized');
    console.log('Current URL:', this.router.url);

    // Navigate to dashboard if we're at root
    if (this.router.url === '/') {
      console.log('Navigating to dashboard...');
      this.router.navigate(['/dashboard']);
    }
  }
}

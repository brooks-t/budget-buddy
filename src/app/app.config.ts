import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * Application Configuration
 *
 * This configures the core services and providers for your Angular app
 * Including routing, change detection, and other global services
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zone-based change detection for optimal performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide the router with our routes configuration
    provideRouter(routes),
  ],
};

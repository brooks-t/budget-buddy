import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Bootstrap the Angular application
 *
 * This starts up your Budget Buddy app with the root App component
 * and applies the configuration from appConfig
 */
bootstrapApplication(App, appConfig).catch((err) =>
  console.error('Error starting Budget Buddy:', err)
);

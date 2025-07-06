import { Injectable } from '@angular/core';

/**
 * Storage Service - Handles data persistence to browser's localStorage
 *
 * This service demonstrates:
 * - Browser storage APIs for data persistence
 * - Error handling for storage operations
 * - Type-safe storage with generics
 * - Fallback mechanisms for storage failures
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {
    console.log('Storage service initialized');
    this.checkStorageAvailability();
  }

  /**
   * Check if localStorage is available and working
   * This handles cases where storage might be disabled or full
   */
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Save data to localStorage with error handling
   * Uses generics to maintain type safety
   */
  setItem<T>(key: string, data: T): boolean {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      console.log(`Data saved to localStorage with key: ${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to save data with key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data from localStorage with type safety
   * Returns null if data doesn't exist or can't be parsed
   */
  getItem<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Failed to retrieve data with key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      console.log(`Data removed from localStorage with key: ${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove data with key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all application data from localStorage
   * Useful for reset functionality
   */
  clearAllData(): boolean {
    try {
      const keysToRemove = [
        'budget_buddy_income',
        'budget_buddy_expenses',
        'budget_buddy_goals',
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log('All Budget Buddy data cleared from localStorage');
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }
}

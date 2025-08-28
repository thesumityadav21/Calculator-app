import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static readonly CURRENCY_KEY = 'selected_currency';
  private static readonly SAVED_CALCULATIONS_KEY = 'saved_calculations';
  private static readonly PREMIUM_STATUS_KEY = 'premium_status';

  static async saveCurrency(currency: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CURRENCY_KEY, currency);
    } catch (error) {
      console.error('Error saving currency:', error);
      throw error;
    }
  }

  static async getCurrency(): Promise<string> {
    try {
      const currency = await AsyncStorage.getItem(this.CURRENCY_KEY);
      return currency || 'INR';
    } catch (error) {
      console.error('Error getting currency:', error);
      return 'INR';
    }
  }

  static async saveCalculation(calculation: any): Promise<void> {
    try {
      const existing = await this.getSavedCalculations();
      const updated = [calculation, ...existing];
      
      // Keep only the latest 50 calculations for free users
      const trimmed = updated.slice(0, 50);
      
      await AsyncStorage.setItem(this.SAVED_CALCULATIONS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  }

  static async getSavedCalculations(): Promise<any[]> {
    try {
      const calculations = await AsyncStorage.getItem(this.SAVED_CALCULATIONS_KEY);
      return calculations ? JSON.parse(calculations) : [];
    } catch (error) {
      console.error('Error getting saved calculations:', error);
      return [];
    }
  }

  static async deleteCalculation(id: string): Promise<void> {
    try {
      const calculations = await this.getSavedCalculations();
      const filtered = calculations.filter(calc => calc.id !== id);
      await AsyncStorage.setItem(this.SAVED_CALCULATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  }

  static async clearAllCalculations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SAVED_CALCULATIONS_KEY);
    } catch (error) {
      console.error('Error clearing calculations:', error);
      throw error;
    }
  }

  static async setPremiumStatus(isPremium: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PREMIUM_STATUS_KEY, JSON.stringify(isPremium));
    } catch (error) {
      console.error('Error setting premium status:', error);
      throw error;
    }
  }

  static async getPremiumStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(this.PREMIUM_STATUS_KEY);
      return status ? JSON.parse(status) : false;
    } catch (error) {
      console.error('Error getting premium status:', error);
      return false;
    }
  }
}
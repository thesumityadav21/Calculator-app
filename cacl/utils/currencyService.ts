export class CurrencyService {
  private static currencies = {
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  };

  static getSymbol(currencyCode: string): string {
    return this.currencies[currencyCode]?.symbol || '₹';
  }

  static getName(currencyCode: string): string {
    return this.currencies[currencyCode]?.name || 'Indian Rupee';
  }

  static formatCurrency(amount: number, currencyCode: string = 'INR'): string {
    if (currencyCode === 'INR') {
      return this.formatIndianCurrency(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private static formatIndianCurrency(amount: number): string {
    const numStr = Math.round(amount).toString();
    let result = '';
    let count = 0;

    for (let i = numStr.length - 1; i >= 0; i--) {
      if (count === 3 || count === 5 || count === 7) {
        result = ',' + result;
      }
      result = numStr[i] + result;
      count++;
    }

    return result;
  }

  static convertToWords(amount: number, currencyCode: string = 'INR'): string {
    if (amount === 0) return '';
    
    if (currencyCode === 'INR') {
      return this.convertToIndianWords(amount);
    }
    
    return this.convertToWesternWords(amount);
  }

  private static convertToIndianWords(amount: number): string {
    if (amount >= 10000000) {
      const crores = Math.floor(amount / 10000000);
      const remainder = amount % 10000000;
      const croresText = `${crores} Crore${crores > 1 ? 's' : ''}`;
      
      if (remainder >= 100000) {
        const lakhs = Math.floor(remainder / 100000);
        return `${croresText} ${lakhs} Lakh${lakhs > 1 ? 's' : ''}`;
      }
      return croresText;
    }
    
    if (amount >= 100000) {
      const lakhs = Math.floor(amount / 100000);
      const remainder = amount % 100000;
      const lakhsText = `${lakhs} Lakh${lakhs > 1 ? 's' : ''}`;
      
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000);
        return `${lakhsText} ${thousands} Thousand`;
      }
      return lakhsText;
    }
    
    if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000);
      return `${thousands} Thousand`;
    }
    
    return amount.toString();
  }

  private static convertToWesternWords(amount: number): string {
    if (amount >= 1000000) {
      const millions = (amount / 1000000).toFixed(1);
      return `${millions} Million`;
    }
    
    if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `${thousands} Thousand`;
    }
    
    return amount.toString();
  }
}
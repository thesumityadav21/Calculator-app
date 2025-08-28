export class CalculationEngine {
  static calculateSIP({
    monthlyAmount = 0,
    lumpsumAmount = 0,
    annualRate,
    years,
    stepUpPercent = 0,
  }: {
    monthlyAmount?: number;
    lumpsumAmount?: number;
    annualRate: number;
    years: number;
    stepUpPercent?: number;
  }) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    // Calculate Regular SIP
    let sipMaturity = 0;
    if (monthlyAmount > 0) {
      if (stepUpPercent > 0) {
        sipMaturity = this.calculateStepUpSIP(monthlyAmount, annualRate, years, stepUpPercent);
      } else {
        if (monthlyRate === 0) {
          sipMaturity = monthlyAmount * months;
        } else {
          sipMaturity = monthlyAmount * 
            (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
             (1 + monthlyRate));
        }
      }
    }

    // Calculate Lumpsum
    let lumpsumMaturity = 0;
    if (lumpsumAmount > 0) {
      lumpsumMaturity = lumpsumAmount * Math.pow(1 + annualRate / 100, years);
    }

    const totalMaturity = sipMaturity + lumpsumMaturity;
    const totalInvested = this.calculateTotalInvested(monthlyAmount, years, stepUpPercent) + lumpsumAmount;
    const returns = totalMaturity - totalInvested;

    return {
      maturityAmount: totalMaturity,
      totalInvested,
      returns,
      monthlyInvestment: monthlyAmount,
      lumpsumInvestment: lumpsumAmount,
      absoluteReturn: ((totalMaturity - totalInvested) / totalInvested) * 100,
    };
  }

  private static calculateStepUpSIP(
    initialAmount: number,
    annualRate: number,
    years: number,
    stepUpPercent: number
  ): number {
    let totalAmount = 0;
    let currentMonthly = initialAmount;
    const monthlyRate = annualRate / 12 / 100;
    const stepUpRate = stepUpPercent / 100;

    for (let year = 0; year < years; year++) {
      // Calculate for each month in the year
      for (let month = 0; month < 12; month++) {
        const monthsRemaining = (years - year) * 12 - month;
        
        if (monthlyRate === 0) {
          totalAmount += currentMonthly * monthsRemaining;
        } else {
          const futureValue = currentMonthly * 
            (((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate) * 
             (1 + monthlyRate));
          totalAmount += futureValue;
        }
      }
      
      // Step up the amount for next year
      if (year < years - 1) {
        currentMonthly = currentMonthly * (1 + stepUpRate);
      }
    }

    return totalAmount;
  }

  private static calculateTotalInvested(
    monthlyAmount: number,
    years: number,
    stepUpPercent: number
  ): number {
    if (stepUpPercent === 0) {
      return monthlyAmount * years * 12;
    }

    let totalInvested = 0;
    let currentMonthly = monthlyAmount;
    const stepUpRate = stepUpPercent / 100;

    for (let year = 0; year < years; year++) {
      totalInvested += currentMonthly * 12;
      currentMonthly = currentMonthly * (1 + stepUpRate);
    }

    return totalInvested;
  }

  static calculateSWP({
    initialAmount,
    monthlyWithdrawal,
    annualRate,
    years,
  }: {
    initialAmount: number;
    monthlyWithdrawal: number;
    annualRate: number;
    years: number;
  }) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    let balance = initialAmount;
    let totalWithdrawn = 0;
    let monthsSupported = 0;

    for (let i = 0; i < months && balance > 0; i++) {
      // Apply monthly return
      balance = balance * (1 + monthlyRate);
      
      // Withdraw monthly amount
      if (balance >= monthlyWithdrawal) {
        balance -= monthlyWithdrawal;
        totalWithdrawn += monthlyWithdrawal;
        monthsSupported++;
      } else {
        // Final partial withdrawal
        if (balance > 0) {
          totalWithdrawn += balance;
          balance = 0;
          monthsSupported++;
        }
        break;
      }
    }

    return {
      finalBalance: Math.max(0, balance),
      totalWithdrawn,
      monthsSupported,
      yearsSupported: monthsSupported / 12,
    };
  }
}
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingDown, Save, RotateCcw } from 'lucide-react-native';
import { CurrencyService } from '@/utils/currencyService';
import { StorageService } from '@/utils/storageService';

export default function SWPCalculatorScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [initialAmount, setInitialAmount] = useState('1000000');
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState('10000');
  const [expectedReturn, setExpectedReturn] = useState('8');
  const [withdrawalPeriod, setWithdrawalPeriod] = useState(15);
  const [result, setResult] = useState(null);

  const calculateSWP = () => {
    if (!initialAmount || !monthlyWithdrawal || !expectedReturn) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const principal = parseFloat(initialAmount);
    const monthly = parseFloat(monthlyWithdrawal);
    const rate = parseFloat(expectedReturn) / 12 / 100;
    const months = withdrawalPeriod * 12;

    let balance = principal;
    let totalWithdrawn = 0;
    let monthsSupported = 0;

    for (let i = 0; i < months && balance > 0; i++) {
      balance = balance * (1 + rate) - monthly;
      totalWithdrawn += monthly;
      monthsSupported++;
      
      if (balance < 0) break;
    }

    setResult({
      finalBalance: Math.max(0, balance),
      totalWithdrawn,
      monthsSupported,
      yearsSupported: monthsSupported / 12,
    });
  };

  const saveResult = async () => {
    if (!result) return;
    
    const savedResult = {
      id: Date.now().toString(),
      type: 'SWP',
      date: new Date().toISOString(),
      currency: selectedCurrency,
      inputs: {
        initialAmount,
        monthlyWithdrawal,
        expectedReturn,
        withdrawalPeriod,
      },
      result,
    };

    await StorageService.saveCalculation(savedResult);
    Alert.alert('Success', 'Calculation saved successfully!');
  };

  const currencySymbol = CurrencyService.getSymbol(selectedCurrency);

  return (
    <LinearGradient colors={['#4CAF50', '#2196F3']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SWP Calculator</Text>
          <Text style={styles.subtitle}>Systematic Withdrawal Plan</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Initial Investment</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.input}
                value={initialAmount}
                onChangeText={setInitialAmount}
                placeholder="1000000"
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.helperText}>
              {CurrencyService.convertToWords(parseFloat(initialAmount || '0'), selectedCurrency)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Monthly Withdrawal</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.input}
                value={monthlyWithdrawal}
                onChangeText={setMonthlyWithdrawal}
                placeholder="10000"
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.helperText}>
              {CurrencyService.convertToWords(parseFloat(monthlyWithdrawal || '0'), selectedCurrency)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Expected Annual Return (%)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={expectedReturn}
                onChangeText={setExpectedReturn}
                placeholder="8"
                keyboardType="numeric"
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Withdrawal Period: {withdrawalPeriod} years</Text>
            <View style={styles.tenureButtons}>
              {[5, 10, 15, 20, 25, 30].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.tenureButton, withdrawalPeriod === year && styles.tenureButtonActive]}
                  onPress={() => setWithdrawalPeriod(year)}
                >
                  <Text style={[styles.tenureButtonText, withdrawalPeriod === year && styles.tenureButtonTextActive]}>
                    {year}Y
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateSWP}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.calculateGradient}>
              <TrendingDown size={20} color="#ffffff" />
              <Text style={styles.calculateButtonText}>Calculate SWP</Text>
            </LinearGradient>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Withdrawal Analysis</Text>
              
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Years Supported</Text>
                  <Text style={styles.resultValue}>
                    {result.yearsSupported.toFixed(1)} years
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Withdrawn</Text>
                  <Text style={styles.resultValue}>
                    {currencySymbol} {CurrencyService.formatCurrency(result.totalWithdrawn)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Final Balance</Text>
                  <Text style={[styles.resultValue, { color: result.finalBalance > 0 ? '#4CAF50' : '#f44336' }]}>
                    {currencySymbol} {CurrencyService.formatCurrency(result.finalBalance)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={saveResult}>
                  <Save size={16} color="#4CAF50" />
                  <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  section: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontStyle: 'italic',
  },
  tenureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tenureButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    minWidth: 45,
    alignItems: 'center',
  },
  tenureButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tenureButtonText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  tenureButtonTextActive: {
    color: '#ffffff',
  },
  calculateButton: {
    marginVertical: 20,
  },
  calculateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#757575',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
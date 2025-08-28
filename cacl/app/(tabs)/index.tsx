import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Calculator, Save, RotateCcw, Share } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationEngine } from '@/utils/calculationEngine';
import { CurrencyService } from '@/utils/currencyService';
import { StorageService } from '@/utils/storageService';

const { width } = Dimensions.get('window');

export default function SIPCalculatorScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [sipEnabled, setSipEnabled] = useState(true);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [lumpsumEnabled, setLumpsumEnabled] = useState(false);
  
  const [monthlyAmount, setMonthlyAmount] = useState('5000');
  const [lumpsumAmount, setLumpsumAmount] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [tenure, setTenure] = useState(10);
  const [stepUpPercent, setStepUpPercent] = useState('10');
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const currency = await StorageService.getCurrency();
      setSelectedCurrency(currency);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const calculateSIP = async () => {
    if (!monthlyAmount && !lumpsumAmount) {
      Alert.alert('Error', 'Please enter at least one investment amount');
      return;
    }

    setIsLoading(true);
    
    try {
      const calculationResult = CalculationEngine.calculateSIP({
        monthlyAmount: sipEnabled ? parseFloat(monthlyAmount || '0') : 0,
        lumpsumAmount: lumpsumEnabled ? parseFloat(lumpsumAmount || '0') : 0,
        annualRate: parseFloat(expectedReturn),
        years: tenure,
        stepUpPercent: stepUpEnabled ? parseFloat(stepUpPercent || '0') : 0,
      });

      setResult(calculationResult);
    } catch (error) {
      Alert.alert('Error', 'Invalid input values');
    }
    
    setIsLoading(false);
  };

  const saveResult = async () => {
    if (!result) return;
    
    const savedResult = {
      id: Date.now().toString(),
      type: 'SIP',
      date: new Date().toISOString(),
      currency: selectedCurrency,
      inputs: {
        monthlyAmount: sipEnabled ? monthlyAmount : '0',
        lumpsumAmount: lumpsumEnabled ? lumpsumAmount : '0',
        expectedReturn,
        tenure,
        stepUpPercent: stepUpEnabled ? stepUpPercent : '0',
      },
      result,
    };

    await StorageService.saveCalculation(savedResult);
    Alert.alert('Success', 'Calculation saved successfully!');
  };

  const clearInputs = () => {
    setMonthlyAmount('5000');
    setLumpsumAmount('');
    setExpectedReturn('12');
    setTenure(10);
    setStepUpPercent('10');
    setResult(null);
  };

  const currencySymbol = CurrencyService.getSymbol(selectedCurrency);

  return (
    <LinearGradient colors={['#2196F3', '#4CAF50']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SIP Calculator</Text>
          <Text style={styles.subtitle}>Plan your investments smartly</Text>
        </View>

        <View style={styles.card}>
          {/* Investment Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Type</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={[styles.checkbox, sipEnabled && styles.checkboxActive]}
                onPress={() => setSipEnabled(!sipEnabled)}
              >
                <Text style={[styles.checkboxText, sipEnabled && styles.checkboxTextActive]}>
                  Monthly SIP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.checkbox, stepUpEnabled && styles.checkboxActive]}
                onPress={() => {
                  setStepUpEnabled(!stepUpEnabled);
                  if (!stepUpEnabled) setSipEnabled(true);
                }}
              >
                <Text style={[styles.checkboxText, stepUpEnabled && styles.checkboxTextActive]}>
                  Step-up SIP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.checkbox, lumpsumEnabled && styles.checkboxActive]}
                onPress={() => setLumpsumEnabled(!lumpsumEnabled)}
              >
                <Text style={[styles.checkboxText, lumpsumEnabled && styles.checkboxTextActive]}>
                  Lumpsum
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Input Fields */}
          {sipEnabled && (
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Monthly SIP Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyAmount}
                  onChangeText={setMonthlyAmount}
                  placeholder="5000"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                {CurrencyService.convertToWords(parseFloat(monthlyAmount || '0'), selectedCurrency)}
              </Text>
            </View>
          )}

          {lumpsumEnabled && (
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Lumpsum Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.input}
                  value={lumpsumAmount}
                  onChangeText={setLumpsumAmount}
                  placeholder="100000"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                {CurrencyService.convertToWords(parseFloat(lumpsumAmount || '0'), selectedCurrency)}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Expected Annual Return (%)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={expectedReturn}
                onChangeText={setExpectedReturn}
                placeholder="12"
                keyboardType="numeric"
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>
          </View>

          {stepUpEnabled && (
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Annual Step-up (%)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={stepUpPercent}
                  onChangeText={setStepUpPercent}
                  placeholder="10"
                  keyboardType="numeric"
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Investment Tenure: {tenure} years</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>1 year</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderProgress, { width: `${(tenure / 30) * 100}%` }]} />
                <TouchableOpacity
                  style={[styles.sliderThumb, { left: `${(tenure / 30) * 100}%` }]}
                  onLongPress={() => {
                    // Simple slider simulation - in real app you'd use a proper slider component
                  }}
                />
              </View>
              <Text style={styles.sliderLabel}>30 years</Text>
            </View>
            <View style={styles.tenureButtons}>
              {[5, 10, 15, 20, 25].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.tenureButton, tenure === year && styles.tenureButtonActive]}
                  onPress={() => setTenure(year)}
                >
                  <Text style={[styles.tenureButtonText, tenure === year && styles.tenureButtonTextActive]}>
                    {year}Y
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity 
            style={styles.calculateButton} 
            onPress={calculateSIP}
            disabled={isLoading}
          >
            <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.calculateGradient}>
              <Calculator size={20} color="#ffffff" />
              <Text style={styles.calculateButtonText}>
                {isLoading ? 'Calculating...' : 'Calculate'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results Section */}
          {result && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Investment Results</Text>
              
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Maturity Amount</Text>
                  <Text style={styles.resultValue}>
                    {currencySymbol} {CurrencyService.formatCurrency(result.maturityAmount)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Invested</Text>
                  <Text style={styles.resultValueSecondary}>
                    {currencySymbol} {CurrencyService.formatCurrency(result.totalInvested)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns Generated</Text>
                  <Text style={[styles.resultValue, { color: '#4CAF50' }]}>
                    {currencySymbol} {CurrencyService.formatCurrency(result.returns)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Return Percentage</Text>
                  <Text style={[styles.resultValue, { color: '#4CAF50' }]}>
                    {((result.returns / result.totalInvested) * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={saveResult}>
                  <Save size={16} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={clearInputs}>
                  <RotateCcw size={16} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Clear</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Share size={16} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Share</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  checkbox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  checkboxActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  checkboxTextActive: {
    color: '#ffffff',
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
    color: '#2196F3',
    marginRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
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
  sliderContainer: {
    marginVertical: 16,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginVertical: 16,
    position: 'relative',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    marginLeft: -10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#757575',
  },
  tenureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tenureButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  tenureButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  tenureButtonText: {
    fontSize: 14,
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
  resultValueSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
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
    color: '#2196F3',
    fontWeight: '500',
  },
});
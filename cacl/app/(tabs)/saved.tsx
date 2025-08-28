import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Trash2, Share, Calculator } from 'lucide-react-native';
import { StorageService } from '@/utils/storageService';
import { CurrencyService } from '@/utils/currencyService';

export default function SavedResultsScreen() {
  const [savedResults, setSavedResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedResults();
    }, [])
  );

  useEffect(() => {
    filterResults();
  }, [savedResults, searchQuery]);

  const loadSavedResults = async () => {
    try {
      const results = await StorageService.getSavedCalculations();
      setSavedResults(results);
    } catch (error) {
      console.log('Error loading saved results:', error);
    }
  };

  const filterResults = () => {
    if (!searchQuery) {
      setFilteredResults(savedResults);
      return;
    }

    const filtered = savedResults.filter((result) =>
      result.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(result.date).toLocaleDateString().includes(searchQuery)
    );
    setFilteredResults(filtered);
  };

  const deleteResult = async (id) => {
    Alert.alert(
      'Delete Calculation',
      'Are you sure you want to delete this calculation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteCalculation(id);
              loadSavedResults();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete calculation');
            }
          },
        },
      ]
    );
  };

  const shareResult = (result) => {
    const shareText = `
💰 ${result.type} Calculation Results

📊 Investment Details:
${result.type === 'SIP' ? `Monthly SIP: ${result.currency} ${result.inputs.monthlyAmount}` : ''}
${result.inputs.lumpsumAmount !== '0' ? `Lumpsum: ${result.currency} ${result.inputs.lumpsumAmount}` : ''}
Expected Return: ${result.inputs.expectedReturn}%
Tenure: ${result.inputs.tenure || result.inputs.withdrawalPeriod} years

💎 Results:
${result.type === 'SIP' ? `Maturity Amount: ${result.currency} ${CurrencyService.formatCurrency(result.result.maturityAmount)}
Total Invested: ${result.currency} ${CurrencyService.formatCurrency(result.result.totalInvested)}
Returns: ${result.currency} ${CurrencyService.formatCurrency(result.result.returns)}` : 
`Final Balance: ${result.currency} ${CurrencyService.formatCurrency(result.result.finalBalance)}
Total Withdrawn: ${result.currency} ${CurrencyService.formatCurrency(result.result.totalWithdrawn)}
Years Supported: ${result.result.yearsSupported.toFixed(1)}`}

📱 Calculated with Smart SIP Calculator
    `.trim();
    
    Alert.alert('Share Result', 'Feature coming soon!');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Calculator size={64} color="#bdbdbd" />
      <Text style={styles.emptyTitle}>No Saved Calculations</Text>
      <Text style={styles.emptySubtitle}>
        Start calculating and save your results to see them here
      </Text>
    </View>
  );

  const renderResultCard = (item) => (
    <View key={item.id} style={styles.resultCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardType}>{item.type} Calculation</Text>
          <Text style={styles.cardDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteResult(item.id)}
        >
          <Trash2 size={20} color="#f44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.contentTitle}>Investment Summary</Text>
        {item.type === 'SIP' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly SIP:</Text>
            <Text style={styles.summaryValue}>
              {CurrencyService.getSymbol(item.currency)} {CurrencyService.formatCurrency(parseFloat(item.inputs.monthlyAmount || '0'))}
            </Text>
          </View>
        )}
        
        {item.inputs.lumpsumAmount !== '0' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lumpsum:</Text>
            <Text style={styles.summaryValue}>
              {CurrencyService.getSymbol(item.currency)} {CurrencyService.formatCurrency(parseFloat(item.inputs.lumpsumAmount))}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Return:</Text>
          <Text style={styles.summaryValue}>{item.inputs.expectedReturn}%</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tenure:</Text>
          <Text style={styles.summaryValue}>{item.inputs.tenure || item.inputs.withdrawalPeriod} years</Text>
        </View>
      </View>

      <View style={styles.resultsContent}>
        <Text style={styles.contentTitle}>Results</Text>
        {item.type === 'SIP' ? (
          <>
            <View style={styles.resultHighlight}>
              <Text style={styles.maturityLabel}>Maturity Amount</Text>
              <Text style={styles.maturityAmount}>
                {CurrencyService.getSymbol(item.currency)} {CurrencyService.formatCurrency(item.result.maturityAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Returns:</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {CurrencyService.getSymbol(item.currency)} {CurrencyService.formatCurrency(item.result.returns)}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.resultHighlight}>
              <Text style={styles.maturityLabel}>Years Supported</Text>
              <Text style={styles.maturityAmount}>
                {item.result.yearsSupported.toFixed(1)} years
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Final Balance:</Text>
              <Text style={[styles.summaryValue, { color: item.result.finalBalance > 0 ? '#4CAF50' : '#f44336' }]}>
                {CurrencyService.getSymbol(item.currency)} {CurrencyService.formatCurrency(item.result.finalBalance)}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => shareResult(item)}
        >
          <Share size={16} color="#2196F3" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Results</Text>
        <Text style={styles.subtitle}>{filteredResults.length} calculations saved</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#757575" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search calculations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {filteredResults.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredResults.map(renderResultCard)
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
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
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  cardDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  resultsContent: {
    marginBottom: 12,
  },
  resultHighlight: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  maturityLabel: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  maturityAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shareText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 20,
  },
});
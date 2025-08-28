import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Globe, 
  Crown, 
  Star, 
  MessageCircle, 
  Shield, 
  Info,
  ChevronRight 
} from 'lucide-react-native';
import { CurrencyService } from '@/utils/currencyService';
import { StorageService } from '@/utils/storageService';

export default function SettingsScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [isPremium, setIsPremium] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currency = await StorageService.getCurrency();
      setSelectedCurrency(currency);
      // In a real app, check premium status from subscription service
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const updateCurrency = async (currency) => {
    try {
      await StorageService.saveCurrency(currency);
      setSelectedCurrency(currency);
      setShowCurrencySelector(false);
      Alert.alert('Success', `Currency changed to ${currency}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  };

  const handlePremiumUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features:\n\n• All 6 currencies\n• Unlimited saved results\n• Export to PDF/Excel\n• Advanced calculations\n• Inflation adjustment\n• Priority support\n• Ad-free experience\n\nPrice: $4.99/year',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => Alert.alert('Coming Soon', 'Premium upgrade will be available in the next version!') },
      ]
    );
  };

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const renderSettingItem = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <ChevronRight size={20} color="#bdbdbd" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#9c27b0', '#673ab7']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Currency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            {renderSettingItem({
              icon: <Globe size={24} color="#2196F3" />,
              title: 'Currency',
              subtitle: `${CurrencyService.getSymbol(selectedCurrency)} ${selectedCurrency}`,
              onPress: () => setShowCurrencySelector(!showCurrencySelector),
              rightComponent: null,
            })}

            {showCurrencySelector && (
              <View style={styles.currencySelector}>
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyOption,
                      selectedCurrency === currency.code && styles.currencyOptionActive
                    ]}
                    onPress={() => updateCurrency(currency.code)}
                  >
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <View>
                      <Text style={styles.currencyCode}>{currency.code}</Text>
                      <Text style={styles.currencyName}>{currency.name}</Text>
                    </View>
                    {selectedCurrency === currency.code && (
                      <View style={styles.currencyCheck} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Premium Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium</Text>
            
            {renderSettingItem({
              icon: <Crown size={24} color="#ff9800" />,
              title: 'Upgrade to Premium',
              subtitle: '$4.99/year - Unlock all features',
              onPress: handlePremiumUpgrade,
            })}
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            {renderSettingItem({
              icon: <Star size={24} color="#ffc107" />,
              title: 'Rate App',
              subtitle: 'Help us improve',
              onPress: () => Alert.alert('Rate App', 'Feature coming soon!'),
            })}

            {renderSettingItem({
              icon: <MessageCircle size={24} color="#4CAF50" />,
              title: 'Request Feature',
              subtitle: 'Suggest improvements',
              onPress: () => Alert.alert('Request Feature', 'Feature coming soon!'),
            })}

            {renderSettingItem({
              icon: <Shield size={24} color="#607d8b" />,
              title: 'Privacy Policy',
              subtitle: 'Your data protection',
              onPress: () => Alert.alert('Privacy Policy', 'We respect your privacy and do not collect personal data.'),
            })}

            {renderSettingItem({
              icon: <Info size={24} color="#795548" />,
              title: 'About',
              subtitle: 'App version 1.0.0',
              onPress: () => Alert.alert('About', 'Smart SIP Calculator v1.0.0\n\nA comprehensive investment planning tool for SIP and SWP calculations.'),
              showArrow: false,
            })}
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySelector: {
    backgroundColor: '#ffffff',
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  currencyOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    width: 30,
    textAlign: 'center',
    marginRight: 16,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  currencyName: {
    fontSize: 14,
    color: '#757575',
  },
  currencyCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginLeft: 'auto',
  },
});
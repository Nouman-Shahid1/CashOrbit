import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {userService} from '../services/userService';
import {coinsToPKR, formatCurrency} from '../utils/currencyUtils';

const WalletScreen = ({navigation}) => {
  const [userStats, setUserStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [stats, transactionHistory] = await Promise.all([
        userService.getUserStats(),
        userService.getTransactionHistory(),
      ]);
      setUserStats(stats);
      setTransactions(transactionHistory);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const TransactionItem = ({item}) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.coins > 0 ? "add-circle" : "remove-circle"} 
          size={24} 
          color={item.coins > 0 ? '#FF6B35' : '#f44336'} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
        {item.status && (
          <View style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)}
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionCoins,
          {color: item.coins > 0 ? '#FF6B35' : '#f44336'}
        ]}>
          {item.coins > 0 ? '+' : ''}{item.coins}
        </Text>
        <Text style={styles.coinsText}>coins</Text>
        <Text style={styles.transactionPKR}>
          ₨{coinsToPKR(Math.abs(item.coins))}
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#FF6B35';
      case 'Pending': return '#FF9800';
      case 'Rejected': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#FF6B35', '#FF8E53']}
          style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>My Wallet</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={['#fff', '#f8f9fa']}
            style={styles.mainBalanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={24} color="#FF6B35" />
              <Text style={styles.balanceTitle}>Total Balance</Text>
            </View>
            <Text style={styles.totalCoins}>{userStats.coins || 0}</Text>
            <Text style={styles.coinsLabel}>Coins</Text>
            <Text style={styles.pkrValue}>₨{coinsToPKR(userStats.coins || 0)}</Text>
            
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => navigation.navigate('Withdraw')}>
              <Ionicons name="card" size={16} color="#fff" />
              <Text style={styles.withdrawText}>Withdraw Now</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.statValue}>{userStats.plan || 'Free'}</Text>
              <Text style={styles.statLabel}>Current Plan</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="cash" size={20} color="#FF9800" />
              <Text style={styles.statValue}>₨{coinsToPKR(100)}</Text>
              <Text style={styles.statLabel}>Per 100 Coins</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Complete tasks to start earning coins!
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((transaction, index) => (
              <TransactionItem key={index} item={transaction} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    padding: 20,
    marginTop: -10,
  },
  mainBalanceCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  totalCoins: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  coinsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  pkrValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionContent: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionCoins: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  transactionPKR: {
    fontSize: 14,
    color: '#666',
  },
});

export default WalletScreen;
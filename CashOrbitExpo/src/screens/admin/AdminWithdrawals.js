import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {adminService} from '../../services/adminService';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      const response = await adminService.getWithdrawals(filter);
      setWithdrawals(response.withdrawals || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const handleWithdrawAction = async (withdrawId, action) => {
    const actionText = action === 'approve' ? 'approve' : 'reject';
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this withdrawal?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await adminService.updateWithdrawStatus(withdrawId, action);
              Alert.alert('Success', `Withdrawal ${actionText}d successfully`);
              loadWithdrawals();
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} withdrawal`);
            }
          },
        },
      ]
    );
  };

  const FilterButton = ({status, title}) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === status && styles.activeFilter]}
      onPress={() => setFilter(status)}>
      <Text style={[styles.filterText, filter === status && styles.activeFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const WithdrawalCard = ({item}) => (
    <View style={styles.withdrawalCard}>
      <View style={styles.withdrawalHeader}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={[
          styles.status,
          {color: getStatusColor(item.status)}
        ]}>
          {item.status}
        </Text>
      </View>
      
      <View style={styles.withdrawalDetails}>
        <Text style={styles.amount}>PKR {item.amount}</Text>
        <Text style={styles.coins}>Coins: {item.coinsDeducted}</Text>
        <Text style={styles.paymentMethod}>Method: {item.paymentMethod}</Text>
        <Text style={styles.date}>Requested: {item.requestDate}</Text>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleWithdrawAction(item.id, 'approve')}>
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleWithdrawAction(item.id, 'reject')}>
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FF9800';
      case 'Approved': return '#4CAF50';
      case 'Rejected': return '#f44336';
      case 'Paid': return '#2196F3';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}>
        <Text style={styles.title}>Withdraw Requests</Text>
      </LinearGradient>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton status="pending" title="Pending" />
          <FilterButton status="approved" title="Approved" />
          <FilterButton status="rejected" title="Rejected" />
          <FilterButton status="all" title="All" />
        </ScrollView>
      </View>

      {/* Withdrawals List */}
      <ScrollView
        style={styles.withdrawalsList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {withdrawals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No withdrawal requests found</Text>
          </View>
        ) : (
          withdrawals.map((item, index) => (
            <WithdrawalCard key={index} item={item} />
          ))
        )}
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilter: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  withdrawalsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 15,
  },
  withdrawalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  withdrawalDetails: {
    marginBottom: 15,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  coins: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminWithdrawals;
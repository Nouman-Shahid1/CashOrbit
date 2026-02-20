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

const AdminUsers = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers(filter);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserAction = async (userId, action) => {
    const actionText = action === 'block' ? 'block' : 'unblock';
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this user?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const newStatus = action === 'block' ? 'Blocked' : 'Active';
              await adminService.updateUserStatus(userId, newStatus);
              Alert.alert('Success', `User ${actionText}ed successfully`);
              loadUsers();
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} user`);
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

  const UserCard = ({user}) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>
        <Text style={[
          styles.userStatus,
          {color: user.status === 'Active' ? '#4CAF50' : '#f44336'}
        ]}>
          {user.status}
        </Text>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.userStat}>
          <Text style={styles.statLabel}>Plan</Text>
          <Text style={styles.statValue}>{user.plan}</Text>
        </View>
        
        <View style={styles.userStat}>
          <Text style={styles.statLabel}>Coins</Text>
          <Text style={styles.statValue}>{user.coins}</Text>
        </View>
        
        <View style={styles.userStat}>
          <Text style={styles.statLabel}>Joined</Text>
          <Text style={styles.statValue}>{user.joinDate}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            user.status === 'Active' ? styles.blockButton : styles.unblockButton
          ]}
          onPress={() => handleUserAction(user.id, user.status === 'Active' ? 'block' : 'unblock')}>
          <Text style={styles.actionButtonText}>
            {user.status === 'Active' ? 'Block User' : 'Unblock User'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('UserDetail', {userId: user.id})}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
      </LinearGradient>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton status="all" title="All Users" />
          <FilterButton status="active" title="Active" />
          <FilterButton status="blocked" title="Blocked" />
        </ScrollView>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.usersList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {users.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          users.map((user, index) => (
            <UserCard key={index} user={user} />
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
  usersList: {
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  userDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  userStat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  blockButton: {
    backgroundColor: '#f44336',
  },
  unblockButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminUsers;
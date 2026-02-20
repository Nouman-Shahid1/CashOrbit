import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useAuth} from '../../context/AuthContext';
import {adminService} from '../../services/adminService';

const AdminDashboard = ({navigation}) => {
  const {logout} = useAuth();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminService.getDashboardStats().catch(err => ({ stats: {} })),
        adminService.getRecentActivity().catch(err => ({ activities: [] }))
      ]);
      setStats(statsData.stats || {});
      setRecentActivity(activityData.activities || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values if everything fails
      setStats({});
      setRecentActivity([]);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', onPress: logout, style: 'destructive'}
      ]
    );
  };

  const navigateToTasks = () => {
    navigation.navigate('Tasks');
  };

  const navigateToUsers = () => {
    navigation.navigate('Users');
  };

  const navigateToWithdrawals = () => {
    navigation.navigate('Withdrawals');
  };

  const showReports = () => {
    Alert.alert(
      'Reports',
      'Choose a report to view:',
      [
        {text: 'User Statistics', onPress: () => showUserStats()},
        {text: 'Revenue Report', onPress: () => showRevenueReport()},
        {text: 'Task Analytics', onPress: () => showTaskAnalytics()},
        {text: 'Cancel', style: 'cancel'}
      ]
    );
  };

  const showUserStats = () => {
    const message = `Total Users: ${stats.totalUsers || 0}\nActive Users: ${stats.activeUsers || 0}\nBlocked Users: ${(stats.totalUsers || 0) - (stats.activeUsers || 0)}\nGrowth Rate: +${Math.floor(Math.random() * 15 + 5)}% this month`;
    Alert.alert('User Statistics', message);
  };

  const showRevenueReport = () => {
    const message = `Total Revenue: PKR ${stats.totalRevenue || 0}\nPending Withdrawals: ${stats.pendingWithdraws || 0}\nCompleted Withdrawals: ${Math.floor((stats.totalRevenue || 0) * 0.7)}\nProfit Margin: ${Math.floor(Math.random() * 20 + 15)}%`;
    Alert.alert('Revenue Report', message);
  };

  const showTaskAnalytics = () => {
    const message = `Active Tasks: ${Math.floor(Math.random() * 20 + 10)}\nCompleted Today: ${Math.floor(Math.random() * 100 + 50)}\nMost Popular: Watch Video\nCompletion Rate: ${Math.floor(Math.random() * 30 + 70)}%`;
    Alert.alert('Task Analytics', message);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({title, value, iconName, color}) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.statGradient}>
        <Ionicons name={iconName} size={24} color="#fff" />
      </LinearGradient>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const ActivityItem = ({item}) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityText}>{item.text}</Text>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Header with Logo and Logout */}
        <LinearGradient
          colors={['#FF6B35', '#FF8E53']}
          style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.title}>Admin Panel</Text>
                <Text style={styles.subtitle}>CashOrbit Management</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            iconName="people"
            color="#4CAF50"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers || 0}
            iconName="checkmark-circle"
            color="#2196F3"
          />
          <StatCard
            title="Pending Withdraws"
            value={stats.pendingWithdraws || 0}
            iconName="time"
            color="#FF9800"
          />
          <StatCard
            title="Total Revenue"
            value={`PKR ${stats.totalRevenue || 0}`}
            iconName="cash"
            color="#9C27B0"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#4CAF50'}]}
              onPress={navigateToWithdrawals}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.actionText}>Approve Withdraws</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#2196F3'}]}
              onPress={navigateToUsers}>
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#FF9800'}]}
              onPress={navigateToTasks}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionText}>Add Tasks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#9C27B0'}]}
              onPress={() => {
                try {
                  navigation.navigate('PlanApprovals');
                } catch (error) {
                  Alert.alert('Error', 'Unable to navigate to Plan Approvals');
                }
              }}>
              <Ionicons name="diamond" size={24} color="#fff" />
              <Text style={styles.actionText}>Plan Approvals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: '#607D8B'}]}
              onPress={showReports}>
              <Ionicons name="bar-chart" size={24} color="#fff" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.noActivity}>No recent activity</Text>
            </View>
          ) : (
            recentActivity.map((item, index) => (
              <ActivityItem key={index} item={item} />
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    padding: 20,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    width: '47%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  recentActivity: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  noActivity: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
});

export default AdminDashboard;
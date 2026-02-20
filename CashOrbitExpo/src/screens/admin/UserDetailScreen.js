import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {adminService} from '../../services/adminService';

const UserDetailScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const response = await adminService.getUserDetails(userId);
      setUser(response.user);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action) => {
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
              loadUserDetails();
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} user`);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#FF6B35" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, {
              color: user.status === 'Active' ? '#4CAF50' : '#f44336'
            }]}>
              {user.status}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Joined:</Text>
            <Text style={styles.value}>{new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Wallet Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color="#FF6B35" />
            <Text style={styles.cardTitle}>Wallet Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Coins:</Text>
            <Text style={styles.value}>{user.wallet?.coins || 0}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Earned:</Text>
            <Text style={styles.value}>{user.wallet?.totalEarned || 0}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Withdrawn:</Text>
            <Text style={styles.value}>{user.wallet?.totalWithdrawn || 0}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Referral Coins:</Text>
            <Text style={styles.value}>{user.wallet?.referralCoins || 0}</Text>
          </View>
        </View>

        {/* Plan Card */}
        {user.plan && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="diamond" size={24} color="#FF6B35" />
              <Text style={styles.cardTitle}>Plan Information</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Plan:</Text>
              <Text style={styles.value}>{user.plan.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Price:</Text>
              <Text style={styles.value}>PKR {user.plan.price}</Text>
            </View>
            
            {user.planActivatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Activated:</Text>
                <Text style={styles.value}>{new Date(user.planActivatedAt).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        )}

        {/* Referral Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color="#FF6B35" />
            <Text style={styles.cardTitle}>Referral Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Referral Code:</Text>
            <Text style={styles.value}>{user.referralCode}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Referrals:</Text>
            <Text style={styles.value}>{user.totalReferrals || 0}</Text>
          </View>
          
          {user.referredBy && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Referred By:</Text>
              <Text style={styles.value}>{user.referredBy.name}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              user.status === 'Active' ? styles.blockButton : styles.unblockButton
            ]}
            onPress={() => handleUserAction(user.status === 'Active' ? 'block' : 'unblock')}>
            <Ionicons 
              name={user.status === 'Active' ? 'ban' : 'checkmark-circle'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {user.status === 'Active' ? 'Block User' : 'Unblock User'}
            </Text>
          </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 15,
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  unblockButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserDetailScreen;
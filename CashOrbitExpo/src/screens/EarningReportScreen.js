import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useAuth} from '../context/AuthContext';

const EarningReportScreen = ({navigation}) => {
  const {user} = useAuth();
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    currentBalance: 0,
    tasksCompleted: 0,
    referralEarnings: 0,
  });

  useEffect(() => {
    if (user) {
      setStats({
        totalEarned: user.wallet?.totalEarned || 0,
        totalWithdrawn: user.wallet?.totalWithdrawn || 0,
        currentBalance: user.wallet?.coins || 0,
        tasksCompleted: 0, // TODO: Get from API
        referralEarnings: user.wallet?.referralCoins || 0,
      });
    }
  }, [user]);

  const StatCard = ({title, value, icon, color}) => (
    <View style={styles.statCard}>
      <LinearGradient colors={[color, color + '80']} style={styles.statIcon}>
        <Ionicons name={icon} size={24} color="#fff" />
      </LinearGradient>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earning Report</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Current Balance"
            value={`${stats.currentBalance} coins`}
            icon="wallet"
            color="#4CAF50"
          />
          
          <StatCard
            title="Total Earned"
            value={`${stats.totalEarned} coins`}
            icon="trending-up"
            color="#2196F3"
          />
          
          <StatCard
            title="Total Withdrawn"
            value={`PKR ${stats.totalWithdrawn}`}
            icon="cash"
            color="#FF9800"
          />
          
          <StatCard
            title="Referral Earnings"
            value={`${stats.referralEarnings} coins`}
            icon="people"
            color="#9C27B0"
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Earning Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Available Balance:</Text>
            <Text style={styles.summaryValue}>{stats.currentBalance} coins</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Conversion Rate:</Text>
            <Text style={styles.summaryValue}>1000 coins = PKR 500</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Value:</Text>
            <Text style={styles.summaryValue}>
              PKR {(stats.currentBalance * 0.5).toFixed(0)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Minimum Withdrawal:</Text>
            <Text style={styles.summaryValue}>5000 coins (PKR 2500)</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Earning Tips</Text>
          <Text style={styles.tipText}>• Complete daily tasks to maximize earnings</Text>
          <Text style={styles.tipText}>• Refer friends to earn bonus coins</Text>
          <Text style={styles.tipText}>• Upgrade your plan for higher coin multipliers</Text>
          <Text style={styles.tipText}>• Check in daily for streak bonuses</Text>
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
  statsGrid: {
    gap: 15,
    marginBottom: 20,
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
  statIcon: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default EarningReportScreen;
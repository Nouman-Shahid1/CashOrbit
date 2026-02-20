import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { referralService } from '../services/referralService';

const ReferralScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({});
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const [stats, history] = await Promise.all([
        referralService.getReferralStats(),
        referralService.getReferralHistory(),
      ]);
      setReferralStats(stats);
      setReferralHistory(history);
    } catch (error) {
      Alert.alert('Error', 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const shareReferralLink = () => {
    referralService.shareReferralLink(user?.referralCode || 'CASH123');
  };

  const renderReferralItem = ({ item }) => (
    <View style={styles.referralItem}>
      <View style={styles.referralInfo}>
        <Text style={styles.referralName}>{item.name}</Text>
        <Text style={styles.referralDate}>
          Joined: {new Date(item.joinedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.referralReward}>
        <Text style={styles.rewardAmount}>+{item.bonusEarned}</Text>
        <Text style={styles.rewardLabel}>coins</Text>
      </View>
    </View>
  );

  const getBonusLevel = (count) => {
    if (count >= 50) return { level: 'Diamond', color: '#9C27B0', bonus: 500 };
    if (count >= 25) return { level: 'Gold', color: '#FF9800', bonus: 250 };
    if (count >= 10) return { level: 'Silver', color: '#607D8B', bonus: 100 };
    if (count >= 5) return { level: 'Bronze', color: '#795548', bonus: 50 };
    if (count >= 1) return { level: 'Starter', color: '#4CAF50', bonus: 25 };
    return { level: 'Beginner', color: '#9E9E9E', bonus: 0 };
  };

  const bonusLevel = getBonusLevel(referralStats.totalReferrals || 0);

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
          <Text style={styles.headerTitle}>Referral Program</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Referral Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.levelBadge}>
            <Ionicons name="trophy" size={24} color={bonusLevel.color} />
            <Text style={[styles.levelText, { color: bonusLevel.color }]}>
              {bonusLevel.level} Level
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{referralStats.totalReferrals || 0}</Text>
              <Text style={styles.statLabel}>Friends Referred</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{referralStats.referralCoins || 0}</Text>
              <Text style={styles.statLabel}>Bonus Earned</Text>
            </View>
          </View>
          
          <View style={styles.nextLevelInfo}>
            <Text style={styles.nextLevelText}>
              Next Level: {getBonusLevel((referralStats.totalReferrals || 0) + 1).level}
            </Text>
            <Text style={styles.nextLevelBonus}>
              Bonus: {getBonusLevel((referralStats.totalReferrals || 0) + 1).bonus} coins per referral
            </Text>
          </View>
        </View>

        {/* Referral Code Card */}
        <View style={styles.referralCodeCard}>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.referralCode}>{user?.referralCode || 'CASH123'}</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy" size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareReferralLink}>
            <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.shareGradient}>
              <Ionicons name="share" size={20} color="#fff" />
              <Text style={styles.shareText}>Share Referral Link</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.cardTitle}>How It Works</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <Text style={styles.stepDescription}>
              Share your referral code with friends
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.stepDescription}>
              They sign up using your code
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <Text style={styles.stepDescription}>
              You both get bonus coins!
            </Text>
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Referral History</Text>
          
          {referralHistory.length > 0 ? (
            <FlatList
              data={referralHistory}
              renderItem={renderReferralItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No referrals yet</Text>
              <Text style={styles.emptySubtext}>
                Start sharing your code to earn bonus coins!
              </Text>
            </View>
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  nextLevelInfo: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nextLevelBonus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  referralCodeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: 15,
    padding: 8,
  },
  shareButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  howItWorksCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepDescription: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: '#666',
  },
  referralReward: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ReferralScreen;
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {planService} from '../services/planService';

const PlanSelectionScreen = ({navigation}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await planService.getPlans();
      setPlans(plansData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (plan) => {
    if (plan.name === 'Free') {
      // Activate free plan directly
      planService.activateFreePlan();
      navigation.navigate('UserTabs');
    } else {
      // Navigate to deposit screen for paid plans
      navigation.navigate('DepositSubmission', {plan});
    }
  };

  const PlanCard = ({plan}) => (
    <View style={[styles.planCard, plan.featured && styles.featuredPlan]}>
      {plan.featured && <Text style={styles.featuredBadge}>POPULAR</Text>}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.depositAmount}>
        {plan.depositAmount === 0 ? 'FREE' : `PKR ${plan.depositAmount}`}
      </Text>
      
      <View style={styles.features}>
        <Text style={styles.feature}><Ionicons name="list" size={16} color="#666" /> {plan.dailyTasks} Daily Tasks</Text>
        <Text style={styles.feature}><Ionicons name="trending-up" size={16} color="#666" /> {plan.coinMultiplier}x Coin Multiplier</Text>
        <Text style={styles.feature}><Ionicons name="card" size={16} color="#666" /> PKR {plan.withdrawLimit} Withdraw Limit</Text>
        <Text style={styles.feature}><Ionicons name="cash" size={16} color="#666" /> {plan.coinRate} PKR per Coin</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.selectButton, plan.name === 'Free' && styles.freeButton]}
        onPress={() => selectPlan(plan)}>
        <Text style={styles.selectButtonText}>
          {plan.name === 'Free' ? 'Continue Free' : 'Deposit & Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Select a plan that suits your earning goals</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan, index) => (
          <PlanCard key={index} plan={plan} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  featuredPlan: {
    borderColor: '#4CAF50',
    transform: [{scale: 1.02}],
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  depositAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  freeButton: {
    backgroundColor: '#2196F3',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlanSelectionScreen;
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {planService} from '../services/planService';
import {useAuth} from '../context/AuthContext';

const UpgradePlanScreen = ({navigation}) => {
  const {user, updateUser} = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [depositProof, setDepositProof] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [depositorName, setDepositorName] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await planService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    if ((plan.depositAmount || plan.price) === 0) {
      // Free plan - direct activation
      Alert.alert(
        'Activate Plan',
        `Activate ${plan.name}?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Activate',
            onPress: async () => {
              setLoading(true);
              try {
                await planService.activateFreePlan();
                Alert.alert('Success', 'Free plan activated!');
                navigation.goBack();
              } catch (error) {
                Alert.alert('Error', error.message);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } else {
      // Paid plan - show deposit modal
      setSelectedPlan(plan);
      setShowDepositModal(true);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setDepositProof(result.assets[0]);
    }
  };

  const submitDepositProof = async () => {
    if (!depositProof || !transactionId || !depositorName) {
      Alert.alert('Error', 'Please fill all fields and upload proof');
      return;
    }

    console.log('Selected Plan:', selectedPlan);
    console.log('Plan ID:', selectedPlan?._id);

    setLoading(true);
    try {
      await planService.submitDepositProof(selectedPlan, {
        transactionId,
        depositorName,
        screenshot: depositProof.uri,
        amount: selectedPlan.depositAmount || selectedPlan.price,
      });
      
      Alert.alert(
        'Success', 
        'Deposit proof submitted! Your plan will be activated after verification.'
      );
      
      setShowDepositModal(false);
      setDepositProof(null);
      setTransactionId('');
      setDepositorName('');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({plan}) => {
    const isCurrentPlan = user?.plan?._id === plan._id;
    
    return (
      <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
        <LinearGradient
          colors={isCurrentPlan ? ['#4CAF50', '#66BB6A'] : ['#FF6B35', '#FF8E53']}
          style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>PKR {plan.depositAmount || plan.price}</Text>
        </LinearGradient>
        
        <View style={styles.planBody}>
          <View style={styles.featureRow}>
            <Ionicons name="diamond" size={16} color="#FF6B35" />
            <Text style={styles.featureText}>Coin Multiplier: {plan.coinMultiplier}</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="time" size={16} color="#FF6B35" />
            <Text style={styles.featureText}>Duration: {plan.duration} days</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="cash" size={16} color="#FF6B35" />
            <Text style={styles.featureText}>Daily Withdrawal Limit: PKR {plan.dailyWithdrawLimit}</Text>
          </View>
          
          {plan.features?.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            isCurrentPlan && styles.currentPlanButton,
            loading && styles.disabledButton
          ]}
          onPress={() => handleUpgrade(plan)}
          disabled={isCurrentPlan || loading}>
          <Text style={[
            styles.upgradeButtonText,
            isCurrentPlan && styles.currentPlanButtonText
          ]}>
            {isCurrentPlan ? 'Current Plan' : (plan.depositAmount || plan.price) === 0 ? 'Activate' : 'Upgrade Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Upgrade Plan</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.currentPlanInfo}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <Text style={styles.currentPlanName}>
            {user?.plan?.name || 'No Plan'}
          </Text>
          {user?.plan && (
            <Text style={styles.currentPlanDetails}>
              Multiplier: {user.plan.coinMultiplier} | 
              Expires: {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString() : 'N/A'}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Available Plans</Text>
        
        {plans.map((plan, index) => (
          <PlanCard key={index} plan={plan} />
        ))}
      </ScrollView>

      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Deposit Proof</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.planInfo}>
                Plan: {selectedPlan?.name} - PKR {selectedPlan?.depositAmount || selectedPlan?.price}
              </Text>

              <Text style={styles.amountInfo}>
                Amount required to activate this plan: PKR {selectedPlan?.depositAmount || selectedPlan?.price}
              </Text>

              <Text style={styles.depositInfo}>
                Send deposit to: JazzCash/EasyPaisa: 03XX-XXXXXXX
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Transaction ID"
                value={transactionId}
                onChangeText={setTransactionId}
              />

              <TextInput
                style={styles.input}
                placeholder="Depositor Name"
                value={depositorName}
                onChangeText={setDepositorName}
              />

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#FF6B35" />
                <Text style={styles.imageButtonText}>
                  {depositProof ? 'Change Image' : 'Upload Proof'}
                </Text>
              </TouchableOpacity>

              {depositProof && (
                <Image source={{uri: depositProof.uri}} style={styles.proofImage} />
              )}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={submitDepositProof}
                disabled={loading}>
                <Text style={styles.submitButtonText}>
                  {loading ? 'Submitting...' : 'Submit Proof'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  currentPlanInfo: {
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
  currentPlanTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  currentPlanDetails: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  planBody: {
    padding: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    margin: 20,
    marginTop: 0,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlanButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  planInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 15,
    textAlign: 'center',
  },
  amountInfo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  depositInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    marginLeft: 10,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpgradePlanScreen;
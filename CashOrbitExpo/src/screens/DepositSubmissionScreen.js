import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {planService} from '../services/planService';

const DepositSubmissionScreen = ({route, navigation}) => {
  const {plan} = route.params;
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const submitDeposit = async () => {
    if (!paymentMethod || !transactionId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await planService.submitDepositProof(plan, {
        paymentMethod,
        transactionId,
        // screenshot would be handled here in real app
      });
      
      Alert.alert(
        'Deposit Submitted!',
        'Your deposit proof has been submitted for admin approval. You will be notified once approved.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('UserTabs'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Submit Deposit</Text>
      </View>

      {/* Plan Summary */}
      <View style={styles.planSummary}>
        <Text style={styles.planName}>{plan.name} Plan</Text>
        <Text style={styles.depositAmount}>PKR {plan.depositAmount}</Text>
        <Text style={styles.planFeatures}>
          • {plan.dailyTasks} Daily Tasks
          • {plan.coinMultiplier} Coin Multiplier
          • PKR {plan.withdrawLimit} Withdraw Limit
        </Text>
      </View>

      {/* Deposit Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Payment Instructions</Text>
        <Text style={styles.instructionText}>
          1. Send PKR {plan.depositAmount} to any of these accounts:
        </Text>
        
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>JazzCash</Text>
          <Text style={styles.accountNumber}>03001234567</Text>
        </View>
        
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>EasyPaisa</Text>
          <Text style={styles.accountNumber}>03007654321</Text>
        </View>
        
        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Bank Transfer</Text>
          <Text style={styles.accountNumber}>Allied Bank: 1234567890</Text>
        </View>
        
        <Text style={styles.instructionText}>
          2. Fill the form below with payment details
        </Text>
        <Text style={styles.instructionText}>
          3. Upload screenshot of payment confirmation
        </Text>
      </View>

      {/* Deposit Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Deposit Details</Text>
        
        <View style={styles.readOnlyField}>
          <Text style={styles.label}>Selected Plan</Text>
          <Text style={styles.readOnlyValue}>{plan.name}</Text>
        </View>
        
        <View style={styles.readOnlyField}>
          <Text style={styles.label}>Deposit Amount</Text>
          <Text style={styles.readOnlyValue}>PKR {plan.depositAmount}</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment Method *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., JazzCash, EasyPaisa, Bank Transfer"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Transaction ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter transaction/reference ID"
            value={transactionId}
            onChangeText={setTransactionId}
          />
        </View>
        
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>📷 Upload Screenshot</Text>
          <Text style={styles.uploadSubtext}>Required for verification</Text>
        </TouchableOpacity>
      </View>

      {/* Status Info */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>What happens next?</Text>
        <Text style={styles.statusText}>
          • Your deposit will be reviewed by our admin team
        </Text>
        <Text style={styles.statusText}>
          • Approval usually takes 2-24 hours
        </Text>
        <Text style={styles.statusText}>
          • You'll be notified once approved
        </Text>
        <Text style={styles.statusText}>
          • Coins & earning will be enabled after approval
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={submitDeposit}
        disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  planSummary: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  depositAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  planFeatures: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 22,
  },
  accountInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  readOnlyField: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  readOnlyValue: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  uploadSubtext: {
    color: '#e3f2fd',
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DepositSubmissionScreen;
import {apiService} from './apiService';

class PlanService {
  async getPlans() {
    try {
      const response = await apiService.get('/cashorbit/plans');
      return response.plans;
    } catch (error) {
      throw new Error('Failed to load plans');
    }
  }

  async activateFreePlan() {
    try {
      const response = await apiService.post('/cashorbit/plans/activate-free');
      return response;
    } catch (error) {
      throw new Error('Failed to activate free plan');
    }
  }

  async submitDepositProof(planData, proofData) {
    try {
      const formData = new FormData();
      formData.append('planId', planData._id || planData.id);
      formData.append('transactionId', proofData.transactionId);
      formData.append('depositorName', proofData.depositorName);
      formData.append('amount', proofData.amount.toString());
      
      // Handle file upload
      if (proofData.screenshot) {
        const filename = `deposit_proof_${Date.now()}.jpg`;
        formData.append('screenshot', {
          uri: proofData.screenshot,
          type: 'image/jpeg',
          name: filename,
        });
      }
      
      console.log('FormData contents:');
      console.log('planId:', planData._id || planData.id);
      console.log('transactionId:', proofData.transactionId);
      console.log('depositorName:', proofData.depositorName);
      console.log('amount:', proofData.amount);
      console.log('screenshot URI:', proofData.screenshot);
      
      const response = await apiService.postFormData('/cashorbit/plans/submit-deposit', formData);
      return response;
    } catch (error) {
      console.error('Submit deposit error:', error);
      throw new Error('Failed to submit deposit proof');
    }
  }

  async upgradePlan(planId) {
    try {
      const response = await apiService.post('/cashorbit/plans/upgrade', { planId });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upgrade plan');
    }
  }
}

export const planService = new PlanService();
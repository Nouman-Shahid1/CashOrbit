import {apiService} from './apiService';

class UserService {
  async getUserStats() {
    try {
      const response = await apiService.get('/cashorbit-auth/me');
      const coins = response.user.wallet.coins || 0;
      return {
        coins,
        pkrValue: (coins / 100).toFixed(2), // Show decimal PKR (e.g., 0.50 PKR for 50 coins)
        plan: response.user.plan?.name || 'Free',
        coinRate: 0.01, // 1 coin = 0.01 PKR
        planExpiry: response.user.planExpiresAt
      };
    } catch (error) {
      console.error('Failed to load user stats:', error);
      return {
        coins: 0,
        pkrValue: '0.00',
        plan: 'Free',
        coinRate: 0.01
      };
    }
  }

  async getTransactionHistory() {
    try {
      const response = await apiService.get('/cashorbit/tasks/history');
      return response.completions?.map(completion => ({
        type: completion.task.type,
        coins: completion.coinsEarned,
        pkrValue: (completion.coinsEarned / 100).toFixed(2), // Show decimal PKR
        date: completion.completedAt.split('T')[0],
        status: completion.status
      })) || [];
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      return [];
    }
  }

  async getReferralStats() {
    try {
      const response = await apiService.get('/cashorbit-auth/me');
      return {
        referralCode: response.user.referralCode,
        totalReferrals: response.user.totalReferrals || 0,
        referralCoins: response.user.wallet.referralCoins || 0
      };
    } catch (error) {
      console.error('Failed to load referral stats:', error);
      return {
        referralCode: 'CASH123',
        totalReferrals: 0,
        referralCoins: 0
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/cashorbit/users/profile', profileData);
      return response;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }
}

export const userService = new UserService();
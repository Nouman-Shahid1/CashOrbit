import {apiService} from './apiService';

class WithdrawService {
  async getUserStats() {
    try {
      const response = await apiService.get('/cashorbit/withdrawals/stats');
      return response.stats;
    } catch (error) {
      throw new Error('Failed to load user stats');
    }
  }

  async getWithdrawHistory() {
    try {
      const response = await apiService.get('/cashorbit/withdrawals/history');
      return response.withdrawals || [];
    } catch (error) {
      console.error('Withdraw history error:', error);
      return [];
    }
  }

  async getWithdrawalHistory() {
    try {
      const response = await apiService.get('/cashorbit/withdrawals/history');
      return response.withdrawals || [];
    } catch (error) {
      console.error('Failed to load withdrawal history:', error);
      return [];
    }
  }

  async requestWithdraw(withdrawData) {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      if (dayOfWeek !== 5 && dayOfWeek !== 0) {
        throw new Error('Withdrawals are only allowed on Friday and Sunday');
      }

      const response = await apiService.post('/cashorbit/withdrawals/request', withdrawData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to request withdraw');
    }
  }

  async checkWeeklyWithdraw() {
    try {
      const response = await apiService.get('/cashorbit/withdrawals/check-weekly');
      return response.hasWithdrawn;
    } catch (error) {
      return false;
    }
  }

  isWithdrawDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayOfWeek === 5 || dayOfWeek === 0;
  }

  getNextWithdrawDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek === 5 || dayOfWeek === 0) {
      return 'Today';
    }
    
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    
    if (daysUntilFriday <= daysUntilSunday) {
      return `Friday (${daysUntilFriday} days)`;
    } else {
      return `Sunday (${daysUntilSunday} days)`;
    }
  }
}

export const withdrawService = new WithdrawService();
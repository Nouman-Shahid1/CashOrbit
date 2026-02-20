import {apiService} from './apiService';

class StreakService {
  async getStreakData() {
    try {
      const response = await apiService.get('/cashorbit-auth/streak');
      return response.streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        canCheckIn: true,
        nextMilestone: 30,
        progress: 0
      };
    } catch (error) {
      console.error('Failed to load streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        canCheckIn: true,
        nextMilestone: 30,
        progress: 0
      };
    }
  }

  async checkIn() {
    try {
      const response = await apiService.post('/cashorbit-auth/checkin');
      return response;
    } catch (error) {
      throw new Error('Failed to check in');
    }
  }

  async claimStreakBonus() {
    try {
      const response = await apiService.post('/cashorbit-auth/streak-bonus');
      return response;
    } catch (error) {
      throw new Error('Failed to claim streak bonus');
    }
  }
}

export const streakService = new StreakService();
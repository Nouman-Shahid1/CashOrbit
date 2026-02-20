import { apiService } from './apiService';
import { Share } from 'react-native';

class ReferralService {
  async getReferralStats() {
    try {
      const response = await apiService.get('/users/referral-stats');
      return response;
    } catch (error) {
      console.error('Failed to get referral stats:', error);
      throw new Error('Failed to load referral data');
    }
  }

  async shareReferralLink(referralCode) {
    try {
      const referralLink = `https://cashorbit.app/signup?ref=${referralCode}`;
      const message = `🎉 Join CashOrbit and start earning money today!\n\n💰 Complete tasks and earn coins\n🎁 Get bonus coins with my referral code: ${referralCode}\n\nDownload now: ${referralLink}`;
      
      await Share.share({
        message,
        title: 'Join CashOrbit - Start Earning Today!',
        url: referralLink,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  async getReferralHistory() {
    try {
      const response = await apiService.get('/users/referral-history');
      return response.referrals || [];
    } catch (error) {
      console.error('Failed to get referral history:', error);
      return [];
    }
  }

  calculateReferralBonus(referralCount) {
    // Progressive bonus system
    if (referralCount >= 50) return 500; // 500 coins for 50+ referrals
    if (referralCount >= 25) return 250; // 250 coins for 25+ referrals
    if (referralCount >= 10) return 100; // 100 coins for 10+ referrals
    if (referralCount >= 5) return 50;   // 50 coins for 5+ referrals
    if (referralCount >= 1) return 25;   // 25 coins for 1+ referrals
    return 0;
  }
}

export const referralService = new ReferralService();
import {apiService} from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(email, password) {
    try {
      console.log('Logging in user:', email);
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });
      
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      
      return response.user;
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error Response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async signup(name, email, password, referralCode) {
    try {
      console.log('Starting signup process for:', email);
      
      // First, send OTP for email verification
      try {
        await this.sendEmailVerificationOTP(email, name);
        
        // Store signup data temporarily for later use
        const signupData = {
          name,
          email,
          password,
          referralCode,
          timestamp: Date.now()
        };
        
        await AsyncStorage.setItem(`signup_${email}`, JSON.stringify(signupData));
        
        return { 
          requiresEmailVerification: true,
          email,
          name
        };
      } catch (otpError) {
        console.error('OTP sending failed:', otpError);
        throw new Error(otpError.message || 'Failed to send verification OTP');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  }

  async sendEmailVerificationOTP(email, name) {
    try {
      console.log('Sending email verification OTP to:', email);
      const response = await apiService.post('/cashorbit-auth/send-signup-otp', {
        email,
        name,
        deviceId: await this.getDeviceId(),
      });
      
      console.log('Email verification OTP sent successfully');
      return response;
    } catch (error) {
      console.error('Send Email Verification OTP Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send verification OTP');
    }
  }

  async sendSignupOTP(email, name) {
    return this.sendEmailVerificationOTP(email, name);
  }

  async sendOTP(email) {
    try {
      console.log('Sending OTP to:', email);
      const response = await apiService.post('/cashorbit-auth/send-otp', {
        email,
        deviceId: await this.getDeviceId(),
      });
      
      console.log('OTP sent successfully');
      return response;
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await apiService.post('/cashorbit-auth/verify-otp', {
        email,
        otp,
        deviceId: await this.getDeviceId(),
      });
      
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      
      return response.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP');
    }
  }

  async verifySignupOTP(email, otp, name) {
    try {
      // Get stored signup data
      const signupDataStr = await AsyncStorage.getItem(`signup_${email}`);
      if (!signupDataStr) {
        throw new Error('Signup session expired. Please start signup again.');
      }
      
      const signupData = JSON.parse(signupDataStr);
      
      // Check if signup data is not too old (30 minutes)
      if (Date.now() - signupData.timestamp > 30 * 60 * 1000) {
        await AsyncStorage.removeItem(`signup_${email}`);
        throw new Error('Signup session expired. Please start signup again.');
      }
      
      // Verify OTP first
      const otpResponse = await apiService.post('/cashorbit-auth/verify-signup-otp', {
        email,
        otp,
        name,
        deviceId: await this.getDeviceId(),
      });
      
      // If OTP is valid but user doesn't exist in main auth system, create the account
      if (otpResponse.user) {
        // Clean up stored signup data
        await AsyncStorage.removeItem(`signup_${email}`);
        
        if (otpResponse.token) {
          await AsyncStorage.setItem('authToken', otpResponse.token);
        }
        
        return otpResponse.user;
      } else {
        // Create user account after OTP verification
        const response = await apiService.post('/auth/register', {
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          referralCode: signupData.referralCode,
        });
        
        // Clean up stored signup data
        await AsyncStorage.removeItem(`signup_${email}`);
        
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        
        return response.user;
      }
    } catch (error) {
      console.error('Verify signup OTP error:', error);
      console.error('Error Response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Invalid OTP');
    }
  }

  async getDeviceId() {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  async logout() {
    await AsyncStorage.multiRemove(['user', 'authToken']);
  }
}

export const authService = new AuthService();
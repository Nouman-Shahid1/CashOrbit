import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.32:6000/api'; // Your computer's IP address
// For physical device, use your computer's IP: 'http://YOUR_COMPUTER_IP:5000/api'
// For iOS simulator, use: 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          AsyncStorage.removeItem('user');
          AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint) {
    try {
      console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`);
      const response = await this.api.get(endpoint);
      console.log('GET Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API GET Error:', error.message);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      console.log(`Making POST request to: ${API_BASE_URL}${endpoint}`);
      console.log('Request data:', data);
      const response = await this.api.post(endpoint, data);
      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API POST Error:', error.message);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async postFormData(endpoint, formData) {
    try {
      console.log(`Making POST FormData request to: ${API_BASE_URL}${endpoint}`);
      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('FormData Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API FormData POST Error:', error.message);
      console.error('Error response:', error.response?.data);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      console.log(`Making PUT request to: ${API_BASE_URL}${endpoint}`);
      console.log('Request data:', data);
      const response = await this.api.put(endpoint, data);
      console.log('PUT Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API PUT Error:', error.message);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async delete(endpoint) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }

  // Test connection to server
  async testConnection() {
    try {
      console.log('Testing connection to:', API_BASE_URL.replace('/api', ''));
      const response = await this.api.get('/', { baseURL: API_BASE_URL.replace('/api', '') });
      console.log('Connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}

export const apiService = new ApiService();
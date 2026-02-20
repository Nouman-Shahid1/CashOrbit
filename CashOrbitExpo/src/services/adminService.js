import {apiService} from './apiService';

class AdminService {
  async getDashboardStats() {
    try {
      const response = await apiService.get('/cashorbit-admin/dashboard/stats');
      return response;
    } catch (error) {
      throw new Error('Failed to load dashboard stats');
    }
  }

  async getRecentActivity() {
    try {
      const response = await apiService.get('/cashorbit-admin/dashboard/activity');
      return response;
    } catch (error) {
      throw new Error('Failed to load recent activity');
    }
  }

  async getWithdrawals(filter = 'all') {
    try {
      const response = await apiService.get(`/cashorbit-admin/withdrawals?status=${filter}`);
      return response;
    } catch (error) {
      throw new Error('Failed to load withdrawals');
    }
  }

  async updateWithdrawStatus(withdrawId, action) {
    try {
      const response = await apiService.put(`/cashorbit-admin/withdrawals/${withdrawId}`, {
        action
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to ${action} withdrawal`);
    }
  }

  async getUsers(filter = 'all') {
    try {
      const response = await apiService.get(`/cashorbit-admin/users?status=${filter}`);
      return response;
    } catch (error) {
      throw new Error('Failed to load users');
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await apiService.get(`/cashorbit-admin/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error('Failed to load user details');
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const response = await apiService.put(`/cashorbit-admin/users/${userId}/status`, {
        status
      });
      return response;
    } catch (error) {
      throw new Error('Failed to update user status');
    }
  }

  async getTasks() {
    try {
      const response = await apiService.get('/cashorbit-admin/tasks');
      return response;
    } catch (error) {
      throw new Error('Failed to load tasks');
    }
  }

  async createTask(taskData) {
    try {
      const response = await apiService.post('/cashorbit-admin/tasks', taskData);
      return response;
    } catch (error) {
      throw new Error('Failed to create task');
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await apiService.put(`/cashorbit-admin/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await apiService.delete(`/cashorbit-admin/tasks/${taskId}`);
      return response;
    } catch (error) {
      throw new Error('Failed to delete task');
    }
  }

  async getPendingDeposits() {
    try {
      const response = await apiService.get('/cashorbit-admin/deposits/pending');
      return response;
    } catch (error) {
      throw new Error('Failed to load pending deposits');
    }
  }

  async approveDeposit(depositId) {
    try {
      const response = await apiService.put(`/cashorbit-admin/deposits/${depositId}/approve`, {});
      return response;
    } catch (error) {
      throw new Error('Failed to approve deposit');
    }
  }

  async rejectDeposit(depositId) {
    try {
      const response = await apiService.put(`/cashorbit-admin/deposits/${depositId}/reject`, {});
      return response;
    } catch (error) {
      throw new Error('Failed to reject deposit');
    }
  }
}

export const adminService = new AdminService();
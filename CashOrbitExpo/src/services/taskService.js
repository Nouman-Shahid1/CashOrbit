import {apiService} from './apiService';

class TaskService {
  async getAvailableTasks() {
    try {
      const response = await apiService.get('/cashorbit/tasks/available');
      return response.tasks || [];
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }

  async startTask(taskId) {
    try {
      const response = await apiService.post(`/cashorbit/tasks/${taskId}/start`);
      return response;
    } catch (error) {
      throw new Error('Failed to start task');
    }
  }

  async completeTask(taskId, completionData = {}) {
    try {
      const response = await apiService.post(`/cashorbit/tasks/${taskId}/complete`, {
        submissionData: completionData
      });
      return response;
    } catch (error) {
      throw new Error('Failed to complete task');
    }
  }

  async getTaskHistory() {
    try {
      const response = await apiService.get('/cashorbit/tasks/history');
      return response.completions || [];
    } catch (error) {
      console.error('Failed to load task history:', error);
      return [];
    }
  }
}

export const taskService = new TaskService();
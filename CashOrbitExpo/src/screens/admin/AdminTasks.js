import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {adminService} from '../../services/adminService';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'Watch Video',
    description: '',
    coins: '',
    dailyLimit: '',
    difficulty: 'Easy',
    videoUrl: '',
    watchTime: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await adminService.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.coins) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newTask.type === 'Watch Video' && (!newTask.videoUrl || !newTask.watchTime)) {
      Alert.alert('Error', 'Please provide video URL and watch time for video tasks');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        coins: parseInt(newTask.coins),
        dailyLimit: parseInt(newTask.dailyLimit) || 0,
        watchTime: newTask.type === 'Watch Video' ? parseInt(newTask.watchTime) : undefined
      };
      
      await adminService.createTask(taskData);
      Alert.alert('Success', 'Task created successfully');
      setShowAddModal(false);
      setNewTask({
        title: '',
        type: 'Watch Video',
        description: '',
        coins: '',
        dailyLimit: '',
        difficulty: 'Easy',
        videoUrl: '',
        watchTime: ''
      });
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      type: task.type,
      description: task.description,
      coins: task.coins.toString(),
      dailyLimit: task.dailyLimit.toString(),
      difficulty: task.difficulty,
      videoUrl: task.videoUrl || '',
      watchTime: task.watchTime ? task.watchTime.toString() : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    if (!newTask.title || !newTask.coins) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newTask.type === 'Watch Video' && (!newTask.videoUrl || !newTask.watchTime)) {
      Alert.alert('Error', 'Please provide video URL and watch time for video tasks');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        coins: parseInt(newTask.coins),
        dailyLimit: parseInt(newTask.dailyLimit) || 0,
        watchTime: newTask.type === 'Watch Video' ? parseInt(newTask.watchTime) : undefined
      };
      
      await adminService.updateTask(editingTask.id, taskData);
      Alert.alert('Success', 'Task updated successfully');
      setShowEditModal(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        type: 'Watch Video',
        description: '',
        coins: '',
        dailyLimit: '',
        difficulty: 'Easy',
        videoUrl: '',
        watchTime: ''
      });
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskAction = async (taskId, action) => {
    let actionText = '';
    switch (action) {
      case 'pause':
        actionText = 'pause';
        break;
      case 'activate':
        actionText = 'activate';
        break;
      case 'delete':
        actionText = 'delete';
        break;
    }
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this task?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              if (action === 'delete') {
                await adminService.deleteTask(taskId);
              } else {
                const newStatus = action === 'pause' ? 'Paused' : 'Active';
                await adminService.updateTask(taskId, {status: newStatus});
              }
              Alert.alert('Success', `Task ${actionText}d successfully`);
              loadTasks();
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} task`);
            }
          },
        },
      ]
    );
  };

  const TaskCard = ({task}) => {
    const getTaskIcon = (type) => {
      switch (type) {
        case 'Watch Video': return 'play-circle';
        case 'Install App': return 'download';
        case 'Survey': return 'clipboard';
        case 'Quiz': return 'help-circle';
        case 'Daily Spin': return 'refresh';
        case 'Referrals': return 'people';
        default: return 'star';
      }
    };

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <View style={styles.taskTitleRow}>
              <Ionicons name={getTaskIcon(task.type)} size={20} color="#FF6B35" />
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
            <Text style={styles.taskType}>{task.type}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            {backgroundColor: task.status === 'Active' ? '#4CAF50' : '#FF9800'}
          ]}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>
        
        <Text style={styles.taskDescription}>{task.description}</Text>
        
        <View style={styles.taskDetails}>
          <View style={styles.taskStat}>
            <Ionicons name="cash" size={16} color="#FF9800" />
            <Text style={styles.statValue}>{task.coins} coins</Text>
          </View>
          
          <View style={styles.taskStat}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{task.completions} completed</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              task.status === 'Active' ? styles.pauseButton : styles.activateButton
            ]}
            onPress={() => handleTaskAction(task.id, task.status === 'Active' ? 'pause' : 'activate')}>
            <Ionicons 
              name={task.status === 'Active' ? 'pause' : 'play'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {task.status === 'Active' ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditTask(task)}>
            <Ionicons name="create" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleTaskAction(task.id, 'delete')}>
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}>
        <Text style={styles.title}>Manage Tasks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Tasks List */}
      <ScrollView
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptyHint}>Tap the "Add Task" button above to create your first task</Text>
            <TouchableOpacity 
              style={styles.createFirstTask}
              onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createFirstTaskText}>Create First Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newTask.title}
                onChangeText={(text) => setNewTask({...newTask, title: text})}
                placeholder="Enter task title"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newTask.description}
                onChangeText={(text) => setNewTask({...newTask, description: text})}
                placeholder="Enter task description"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Coins Reward *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.coins}
                  onChangeText={(text) => setNewTask({...newTask, coins: text})}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Daily Limit</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.dailyLimit}
                  onChangeText={(text) => setNewTask({...newTask, dailyLimit: text})}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {newTask.type === 'Watch Video' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Video URL *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newTask.videoUrl}
                    onChangeText={(text) => setNewTask({...newTask, videoUrl: text})}
                    placeholder="https://youtube.com/watch?v=..."
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Watch Time (seconds) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newTask.watchTime}
                    onChangeText={(text) => setNewTask({...newTask, watchTime: text})}
                    placeholder="30"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleAddTask}>
              <Text style={styles.createButtonText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newTask.title}
                onChangeText={(text) => setNewTask({...newTask, title: text})}
                placeholder="Enter task title"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newTask.description}
                onChangeText={(text) => setNewTask({...newTask, description: text})}
                placeholder="Enter task description"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Coins Reward *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.coins}
                  onChangeText={(text) => setNewTask({...newTask, coins: text})}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Daily Limit</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.dailyLimit}
                  onChangeText={(text) => setNewTask({...newTask, dailyLimit: text})}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {newTask.type === 'Watch Video' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Video URL *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newTask.videoUrl}
                    onChangeText={(text) => setNewTask({...newTask, videoUrl: text})}
                    placeholder="https://youtube.com/watch?v=..."
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Watch Time (seconds) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newTask.watchTime}
                    onChangeText={(text) => setNewTask({...newTask, watchTime: text})}
                    placeholder="30"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleUpdateTask}>
              <Text style={styles.createButtonText}>Update Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  tasksList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  createFirstTask: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createFirstTaskText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  taskType: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  taskStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputHalf: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminTasks;
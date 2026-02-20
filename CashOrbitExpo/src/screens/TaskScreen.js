import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import {taskService} from '../services/taskService';

const TaskScreen = ({route, navigation}) => {
  const {task} = route.params;
  const [loading, setLoading] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    if (task.type === 'Watch Video' && taskStarted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [taskStarted, timeRemaining]);

  const startTask = async () => {
    setLoading(true);
    try {
      await taskService.startTask(task.id);
      setTaskStarted(true);
      
      if (task.type === 'Watch Video') {
        setTimeRemaining(task.watchTime);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async () => {
    setLoading(true);
    try {
      let completionData = {};
      
      if (task.type === 'Manual Task') {
        completionData.submissionText = submissionText;
        // In real app, you'd also handle screenshot upload here
      }
      
      await taskService.completeTask(task.id, completionData);
      
      Alert.alert(
        'Task Completed!',
        `You earned ${task.coins} coins!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openAppStore = () => {
    // In real app, use Linking.openURL(task.appLink)
    Alert.alert('App Store', 'Opening app store...');
    setTaskStarted(true);
  };

  const renderTaskContent = () => {
    switch (task.type) {
      case 'Watch Video':
        return (
          <View style={styles.taskContent}>
            <Text style={styles.taskDescription}>
              Watch the video for {task.watchTime} seconds to earn coins
            </Text>
            
            {!taskStarted ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startTask}
                disabled={loading}>
                <Text style={styles.startButtonText}>
                  {loading ? 'Starting...' : 'Watch Now'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.videoContainer}>
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoText}>🎥 Video Playing</Text>
                  {timeRemaining > 0 && (
                    <Text style={styles.timer}>
                      Time remaining: {timeRemaining}s
                    </Text>
                  )}
                </View>
                
                {timeRemaining === 0 && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={completeTask}
                    disabled={loading}>
                    <Text style={styles.completeButtonText}>
                      {loading ? 'Completing...' : 'Claim Coins'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );

      case 'Install App':
        return (
          <View style={styles.taskContent}>
            <Text style={styles.taskDescription}>
              Install the app from the store and submit for review
            </Text>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={openAppStore}>
              <Text style={styles.startButtonText}>Install Now</Text>
            </TouchableOpacity>
            
            {taskStarted && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={completeTask}
                disabled={loading}>
                <Text style={styles.completeButtonText}>
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'Manual Task':
        return (
          <View style={styles.taskContent}>
            <Text style={styles.taskDescription}>
              {task.instructions}
            </Text>
            
            <View style={styles.submissionContainer}>
              <Text style={styles.label}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter any additional information..."
                value={submissionText}
                onChangeText={setSubmissionText}
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>📷 Upload Screenshot</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.completeButton}
              onPress={completeTask}
              disabled={loading}>
              <Text style={styles.completeButtonText}>
                {loading ? 'Submitting...' : 'Submit Task'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskType}>{task.type}</Text>
        <Text style={styles.taskReward}>Reward: {task.coins} 🪙</Text>
      </View>

      {renderTaskContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskInfo: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taskType: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 10,
  },
  taskReward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  taskContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    alignItems: 'center',
  },
  videoPlaceholder: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  videoText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  timer: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submissionContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskScreen;
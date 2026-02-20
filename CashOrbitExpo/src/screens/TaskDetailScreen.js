import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {WebView} from 'react-native-webview';
import {taskService} from '../services/taskService';

const TaskDetailScreen = ({route, navigation}) => {
  const {task} = route.params;
  const [loading, setLoading] = useState(false);
  const [watchStarted, setWatchStarted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const watchTimerRef = useRef(null);

  const getTaskIcon = (type) => {
    switch (type) {
      case 'Watch Video': return 'play-circle';
      case 'Install App': return 'download';
      case 'Survey': return 'document-text';
      case 'Quiz': return 'bulb';
      case 'Daily Spin': return 'refresh-circle';
      case 'Referrals': return 'people';
      default: return 'star';
    }
  };

  const startWatchTimer = () => {
    if (task.type === 'Watch Video' && !watchStarted) {
      setWatchStarted(true);
      watchTimerRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime >= task.watchTime) {
            clearInterval(watchTimerRef.current);
            return task.watchTime;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const showVideoPlayer = () => {
    setShowVideo(true);
    startWatchTimer();
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const completeTask = async () => {
    if (task.type === 'Watch Video' && watchTime < task.watchTime) {
      Alert.alert('Wait!', `Please watch the video for at least ${task.watchTime} seconds. Current: ${watchTime}s`);
      return;
    }

    try {
      setLoading(true);
      const result = await taskService.completeTask(task._id || task.id, {
        watchTime: task.type === 'Watch Video' ? watchTime : undefined
      });
      
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
      
      Alert.alert(
        'Task Completed!', 
        `Congratulations! You earned ${result.coinsEarned} coins!`,
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = task.completed >= task.dailyLimit || task.status === 'blocked' || 
    (task.type === 'Watch Video' && watchTime < task.watchTime);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskCard}>
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            style={styles.taskHeader}>
            <View style={styles.taskIconContainer}>
              <Ionicons name={getTaskIcon(task.type)} size={48} color="#fff" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskType}>{task.type}</Text>
              <View style={[styles.difficultyBadge, 
                task.difficulty === 'Easy' ? styles.easyBadge : 
                task.difficulty === 'Medium' ? styles.mediumBadge : styles.hardBadge
              ]}>
                <Text style={styles.difficultyText}>{task.difficulty || 'Easy'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.taskBody}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {task.description || `Complete this ${task.type.toLowerCase()} task to earn coins!`}
            </Text>

            <View style={styles.rewardSection}>
              <Text style={styles.sectionTitle}>Reward</Text>
              <View style={styles.rewardCard}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <Text style={styles.rewardAmount}>{task.coins} Coins</Text>
                <Text style={styles.rewardValue}>≈ PKR {(task.coins * 0.5).toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Task Details</Text>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.detailText}>Daily Limit: {task.dailyLimit} times</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="checkmark-circle" size={20} color="#666" />
                <Text style={styles.detailText}>Completed: {task.completed || 0} times today</Text>
              </View>
              {task.watchTime && (
                <View style={styles.detailItem}>
                  <Ionicons name="play" size={20} color="#666" />
                  <Text style={styles.detailText}>Duration: {task.watchTime} seconds</Text>
                </View>
              )}
            </View>

            {task.type === 'Watch Video' && task.videoUrl && (
              <View style={styles.videoSection}>
                <Text style={styles.sectionTitle}>Video</Text>
                {!showVideo ? (
                  <TouchableOpacity style={styles.videoButton} onPress={showVideoPlayer}>
                    <LinearGradient
                      colors={['#FF6B35', '#FF8E53']}
                      style={styles.videoButtonGradient}>
                      <Ionicons name="play-circle" size={24} color="#fff" />
                      <Text style={styles.videoButtonText}>Watch Video</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.videoContainer}>
                    <WebView
                      source={{uri: getEmbedUrl(task.videoUrl)}}
                      style={styles.webview}
                      allowsFullscreenVideo={true}
                      mediaPlaybackRequiresUserAction={false}
                    />
                  </View>
                )}
                {watchStarted && (
                  <View style={styles.watchProgress}>
                    <Text style={styles.progressText}>
                      Progress: {watchTime}s / {task.watchTime}s
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[styles.progressFill, {
                          width: `${Math.min((watchTime / task.watchTime) * 100, 100)}%`
                        }]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {task.instructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.instructions}>{task.instructions}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.startButton, isDisabled && styles.disabledButton]}
          onPress={completeTask}
          disabled={isDisabled || loading}>
          <LinearGradient
            colors={isDisabled ? ['#ccc', '#999'] : ['#FF6B35', '#FF8E53']}
            style={styles.buttonGradient}>
            <Ionicons 
              name={isDisabled ? "checkmark" : "diamond"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.buttonText}>
              {loading ? 'Completing...' : 
               isDisabled && task.type === 'Watch Video' && watchTime < task.watchTime ? 
               `Watch ${task.watchTime - watchTime}s more` :
               isDisabled ? 'Completed' : 'Complete Task'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  taskHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  taskType: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  easyBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  hardBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  taskBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  rewardSection: {
    marginBottom: 24,
  },
  rewardCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  rewardValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  videoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  watchProgress: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  videoContainer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  webview: {
    flex: 1,
  },
  bottomSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default TaskDetailScreen;
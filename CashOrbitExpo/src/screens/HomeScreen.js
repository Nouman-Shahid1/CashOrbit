import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useAuth} from '../context/AuthContext';
import {taskService} from '../services/taskService';
import {userService} from '../services/userService';
import {streakService} from '../services/streakService';

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();
  const [userStats, setUserStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', difficulty: 'all' });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [streakData, setStreakData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData, streakInfo] = await Promise.all([
        userService.getUserStats(),
        taskService.getAvailableTasks(),
        streakService.getStreakData(),
      ]);
      setUserStats(statsData);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setStreakData(streakInfo);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (type, difficulty) => {
    let filtered = tasks;
    if (type !== 'all') {
      filtered = filtered.filter(task => task.type === type);
    }
    if (difficulty !== 'all') {
      filtered = filtered.filter(task => task.difficulty === difficulty);
    }
    setFilteredTasks(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(newFilters.type, newFilters.difficulty);
  };

  const claimStreakBonus = async () => {
    try {
      await streakService.claimStreakBonus();
      Alert.alert('Success!', 'Streak bonus claimed successfully!');
      loadData();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to claim bonus');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startTask = (task) => {
    navigation.navigate('TaskDetail', {task});
  };

  const TaskCard = ({task}) => {
    const getTaskIcon = (type) => {
      switch (type) {
        case 'Watch Video': return {icon: 'play', gradient: ['#FF6B35', '#FF8E53']};
        case 'Install App': return {icon: 'download', gradient: ['#FF6B35', '#FF8E53']};
        case 'Survey': return {icon: 'document-text', gradient: ['#FF6B35', '#FF8E53']};
        case 'Quiz': return {icon: 'bulb', gradient: ['#FF6B35', '#FF8E53']};
        case 'Daily Spin': return {icon: 'refresh-circle', gradient: ['#FF6B35', '#FF8E53']};
        case 'Referrals': return {icon: 'people', gradient: ['#FF6B35', '#FF8E53']};
        default: return {icon: 'star', gradient: ['#FF6B35', '#FF8E53']};
      }
    };

    const taskIcon = getTaskIcon(task.type);
    const isDisabled = task.completed >= task.dailyLimit || task.status === 'blocked';

    return (
      <TouchableOpacity 
        style={[styles.compactTaskCard, isDisabled && styles.disabledTaskCard]}
        onPress={() => !isDisabled && startTask(task)}
        disabled={isDisabled}>
        
        <LinearGradient
          colors={isDisabled ? ['#f5f5f5', '#e0e0e0'] : taskIcon.gradient}
          style={styles.compactGradientBg}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          
          <View style={styles.compactHeader}>
            <View style={styles.compactIconWrapper}>
              <Ionicons name={taskIcon.icon} size={24} color="#fff" />
            </View>
            <View style={[styles.compactDifficultyChip, 
              task.difficulty === 'Easy' ? styles.easyChip : 
              task.difficulty === 'Medium' ? styles.mediumChip : styles.hardChip
            ]}>
              <Text style={styles.difficultyChipText}>{task.difficulty || 'Easy'}</Text>
            </View>
          </View>
          
          <Text style={styles.compactTaskTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.compactTaskDesc} numberOfLines={2}>{task.description || task.type}</Text>
          
          <View style={styles.compactFooter}>
            <View style={styles.compactCoinBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.compactCoinAmount}>{task.coins}</Text>
            </View>
            
            <View style={[styles.compactActionButton, isDisabled && styles.disabledAction]}>
              <Ionicons 
                name={isDisabled ? "checkmark" : "arrow-forward"} 
                size={14} 
                color={isDisabled ? "#999" : "#fff"} 
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Header with Orange Gradient */}
        <LinearGradient
          colors={['#FF6B35', '#FF8E53']}
          style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back 👋</Text>
              <Text style={styles.subGreeting}>Ready to earn today?</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{userStats.coins || 0} coins</Text>
            <Text style={styles.balanceUSD}>≈ PKR {userStats.pkrValue || 0}</Text>
            
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => navigation.navigate('Withdraw')}>
              <Ionicons name="card" size={16} color="#FF9800" />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Available Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Tasks</Text>
            <TouchableOpacity 
              style={styles.filterIcon}
              onPress={() => setShowFilterModal(true)}>
              <Ionicons name="filter" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tasksGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading tasks...</Text>
              </View>
            ) : filteredTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks match filters</Text>
                <Text style={styles.emptySubtext}>Try changing your filter settings!</Text>
              </View>
            ) : (
              filteredTasks.map((task, index) => (
                <TaskCard key={task._id || index} task={task} />
              ))
            )}
          </View>
        </View>

        {/* Daily Streak Section */}
        <View style={styles.streakSection}>
          <LinearGradient
            colors={['#FFF3E0', '#FFE0B2']}
            style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={20} color="#FF6B35" />
              <Text style={styles.streakTitle}>Daily Streak 🔥</Text>
            </View>
            <Text style={styles.streakDays}>{streakData.currentStreak || 0} days in a row!</Text>
            <Text style={styles.streakMilestone}>
              {(streakData.nextMilestone || 30) - (streakData.currentStreak || 0)} days until milestone
            </Text>
            
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                {width: `${((streakData.currentStreak || 0) / (streakData.nextMilestone || 30)) * 100}%`}
              ]} />
            </View>
            
            <TouchableOpacity 
              style={styles.claimButton}
              onPress={claimStreakBonus}>
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.claimText}>Claim Bonus</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Tasks</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.filterSectionTitle}>Task Type</Text>
              <View style={styles.filterOptions}>
                {['all', 'Watch Video', 'Quiz', 'Survey', 'Install App'].map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.filterOption, filters.type === type && styles.activeFilterOption]}
                    onPress={() => handleFilterChange('type', type)}>
                    <Text style={[styles.filterOptionText, filters.type === type && styles.activeFilterOptionText]}>
                      {type === 'all' ? 'All Tasks' : type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              <View style={styles.filterOptions}>
                {['all', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
                  <TouchableOpacity 
                    key={difficulty}
                    style={[styles.filterOption, filters.difficulty === difficulty && styles.activeFilterOption]}
                    onPress={() => handleFilterChange('difficulty', difficulty)}>
                    <Text style={[styles.filterOptionText, filters.difficulty === difficulty && styles.activeFilterOptionText]}>
                      {difficulty === 'all' ? 'All Levels' : difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  balanceUSD: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  withdrawText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  tasksSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskIconContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  taskIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskDifficulty: {
    marginBottom: 10,
  },
  difficultyTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  easyTag: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
  },
  mediumTag: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  hardTag: {
    backgroundColor: '#FCE4EC',
    color: '#E91E63',
  },
  taskFooter: {
    marginBottom: 10,
  },
  taskCoins: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  taskButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  taskButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  streakSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  streakCard: {
    borderRadius: 15,
    padding: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  streakDays: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  streakMilestone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#FFE0B2',
    borderRadius: 3,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  claimButton: {
    backgroundColor: '#FF9800',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  claimText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  loadingContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterOptionText: {
    color: '#fff',
  },
  applyFiltersButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  applyFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newTaskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledTaskCard: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBadgeContainer: {
    alignItems: 'flex-end',
  },
  taskBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  easyBadge: {
    backgroundColor: '#E8F5E8',
  },
  mediumBadge: {
    backgroundColor: '#FFF3E0',
  },
  hardBadge: {
    backgroundColor: '#FFEBEE',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  newTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  newTaskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCoins: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 4,
  },
  taskStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableStatus: {
    backgroundColor: '#E8F5E8',
  },
  completedStatus: {
    backgroundColor: '#F5F5F5',
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableStatusText: {
    color: '#4CAF50',
  },
  completedStatusText: {
    color: '#999',
  },
  modernTaskCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  taskGradientBg: {
    padding: 20,
    minHeight: 140,
  },
  taskTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  taskMetrics: {
    alignItems: 'flex-end',
  },
  remainingBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  difficultyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  mediumChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  hardChip: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  difficultyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  taskContent: {
    marginBottom: 16,
  },
  modernTaskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  modernTaskDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  taskBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginLeft: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabledAction: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  compactTaskCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  compactGradientBg: {
    padding: 16,
    minHeight: 160,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  compactIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  compactDifficultyChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compactTaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  compactTaskDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
    marginBottom: 12,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactCoinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  compactCoinAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginLeft: 3,
  },
  compactActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default HomeScreen;
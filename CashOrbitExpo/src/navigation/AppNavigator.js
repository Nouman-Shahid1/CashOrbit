import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../context/AuthContext';
import {Ionicons} from '@expo/vector-icons';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import DepositSubmissionScreen from '../screens/DepositSubmissionScreen';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import WalletScreen from '../screens/WalletScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralScreen from '../screens/ReferralScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TaskHistoryScreen from '../screens/TaskHistoryScreen';
import WithdrawalHistoryScreen from '../screens/WithdrawalHistoryScreen';
import EarningReportScreen from '../screens/EarningReportScreen';
import UpgradePlanScreen from '../screens/UpgradePlanScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminWithdrawals from '../screens/admin/AdminWithdrawals';
import AdminTasks from '../screens/admin/AdminTasks';
import AdminPlanApprovals from '../screens/admin/AdminPlanApprovals';
import UserDetailScreen from '../screens/admin/UserDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabs = () => (
  <Tab.Navigator 
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Withdraw') {
          iconName = focused ? 'cash' : 'cash-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B35',
      tabBarInactiveTintColor: 'gray',
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Withdraw" component={WithdrawScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator 
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        
        if (route.name === 'Dashboard') {
          iconName = focused ? 'analytics' : 'analytics-outline';
        } else if (route.name === 'Users') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Withdrawals') {
          iconName = focused ? 'card' : 'card-outline';
        } else if (route.name === 'Tasks') {
          iconName = focused ? 'list' : 'list-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B35',
      tabBarInactiveTintColor: 'gray',
    })}>
    <Tab.Screen name="Dashboard" component={AdminDashboard} />
    <Tab.Screen name="Users" component={AdminUsers} />
    <Tab.Screen name="Withdrawals" component={AdminWithdrawals} />
    <Tab.Screen name="Tasks" component={AdminTasks} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const {user, loading, isAdmin} = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="OTPLogin" component={LoginScreen} />
          <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
          <Stack.Screen name="DepositSubmission" component={DepositSubmissionScreen} />
        </>
      ) : isAdmin ? (
        <>
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          <Stack.Screen name="PlanApprovals" component={AdminPlanApprovals} />
        </>
      ) : (
        <>
          <Stack.Screen name="UserTabs" component={UserTabs} />
          <Stack.Screen name="Task" component={TaskScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="Referral" component={ReferralScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="TaskHistory" component={TaskHistoryScreen} />
          <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />
          <Stack.Screen name="EarningReport" component={EarningReportScreen} />
          <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
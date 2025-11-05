import { useRouter } from 'expo-router';
import { Edit2, LogOut, RefreshCw, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { adminService } from '../../../services/adminService';
import { initDatabase, itemService } from '../../../services/database';
import Modal from '../../components/Modal';

const Index = () => {
  const router = useRouter();
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    username: 'admin',
    password: '••••••'
  });
  const [editProfile, setEditProfile] = useState({
    name: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for dashboard data
  const [adminStats, setAdminStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeCashiers: 0,
    lowStockItems: 0,
    totalRestocks: 0,
    rejectedItems: 0
  });
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<any[]>([]);
  const [todayPerformance, setTodayPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Ensure database is initialized
      await initDatabase();
      
      // Load dashboard stats
      const stats = await adminService.getDashboardStats();
      setAdminStats(stats);

      // Load user activities
      const activities = await adminService.getUserActivities();
      setUserActivities(activities);

      // Load inventory status
      const items = await itemService.getItems();
      const inventory = items.map((item: any) => ({
        size: item.label,
        stock: item.stock || 0,
        threshold: item.low_stock_threshold || 5,
        status: item.stock === 0 ? 'critical' : 
                item.stock <= (item.low_stock_threshold || 5) ? 'warning' : 'good'
      }));
      setInventoryStatus(inventory);

      // Calculate today's performance
      const performance = [
        { metric: 'Items Sold', value: stats.totalSales.toString(), change: '+0%' },
        { metric: 'Restocks', value: stats.totalRestocks.toString(), change: '+0%' },
        { metric: 'Rejected Items', value: stats.rejectedItems.toString(), change: '+0%' },
        { metric: 'Active Cashiers', value: `${stats.activeCashiers}/${stats.activeCashiers}`, change: '+0' }
      ];
      setTodayPerformance(performance);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleAdminAction = (action: string) => {
    switch (action) {
      case 'users':
        router.push('./users');
        break;
      case 'reports':
        router.push('./reports');
        break;
      case 'configuration':
        router.push('./configuration');
        break;
      default:
        Alert.alert('Admin Action', `${action} clicked`);
    }
  };

  const handleSaveProfile = () => {
    if (editProfile.newPassword && editProfile.newPassword !== editProfile.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Update admin profile
    const updatedProfile = {
      ...adminProfile,
      ...(editProfile.name && { name: editProfile.name }),
      ...(editProfile.username && { username: editProfile.username }),
      ...(editProfile.newPassword && { password: '••••••' })
    };

    setAdminProfile(updatedProfile);
    setShowAdminSettings(false);
    setEditProfile({
      name: '',
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    Alert.alert('Success', 'Profile updated successfully');
  };

  const openAdminSettings = () => {
    setEditProfile({
      name: adminProfile.name,
      username: adminProfile.username,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowAdminSettings(true);
  };

  const getActionColor = (action: string) => {
    return action === 'restock' ? 'text-success' : 'text-secondary';
  };

  const getActionIcon = (action: string) => {
    return action === 'restock' ? '📦' : '💰';
  };

  const getActionBackground = (action: string) => {
    return action === 'restock' ? 'bg-success/20' : 'bg-secondary/20';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-error';
      case 'warning': return 'bg-warning';
      case 'good': return 'bg-success';
      default: return 'bg-neutral-300';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical';
      case 'warning': return 'Low';
      case 'good': return 'Good';
      default: return 'Normal';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center">
        <RefreshCw size={32} color="#3B82F6" className="animate-spin" />
        <Text className="text-primary text-lg mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header with Welcome Message */}
      <View className="bg-primary p-6 pt-12 pb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
            <Text className="text-accent-100 text-sm mt-1">
              Welcome back, {adminProfile.name}! 👋
            </Text>
            <Text className="text-accent-100 text-xs mt-1">
              Monitor sales, inventory, and cashier activities
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity 
              className="bg-white/20 rounded-lg p-2"
              onPress={openAdminSettings}
            >
              <Settings size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white/20 rounded-lg p-2"
              onPress={handleLogout}
            >
              <LogOut size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Business Overview */}
        <View className="mx-4 mt-4">
          <Text className="text-primary text-xl font-bold mb-3">
            Business Overview
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Total Revenue Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Total Revenue</Text>
                  <Text className="text-secondary text-2xl font-bold mt-1">
                    {formatCurrency(adminStats.totalRevenue)}
                  </Text>
                </View>
                <View className="bg-secondary/20 p-2 rounded-lg">
                  <Text className="text-secondary text-lg">💰</Text>
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                Today: {formatCurrency(adminStats.todayRevenue)}
              </Text>
            </View>

            {/* Active Cashiers Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Active Cashiers</Text>
                  <Text className="text-primary text-2xl font-bold mt-1">
                    {adminStats.activeCashiers}
                  </Text>
                </View>
                <View className="bg-primary/20 p-2 rounded-lg">
                  <Text className="text-primary text-lg">👥</Text>
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                {adminStats.activeCashiers > 0 ? 'All systems operational' : 'No active cashiers'}
              </Text>
            </View>

            {/* Low Stock Items Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Low Stock Items</Text>
                  <Text className="text-warning text-2xl font-bold mt-1">
                    {adminStats.lowStockItems}
                  </Text>
                </View>
                <View className="bg-warning/20 p-2 rounded-lg">
                  <Text className="text-warning text-lg">⚠️</Text>
                </View>
              </View>
              <Text className="text-warning text-xs font-medium mt-2">
                {adminStats.lowStockItems > 0 ? 'Needs attention' : 'All items stocked'}
              </Text>
            </View>

            {/* Rejected Items Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Rejected Items</Text>
                  <Text className="text-error text-2xl font-bold mt-1">
                    {adminStats.rejectedItems}
                  </Text>
                </View>
                <View className="bg-error/20 p-2 rounded-lg">
                  <Text className="text-error text-lg">❌</Text>
                </View>
              </View>
              <Text className="text-error text-xs font-medium mt-2">
                Quality control
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Quick Actions */}
        <View className="mx-4 mt-6">
          <Text className="text-primary text-xl font-bold mb-3">
            Quick Actions
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 mr-2 items-center"
              onPress={() => handleAdminAction('users')}
            >
              <View className="bg-primary/20 p-3 rounded-full mb-2">
                <Text className="text-primary text-xl">👥</Text>
              </View>
              <Text className="text-primary font-semibold text-center">Cashiers</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Manage Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 mx-2 items-center"
              onPress={() => handleAdminAction('reports')}
            >
              <View className="bg-success/20 p-3 rounded-full mb-2">
                <Text className="text-success text-xl">📋</Text>
              </View>
              <Text className="text-success font-semibold text-center">Reports</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Generate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 ml-2 items-center"
              onPress={() => handleAdminAction('configuration')}
            >
              <View className="bg-secondary/20 p-3 rounded-full mb-2">
                <Text className="text-secondary text-xl">⚙️</Text>
              </View>
              <Text className="text-secondary font-semibold text-center">Settings</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Configure
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory Status */}
        <View className="mx-4 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-primary text-xl font-bold">
              Inventory Status
            </Text>
            <Text className="text-neutral-500 text-sm">
              {inventoryStatus.filter(item => item.status !== 'good').length} need attention
            </Text>
          </View>
          
          <View className="bg-white rounded-xl shadow-sm border border-accent-100 overflow-hidden">
            {inventoryStatus.map((item, index) => (
              <View 
                key={item.size}
                className={`flex-row items-center justify-between p-4 ${
                  index !== inventoryStatus.length - 1 ? 'border-b border-accent-100' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-3 ${getStockStatusColor(item.status)}`} />
                  <Text className="text-primary font-medium">{item.size}</Text>
                </View>
                
                <View className="flex-row items-center space-x-4">
                  <Text className="text-neutral-500 text-sm">
                    Stock: {item.stock}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${
                    item.status === 'critical' 
                      ? 'bg-error/20 text-error' 
                      : item.status === 'warning'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                  }`}>
                    <Text className="text-xs font-medium">
                      {getStockStatusText(item.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              className="p-4 border-t border-accent-100 items-center"
              onPress={() => handleAdminAction('reports')}
            >
              <Text className="text-primary font-semibold">View Inventory Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Performance */}
        <View className="mx-4 mt-6">
          <Text className="text-primary text-xl font-bold mb-3">
            Today's Performance
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {todayPerformance.map((metric, index) => (
              <View 
                key={metric.metric}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]"
              >
                <Text className="text-neutral-500 text-sm mb-2">{metric.metric}</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-primary font-bold text-xl">
                    {metric.value}
                  </Text>
                  <Text className={`text-xs font-medium ${
                    metric.change.includes('+') ? 'text-success' : 'text-error'
                  }`}>
                    {metric.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Cashier Activities */}
        <View className="mx-4 mt-6 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-primary text-xl font-bold">
              Recent Activities
            </Text>
            <Text className="text-neutral-500 text-sm">
              Last 24 hours
            </Text>
          </View>
          
          <View className="bg-white rounded-xl shadow-sm border border-accent-100 overflow-hidden">
            {userActivities.length > 0 ? (
              userActivities.map((activity, index) => (
                <View 
                  key={index}
                  className={`flex-row items-center p-4 ${
                    index !== userActivities.length - 1 ? 'border-b border-accent-100' : ''
                  }`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getActionBackground(activity.action)}`}>
                    <Text className={getActionColor(activity.action)}>
                      {getActionIcon(activity.action)}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-primary font-medium">
                      {activity.user}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      {activity.details} • {activity.time}
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className={`font-bold ${getActionColor(activity.action)}`}>
                      {activity.action === 'restock' ? '+' : '-'}{activity.items}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      {activity.amount > 0 ? formatCurrency(activity.amount) : 'items'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="p-8 items-center">
                <Text className="text-neutral-500">No recent activities</Text>
              </View>
            )}
            
            <TouchableOpacity 
              className="p-4 border-t border-accent-100 items-center"
              onPress={() => handleAdminAction('reports')}
            >
              <Text className="text-primary font-semibold">View All Activities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Admin Settings Modal */}
      <Modal
        visible={showAdminSettings}
        onClose={() => setShowAdminSettings(false)}
        title="Admin Settings"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <Text className="text-primary text-lg font-bold mb-4">Profile Settings</Text>
            
            <View className="space-y-4">
              {/* Current Profile Info */}
              <View className="bg-primary/5 rounded-lg p-3 mb-4">
                <Text className="text-primary font-semibold text-sm mb-2">Current Profile</Text>
                <Text className="text-neutral-600">Name: {adminProfile.name}</Text>
                <Text className="text-neutral-600">Username: {adminProfile.username}</Text>
              </View>

              {/* Name Input */}
              <View>
                <Text className="text-neutral-500 text-sm mb-2">Full Name</Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
                  placeholder="Enter your full name"
                  value={editProfile.name}
                  onChangeText={(text) => setEditProfile(prev => ({ ...prev, name: text }))}
                />
              </View>
              
              {/* Username Input */}
              <View>
                <Text className="text-neutral-500 text-sm mb-2">Username</Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
                  placeholder="Enter username"
                  value={editProfile.username}
                  onChangeText={(text) => setEditProfile(prev => ({ ...prev, username: text }))}
                />
              </View>

              {/* Password Change Section */}
              <View className="pt-4 border-t border-accent-100">
                <Text className="text-neutral-500 text-sm mb-3">Change Password</Text>
                
                <View className="space-y-3">
                  <TextInput
                    className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
                    placeholder="Current Password"
                    secureTextEntry
                    value={editProfile.currentPassword}
                    onChangeText={(text) => setEditProfile(prev => ({ ...prev, currentPassword: text }))}
                  />
                  
                  <TextInput
                    className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
                    placeholder="New Password"
                    secureTextEntry
                    value={editProfile.newPassword}
                    onChangeText={(text) => setEditProfile(prev => ({ ...prev, newPassword: text }))}
                  />
                  
                  <TextInput
                    className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
                    placeholder="Confirm New Password"
                    secureTextEntry
                    value={editProfile.confirmPassword}
                    onChangeText={(text) => setEditProfile(prev => ({ ...prev, confirmPassword: text }))}
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-primary rounded-lg py-3 px-4 mt-6 items-center flex-row justify-center"
              onPress={handleSaveProfile}
            >
              <Edit2 size={16} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Index;
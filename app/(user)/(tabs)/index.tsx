// app/(user)/(tabs)/index.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, LogOut, Package, ShoppingCart, TrendingUp, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { activityService, itemService, userService } from '../../../services/database';
import Modal from '../../components/Modal';

interface UserData {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface UserStats {
  todaySold: number;
  todayRevenue: number;
  todayRestock: number;
  totalSold: number;
  totalRevenue: number;
  lastActive: string;
}

interface LowStockItem {
  key: string;
  label: string;
  stock: number;
  lowStockThreshold: number;
}

interface RecentActivity {
  id: number;
  type: 'sale' | 'restock' | 'login' | 'rejected' | 'returned';
  description: string;
  timestamp: string;
  amount?: number;
  items?: string; // Changed to string since we're using join(', ')
}

const { width: screenWidth } = Dimensions.get('window');

const UserIndex = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    todaySold: 0,
    todayRevenue: 0,
    todayRestock: 0,
    totalSold: 0,
    totalRevenue: 0,
    lastActive: 'Never'
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [allActivities, setAllActivities] = useState<RecentActivity[]>([]);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate responsive values
  const cardWidth = (screenWidth - 48) / 2; // 48 = 32px padding + 16px gap
  const isSmallScreen = screenWidth < 375;

  // Parse user data from params (only once on mount)
  useEffect(() => {
    const parseUserData = () => {
      if (params.user) {
        try {
          const userData = JSON.parse(params.user as string);
          return userData;
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Fallback: try to get from individual params
          if (params.userId && params.userName) {
            return {
              id: parseInt(params.userId as string),
              username: params.userUsername as string || params.userId as string,
              name: params.userName as string,
              role: params.userRole as string || 'cashier'
            };
          }
        }
      }
      return null;
    };

    const userData = parseUserData();
    setCurrentUser(userData);
  }, []);

  // Load user stats, low stock items, total stock, and recent activities
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        
        // Load user-specific stats
        const user = await userService.getUserById(currentUser.id);
        if (user) {
          setUserStats({
            todaySold: user.today_sold || 0,
            todayRevenue: user.today_revenue || 0,
            todayRestock: user.today_restock || 0,
            totalSold: user.total_sold || 0,
            totalRevenue: user.total_revenue || 0,
            lastActive: user.last_active || 'Never'
          });
        }

        // Load items data and calculate total stock
        const items = await itemService.getItems();
        const enabledItems = items.filter((item: any) => item.enabled);
        const totalStockCount = enabledItems.reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
        setTotalStock(totalStockCount);

        // Load low stock items
        const lowStock = enabledItems
          .filter((item: any) => (item.stock || 0) <= (item.low_stock_threshold || 5))
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5
          }));
        
        setLowStockItems(lowStock);

        // Load recent activities for current cashier
        await loadRecentActivities();
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Fallback: if no user from params, try to get from database
  useEffect(() => {
    const loadFallbackUser = async () => {
      if (currentUser) return;

      try {
        const users = await userService.getUsers();
        const cashierUser = users.find((user: any) => user.role === 'cashier' && user.status === 'active');
        if (cashierUser) {
          const userData = {
            id: cashierUser.id,
            username: cashierUser.username,
            name: cashierUser.name,
            role: cashierUser.role
          };
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error loading fallback user:', error);
      }
    };

    const timer = setTimeout(() => {
      if (!currentUser) {
        loadFallbackUser();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentUser]);

const loadRecentActivities = async () => {
  if (!currentUser) {
    console.log('No current user found');
    return;
  }

  try {
    console.log('Loading activities for user:', currentUser.id);
    
    // Get real activities from database
    const activities = await activityService.getUserActivities(currentUser.id, 5);
    console.log('Raw activities from database:', activities);
    
    const formattedActivities: RecentActivity[] = activities.map(activity => ({
      id: activity.id,
      type: activity.type as 'sale' | 'restock' | 'login' | 'rejected' | 'returned',
      description: activity.description,
      timestamp: activity.timestamp,
      amount: activity.amount || undefined,
      items: activity.items || undefined
    }));

    console.log('Formatted activities:', formattedActivities);
    setRecentActivities(formattedActivities);
    setAllActivities(formattedActivities);
  } catch (error) {
    console.error('Error loading recent activities:', error);
    // Fallback to empty array
    setRecentActivities([]);
    setAllActivities([]);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (currentUser) {
        // Reload user stats
        const user = await userService.getUserById(currentUser.id);
        if (user) {
          setUserStats({
            todaySold: user.today_sold || 0,
            todayRevenue: user.today_revenue || 0,
            todayRestock: user.today_restock || 0,
            totalSold: user.total_sold || 0,
            totalRevenue: user.total_revenue || 0,
            lastActive: user.last_active || 'Never'
          });
        }

        // Reload items data and calculate total stock
        const items = await itemService.getItems();
        const enabledItems = items.filter((item: any) => item.enabled);
        const totalStockCount = enabledItems.reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
        setTotalStock(totalStockCount);

        // Reload low stock items
        const lowStock = enabledItems
          .filter((item: any) => (item.stock || 0) <= (item.low_stock_threshold || 5))
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5
          }));
        
        setLowStockItems(lowStock);

        // Reload recent activities
        await loadRecentActivities();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'shop':
        router.push('/(user)/(tabs)/shop');
        break;
      case 'restock':
        router.push('/(user)/(tabs)/restock');
        break;
      case 'add-restock':
        router.push('../(restock)/restock_config');
        break;
      case 'analytics':
        router.push('/(user)/(tabs)/analytics');
        break;
      default:
        Alert.alert('Action', `${action} clicked`);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'restock':
        return '📦';
      case 'login':
        return '🔐';
      case 'rejected':
        return '❌';
      case 'returned':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-success';
      case 'restock':
        return 'text-secondary';
      case 'login':
        return 'text-primary';
      case 'rejected':
        return 'text-error';
      case 'returned':
        return 'text-warning';
      default:
        return 'text-neutral-500';
    }
  };

  const getStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'bg-error';
    if (stock <= threshold) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusText = (stock: number, threshold: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  // Get the most critical low stock item (lowest stock percentage)
  const getMostCriticalLowStockItem = () => {
    if (lowStockItems.length === 0) return null;
    
    return lowStockItems.reduce((mostCritical, item) => {
      const currentPercentage = (item.stock / item.lowStockThreshold) * 100;
      const mostCriticalPercentage = (mostCritical.stock / mostCritical.lowStockThreshold) * 100;
      return currentPercentage < mostCriticalPercentage ? item : mostCritical;
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-lg text-gray-700">Loading dashboard...</Text>
        <Text className="text-sm text-gray-500 mt-2">Please wait</Text>
      </View>
    );
  }

  const mostCriticalItem = getMostCriticalLowStockItem();

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Enhanced Header with User Info */}
      <View className="bg-primary px-4 pt-12 pb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <User size={isSmallScreen ? 14 : 16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold" numberOfLines={1}>
                  {currentUser ? `Welcome, ${currentUser.name}` : 'Cashier Dashboard'}
                </Text>
                {currentUser && (
                  <Text className="text-accent-100 text-xs mt-1" numberOfLines={1}>
                    @{currentUser.username} • {currentUser.role}
                  </Text>
                )}
              </View>
            </View>
            <Text className="text-accent-100 text-sm" numberOfLines={1}>
              {currentUser ? 'Ready for today\'s sales!' : 'Welcome back!'}
            </Text>
            <Text className="text-accent-100 text-xs mt-1">
              Last active: {userStats.lastActive}
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-white/20 rounded-lg p-2 ml-2"
            onPress={handleLogout}
          >
            <LogOut size={isSmallScreen ? 18 : 20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Overview */}
        <View className="px-4 mt-4">
          <Text className="text-primary text-lg font-bold mb-3">
            Quick Overview
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Total Stock Card */}
            <View 
              className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Total Stock</Text>
                  <Text className="text-primary text-lg font-bold mt-1">
                    {formatNumber(totalStock)}
                  </Text>
                </View>
                <View className="bg-primary/20 p-1 rounded-lg">
                  <Package size={isSmallScreen ? 16 : 18} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-primary text-xs font-medium mt-1">
                Items in inventory
              </Text>
            </View>

            {/* Low Stock Alert Card */}
            <View 
              className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Low Stock</Text>
                  <Text className="text-warning text-lg font-bold mt-1">
                    {lowStockItems.length}
                  </Text>
                </View>
                <View className="bg-warning/20 p-1 rounded-lg">
                  <Text className="text-warning text-sm">⚠️</Text>
                </View>
              </View>
              <Text className="text-warning text-xs font-medium mt-1" numberOfLines={1}>
                {mostCriticalItem ? mostCriticalItem.label : 'All items stocked'}
              </Text>
            </View>

            {/* Total Sales Card */}
            <View 
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Total Sales</Text>
                  <Text className="text-secondary text-lg font-bold mt-1">
                    {formatNumber(userStats.totalSold)}
                  </Text>
                </View>
                <View className="bg-secondary/20 p-1 rounded-lg">
                  <TrendingUp size={isSmallScreen ? 16 : 18} color="#831843" />
                </View>
              </View>
              <Text className="text-secondary text-xs font-medium mt-1">
                All time sales
              </Text>
            </View>

            {/* Today's Sold Card */}
            <View 
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Today's Sold</Text>
                  <Text className="text-success text-lg font-bold mt-1">
                    {formatNumber(userStats.todaySold)}
                  </Text>
                </View>
                <View className="bg-success/20 p-1 rounded-lg">
                  <ShoppingCart size={isSmallScreen ? 16 : 18} color="#10B981" />
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-1">
                Items sold today
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Quick Actions
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction('shop')}
            >
              <View className="bg-primary/20 p-2 rounded-full mb-2">
                <ShoppingCart size={isSmallScreen ? 20 : 22} color="#3B82F6" />
              </View>
              <Text className="text-primary font-semibold text-center text-sm">Process Sale</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Sell Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction('restock')}
            >
              <View className="bg-secondary/20 p-2 rounded-full mb-2">
                <Package size={isSmallScreen ? 20 : 22} color="#831843" />
              </View>
              <Text className="text-secondary font-semibold text-center text-sm">View Stock</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Check Inventory
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction('add-restock')}
            >
              <View className="bg-success/20 p-2 rounded-full mb-2">
                <Text className="text-success text-lg">➕</Text>
              </View>
              <Text className="text-success font-semibold text-center text-sm">Add Stock</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                New Restock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {recentActivities.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-lg font-bold">
                Recent Activity
              </Text>
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => setShowAllActivitiesModal(true)}
              >
                <Text className="text-primary text-sm font-medium mr-1">
                  View All
                </Text>
                <ChevronRight size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-white rounded-xl shadow-sm border border-accent-100">
              {recentActivities.map((activity, index) => (
                <View 
                  key={activity.id}
                  className={`flex-row items-center p-3 ${
                    index !== recentActivities.length - 1 ? 'border-b border-accent-100' : ''
                  }`}
                >
                  <View className="bg-primary/10 rounded-full p-2 mr-3">
                    <Text className="text-sm">{getActivityIcon(activity.type)}</Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-primary font-medium text-sm">
                      {activity.description}
                    </Text>
                    {activity.amount && (
                      <Text className="text-success text-xs font-medium mt-1">
                        {formatCurrency(activity.amount)}
                      </Text>
                    )}
                    {activity.items && (
                      <Text className="text-neutral-500 text-xs mt-1" numberOfLines={1}>
                        {activity.items}
                      </Text>
                    )}
                  </View>
                  
                  <Text className="text-neutral-400 text-xs">
                    {formatTime(activity.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View className="px-4 mt-6 mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-lg font-bold">
                Low Stock Alerts
              </Text>
              <Text className="text-error text-sm font-medium">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need attention
              </Text>
            </View>
            
            <View className="bg-warning/10 rounded-xl p-4 border border-warning/20">
              {lowStockItems.map((item, index) => (
                <View 
                  key={item.key}
                  className={`flex-row justify-between items-center py-2 ${
                    index !== lowStockItems.length - 1 ? 'border-b border-warning/20' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(item.stock, item.lowStockThreshold)}`} />
                    <Text className="text-primary font-medium text-sm flex-1" numberOfLines={1}>
                      {item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center ml-2">
                    <Text className="text-neutral-500 text-xs mr-2">
                      {item.stock} / {item.lowStockThreshold}
                    </Text>
                    <Text className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.stock === 0 
                        ? 'bg-error/20 text-error' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {getStatusText(item.stock, item.lowStockThreshold)}
                    </Text>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                className="bg-warning rounded-lg py-2 px-4 mt-3 items-center"
                onPress={() => handleQuickAction('add-restock')}
              >
                <Text className="text-white font-semibold text-sm">Restock Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* All Activities Modal */}
      <Modal
        visible={showAllActivitiesModal}
        onClose={() => setShowAllActivitiesModal(false)}
        title="All Activities"
      >
        <View className="p-4">
          {allActivities.map((activity) => (
            <View 
              key={activity.id}
              className="flex-row items-start p-3 border-b border-accent-100"
            >
              <View className="bg-primary/10 rounded-full p-2 mr-3 mt-1">
                <Text className="text-sm">{getActivityIcon(activity.type)}</Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-primary font-medium text-base">
                  {activity.description}
                </Text>
                {activity.amount && (
                  <Text className="text-success text-sm font-medium mt-1">
                    Amount: {formatCurrency(activity.amount)}
                  </Text>
                )}
                {activity.items && (
                  <Text className="text-neutral-500 text-sm mt-1">
                    Items: {activity.items}
                  </Text>
                )}
                <Text className="text-neutral-400 text-xs mt-2">
                  {formatDateTime(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))}
          
          {allActivities.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-neutral-500 text-lg">No activities found</Text>
              <Text className="text-neutral-400 text-sm mt-2">Your activities will appear here</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default UserIndex;
// app/(user)/(tabs)/index.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LogOut, Package, ShoppingCart, TrendingUp, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { itemService, userService } from '../../../services/database';

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
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []); // Empty dependency array - only run once on mount

  // Load user stats and low stock items
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

        // Load low stock items
        const items = await itemService.getItems();
        const lowStock = items
          .filter((item: any) => item.enabled && (item.stock || 0) <= (item.low_stock_threshold || 5))
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5
          }));
        
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]); // Only run when currentUser changes

  // Fallback: if no user from params, try to get from database
  useEffect(() => {
    const loadFallbackUser = async () => {
      if (currentUser) return; // If we already have a user, don't load fallback

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

    // Only try fallback if we don't have a user after a short delay
    const timer = setTimeout(() => {
      if (!currentUser) {
        loadFallbackUser();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentUser]); // Only run when currentUser changes

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

        // Reload low stock items
        const items = await itemService.getItems();
        const lowStock = items
          .filter((item: any) => item.enabled && (item.stock || 0) <= (item.low_stock_threshold || 5))
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5
          }));
        
        setLowStockItems(lowStock);
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-lg text-gray-700">Loading dashboard...</Text>
        <Text className="text-sm text-gray-500 mt-2">Please wait</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Enhanced Header with User Info */}
      <View className="bg-primary p-6 pt-12 pb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <User size={16} color="white" />
              </View>
              <View>
                <Text className="text-white text-2xl font-bold">
                  {currentUser ? `Welcome, ${currentUser.name}` : 'Cashier Dashboard'}
                </Text>
                {currentUser && (
                  <Text className="text-accent-100 text-xs mt-1">
                    @{currentUser.username} • {currentUser.role}
                  </Text>
                )}
              </View>
            </View>
            <Text className="text-accent-100 text-sm">
              {currentUser ? 'Ready for today\'s sales!' : 'Welcome back!'}
            </Text>
            <Text className="text-accent-100 text-xs mt-1">
              Last active: {userStats.lastActive}
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-white/20 rounded-lg p-2"
            onPress={handleLogout}
          >
            <LogOut size={20} color="white" />
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
        {/* Today's Performance Stats */}
        <View className="mx-4 mt-4">
          <Text className="text-primary text-xl font-bold mb-3">
            Today's Performance
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Today's Sales Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Today's Sales</Text>
                  <Text className="text-secondary text-2xl font-bold mt-1">
                    {formatNumber(userStats.todaySold)}
                  </Text>
                </View>
                <View className="bg-secondary/20 p-2 rounded-lg">
                  <ShoppingCart size={20} color="#831843" />
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                {formatCurrency(userStats.todayRevenue)} revenue
              </Text>
            </View>

            {/* Today's Restock Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Today's Restock</Text>
                  <Text className="text-success text-2xl font-bold mt-1">
                    {formatNumber(userStats.todayRestock)}
                  </Text>
                </View>
                <View className="bg-success/20 p-2 rounded-lg">
                  <Package size={20} color="#10B981" />
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                Items added today
              </Text>
            </View>

            {/* Total Sales Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Total Sales</Text>
                  <Text className="text-primary text-2xl font-bold mt-1">
                    {formatNumber(userStats.totalSold)}
                  </Text>
                </View>
                <View className="bg-primary/20 p-2 rounded-lg">
                  <TrendingUp size={20} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-primary text-xs font-medium mt-2">
                All time sales
              </Text>
            </View>

            {/* Total Revenue Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Total Revenue</Text>
                  <Text className="text-success text-2xl font-bold mt-1">
                    {formatCurrency(userStats.totalRevenue)}
                  </Text>
                </View>
                <View className="bg-success/20 p-2 rounded-lg">
                  <Text className="text-success text-lg">💰</Text>
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                Lifetime earnings
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-6">
          <Text className="text-primary text-xl font-bold mb-3">
            Quick Actions
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 mr-2 items-center"
              onPress={() => handleQuickAction('shop')}
            >
              <View className="bg-primary/20 p-3 rounded-full mb-2">
                <ShoppingCart size={24} color="#3B82F6" />
              </View>
              <Text className="text-primary font-semibold text-center">Process Sale</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Sell Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 mx-2 items-center"
              onPress={() => handleQuickAction('restock')}
            >
              <View className="bg-secondary/20 p-3 rounded-full mb-2">
                <Package size={24} color="#831843" />
              </View>
              <Text className="text-secondary font-semibold text-center">View Stock</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Check Inventory
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 ml-2 items-center"
              onPress={() => handleQuickAction('add-restock')}
            >
              <View className="bg-success/20 p-3 rounded-full mb-2">
                <Text className="text-success text-xl">➕</Text>
              </View>
              <Text className="text-success font-semibold text-center">Add Stock</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                New Restock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View className="mx-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-xl font-bold">
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
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(item.stock, item.lowStockThreshold)}`} />
                    <Text className="text-primary font-medium">{item.label}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-500 text-sm mr-3">
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
                <Text className="text-white font-semibold">Restock Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Performance Summary */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-primary text-xl font-bold mb-3">
            Your Performance Summary
          </Text>
          
          <View className="bg-white rounded-xl shadow-sm border border-accent-100 overflow-hidden">
            <View className="flex-row justify-between items-center p-4 border-b border-accent-100">
              <Text className="text-primary font-semibold">Metric</Text>
              <Text className="text-primary font-semibold">Today</Text>
              <Text className="text-primary font-semibold">Total</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-4 border-b border-accent-100">
              <Text className="text-neutral-600">Items Sold</Text>
              <Text className="text-secondary font-bold">{formatNumber(userStats.todaySold)}</Text>
              <Text className="text-primary font-bold">{formatNumber(userStats.totalSold)}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-4 border-b border-accent-100">
              <Text className="text-neutral-600">Revenue</Text>
              <Text className="text-success font-bold">{formatCurrency(userStats.todayRevenue)}</Text>
              <Text className="text-success font-bold">{formatCurrency(userStats.totalRevenue)}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-neutral-600">Restocks</Text>
              <Text className="text-success font-bold">{formatNumber(userStats.todayRestock)}</Text>
              <Text className="text-primary font-bold">-</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserIndex;
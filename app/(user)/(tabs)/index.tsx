import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Sample images - replace with your actual images
const shirtIcon = require('../../../assets/images/size-shirt/medium.png'); // Using one of your existing images
const restockIcon = require('../../../assets/images/size-shirt/large.png'); // Using another existing image


const index = () => {
  const router = useRouter();

  // Sample data for dashboard
  const dashboardStats = {
    totalItems: 102,
    lowStockItems: 3,
    todaysSales: 28,
    needRestock: 2
  };

  // Sample low stock items
  const lowStockItems = [
    { size: 'XXXL', currentStock: 3, threshold: 5, status: 'critical' },
    { size: 'XXL', currentStock: 8, threshold: 10, status: 'warning' },
    { size: 'XL', currentStock: 12, threshold: 15, status: 'warning' }
  ];

  // Sample recent activity
  const recentActivity = [
    { action: 'restock', items: 45, time: '2 hours ago', size: 'Multiple' },
    { action: 'sale', items: 15, time: '4 hours ago', size: 'Medium' },
    { action: 'restock', items: 20, time: 'Yesterday', size: 'Large' },
    { action: 'sale', items: 8, time: 'Yesterday', size: 'Small' }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'shop':
        router.push('/shop');
        break;
      case 'restock':
        router.push('/restock');
        break;
      case 'add-restock':
        router.push('../(restock)/restock_config');
        break;
      default:
        Alert.alert('Action', `${action} clicked`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-error';
      case 'warning': return 'bg-warning';
      default: return 'bg-success';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical';
      case 'warning': return 'Low';
      default: return 'Good';
    }
  };

  const getActivityIcon = (action: string) => {
    return action === 'restock' ? '📦' : '💰';
  };

  const getActivityColor = (action: string) => {
    return action === 'restock' ? 'text-success' : 'text-secondary';
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Inventory Dashboard</Text>
        <Text className="text-accent-100 text-sm mt-1">
          Welcome back! Here's your inventory overview
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Stats Overview */}
        <View className="mx-4 mt-4">
          <Text className="text-primary text-xl font-bold mb-3">
            Quick Overview
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Total Items Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Total Items</Text>
                  <Text className="text-primary text-2xl font-bold mt-1">
                    {dashboardStats.totalItems}
                  </Text>
                </View>
                <View className="bg-primary/20 p-2 rounded-lg">
                  <Text className="text-primary text-lg">👕</Text>
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                +12% from last week
              </Text>
            </View>

            {/* Low Stock Card */}
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Low Stock</Text>
                  <Text className="text-warning text-2xl font-bold mt-1">
                    {dashboardStats.lowStockItems}
                  </Text>
                </View>
                <View className="bg-warning/20 p-2 rounded-lg">
                  <Text className="text-warning text-lg">⚠️</Text>
                </View>
              </View>
              <Text className="text-warning text-xs font-medium mt-2">
                Needs attention
              </Text>
            </View>

            {/* Today's Sales Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Today's Sales</Text>
                  <Text className="text-secondary text-2xl font-bold mt-1">
                    {dashboardStats.todaysSales}
                  </Text>
                </View>
                <View className="bg-secondary/20 p-2 rounded-lg">
                  <Text className="text-secondary text-lg">💰</Text>
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-2">
                Good performance
              </Text>
            </View>

            {/* Need Restock Card */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-500 text-sm">Need Restock</Text>
                  <Text className="text-tertiary text-2xl font-bold mt-1">
                    {dashboardStats.needRestock}
                  </Text>
                </View>
                <View className="bg-tertiary/20 p-2 rounded-lg">
                  <Text className="text-tertiary text-lg">📦</Text>
                </View>
              </View>
              <Text className="text-tertiary text-xs font-medium mt-2">
                Review required
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
                <Text className="text-primary text-xl">🛒</Text>
              </View>
              <Text className="text-primary font-semibold text-center">Shop</Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Process Sales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 flex-1 mx-2 items-center"
              onPress={() => handleQuickAction('restock')}
            >
              <View className="bg-secondary/20 p-3 rounded-full mb-2">
                <Text className="text-secondary text-xl">📊</Text>
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

        {/* Low Stock Alert Section */}
        {dashboardStats.lowStockItems > 0 && (
          <View className="mx-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-xl font-bold">
                Low Stock Alerts
              </Text>
              <Text className="text-error text-sm font-medium">
                {dashboardStats.lowStockItems} items need attention
              </Text>
            </View>
            
            <View className="bg-warning/10 rounded-xl p-4 border border-warning/20">
              {lowStockItems.map((item, index) => (
                <View 
                  key={item.size}
                  className={`flex-row justify-between items-center py-2 ${
                    index !== lowStockItems.length - 1 ? 'border-b border-warning/20' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(item.status)}`} />
                    <Text className="text-primary font-medium">{item.size}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-500 text-sm mr-3">
                      {item.currentStock} / {item.threshold}
                    </Text>
                    <Text className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === 'critical' 
                        ? 'bg-error/20 text-error' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {getStatusText(item.status)}
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

        {/* Recent Activity */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-primary text-xl font-bold mb-3">
            Recent Activity
          </Text>
          
          <View className="bg-white rounded-xl shadow-sm border border-accent-100 overflow-hidden">
            {recentActivity.map((activity, index) => (
              <View 
                key={index}
                className={`flex-row items-center p-4 ${
                  index !== recentActivity.length - 1 ? 'border-b border-accent-100' : ''
                }`}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  activity.action === 'restock' ? 'bg-success/20' : 'bg-secondary/20'
                }`}>
                  <Text className={getActivityColor(activity.action)}>
                    {getActivityIcon(activity.action)}
                  </Text>
                </View>
                
                <View className="flex-1">
                  <Text className="text-primary font-medium">
                    {activity.action === 'restock' ? 'Stock Added' : 'Sale Completed'}
                  </Text>
                  <Text className="text-neutral-500 text-xs">
                    {activity.size} • {activity.time}
                  </Text>
                </View>
                
                <View className={`items-end ${
                  activity.action === 'restock' ? 'text-success' : 'text-secondary'
                }`}>
                  <Text className={`font-bold ${
                    activity.action === 'restock' ? 'text-success' : 'text-secondary'
                  }`}>
                    {activity.action === 'restock' ? '+' : '-'}{activity.items}
                  </Text>
                  <Text className="text-neutral-500 text-xs">items</Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              className="p-4 border-t border-accent-100 items-center"
              onPress={() => handleQuickAction('restock')}
            >
              <Text className="text-primary font-semibold">View All Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default index;
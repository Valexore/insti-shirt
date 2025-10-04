import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// These return numbers (image resource IDs), not strings
const extraSmallImg = require('../../assets/images/size-shirt/extra-small.png');
const smallImg = require('../../assets/images/size-shirt/small.png');
const mediumImg = require('../../assets/images/size-shirt/medium.png');
const largeImg = require('../../assets/images/size-shirt/large.png');
const xlImg = require('../../assets/images/size-shirt/extra-large.png');
const xxlImg = require('../../assets/images/size-shirt/extra-extra-large.png');
const xxxlImg = require('../../assets/images/size-shirt/extra-extra-extra-large.png');

type SizeKey = 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl';

interface StockItem {
  key: SizeKey;
  label: string;
  image: number;
  stock: number;
  lowStockThreshold: number;
}

const Restock = () => {
  // Sample stock data - in real app, this would come from your database/API
  const stockData: StockItem[] = [
    { key: 'xs', label: 'Extra Small', image: extraSmallImg, stock: 15, lowStockThreshold: 5 },
    { key: 'small', label: 'Small', image: smallImg, stock: 20, lowStockThreshold: 5 },
    { key: 'medium', label: 'Medium', image: mediumImg, stock: 25, lowStockThreshold: 5 },
    { key: 'large', label: 'Large', image: largeImg, stock: 18, lowStockThreshold: 5 },
    { key: 'xl', label: 'Extra Large', image: xlImg, stock: 12, lowStockThreshold: 5 },
    { key: 'xxl', label: '2X Large', image: xxlImg, stock: 8, lowStockThreshold: 5 },
    { key: 'xxxl', label: '3X Large', image: xxxlImg, stock: 3, lowStockThreshold: 5 },
  ];

  // Sample numbers for the new summary stats
  const todaysRestocked = 45; // Total items added to restock today
  const todaysSold = 28;      // Total items sold/dropped today
  const totalStock = 101;     // Total stock added by user (cumulative)

  const getStockStatusColor = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return 'text-error';
    if (stock <= lowStockThreshold) return 'text-warning';
    return 'text-success';
  };

  const getStockStatusText = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const getProgressBarColor = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return 'bg-error';
    if (stock <= lowStockThreshold) return 'bg-warning';
    return 'bg-success';
  };

  const getStockPercentage = (stock: number, max: number = 30) => {
    return Math.min((stock / max) * 100, 100);
  };

  // Calculate items needing restock from current stock data
  const itemsNeedingRestock = stockData.filter(item => item.stock <= item.lowStockThreshold).length;

  const handleAddRestock = () => {
    console.log('Navigate to add restock screen');
    // Navigation logic would go here
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-4 pt-6">
        <Text className="text-white text-2xl font-bold text-center">Stock Management</Text>
        <Text className="text-accent-100 text-center mt-1">Daily Stock Overview</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Stock Summary Card */}
        <View className="mx-4 mt-4 bg-white rounded-xl shadow-lg border border-accent-100">
          <View className="p-4 border-b border-accent-100">
            <Text className="text-primary text-xl font-bold text-center">Today's Summary</Text>
          </View>
          
          <View className="p-4">
            {/* Main Stats Row */}
            <View className="flex-row justify-between mb-4">
              {/* Today's Restocked */}
              <View className="items-center flex-1">
                <View className="bg-success/20 p-3 rounded-full mb-2">
                  <Text className="text-success text-lg font-bold">{todaysRestocked}</Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">Today's Restocked</Text>
                <Text className="text-success text-xs font-medium mt-1">+{todaysRestocked} items</Text>
              </View>
              
              {/* Today's Sold */}
              <View className="items-center flex-1">
                <View className="bg-error/20 p-3 rounded-full mb-2">
                  <Text className="text-error text-lg font-bold">{todaysSold}</Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">Today's Sold</Text>
                <Text className="text-error text-xs font-medium mt-1">-{todaysSold} items</Text>
              </View>
              
              {/* Total Stock */}
              <View className="items-center flex-1">
                <View className="bg-primary/20 p-3 rounded-full mb-2">
                  <Text className="text-primary text-lg font-bold">{totalStock}</Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">Total Stock</Text>
                <Text className="text-primary text-xs font-medium mt-1">Overall inventory</Text>
              </View>
            </View>

            {/* Net Change Indicator */}
            <View className="bg-neutral-50 rounded-lg p-3 mt-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-primary font-semibold">Daily Net Change</Text>
                <Text className={`text-sm font-medium ${
                  todaysRestocked > todaysSold ? 'text-success' : 'text-error'
                }`}>
                  {todaysRestocked > todaysSold ? '+' : ''}{todaysRestocked - todaysSold} items
                </Text>
              </View>
              <View className="w-full bg-accent-100 rounded-full h-2">
                <View 
                  className={`h-2 rounded-full ${
                    todaysRestocked > todaysSold ? 'bg-success' : 'bg-error'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(todaysRestocked - todaysSold) / Math.max(todaysRestocked, todaysSold) * 100, 100)}%` 
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-neutral-500 text-xs">More Sales</Text>
                <Text className="text-neutral-500 text-xs">Balanced</Text>
                <Text className="text-neutral-500 text-xs">More Restocks</Text>
              </View>
            </View>

            {/* Restock Alert */}
            {itemsNeedingRestock > 0 && (
              <View className="bg-warning/10 rounded-lg p-3 mt-3 border border-warning/20">
                <View className="flex-row items-center">
                  <Text className="text-warning text-lg mr-2">⚠️</Text>
                  <View className="flex-1">
                    <Text className="text-warning font-semibold">Restock Alert</Text>
                    <Text className="text-warning text-xs">
                      {itemsNeedingRestock} size{itemsNeedingRestock !== 1 ? 's' : ''} need{itemsNeedingRestock !== 1 ? '' : 's'} attention
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Add Restock Button */}
        <TouchableOpacity 
          onPress={handleAddRestock}
          className="mx-4 mt-4 bg-secondary rounded-xl py-4 shadow-lg"
        >
          <Text className="text-white text-lg font-semibold text-center">
            📦 Add Restock
          </Text>
          <Text className="text-accent-100 text-center text-sm mt-1">
            Update inventory levels
          </Text>
        </TouchableOpacity>

        {/* Stock Details Header */}
        <View className="mx-4 mt-6 mb-3">
          <Text className="text-primary text-lg font-bold">Size-wise Stock Details</Text>
          <Text className="text-neutral-500 text-sm">Current inventory levels by size</Text>
        </View>

        {/* Stock Items List */}
        <View className="mx-4 mb-4">
          {stockData.map((item) => (
            <View 
              key={item.key}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
            >
              <View className="flex-row items-center justify-between">
                {/* Size Image and Basic Info */}
                <View className="flex-row items-center flex-1">
                  <View className="w-16 h-16 bg-neutral-50 rounded-lg border border-accent-100 overflow-hidden items-center justify-center">
                    <Image 
                      source={item.image} 
                      className="w-14 h-14"
                      resizeMode="contain" 
                    />
                  </View>
                  
                  <View className="ml-3 flex-1">
                    <Text className="text-primary text-lg font-semibold">
                      {item.label}
                    </Text>
                    <Text className="text-neutral-500 text-sm">
                      Size: {item.key.toUpperCase()}
                    </Text>
                    
                    {/* Stock Status with Icon */}
                    <View className="flex-row items-center mt-1">
                      <View className={`w-2 h-2 rounded-full mr-2 ${
                        item.stock === 0 ? 'bg-error' : 
                        item.stock <= item.lowStockThreshold ? 'bg-warning' : 'bg-success'
                      }`} />
                      <Text className={`text-sm font-medium ${getStockStatusColor(item.stock, item.lowStockThreshold)}`}>
                        {getStockStatusText(item.stock, item.lowStockThreshold)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Stock Count and Progress */}
                
                <View className="items-end">
                  <View className={`p-2 rounded-lg ${
                    item.stock === 0 ? 'bg-error/10' : 
                    item.stock <= item.lowStockThreshold ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    <Text className={`text-lg font-bold ${getStockStatusColor(item.stock, item.lowStockThreshold)}`}>
                      {item.stock}
                    </Text>
                    <Text className="text-neutral-500 text-xs text-center">units</Text>
                  </View>
                </View>
              </View>

              {/* Enhanced Progress Bar */}
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-neutral-500 text-xs">Stock Level</Text>
                  <Text className="text-neutral-500 text-xs">
                    {getStockPercentage(item.stock).toFixed(0)}%
                  </Text>
                </View>
                <View className="w-full bg-accent-100 rounded-full h-3">
                  <View 
                    className={`h-3 rounded-full ${getProgressBarColor(item.stock, item.lowStockThreshold)}`}
                    style={{ 
                      width: `${getStockPercentage(item.stock)}%` 
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-neutral-500 text-xs">0</Text>
                  <Text className="text-warning text-xs">Low: {item.lowStockThreshold}</Text>
                  <Text className="text-neutral-500 text-xs">30</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Restock;
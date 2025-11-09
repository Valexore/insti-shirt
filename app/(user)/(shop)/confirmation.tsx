// app/(shop)/confirmation.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { shopService } from '../../../services/shopService';

// Define the type for quantities
type Quantities = {
  xs: number;
  small: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

// Define the type for item data
type ItemData = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

const Confirmation = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse all data with proper typing
  const orderData = params.orderData ? JSON.parse(params.orderData as string) as {
    quantities: Quantities;
    fullName: string;
    studentId: string;
    orNumber: string;
    college: { name: string };
  } : null;

  const userData = params.user ? JSON.parse(params.user as string) : null;
  const itemData = params.itemData ? JSON.parse(params.itemData as string) as ItemData : null;

  if (!orderData || !itemData) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center p-8">
        <Ionicons name="warning-outline" size={64} color="#991b1b" />
        <Text className="text-error text-xl font-bold mt-4 text-center">
          {!orderData ? 'No order data found' : 'No item data found'}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-primary mt-6 px-6 py-3 rounded-lg"
        >
          <Text className="text-white text-lg font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { quantities, fullName, studentId, orNumber, college } = orderData;

  // Use the actual item price from admin configuration
  const shirtPrice = itemData.price;
  const itemName = itemData.name;
  
  // Now TypeScript knows quantities is of type Quantities
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = totalItems * shirtPrice;

  const sizeLabels = {
    xs: 'XS',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    xl: 'XL',
    xxl: 'XXL',
    xxxl: 'XXXL'
  };

  const handleConfirmOrder = async () => {
    try {
      if (!userData) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      // Process the sale using shopService with item data
      const saleData = {
        quantities: quantities,
        customerInfo: {
          fullName,
          studentId,
          orNumber,
          college: college?.name
        },
        userId: userData.id,
        totalAmount: totalAmount,
        itemId: itemData.id,
        itemName: itemData.name,
        itemPrice: itemData.price
      };

      const result = await shopService.processSale(saleData);
      
      Alert.alert(
        'Order Confirmed!',
        `Successfully processed order for ${totalItems} ${itemName}${totalItems !== 1 ? 's' : ''}. Total: ₱${totalAmount.toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(user)/(tabs)')
          }
        ]
      );
      
    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    }
  };

  const handleEditOrder = () => {
    router.back();
  };

  const handleCancel = () => {
    router.replace('/(user)/(tabs)');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-12">
        <View className="items-center">
          <View className="bg-white rounded-full p-3 mb-3">
            <Ionicons name="checkmark-circle" size={32} color="#166534" />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Order Summary
          </Text>
          <Text className="text-accent-100 text-center mt-1">
            Review your order details before confirming
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Item Information Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-accent-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="cube" size={20} color="#831843" />
            <Text className="text-primary text-lg font-bold ml-2">
              Item Information
            </Text>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">Item Name</Text>
              <Text className="text-neutral-800 font-semibold">{itemName}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">Price per item</Text>
              <Text className="text-neutral-800 font-semibold">₱{shirtPrice.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-accent-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person" size={20} color="#831843" />
            <Text className="text-primary text-lg font-bold ml-2">
              Student Information
            </Text>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">Full Name</Text>
              <Text className="text-neutral-800 font-semibold">{fullName}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">Student ID</Text>
              <Text className="text-neutral-800 font-semibold">{studentId}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">OR Number</Text>
              <Text className="text-neutral-800 font-semibold">{orNumber}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">College</Text>
              <Text className="text-neutral-800 font-semibold text-right">
                {college?.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Details Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-accent-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shirt" size={20} color="#831843" />
            <Text className="text-primary text-lg font-bold ml-2">
              Order Details
            </Text>
          </View>

          {/* Size Quantities */}
          <View className="space-y-3">
            {Object.entries(quantities).map(([size, quantity]) => {
              if (quantity > 0) {
                return (
                  <View key={size} className="flex-row justify-between items-center py-2 border-b border-neutral-100">
                    <Text className="text-neutral-800 font-medium">
                      {sizeLabels[size as keyof typeof sizeLabels]}
                    </Text>
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-neutral-500">x{quantity}</Text>
                      <Text className="text-primary font-semibold">
                        ₱{(quantity * shirtPrice).toLocaleString()} 
                      </Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>

          {/* Total Summary */}
          <View className="mt-4 pt-4 border-t border-neutral-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">Items</Text>
              <Text className="text-neutral-800">{totalItems}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">Price per item</Text>
              <Text className="text-neutral-800">₱{shirtPrice.toLocaleString()}</Text>
            </View>
            
            <View className="flex-row justify-between mt-3 pt-3 border-t border-neutral-200">
              <Text className="text-primary text-lg font-bold">Total Amount</Text>
              <Text className="text-primary text-lg font-bold">
                ₱{totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-3 border-t border-accent-100 bg-white">
        {/* First two buttons in row */}
        <View className="flex-row space-x-4 mb-4">
          <TouchableOpacity 
            onPress={handleEditOrder}
            className="flex-1 bg-white border border-primary rounded-xl py-4 items-center"
          >
            <Text className="text-primary text-lg font-semibold">Edit Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConfirmOrder}
            className="flex-1 bg-success rounded-xl py-4 items-center shadow-sm"
          >
            <Text className="text-white text-lg font-semibold">Confirm Order</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cancel button with proper spacing */}
        <TouchableOpacity 
          onPress={handleCancel}
          className="py-4 items-center border border-neutral-300 rounded-xl"
        >
          <Text className="text-neutral-500 text-lg font-semibold">Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Confirmation;
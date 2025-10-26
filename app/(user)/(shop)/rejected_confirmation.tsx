// app/(shop)/rejected_confirmation.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Quantities = {
  xs: number;
  small: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

const RejectedConfirmation = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [comment, setComment] = useState('');
  
  // Parse the rejected quantities and available stock
  const rejectedQuantities: Quantities = params.rejectedQuantities 
    ? JSON.parse(params.rejectedQuantities as string)
    : {
        xs: 0,
        small: 0,
        medium: 0,
        large: 0,
        xl: 0,
        xxl: 0,
        xxxl: 0
      };

  const availableStock: Quantities = params.availableStock 
    ? JSON.parse(params.availableStock as string)
    : {
        xs: 15,
        small: 20,
        medium: 25,
        large: 18,
        xl: 12,
        xxl: 8,
        xxxl: 5
      };

  const sizeLabels = {
    xs: 'Extra Small',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    xl: 'Extra Large',
    xxl: '2X Large',
    xxxl: '3X Large'
  };

  const totalItems = Object.values(rejectedQuantities).reduce((sum, qty) => sum + qty, 0);

  const handleConfirmRejection = () => {
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please provide a reason for rejecting these items.');
      return;
    }

    // Calculate new stock after rejection
    const newStock: Quantities = {
      xs: availableStock.xs - rejectedQuantities.xs,
      small: availableStock.small - rejectedQuantities.small,
      medium: availableStock.medium - rejectedQuantities.medium,
      large: availableStock.large - rejectedQuantities.large,
      xl: availableStock.xl - rejectedQuantities.xl,
      xxl: availableStock.xxl - rejectedQuantities.xxl,
      xxxl: availableStock.xxxl - rejectedQuantities.xxxl
    };

    // Here you would typically send the rejection data to your backend
    console.log('Rejected items:', rejectedQuantities);
    console.log('New stock after rejection:', newStock);
    console.log('Rejection reason:', comment);
    
    Alert.alert(
      'Rejection Confirmed',
      `Successfully rejected ${totalItems} items. Stock has been updated.`,
      [
        {
          text: 'OK',
          onPress: () => router.replace('../(tabs)')
        }
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-orange-500 p-6 pt-12">
        <View className="items-center">
          <View className="bg-white rounded-full p-3 mb-3">
            <Text className="text-orange-500 text-xl">⚠️</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Confirm Item Rejection
          </Text>
          <Text className="text-orange-100 text-center mt-1">
            Review rejected items before confirmation
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Rejected Items Summary */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-orange-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-orange-500 text-lg font-bold">
              Rejected Items Summary
            </Text>
          </View>

          {/* Rejected Items List */}
          <View className="space-y-3">
            {Object.entries(rejectedQuantities).map(([size, quantity]) => {
              if (quantity > 0) {
                const currentStock = availableStock[size as keyof Quantities];
                const newStock = currentStock - quantity;
                
                return (
                  <View key={size} className="border-b border-neutral-100 pb-3">
                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-neutral-800 font-medium">
                        {sizeLabels[size as keyof typeof sizeLabels]}
                      </Text>
                      <View className="flex-row items-center space-x-4">
                        <Text className="text-orange-500 font-semibold">x{quantity}</Text>
                        <Text className="text-neutral-500 text-sm">
                          to reject
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between text-xs">
                      <Text className="text-neutral-500">Current stock: {currentStock}</Text>
                      <Text className="text-orange-500">New stock: {newStock}</Text>
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
              <Text className="text-neutral-500">Total Items to Reject</Text>
              <Text className="text-orange-500 font-bold">{totalItems}</Text>
            </View>
            
            <View className="flex-row justify-between mt-3 pt-3 border-t border-neutral-200">
              <Text className="text-orange-500 text-lg font-bold">Total Rejected</Text>
              <Text className="text-orange-500 text-lg font-bold">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Comment Section */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-orange-200">
          <Text className="text-orange-500 text-lg font-bold mb-3">
            Rejection Reason
          </Text>
          <Text className="text-neutral-500 text-sm mb-3">
            Please provide details about why these items are being rejected (quality issues, damage, etc.)
          </Text>
          
          <TextInput
            className="bg-neutral-50 border border-orange-200 rounded-lg p-4 text-neutral-800 min-h-[100px]"
            placeholder="Describe the reason for rejection..."
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Impact Warning */}
        <View className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <Text className="text-orange-700 font-semibold mb-2">⚠️ Stock Impact</Text>
          <Text className="text-orange-600 text-sm">
            Confirming will permanently remove {totalItems} item{totalItems !== 1 ? 's' : ''} from available stock due to quality issues or damage.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-accent-100 bg-white">
        <View className="flex-row space-x-4 mb-4">
          <TouchableOpacity 
            onPress={handleCancel}
            className="flex-1 bg-white border border-orange-500 rounded-xl py-4 items-center"
          >
            <Text className="text-orange-500 text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConfirmRejection}
            className="flex-1 bg-orange-500 rounded-xl py-4 items-center shadow-sm"
          >
            <Text className="text-white text-lg font-semibold">Confirm Rejection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RejectedConfirmation;
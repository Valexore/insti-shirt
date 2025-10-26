// app/(shop)/returned_confirmation.tsx
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
import Modal from '../../components/Modal';

type Quantities = {
  xs: number;
  small: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

type SwapItem = {
  fromSize: string;
  toSize: string;
  quantity: number;
};

const ReturnedConfirmation = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [comment, setComment] = useState('');
  const [swapItems, setSwapItems] = useState<SwapItem[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedReturnSize, setSelectedReturnSize] = useState<string>('');
  
  // Parse the returned quantities and available stock
  const returnedQuantities: Quantities = params.returnedQuantities 
    ? JSON.parse(params.returnedQuantities as string)
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

  const totalItems = Object.values(returnedQuantities).reduce((sum, qty) => sum + qty, 0);

  // Get returned sizes that have quantities
  const getReturnedSizes = () => {
    return Object.entries(returnedQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size]) => size);
  };

  // Get available sizes for swapping (excluding the current returned size)
  const getAvailableSwapSizes = (fromSize: string) => {
    return Object.keys(sizeLabels).filter(size => size !== fromSize);
  };

  // Add a new swap item
  const handleAddSwap = (fromSize: string) => {
    const availableSizes = getAvailableSwapSizes(fromSize);
    if (availableSizes.length > 0) {
      const newSwap: SwapItem = {
        fromSize: fromSize,
        toSize: availableSizes[0],
        quantity: 1
      };
      setSwapItems(prev => [...prev, newSwap]);
    }
    setShowSwapModal(false);
  };

  // Update swap quantity
  const updateSwapQuantity = (index: number, change: number) => {
    setSwapItems(prev => {
      const newSwaps = [...prev];
      const returnedQty = returnedQuantities[newSwaps[index].fromSize as keyof Quantities];
      const currentSwapQty = newSwaps[index].quantity;
      const newQuantity = Math.max(1, Math.min(currentSwapQty + change, returnedQty));
      
      newSwaps[index] = {
        ...newSwaps[index],
        quantity: newQuantity
      };
      return newSwaps;
    });
  };

  // Update swap target size
  const updateSwapSize = (index: number, toSize: string) => {
    setSwapItems(prev => {
      const newSwaps = [...prev];
      newSwaps[index] = {
        ...newSwaps[index],
        toSize: toSize
      };
      return newSwaps;
    });
  };

  // Remove a swap item
  const removeSwap = (index: number) => {
    setSwapItems(prev => prev.filter((_, i) => i !== index));
  };

  // Get remaining quantity for a returned size (total returned - swapped quantity)
  const getRemainingQuantity = (size: string) => {
    const returnedQty = returnedQuantities[size as keyof Quantities];
    const swappedQty = swapItems
      .filter(swap => swap.fromSize === size)
      .reduce((sum, swap) => sum + swap.quantity, 0);
    return returnedQty - swappedQty;
  };

  // Calculate new stock after returns and swaps
  const calculateNewStock = () => {
    const newStock = { ...availableStock };
    
    // First, add all returned items back to stock
    Object.entries(returnedQuantities).forEach(([size, quantity]) => {
      newStock[size as keyof Quantities] += quantity;
    });
    
    // Then, apply the swaps (remove from target size, add to source size)
    swapItems.forEach(swap => {
      newStock[swap.toSize as keyof Quantities] -= swap.quantity;
      newStock[swap.fromSize as keyof Quantities] += swap.quantity;
    });
    
    return newStock;
  };

  const handleConfirmReturn = () => {
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please provide details about the return.');
      return;
    }

    // Validate swaps don't exceed available stock
    const newStock = calculateNewStock();
    const invalidSwaps = Object.entries(newStock).filter(([_, stock]) => stock < 0);
    
    if (invalidSwaps.length > 0) {
      const invalidSize = invalidSwaps[0][0];
      Alert.alert(
        'Invalid Swap', 
        `Swapping would result in negative stock for ${sizeLabels[invalidSize as keyof typeof sizeLabels]}. Please adjust your swaps.`
      );
      return;
    }

    // Here you would typically send the return data to your backend
    console.log('Returned items:', returnedQuantities);
    console.log('Swap items:', swapItems);
    console.log('New stock after return and swaps:', newStock);
    console.log('Return reason:', comment);
    
    Alert.alert(
      'Return Processed',
      `Successfully processed ${totalItems} returned items with ${swapItems.length} swap${swapItems.length !== 1 ? 's' : ''}. Stock has been updated.`,
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

  const newStock = calculateNewStock();

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-purple-500 p-6 pt-12">
        <View className="items-center">
          <View className="bg-white rounded-full p-3 mb-3">
            <Text className="text-purple-500 text-xl">🔄</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Process Returned Items
          </Text>
          <Text className="text-purple-100 text-center mt-1">
            Manage returns and size exchanges
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Returned Items Summary */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-purple-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-purple-500 text-lg font-bold">
              Returned Items Summary
            </Text>
            <Text className="text-purple-500 font-semibold">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Returned Items List */}
          <View className="space-y-3">
            {Object.entries(returnedQuantities).map(([size, quantity]) => {
              if (quantity > 0) {
                const currentStock = availableStock[size as keyof Quantities];
                const remainingQty = getRemainingQuantity(size);
                
                return (
                  <View key={size} className="border-b border-neutral-100 pb-3">
                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-neutral-800 font-medium">
                        {sizeLabels[size as keyof typeof sizeLabels]}
                      </Text>
                      <View className="flex-row items-center space-x-4">
                        <Text className="text-purple-500 font-semibold">x{quantity}</Text>
                        <Text className="text-neutral-500 text-sm">
                          returned
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between text-xs mb-2">
                      <Text className="text-neutral-500">Current: {currentStock}</Text>
                      <Text className="text-purple-500">After return: {currentStock + quantity}</Text>
                    </View>
                    
                    {/* Add Swap Button */}
                    {remainingQty > 0 && (
                      <TouchableOpacity 
                        className="bg-purple-100 rounded-lg p-2 flex-row items-center justify-center mt-2"
                        onPress={() => {
                          setSelectedReturnSize(size);
                          setShowSwapModal(true);
                        }}
                      >
                        <Text className="text-purple-600 text-sm font-medium">
                          + Add Size Swap ({remainingQty} available to swap)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>

        {/* Size Swaps Section */}
        {swapItems.length > 0 && (
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-purple-200">
            <Text className="text-purple-500 text-lg font-bold mb-3">
              Size Exchanges ({swapItems.length})
            </Text>
            
            <View className="space-y-3">
              {swapItems.map((swap, index) => {
                const remainingQty = getRemainingQuantity(swap.fromSize) + swap.quantity;
                
                return (
                  <View key={index} className="border border-purple-200 rounded-lg p-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-purple-600 font-semibold">
                        Exchange #{index + 1}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => removeSwap(index)}
                        className="bg-red-100 rounded-full p-1"
                      >
                        <Text className="text-red-500 text-xs">Remove</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-neutral-600">
                        From: {sizeLabels[swap.fromSize as keyof typeof sizeLabels]}
                      </Text>
                      <Text className="text-neutral-600">
                        To: {sizeLabels[swap.toSize as keyof typeof sizeLabels]}
                      </Text>
                    </View>
                    
                    {/* Quantity Stepper */}
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-neutral-500 text-sm">Quantity:</Text>
                      <View className="flex-row items-center space-x-3">
                        <TouchableOpacity 
                          onPress={() => updateSwapQuantity(index, -1)}
                          className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center"
                          disabled={swap.quantity <= 1}
                        >
                          <Text className="text-white text-sm font-bold">-</Text>
                        </TouchableOpacity>
                        
                        <Text className="text-purple-600 font-bold text-lg">
                          {swap.quantity}
                        </Text>
                        
                        <TouchableOpacity 
                          onPress={() => updateSwapQuantity(index, 1)}
                          className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center"
                          disabled={swap.quantity >= remainingQty}
                        >
                          <Text className="text-white text-sm font-bold">+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* Size Selection Dropdown */}
                    <View className="mt-2">
                      <Text className="text-neutral-500 text-sm mb-1">Exchange to:</Text>
                      <View className="border border-purple-200 rounded-lg p-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View className="flex-row space-x-2">
                            {getAvailableSwapSizes(swap.fromSize).map((size) => (
                              <TouchableOpacity
                                key={size}
                                className={`px-3 py-1 rounded-full ${
                                  swap.toSize === size 
                                    ? 'bg-purple-500' 
                                    : 'bg-purple-100'
                                }`}
                                onPress={() => updateSwapSize(index, size)}
                              >
                                <Text className={
                                  swap.toSize === size 
                                    ? 'text-white text-sm' 
                                    : 'text-purple-600 text-sm'
                                }>
                                  {sizeLabels[size as keyof typeof sizeLabels]}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                    
                    {/* Stock Impact */}
                    <View className="mt-2 bg-purple-50 rounded p-2">
                      <Text className="text-purple-600 text-xs">
                        Impact: {swap.quantity} {sizeLabels[swap.fromSize as keyof typeof sizeLabels]} → {swap.quantity} {sizeLabels[swap.toSize as keyof typeof sizeLabels]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Comment Section */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-purple-200">
          <Text className="text-purple-500 text-lg font-bold mb-3">
            Return Details
          </Text>
          <Text className="text-neutral-500 text-sm mb-3">
            Please provide details about why these items are being returned and any exchange preferences.
          </Text>
          
          <TextInput
            className="bg-neutral-50 border border-purple-200 rounded-lg p-4 text-neutral-800 min-h-[100px]"
            placeholder="Describe the reason for return and exchange details..."
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Stock Summary */}
        <View className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <Text className="text-purple-700 font-semibold mb-3">📊 Stock Impact Summary</Text>
          
          <View className="space-y-2">
            {Object.entries(availableStock).map(([size, currentStock]) => {
              const finalStock = newStock[size as keyof Quantities];
              const change = finalStock - currentStock;
              
              if (change !== 0) {
                return (
                  <View key={size} className="flex-row justify-between items-center">
                    <Text className="text-purple-600 text-sm">
                      {sizeLabels[size as keyof typeof sizeLabels]}
                    </Text>
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-neutral-500 text-sm">{currentStock}</Text>
                      <Text className="text-purple-500">→</Text>
                      <Text className={`text-sm font-semibold ${
                        change > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {finalStock} ({change > 0 ? '+' : ''}{change})
                      </Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-accent-100 bg-white">
        <View className="flex-row space-x-4 mb-4">
          <TouchableOpacity 
            onPress={handleCancel}
            className="flex-1 bg-white border border-purple-500 rounded-xl py-4 items-center"
          >
            <Text className="text-purple-500 text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConfirmReturn}
            className="flex-1 bg-purple-500 rounded-xl py-4 items-center shadow-sm"
          >
            <Text className="text-white text-lg font-semibold">
              Process Returns{swapItems.length > 0 ? ` + ${swapItems.length} Swap${swapItems.length !== 1 ? 's' : ''}` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Swap Modal */}
      <Modal
        visible={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title="Add Size Exchange"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <Text className="text-purple-500 text-lg font-bold mb-3">
              Exchange {sizeLabels[selectedReturnSize as keyof typeof sizeLabels]}
            </Text>
            
            <Text className="text-neutral-500 text-sm mb-4">
              Select a size to exchange the returned items for:
            </Text>
            
            <View className="space-y-2">
              {getAvailableSwapSizes(selectedReturnSize).map((size) => (
                <TouchableOpacity
                  key={size}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  onPress={() => handleAddSwap(selectedReturnSize)}
                >
                  <Text className="text-purple-600 font-semibold text-center">
                    {sizeLabels[size as keyof typeof sizeLabels]}
                  </Text>
                  <Text className="text-neutral-500 text-sm text-center mt-1">
                    Current stock: {availableStock[size as keyof Quantities]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReturnedConfirmation;
// app/(shop)/rejected_confirmation.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { shopService } from '../../../services/shopService';
import ConfirmationModal from '../../components/ConfirmationModal';
import Loading from '../../components/Loading';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Parse the rejected quantities and available stock with better error handling
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

  // FIX: Better user data parsing with fallbacks
  const userData = React.useMemo(() => {
    if (params.user) {
      try {
        return JSON.parse(params.user as string);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fallback: try to get from individual params
    if (params.userId || params.userName) {
      return {
        id: parseInt(params.userId as string) || 1,
        username: params.userUsername as string || 'cashier',
        name: params.userName as string || 'Cashier User',
        role: params.userRole as string || 'cashier'
      };
    }
    
    return null;
  }, [params.user, params.userId, params.userName, params.userUsername, params.userRole]);

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

  const handleConfirmRejection = async () => {
    if (!comment.trim()) {
      setModalMessage('Please provide a reason for rejecting these items.');
      setShowErrorModal(true);
      return;
    }

    if (!userData) {
      setModalMessage('User data not found. Please try again.');
      setShowErrorModal(true);
      return;
    }

    if (totalItems === 0) {
      setModalMessage('Please select items to reject.');
      setShowErrorModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Process rejected items using shopService
      const rejectedData = {
        quantities: rejectedQuantities,
        userId: userData.id,
        comment: comment.trim()
      };

      console.log('Processing rejection with data:', rejectedData);
      
      const result = await shopService.processRejected(rejectedData);
      
      setModalMessage(`Successfully rejected ${totalItems} items. Stock has been updated.`);
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('Error processing rejection:', error);
      setModalMessage(`Failed to process rejection: ${error.message || 'Please try again.'}`);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.navigate({
      pathname: '/(user)/(tabs)',
      params: { 
        user: JSON.stringify(userData),
        refresh: Date.now()
      }
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (isProcessing) {
    return (
      <Loading 
        message="Processing rejection..."
        type="pulse"
        fullScreen={true}
      />
    );
  }

  // Show error if no user data
  if (!userData) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center p-8">
        <Text className="text-error text-xl font-bold text-center mb-4">
          User Not Found
        </Text>
        <Text className="text-neutral-500 text-center mb-6">
          Unable to load user information. Please go back and try again.
        </Text>
        <TouchableOpacity 
          onPress={handleCancel}
          className="bg-primary rounded-lg py-3 px-6"
        >
          <Text className="text-white font-semibold text-lg">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
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
            editable={!isProcessing}
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

      {/* Action Buttons - Fixed with safe area padding */}
      <View className="p-4 pb-8 border-t border-accent-100 bg-white">
        <View className="flex-row space-x-4 mb-4">
          <TouchableOpacity 
            onPress={handleCancel}
            disabled={isProcessing}
            className={`flex-1 border rounded-xl py-4 items-center ${
              isProcessing ? 'border-neutral-300' : 'border-orange-500'
            }`}
          >
            <Text className={`text-lg font-semibold ${
              isProcessing ? 'text-neutral-400' : 'text-orange-500'
            }`}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConfirmRejection}
            disabled={!comment.trim() || totalItems === 0 || isProcessing}
            className={`flex-1 rounded-xl py-4 items-center shadow-sm ${
              !comment.trim() || totalItems === 0 || isProcessing 
                ? 'bg-neutral-400' 
                : 'bg-orange-500'
            }`}
          >
            <Text className="text-white text-lg font-semibold">
              Confirm Rejection
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Confirmation Modals */}
      <ConfirmationModal
        visible={showSuccessModal}
        type="success"
        title="Rejection Confirmed"
        message={modalMessage}
        onConfirm={handleSuccessConfirm}
        onClose={handleSuccessConfirm}
        confirmText="OK"
        showConfirmButton={false}
      />

      <ConfirmationModal
        visible={showErrorModal}
        type="error"
        title="Error"
        message={modalMessage}
        onClose={() => setShowErrorModal(false)}
        confirmText="OK"
        showConfirmButton={false}
      />
    </View>
  );
};

export default RejectedConfirmation;
// app/(shop)/reserve_confirmation.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

type CollegeOption = {
  id: string;
  name: string;
  image: any;
};

interface ReservationData {
  quantities: Quantities;
  fullName: string;
  studentId: string;
  contactNumber: string;
  orNumber: string;
  college: CollegeOption;
  reservationDate: string;
  status: string;
}

const ReserveConfirmation = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the reservation data with proper typing
  const reservationData = params.reservationData ? JSON.parse(params.reservationData as string) as ReservationData : null;

  if (!reservationData) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center p-8">
        <Ionicons name="warning-outline" size={64} color="#991b1b" />
        <Text className="text-error text-xl font-bold mt-4 text-center">
          No reservation data found
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

  const { quantities, fullName, studentId, contactNumber, orNumber, college, reservationDate } = reservationData;

  // Calculate total items and amount
  const shirtPrice = 299;
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

  const handleConfirmReservation = () => {
    // Here you would typically send the reservation to your backend
    console.log('Reservation confirmed:', reservationData);
    
    // Show success message and navigate
    Alert.alert(
      'Reservation Confirmed!',
      `Your reservation has been confirmed. Reservation ID: R${Date.now().toString().slice(-6)}`,
      [
        {
          text: 'OK',
          onPress: () => router.replace('../(tabs)')
        }
      ]
    );
  };

  const handleEditReservation = () => {
    router.back();
  };

  const handleCancel = () => {
    router.replace('../(tabs)');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-blue-500 p-6 pt-12">
        <View className="items-center">
          <View className="bg-white rounded-full p-3 mb-3">
            <Ionicons name="time-outline" size={32} color="#1e40af" />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Reservation Summary
          </Text>
          <Text className="text-blue-100 text-center mt-1">
            Review your reservation details before confirming
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Customer Information Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-blue-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-outline" size={20} color="#1e40af" />
            <Text className="text-blue-500 text-lg font-bold ml-2">
              Customer Information
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
              <Text className="text-neutral-500">Contact Number</Text>
              <Text className="text-neutral-800 font-semibold">{contactNumber}</Text>
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

        {/* Reservation Details Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-blue-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shirt-outline" size={20} color="#1e40af" />
            <Text className="text-blue-500 text-lg font-bold ml-2">
              Reservation Details
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
                      <Text className="text-neutral-500">x{quantity}  </Text>
                      <Text className="text-blue-500 font-semibold">
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
              <Text className="text-neutral-500">Subtotal</Text>
              <Text className="text-neutral-800">₱{totalAmount.toLocaleString()}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">Items Reserved</Text>
              <Text className="text-neutral-800">{totalItems}</Text>
            </View>
            
            <View className="flex-row justify-between mt-3 pt-3 border-t border-neutral-200">
              <Text className="text-blue-500 text-lg font-bold">Total Amount</Text>
              <Text className="text-blue-500 text-lg font-bold">
                ₱{totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-accent-100 bg-white">
        {/* First two buttons in row */}
        <View className="flex-row space-x-4 mb-3">
          <TouchableOpacity 
            onPress={handleEditReservation}
            className="flex-1 bg-white border border-blue-500 rounded-xl py-4 items-center"
          >
            <Text className="text-blue-500 text-lg font-semibold">Edit Reservation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleConfirmReservation}
            className="flex-1 bg-blue-500 rounded-xl py-4 items-center shadow-sm"
          >
            <Text className="text-white text-lg font-semibold">Confirm Reservation</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cancel button with proper spacing */}
        <TouchableOpacity 
          onPress={handleCancel}
          className="py-3 items-center border border-neutral-300 rounded-xl"
        >
          <Text className="text-neutral-500 text-lg font-semibold">Cancel Reservation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReserveConfirmation;
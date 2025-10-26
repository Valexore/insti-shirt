// app/(shop)/reserve_information.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Components
import { BackButton } from '../../components/Button';
import CollegeOption from '../../components/CollegeOption';
import InputField from '../../components/InputField';
import Modal from '../../components/Modal';

// Types
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

// Sample college data - replace with your actual images
const collegeOptions: CollegeOption[] = [
  { id: 'coe', name: 'College of Engineering', image: require('../../../assets/images/size-shirt/extra-extra-extra-large.png') },
  { id: 'cas', name: 'College of Arts and Sciences', image: require('../../../assets/images/size-shirt/extra-extra-extra-large.png') },
  { id: 'cob', name: 'College of Business', image: require('../../../assets/images/size-shirt/extra-extra-extra-large.png') },
  { id: 'ccje', name: 'College of Criminal Justice Education', image: require('../../../assets/images/size-shirt/extra-extra-extra-large.png') },
  { id: 'cte', name: 'College of Teacher Education', image: require('../../../assets/images/size-shirt/extra-extra-extra-large.png') },
];

const ReserveInformation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the quantities from params
  const quantities: Quantities = params.quantities 
    ? JSON.parse(params.quantities as string)
    : {
        xs: 0,
        small: 0,
        medium: 0,
        large: 0,
        xl: 0,
        xxl: 0,
        xxxl: 0
      };

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [orNumber, setOrNumber] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the reservation data to pass to confirmation page
      const reservationData = {
        quantities,
        fullName,
        studentId,
        contactNumber,
        orNumber,
        college: selectedCollege,
        reservationDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      console.log('Reservation data:', reservationData);
      
      // Navigate to reservation confirmation page
      router.push({
        pathname: '/reserve_confirmation',
        params: {
          reservationData: JSON.stringify(reservationData)
        }
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to process reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollegeSelect = (college: CollegeOption) => {
    setSelectedCollege(college);
    setShowCollegeModal(false);
  };

  const isFormValid = fullName && studentId && contactNumber && orNumber && selectedCollege;

  // Calculate total items and amount
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = totalItems * 299; // Assuming fixed price of ₱299

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-neutral-50"
    >
      <ScrollView className="flex-1">
        {/* Header with Back Button */}
        <View className="bg-primary p-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <BackButton onPress={() => router.back()}/>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center mr-4">
            Reservation Information
          </Text>
        </View>

        {/* Reservation Summary */}
        <View className="bg-blue-50 mx-4 mt-4 rounded-lg p-4 border border-blue-200">
          <Text className="text-blue-600 font-semibold text-lg mb-2">
            📦 Reservation Summary
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Total Items:</Text>
            <Text className="text-blue-700 font-bold">{totalItems}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Estimated Total:</Text>
            <Text className="text-blue-700 font-bold">₱{totalAmount}</Text>
          </View>
          <Text className="text-blue-600 text-xs mt-2">
            Items will be reserved for 7 days. Please complete your purchase within this period.
          </Text>
        </View>

        {/* Form */}
        <View className="p-4">
          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />

          <InputField
            label="Student ID"
            value={studentId}
            onChangeText={setStudentId}
            placeholder="Enter your student ID"
          />

          <InputField
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter your contact number"
            keyboardType="phone-pad"
          />

          <InputField
            label="OR Number"
            value={orNumber}
            onChangeText={setOrNumber}
            placeholder="Enter OR number"
            keyboardType="numeric"
          />

          {/* College Selection */}
          <View className="mb-6">
            <Text className="text-primary text-lg font-semibold mb-2">
              College
            </Text>
            <TouchableOpacity 
              onPress={() => setShowCollegeModal(true)}
              className="bg-white border border-accent-100 rounded-lg p-4"
            >
              <Text className={`${selectedCollege ? 'text-neutral-800' : 'text-neutral-500'}`}>
                {selectedCollege ? selectedCollege.name : 'Select your college'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={isFormValid && !isSubmitting ? handleSubmit : undefined}
            className={`w-full rounded-xl py-4 items-center ${
              !isFormValid || isSubmitting ? 'bg-neutral-400' : 'bg-blue-500'
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* College Selection Modal */}
      <Modal
        visible={showCollegeModal}
        onClose={() => setShowCollegeModal(false)}
        title="Select College"
      >
        <View className="p-4">
          {collegeOptions.map((college) => (
            <CollegeOption
              key={college.id}
              college={college}
              onSelect={handleCollegeSelect}
              isSelected={selectedCollege?.id === college.id}
            />
          ))}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ReserveInformation;
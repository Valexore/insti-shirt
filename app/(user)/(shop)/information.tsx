// app/(shop)/information.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { shopService } from '../../../services/shopService';

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

type ItemData = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

const Information = () => {
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

  // Parse item data from params
  const itemData: ItemData = params.itemData 
    ? JSON.parse(params.itemData as string)
    : null;

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [orNumber, setOrNumber] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<CollegeOption[]>([]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const colleges = await shopService.getAvailableColleges();
        // Map colleges to the expected format without requiring images
        const formattedColleges = colleges.map(college => ({
          id: college.id,
          name: college.name,
          image: null // No image required
        }));
        setCollegeOptions(formattedColleges);
      } catch (error) {
        console.error('Error loading colleges:', error);
        // Fallback colleges without images
        setCollegeOptions([
          { id: 'coe', name: 'College of Engineering', image: null },
          { id: 'cas', name: 'College of Arts and Sciences', image: null },
          { id: 'cob', name: 'College of Business', image: null },
          { id: 'ccje', name: 'College of Criminal Justice Education', image: null },
          { id: 'cte', name: 'College of Teacher Education', image: null },
        ]);
      }
    };

    loadColleges();
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    // Check if item data is available
    if (!itemData) {
      Alert.alert('Error', 'No item data found. Please go back and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the order data to pass to confirmation page
      const orderData = {
        quantities,
        fullName,
        studentId,
        orNumber,
        college: selectedCollege
      };
      
      console.log('Order data:', orderData);
      console.log('Item data:', itemData);
      
      // Navigate to confirmation page with the order data and item data
      router.push({
        pathname: '/confirmation',
        params: {
          orderData: JSON.stringify(orderData),
          user: params.user, // Pass user data along
          itemData: JSON.stringify(itemData) // Pass item data along
        }
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollegeSelect = (college: CollegeOption) => {
    setSelectedCollege(college);
    setShowCollegeModal(false);
  };

  const isFormValid = fullName && studentId && orNumber && selectedCollege;

  // Calculate total items for display
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

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
            Student Information
          </Text>
        </View>

        {/* Order Summary Banner */}
        {itemData && (
          <View className="bg-accent-50 mx-4 mt-4 p-3 rounded-lg border border-accent-100">
            <Text className="text-primary font-semibold text-center">
              Ordering: {itemData.name} - ₱{itemData.price.toLocaleString()} each
            </Text>
            <Text className="text-neutral-600 text-center mt-1">
              Total Items: {totalItems} | Total: ₱{(totalItems * itemData.price).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="p-4">
          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <InputField
            label="Student ID"
            value={studentId}
            onChangeText={setStudentId}
            placeholder="Enter your student ID"
            autoCapitalize="characters"
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
              !isFormValid || isSubmitting ? 'bg-neutral-400' : 'bg-primary'
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? 'Submitting...' : 'Continue to Confirmation'}
            </Text>
          </TouchableOpacity>

          {/* Warning if no item data */}
          {!itemData && (
            <View className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <Text className="text-error text-center font-semibold">
                Item data missing. Please go back and try again.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* College Selection Modal */}
      <Modal
        visible={showCollegeModal}
        onClose={() => setShowCollegeModal(false)}
        title="Select College"
      >
        <View className="p-4 max-h-80">
          <ScrollView>
            {collegeOptions.map((college) => (
              <CollegeOption
                key={college.id}
                college={college}
                onSelect={handleCollegeSelect}
                isSelected={selectedCollege?.id === college.id}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Information;
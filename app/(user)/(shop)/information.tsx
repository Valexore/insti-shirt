// app/(shop)/information.tsx
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

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [orNumber, setOrNumber] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get colleges from service
  const [collegeOptions, setCollegeOptions] = useState<CollegeOption[]>([]);

React.useEffect(() => {
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
      
      // Navigate to confirmation page with the order data
      router.push({
        pathname: '/confirmation',
        params: {
          orderData: JSON.stringify(orderData),
          user: params.user // Pass user data along
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
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
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

export default Information;
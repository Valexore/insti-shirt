import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// These return numbers (image resource IDs), not strings
const extraSmallImg = require('../../../assets/images/size-shirt/extra-small.png');
const smallImg = require('../../../assets/images/size-shirt/small.png');
const mediumImg = require('../../../assets/images/size-shirt/medium.png');
const largeImg = require('../../../assets/images/size-shirt/large.png');
const xlImg = require('../../../assets/images/size-shirt/extra-large.png');
const xxlImg = require('../../../assets/images/size-shirt/extra-extra-large.png');
const xxxlImg = require('../../../assets/images/size-shirt/extra-extra-extra-large.png');

// Define the type for sizes
type SizeKey = 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl';

interface Quantities {
  xs: number;
  small: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  xxxl: number; 
}

interface SizeItem {
  key: SizeKey;
  label: string;
  image: number; 
}

const Shop = () => {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Quantities>({
    xs: 0,
    small: 0,
    medium: 0,
    large: 0,
    xl: 0,
    xxl: 0,
    xxxl: 0
  });

  // Track which input is currently focused
  const [focusedInput, setFocusedInput] = useState<SizeKey | null>(null);

  // Stock numbers for each size
  const stockNumbers: Quantities = {
    xs: 15,
    small: 20,
    medium: 25,
    large: 18,
    xl: 12,
    xxl: 8,
    xxxl: 5
  };

  const sizes: SizeItem[] = [
    { key: 'xs', label: '{price}', image: extraSmallImg },
    { key: 'small', label: '{price}', image: smallImg },
    { key: 'medium', label: '{price}', image: mediumImg },
    { key: 'large', label: '{price}', image: largeImg },
    { key: 'xl', label: '{price}', image: xlImg },
    { key: 'xxl', label: '{price}', image: xxlImg },
    { key: 'xxxl', label: '{price}', image: xxxlImg }
  ];

  const updateQuantity = (size: SizeKey, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, Math.min(prev[size] + change, stockNumbers[size]))
    }));
  };

  const handleInputChange = (size: SizeKey, text: string) => {
    // Allow empty string for better UX during typing
    if (text === '') {
      setQuantities(prev => ({ ...prev, [size]: 0 }));
      return;
    }

    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setQuantities(prev => ({ ...prev, [size]: 0 }));
      return;
    }

    const newQuantity = parseInt(numericValue, 10);
    
    // Validate against stock limit
    if (newQuantity > stockNumbers[size]) {
      Alert.alert(
        'Quantity Exceeds Stock',
        `Maximum available for ${size.toUpperCase()} is ${stockNumbers[size]}`,
        [{ text: 'OK' }]
      );
      setQuantities(prev => ({ 
        ...prev, 
        [size]: stockNumbers[size] 
      }));
    } else {
      setQuantities(prev => ({ 
        ...prev, 
        [size]: newQuantity 
      }));
    }
  };

  const handleInputBlur = (size: SizeKey) => {
    setFocusedInput(null);
    
    // Ensure quantity is at least 0 when input loses focus
    if (quantities[size] < 0) {
      setQuantities(prev => ({ ...prev, [size]: 0 }));
    }
  };

  const handleInputFocus = (size: SizeKey) => {
    setFocusedInput(size);
  };

  const handleNext = () => {
    console.log('Selected quantities:', quantities);
    // Navigate to Information screen with quantities data
    router.push({
      pathname: '../(shop)/information',
      params: { quantities: JSON.stringify(quantities) }
    });
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">Shirt Size Selection</Text>
        {totalItems > 0 && (
          <Text className="text-accent-100 text-center mt-1">
            {totalItems} item{totalItems !== 1 ? 's' : ''} selected
          </Text>
        )}
      </View>
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-neutral-500 text-lg mb-4 text-center">
          Select shirt quantities by size
        </Text>
        
        {sizes.map((size) => (
          <View 
            key={size.key}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-accent-100"
          >
            <View className="flex-row items-center justify-between">
             
              <View className="w-24 h-24 bg-neutral-50 rounded-lg border border-accent-100 overflow-hidden items-center justify-center">
                <Image 
                  source={size.image} 
                  className="w-20 h-20"
                  resizeMode="contain" 
                />
              </View>
              
              {/* Size Label */}
              <View className="flex-1 ml-4">
                <Text className="text-primary text-lg font-semibold">
                  {size.label}
                </Text>
                <Text className="text-neutral-500 text-sm">
                  Size: {size.key.toUpperCase()}
                </Text>
                {/* Stock Number Display */}
                <Text className={`text-xs mt-1 ${
                  stockNumbers[size.key] === 0 
                    ? 'text-error' 
                    : stockNumbers[size.key] < 5 
                    ? 'text-warning' 
                    : 'text-success'
                }`}>
                  {stockNumbers[size.key] === 0 
                    ? 'Out of Stock' 
                    : `stock: ${stockNumbers[size.key]} `}
                </Text>
              </View>
              
              {/* Stepper Controls with TextInput */}
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity 
                  onPress={() => updateQuantity(size.key, -1)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    quantities[size.key] > 0 
                      ? 'bg-error' 
                      : 'bg-neutral-500'
                  }`}
                  disabled={quantities[size.key] === 0}
                >
                  <Text className="text-white text-lg font-bold">-</Text>
                </TouchableOpacity>
                
                {/* TextInput for direct number entry */}
                <TextInput
                  className={`text-primary text-xl font-bold text-center border rounded-lg py-1 px-2 min-w-12 ${
                    focusedInput === size.key 
                      ? 'border-secondary bg-neutral-50' 
                      : 'border-accent-100 bg-white'
                  }`}
                  value={quantities[size.key].toString()}
                  onChangeText={(text) => handleInputChange(size.key, text)}
                  onBlur={() => handleInputBlur(size.key)}
                  onFocus={() => handleInputFocus(size.key)}
                  keyboardType="numeric"
                  maxLength={3} // Limit to 3 digits (reasonable for stock)
                  selectTextOnFocus
                />
                
                <TouchableOpacity 
                  onPress={() => updateQuantity(size.key, 1)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    quantities[size.key] < stockNumbers[size.key]
                      ? 'bg-success'
                      : 'bg-neutral-500'
                  }`}
                  disabled={quantities[size.key] >= stockNumbers[size.key]}
                >
                  <Text className="text-white text-lg font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Next Button */}
      <View className="p-4 border-t border-accent-100">
        <TouchableOpacity 
          onPress={handleNext}
          className={`rounded-lg py-4 items-center ${
            totalItems > 0 ? 'bg-secondary' : 'bg-neutral-500'
          }`}
          disabled={totalItems === 0}
        >
          <Text className="text-white text-lg font-semibold">
            Next {totalItems > 0 ? `(${totalItems})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Shop;
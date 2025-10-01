import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CollegeOptionProps {
  college: {
    id: string;
    name: string;
    image: any;
  };
  onSelect: (college: any) => void;
  isSelected?: boolean;
}

const CollegeOption: React.FC<CollegeOptionProps> = ({
  college,
  onSelect,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(college)}
      className={`bg-white rounded-lg p-4 mb-3 border ${
        isSelected ? 'border-secondary' : 'border-accent-100'
      } flex-row items-center`}
    >
      <Image 
        source={college.image} 
        className="w-12 h-12 rounded-lg mr-4"
        resizeMode="contain"
      />
      <Text className="text-primary text-lg font-semibold flex-1">
        {college.name}
      </Text>
      {isSelected && (
        <View className="w-3 h-3 bg-secondary rounded-full" />
      )}
    </TouchableOpacity>
  );
};

export default CollegeOption;
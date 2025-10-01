import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  className = '',
  ...props
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-primary text-lg font-semibold mb-2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-white border border-accent-100 rounded-lg p-4 text-neutral-800"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
};

export default InputField;
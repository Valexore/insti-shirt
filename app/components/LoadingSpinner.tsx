import React from 'react';
import {
    Image,
    Text,
    View
} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
  text?: string;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  withText = false,
  text = 'Loading...',
  backgroundColor = 'bg-neutral-50',
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'large':
        return 140;
      default:
        return 100;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const loadingGif = require('../../assets/images/loadingfox.gif');

  return (
    <View className={`flex-1 justify-center items-center ${backgroundColor}`}>
      <View className="items-center">
        <Image
          source={loadingGif}
          style={{
            width: getSize(),
            height: getSize(),
          }}
          resizeMode="contain"
        />
        {withText && (
          <Text className={`text-neutral-500 mt-4 ${getTextSize()}`}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

export default LoadingSpinner;
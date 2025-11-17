import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  type?: 'spinner' | 'dots' | 'pulse';
  backgroundColor?: string;
  textColor?: string;
  fullScreen?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerUser?: any;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'large',
  type = 'spinner',
  backgroundColor = 'bg-neutral-50',
  textColor = 'text-neutral-500',
  fullScreen = true,
  showHeader = false,
  headerTitle = '',
  headerUser = null,
}) => {
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);
  const { width: screenWidth } = Dimensions.get('window');

  // Spinner animation
  React.useEffect(() => {
    if (type === 'spinner') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [type]);

  // Pulse animation
  React.useEffect(() => {
    if (type === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <View className="flex-row space-x-2">
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={{
                  transform: [
                    {
                      scale: pulseValue.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                }}
                className="w-3 h-3 bg-primary rounded-full"
              />
            ))}
          </View>
        );

      case 'pulse':
        return (
          <Animated.View
            style={{
              transform: [{ scale: pulseValue }],
            }}
          >
            <View className="bg-primary/10 rounded-full p-4">
              <Icon name="inventory" size={32} color="#831843" />
            </View>
          </Animated.View>
        );

      case 'spinner':
      default:
        return (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator 
              size={size} 
              color="#831843" 
            />
          </Animated.View>
        );
    }
  };

  const loadingContent = (
    <View className={`${fullScreen ? 'flex-1 justify-center' : 'justify-center'} items-center ${backgroundColor}`}>
      <View className="items-center justify-center p-8">
        {/* Loader */}
        <View className="mb-4">
          {renderLoader()}
        </View>

        {/* Message */}
        <Text className={`text-lg font-medium ${textColor}`}>
          {message}
        </Text>

        {/* Optional subtitle */}
        {type === 'spinner' && (
          <Text className={`text-sm mt-2 ${textColor} opacity-70`}>
            Please wait...
          </Text>
        )}
      </View>
    </View>
  );

  if (fullScreen && showHeader) {
    return (
      <View className="flex-1 bg-neutral-50">
        {/* Header */}
        <View className="bg-primary p-4">
          <Text className="text-white text-xl font-bold text-center">
            {headerTitle}
          </Text>
          {headerUser && (
            <Text className="text-accent-100 text-sm text-center mt-1">
              Welcome, {headerUser.name}
            </Text>
          )}
        </View>
        {loadingContent}
      </View>
    );
  }

  if (fullScreen) {
    return loadingContent;
  }

  return loadingContent;
};

export default Loading;
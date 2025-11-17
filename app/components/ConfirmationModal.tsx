import React from 'react';
import {
    Dimensions,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ConfirmationModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  showConfirmButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = 'OK',
  showConfirmButton = true,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const modalWidth = Math.min(screenWidth - 64, 400);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#166534', // success color
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
        };
      case 'error':
        return {
          icon: 'error',
          iconColor: '#991b1b', // error color
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
        };
      default:
        return {
          icon: 'info',
          iconColor: '#831843', // primary color
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
        };
    }
  };

  const { icon, iconColor, bgColor, borderColor } = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-8">
        <View 
          className={`bg-white rounded-2xl ${borderColor} border-2 p-6 mx-4`}
          style={{ width: modalWidth }}
        >
          {/* Icon Section */}
          <View className="items-center mb-4">
            <View className={`${bgColor} rounded-full p-4 mb-3`}>
              <Icon name={icon} size={48} color={iconColor} />
            </View>
          </View>

          {/* Content Section */}
          <View className="items-center mb-6">
            <Text className="text-primary text-xl font-bold text-center mb-2">
              {title}
            </Text>
            <Text className="text-neutral-500 text-base text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-3">
            {showConfirmButton && onConfirm ? (
              <>
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-neutral-100 rounded-lg py-3 px-4"
                >
                  <Text className="text-neutral-500 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  className={`flex-1 rounded-lg py-3 px-4 ${
                    type === 'success' ? 'bg-success' : 'bg-error'
                  }`}
                >
                  <Text className="text-white font-semibold text-center">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                className={`flex-1 rounded-lg py-3 px-4 ${
                  type === 'success' ? 'bg-success' : 'bg-error'
                }`}
              >
                <Text className="text-white font-semibold text-center">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
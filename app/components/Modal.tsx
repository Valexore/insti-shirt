import { ArrowLeft } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-neutral-50">
        {/* Modal Header */}
        <View className="bg-primary p-4 flex-row items-center">
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} className="mr-4">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          )}
          <Text className="text-white text-xl font-bold flex-1 text-center mr-4">
            {title}
          </Text>
        </View>

        {/* Modal Content */}
        <ScrollView className="flex-1">
          {children}
        </ScrollView>
      </View>
    </RNModal>
  );
};

export default Modal;
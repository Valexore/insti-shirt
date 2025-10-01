import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  containerClassName?: string;
  textClassName?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  withShadow?: boolean;
};

const Button = ({
  children,
  onPress,
  containerClassName,
  textClassName,
  iconLeft,
  iconRight,
  withShadow = false,
}: ButtonProps) => {
  const shadowConfig = {
    // iOS shadow properties
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,

    // Android shadow property
    elevation: 7,
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center p-3 bg-primary rounded-xl ${
        containerClassName || ""
      }`}
      style={withShadow ? shadowConfig : undefined}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-center">
        {iconLeft && <View className="mx-5">{iconLeft}</View>}
        <Text
          className={`font-bold text-center text-white ${textClassName || ""}`}
        >
          {children}
        </Text>
        {iconRight && <View className="ml-2">{iconRight}</View>}
      </View>
    </TouchableOpacity>
  );
};

export default Button;

interface BackButtonProps {
  onPress?: () => void;
}

export const BackButton = ({ onPress }: BackButtonProps) => {
  return (
    <ArrowLeft onPress={onPress} size={24} color="#ffffff" strokeWidth={3} />
  ); // ito icons lang to na arrow left back button
};

export const ForwardButton = ({ color }: any) => {
  return <ArrowRight size={24} color={color} strokeWidth={3} />; // ito icons lang to na arrow right forward button
};

type IconProps = {
  children: React.ReactNode;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export const IconButton = ({ children, onPress, icon }: IconProps) => {
  // button na may icon at text sa baba ito ung ginamit ko sa request,to process,to receive at to rate sa home screen
  return (
    <View className="flex items-center">
      <TouchableOpacity
        onPress={onPress}
        className="items-center p-3 rounded-full shadow-md bg-primary"
      >
        {icon}
      </TouchableOpacity>
      <Text className="mt-1 text-xs text-center">{children}</Text>
    </View>
  );
};

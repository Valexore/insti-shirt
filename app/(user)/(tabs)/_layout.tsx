// app/(user)/(tabs)/_layout.tsx
import { Tabs, useLocalSearchParams } from "expo-router";
import {
  ChartArea,
  House,
  Package,
  ShoppingBasket
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type TabIconProps = {
  title: string;
  color: string;
  icon: React.ReactNode;
  focused: boolean;
};

const TabIcon = ({ title, icon, focused }: TabIconProps) => {
  if (focused) {
    return (
      <View className="bg-primary/10 min-w-[90px] min-h-14 rounded-lg flex-1 justify-center items-center">
        {icon}
        <Text className="text-sm font-medium text-primary">{title}</Text>
      </View>
    );
  }
  return (
    <View className="min-w-[90px] min-h-14 rounded-lg flex-1 justify-center items-center">
      {icon}
      <Text className="text-sm font-medium text-gray-500">{title}</Text>
    </View>
  );
};

const UserTabLayout = () => {
  const params = useLocalSearchParams();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 10,
          paddingHorizontal: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Dashboard"
              color={color}
              icon={<House size={20} color={color} />}
            />
          ),
        }}
        initialParams={params} // Pass params to index
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Shop"
              color={color}
              icon={<ShoppingBasket size={20} color={color} />}
            />
          ),
        }}
        initialParams={params} // Pass params to shop
      />

      <Tabs.Screen
        name="restock"
        options={{
          title: "Restock",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Restock"
              color={color}
              icon={<Package size={20} color={color} />}
            />
          ),
        }}
        initialParams={params} // Pass params to restock
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Analytics"
              color={color}
              icon={<ChartArea size={20} color={color} />}
            />
          ),
        }}
        initialParams={params} // Pass params to analytics
      />
    </Tabs>
  );
};

export default UserTabLayout;
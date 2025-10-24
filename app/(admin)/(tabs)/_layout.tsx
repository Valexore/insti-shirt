import { Tabs } from "expo-router";
import {
    BarChart3,
    House,
    Users,
    Wrench
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
      <View className="bg-[#ffe4e4] min-w-[90px] min-h-14 rounded-lg flex-1 justify-center items-center">
        {icon}
        <Text className="text-sm font-medium text-neutral-800">{title}</Text>
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

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#831843",
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
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Home"
              color={color}
              icon={<House size={20} color={color} />}
            />
          ),
        }}
      />

        <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Users"
              color={color}
              icon={<Users size={20} color={color} />}
            />
          ),
        }}
      />


        <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Reports"
              color={color}
              icon={<BarChart3 size={20} color={color} />}
            />
          ),
        }}
      />
      
        <Tabs.Screen
        name="configuration"
        options={{
          title: "Config",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              title="Config"
              color={color}
              icon={<Wrench size={20} color={color} />}
            />
          ),
        }}
      />

    </Tabs>
  );
};

export default TabLayout;
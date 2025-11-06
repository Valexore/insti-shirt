// app/(user)/_layout.tsx
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

const UserLayout = () => {
  const params = useLocalSearchParams();
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "tabs",
          headerShown: false,
        }}
        initialParams={params} // Pass params to tabs
      />

      <Stack.Screen
        name="(shop)"
        options={{
          title: "Shop",
          headerShown: false,
        }}
        initialParams={params} // Pass params to shop
      />
      
      <Stack.Screen
        name="(restock)"
        options={{
          title: "Restock",
          headerShown: false,
        }}
        initialParams={params} // Pass params to restock
      />
    </Stack>
  );
};

export default UserLayout;
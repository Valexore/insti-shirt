import { Stack } from "expo-router";
import React from "react";

const ShopLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      

        <Stack.Screen
        name="(tabs)"
        options={{
          title: "tabs",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(shop)"
        options={{
          title: "Shop",
          headerShown: false,
        }}
      />
      
        <Stack.Screen
        name="(restock)"
        options={{
          title: "Restock",
          headerShown: false,
        }}
      />




    </Stack>
  );
};

export default ShopLayout;

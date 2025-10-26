import { Stack } from "expo-router";
import React from "react";

const ShopLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="history_restock.tsx"
        options={{
          title: "Restcok History",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="history_reject.tsx"
        options={{
          title: "Reject History",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="history_returned.tsx"
        options={{
          title: "Returned History",
          headerShown: false,
        }}
      />




    </Stack>
  );
};

export default ShopLayout;

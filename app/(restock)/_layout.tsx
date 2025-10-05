import { Stack } from "expo-router";
import React from "react";

const RestockLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="restock_config"
        options={{
          title: "Restock Config",
          headerShown: false,
        }}
      />
      


    </Stack>
  );
};

export default RestockLayout;

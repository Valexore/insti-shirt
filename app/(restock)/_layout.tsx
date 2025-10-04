import { Stack } from "expo-router";
import React from "react";

const RestockLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="informationt"
        options={{
          title: "Information",
          headerShown: false,
        }}
      />
      
        <Stack.Screen
        name="confirmation"
        options={{
          title: "Confirmation",
          headerShown: false,
        }}
      />


    </Stack>
  );
};

export default RestockLayout;

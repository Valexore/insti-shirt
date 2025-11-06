import { Stack } from "expo-router";
import React from "react";

const ShopLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="information"
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

      <Stack.Screen
        name="rejected_confirmation"
        options={{
          title: "Rejected Confirmation",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="returned_confirmation"
        options={{
          title: "Returned Confirmation",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="reserve_information"
        options={{
          title: "Reserve Information",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="reserve_confirmation"
        options={{
          title: "Reserve Confirmation",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ShopLayout;

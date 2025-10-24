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

    </Stack>
  );
};

export default ShopLayout;

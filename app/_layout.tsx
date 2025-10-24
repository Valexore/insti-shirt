import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        className="flex-1 bg-primary"
        edges={["top", "left", "right"]}
      >

        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(user)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

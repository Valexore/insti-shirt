import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Immediately navigate to your custom splash screen
    router.replace('/splash');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }} />
  );
}
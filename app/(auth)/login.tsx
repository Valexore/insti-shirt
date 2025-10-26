import { useRouter } from 'expo-router';
import { Eye, EyeClosed } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = /\S+@\S+\.\S+/;

  const showPass = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const isEmailValid = isValidEmail.test(email);
    const isPassNotEmpty = password.trim().length > 0;
    return isEmailValid && isPassNotEmpty;
  };

  const handleLogin = () => {
    // Simple validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Sample login logic
    if (email === 'admin@example.com' && password === 'admin123') {
      router.replace('../(admin)');
      return;
    }
    
    if (email === 'user@example.com' && password === 'user123') {
      router.replace('../(user)');
      return;
    }

    Alert.alert('Success', 'Logged in successfully!');
    router.replace('../(user)');
  };

  const handleQuickNavigate = (role: 'user' | 'admin') => {
    Alert.alert(
      'Quick Navigation',
      `Navigating to ${role} section`,
      [
        {
          text: 'OK',
          onPress: () => router.replace(`../(${role})`)
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 15}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="items-center justify-start flex-1 pt-10 bg-white">
            {/* Fixed Logo Size - 295x94px scaled down proportionally */}
            <Image 
              source={require('../../assets/images/welcome-logo.png')} 
              style={{ 
                width: 200, // Scaled down from 295px
                height: 64, // Scaled down from 94px (maintaining aspect ratio)
                resizeMode: 'contain'
              }} 
            />
            
            <View className="gap-2 mt-4">
              <Text className="max-w-xs text-center text-neutral-500">
                Welcome bruh! Please login to continue.
              </Text>
            </View>

            {/* Rest of your login form remains the same */}
            <View className="w-full px-5 mt-10">
              {/* Email Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Name</Text>
                <TextInput
                  className={`w-full border rounded-lg px-4 py-3 bg-white ${
                    email.length > 0 && !isValidEmail.test(email) 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Your name kuh!"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {email.length > 0 && !isValidEmail.test(email) && (
                  <Text className="mt-1 text-sm text-red-500">Name</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-2">
                <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                <View className="relative">
                  <TextInput
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white pr-12"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                  />
                  <TouchableOpacity 
                    className="absolute right-3 top-3"
                    onPress={showPass}
                  >
                    {showPassword ? (
                      <EyeClosed size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <Text className="text-sm text-right text-primary mb-6">
                Forgot Password?
              </Text>

              {/* Login Button */}
              <TouchableOpacity
                className={`w-full rounded-lg py-3 ${
                  validateForm() ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                onPress={handleLogin}
                disabled={!validateForm()}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Login
                </Text>
              </TouchableOpacity>

              {/* Quick Navigation Buttons - For development/testing */}
              <View className="mt-8 border-t border-gray-300 pt-6">
                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="flex-1 bg-green-500 rounded-lg py-2"
                    onPress={() => handleQuickNavigate('user')}
                  >
                    <Text className="text-white text-center font-semibold">
                      Go to User
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-purple-500 rounded-lg py-2"
                    onPress={() => handleQuickNavigate('admin')}
                  >
                    <Text className="text-white text-center font-semibold">
                      Go to Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sample Credentials */}
              <View className="mt-6 p-4 bg-gray-100 rounded-lg">
                <Text className="text-gray-700 font-semibold mb-2">Sample Credentials:</Text>
                <Text className="text-gray-600">Admin: admin@example.com / admin123</Text>
                <Text className="text-gray-600">User: user@example.com / user123</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
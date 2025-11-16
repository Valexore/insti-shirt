import { useRouter } from 'expo-router';
import { Eye, EyeClosed, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { initDatabase, resetDatabase, userService } from '../../services/database';
import Modal from '../components/Modal';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset Database Function
  const handleResetDatabase = async () => {
    try {
      Alert.alert(
        'Reset Database',
        'This will delete all data and reset the database. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await resetDatabase();
                Alert.alert('Success', 'Database reset successfully! Please login again.');
                // Clear form
                setUsername('');
                setPassword('');
              } catch (error) {
                Alert.alert('Error', 'Failed to reset database');
                console.error(error);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset database');
      console.error(error);
    }
  };

  // Initialize database on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        showError('Failed to initialize app. Please restart.');
      }
    };

    initializeApp();
  }, []);

  const showPass = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const isUsernameValid = username.trim().length > 0;
    const isPassNotEmpty = password.trim().length > 0;
    return isUsernameValid && isPassNotEmpty;
  };

  // Show error in modal
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleLogin = async () => {
    // Simple validation
    if (!username || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (!isDbInitialized) {
      showError('App is still initializing. Please wait...');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username, password });
      
      const user = await userService.login(username, password);
      
      console.log('Login successful:', user);
      
      // Prepare user data to pass to the next screen
      const userData = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      
      // If login is successful, navigate with user data
      if (user.role === 'admin') {
        router.replace('../(admin)');
      } else {
        // Pass user data to user section with multiple formats for reliability
        router.replace({
          pathname: '../(user)',
          params: { 
            user: JSON.stringify(userData),
            userId: user.id.toString(),
            userName: user.name,
            userUsername: user.username,
            userRole: user.role
          }
        });
      }
      
    } catch (error: unknown) {
      // Handle specific error types with modal
      if (error instanceof Error) {
        if (error.message.includes('no such table')) {
          showError('Database not properly initialized. Please use the "Reset Database" button below.');
        } else if (error.message.includes('Invalid credentials or inactive account')) {
          showError('Invalid username or password. Please check your credentials and make sure your account is active.');
        } else {
          showError(error.message);
        }
      } else {
        showError('Invalid credentials or network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickNavigate = (role: 'user' | 'admin') => {
    // Create mock user data for quick navigation
    const mockUserData = {
      id: role === 'admin' ? 1 : 2,
      username: role === 'admin' ? 'admin' : 'cashier',
      name: role === 'admin' ? 'Admin User' : 'Cashier User',
      role: role
    };

    Alert.alert(
      'Quick Navigation',
      `Navigating to ${role} section`,
      [
        {
          text: 'OK',
          onPress: () => router.replace({
            pathname: `../(${role})`,
            params: { 
              user: JSON.stringify(mockUserData),
              userId: mockUserData.id.toString(),
              userName: mockUserData.name,
              userUsername: mockUserData.username,
              userRole: mockUserData.role
            }
          })
        }
      ]
    );
  };

  // Admin test login handler
  const handleAdminLogin = () => {
    setUsername('admin');
    setPassword('123');
    
    // Auto-login after a short delay to show the credentials
    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  if (!isDbInitialized) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-700">Initializing app...</Text>
        <Text className="text-sm text-gray-500 mt-2">Please wait</Text>
      </View>
    );
  }

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
                Welcome! Please login to continue.
              </Text>
            </View>

            <View className="w-full px-5 mt-10">
              {/* Username Input */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Username</Text>
                <TextInput
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoComplete="username"
                  editable={!isLoading}
                />
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
                    autoComplete="password"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    className="absolute right-3 top-3"
                    onPress={showPass}
                    disabled={isLoading}
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
                  validateForm() && !isLoading ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                onPress={handleLogin}
                disabled={!validateForm() || isLoading}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              {/* Test Login Buttons */}
              <View className="mt-6 border-t border-gray-300 pt-6">
                <Text className="text-gray-700 font-semibold mb-3 text-center">
                  Quick Test Logins
                </Text>
                
                {/* Admin Test Button */}
                <TouchableOpacity
                  className="bg-green-500 rounded-lg py-3 mb-3"
                  onPress={handleAdminLogin}
                  disabled={isLoading}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Login as Admin
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs text-center mb-4">
                  Uses: admin / 123
                </Text>
              </View>

              {/* Quick Navigation Buttons - For development/testing */}
              <View className="mt-6 border-t border-gray-300 pt-6">
                <Text className="text-gray-700 font-semibold mb-3 text-center">
                  Direct Navigation (Dev):
                </Text>
                <View className="flex-row justify-between space-x-2">
                  <TouchableOpacity
                    className="flex-1 bg-purple-500 rounded-lg py-2"
                    onPress={() => handleQuickNavigate('user')}
                    disabled={isLoading}
                  >
                    <Text className="text-white text-center font-semibold text-sm">
                      Go to User
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-orange-500 rounded-lg py-2"
                    onPress={() => handleQuickNavigate('admin')}
                    disabled={isLoading}
                  >
                    <Text className="text-white text-center font-semibold text-sm">
                      Go to Admin
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-500 text-xs text-center mt-2">
                  Bypasses login for testing
                </Text>
              </View>

              {/* Reset Database Button - Added at the bottom */}
              <View className="mt-6 border-t border-gray-300 pt-6">
                <Text className="text-gray-700 font-semibold mb-3 text-center">
                  Database Tools
                </Text>
                <TouchableOpacity
                  className="bg-red-500 rounded-lg py-3 mb-2"
                  onPress={handleResetDatabase}
                  disabled={isLoading}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Reset Database
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs text-center">
                  Use this if you encounter database errors
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Login Error"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <View className="items-center mb-4">
              <View className="bg-error/20 p-3 rounded-full mb-3">
                <X size={32} color="#EF4444" />
              </View>
              <Text className="text-error text-lg font-bold text-center mb-2">
                Login Failed
              </Text>
              <Text className="text-neutral-600 text-center">
                {errorMessage}
              </Text>
            </View>
            
            <TouchableOpacity
              className="bg-primary rounded-lg py-3 px-4 mt-2 items-center"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="text-white font-semibold text-lg">Try Again</Text>
            </TouchableOpacity>

            {/* Add Reset Database option to error modal if it's a database error */}
            {errorMessage.includes('database') && (
              <TouchableOpacity
                className="bg-red-500 rounded-lg py-3 px-4 mt-2 items-center"
                onPress={() => {
                  setShowErrorModal(false);
                  handleResetDatabase();
                }}
              >
                <Text className="text-white font-semibold text-lg">Reset Database</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Login;
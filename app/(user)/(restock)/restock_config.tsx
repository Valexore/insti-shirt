// app/(restock)/restock_config.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { configService } from "../../../services/database";
import { restockService } from "../../../services/restockService";

// Image imports
const extraSmallImg = require("../../../assets/images/size-shirt/extra-small.png");
const smallImg = require("../../../assets/images/size-shirt/small.png");
const mediumImg = require("../../../assets/images/size-shirt/medium.png");
const largeImg = require("../../../assets/images/size-shirt/large.png");
const xlImg = require("../../../assets/images/size-shirt/extra-large.png");
const xxlImg = require("../../../assets/images/size-shirt/extra-extra-large.png");
const xxxlImg = require("../../../assets/images/size-shirt/extra-extra-extra-large.png");

interface StockItem {
  key: string; // Dynamic key
  label: string;
  image: number;
  currentStock: number;
  restockAmount: number;
}

interface UserData {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface RestockFeatures {
  restockEnabled: boolean;
  quickRestockButtons: boolean;
  bulkRestockApply: boolean;
  restockConfirmation: boolean;
}

const RestockConfig = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [customAmount, setCustomAmount] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState<RestockFeatures>({
    restockEnabled: true,
    quickRestockButtons: true,
    bulkRestockApply: true,
    restockConfirmation: true
  });

  // Get screen dimensions
  const { height: screenHeight } = Dimensions.get('window');

  // Parse user data
  const parseUserData = useCallback(() => {
    if (params.user) {
      try {
        const userData = JSON.parse(params.user as string);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [params.user]);

  // Load restock configuration
  const loadRestockFeatures = useCallback(async () => {
    try {
      const config = await configService.getConfiguration();
      console.log('Loaded restock features:', config);
      
      // Set features with defaults if not found in config
      setFeatures({
        restockEnabled: config.restockEnabled !== false,
        quickRestockButtons: config.quickRestockButtons !== false,
        bulkRestockApply: config.bulkRestockApply !== false,
        restockConfirmation: config.restockConfirmation !== false
      });
    } catch (error) {
      console.error('Error loading restock features:', error);
      // Keep default values if error
    }
  }, []);

  useEffect(() => {
    parseUserData();
    loadRestockFeatures();
  }, [parseUserData, loadRestockFeatures]);

  // Load initial stock data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if restock is enabled before loading data
      if (!features.restockEnabled) {
        Alert.alert(
          "Restock Disabled", 
          "The restock module is currently disabled by the administrator."
        );
        return;
      }

      const data = await restockService.getCurrentStock();
      
      const initialData: StockItem[] = data.map((item: any) => ({
        key: item.key,
        label: item.label,
        image: item.image,
        currentStock: item.stock,
        restockAmount: 0
      }));
      
      setStockData(initialData);
    } catch (error: any) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  }, [features.restockEnabled]);

  useEffect(() => {
    if (features.restockEnabled) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, [features.restockEnabled, loadInitialData]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const updateRestockAmount = useCallback((key: string, amount: number) => {
    if (!features.restockEnabled) return;
    
    setStockData(prevData =>
      prevData.map(item =>
        item.key === key
          ? { ...item, restockAmount: Math.max(0, amount) }
          : item
      )
    );
  }, [features.restockEnabled]);

  const handleDirectInput = useCallback((key: string, text: string) => {
    if (!features.restockEnabled) return;
    
    const numericValue = text.replace(/[^0-9]/g, '');
    setTempAmount(numericValue);
  }, [features.restockEnabled]);

  const saveDirectInput = useCallback((key: string) => {
    if (!features.restockEnabled) return;
    
    if (tempAmount === "") {
      setEditingItem(null);
      return;
    }

    const amount = parseInt(tempAmount);
    if (!isNaN(amount) && amount >= 0) {
      updateRestockAmount(key, amount);
    }
    setEditingItem(null);
    setTempAmount("");
  }, [tempAmount, updateRestockAmount, features.restockEnabled]);

  const startEditing = useCallback((key: string, currentAmount: number) => {
    if (!features.restockEnabled) {
      Alert.alert(
        "Restock Disabled", 
        "The restock functionality has been disabled by the administrator."
      );
      return;
    }
    
    setEditingItem(key);
    setTempAmount(currentAmount.toString());
  }, [features.restockEnabled]);

  const applyCustomAmount = useCallback(() => {
    if (!features.restockEnabled) {
      Alert.alert(
        "Restock Disabled", 
        "The restock functionality has been disabled by the administrator."
      );
      return;
    }

    // Check if bulk restock is enabled
    if (!features.bulkRestockApply) {
      Alert.alert(
        "Bulk Restock Disabled", 
        "Bulk restock functionality has been disabled by the administrator."
      );
      return;
    }

    if (!customAmount) return;

    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number");
      return;
    }

    setStockData(prevData =>
      prevData.map(item => ({ ...item, restockAmount: amount }))
    );
    setCustomAmount("");
  }, [customAmount, features.restockEnabled, features.bulkRestockApply]);

  const handleQuickAdd = useCallback((key: string, amount: number) => {
    if (!features.restockEnabled) {
      Alert.alert(
        "Restock Disabled", 
        "The restock functionality has been disabled by the administrator."
      );
      return;
    }

    // Check if quick restock buttons are enabled
    if (!features.quickRestockButtons) {
      Alert.alert(
        "Quick Buttons Disabled", 
        "Quick restock buttons have been disabled by the administrator."
      );
      return;
    }

    updateRestockAmount(key, amount);
  }, [features.restockEnabled, features.quickRestockButtons, updateRestockAmount]);

const handleRestock = useCallback(async () => {
  if (!currentUser) {
    Alert.alert("Error", "User not found");
    return;
  }

  // Declare processRestock function first
  const processRestock = async () => {
    try {
      const totalRestock = stockData.reduce(
        (sum, item) => sum + item.restockAmount,
        0
      );

      if (totalRestock === 0) {
        Alert.alert("No Items", "Please add some items to restock first");
        return;
      }

      // Prepare restock data
      const restockData = stockData
        .filter(item => item.restockAmount > 0)
        .map(item => ({
          key: item.key,
          amount: item.restockAmount
        }));

      // Process restock in database
      const result = await restockService.processRestock(restockData, currentUser.id);

      if (result.success) {
        Alert.alert(
          "Restock Confirmed",
          `Successfully restocked ${result.totalRestocked} items across all sizes!`
        );

        // Navigate back to restock screen with updated data
        router.replace({
          pathname: '/(user)/(tabs)/restock',
          params: { user: JSON.stringify(currentUser) }
        });
      }
    } catch (error: any) {
      console.error('Error processing restock:', error);
      Alert.alert("Error", "Failed to process restock. Please try again.");
    }
  };

  // Double-check if restock is enabled before processing
  try {
    const config = await configService.getConfiguration();
    const enabled = config.restockEnabled !== false;
    
    if (!enabled) {
      Alert.alert(
        "Restock Disabled", 
        "The restock functionality has been disabled by the administrator. Please contact your administrator."
      );
      return;
    }

    // Check if confirmation is required
    if (config.restockConfirmation !== false) {
      const totalRestock = stockData.reduce(
        (sum, item) => sum + item.restockAmount,
        0
      );
      
      Alert.alert(
        "Confirm Restock",
        `Are you sure you want to restock ${totalRestock} items?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Confirm", 
            onPress: processRestock
          }
        ]
      );
    } else {
      await processRestock();
    }
  } catch (error) {
    console.error('Error checking restock status:', error);
  }
}, [currentUser, stockData, router, features.restockConfirmation]);

  const getTotalRestock = useCallback(() => {
    return stockData.reduce((sum, item) => sum + item.restockAmount, 0);
  }, [stockData]);

  // Disabled state component
  const DisabledRestockState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="bg-warning/10 rounded-full p-6 mb-4">
        <Icon name="inventory" size={48} color="#F59E0B" />
      </View>
      <Text className="text-warning text-xl font-bold text-center mb-2">
        Restock Module Disabled
      </Text>
      <Text className="text-neutral-500 text-center mb-6">
        The restock functionality is currently disabled by the administrator.
        Please contact your administrator to enable restocking.
      </Text>
      <TouchableOpacity 
        className="bg-primary rounded-lg py-3 px-6"
        onPress={handleBack}
      >
        <Text className="text-white font-semibold text-lg">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state component
  const EmptyStockState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="bg-primary/10 rounded-full p-6 mb-4">
        <Icon name="inventory" size={48} color="#3B82F6" />
      </View>
      <Text className="text-primary text-xl font-bold text-center mb-2">
        No Items Available
      </Text>
      <Text className="text-neutral-500 text-center mb-6">
        There are no items available for restocking. 
        Please contact the administrator to add items to the system.
      </Text>
      <TouchableOpacity 
        className="bg-primary rounded-lg py-3 px-6"
        onPress={handleBack}
      >
        <Text className="text-white font-semibold text-lg">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-lg text-gray-700">Loading restock data...</Text>
      </SafeAreaView>
    );
  }

  // Show disabled state if restock is not enabled
  if (!features.restockEnabled) {
    return (
<SafeAreaView className="flex-1" edges={['top']}>
  {/* Header with Back Button */}
  <View className="bg-primary p-4">
    <View className="flex-row items-center">
      <TouchableOpacity 
        onPress={handleBack}
        className="mr-3 p-1"
      >
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text className="text-white text-xl font-bold flex-1 text-center">
        Restock Uniforms hala
      </Text>
      <View className="w-8" />
    </View>
    {currentUser && (
      <Text className="text-accent-100 text-sm text-center mt-1">
        Restocking as: {currentUser.name}
      </Text>
    )}
  </View>

  <View className="flex-1 bg-neutral-50">
    <DisabledRestockState />
  </View>
</SafeAreaView>
    );
  }

  // Add empty state check
  if (stockData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        {/* Header with Back Button */}
        <View className="bg-primary p-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={handleBack}
              className="mr-3 p-1"
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold flex-1 text-center">
              Restock Uniforms
            </Text>
            <View className="w-8" />
          </View>
          {currentUser && (
            <Text className="text-accent-100 text-sm text-center mt-1">
              Restocking as: {currentUser.name}
            </Text>
          )}
        </View>

        <EmptyStockState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* Header with Back Button */}
      <View className="bg-primary p-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleBack}
            className="mr-3 p-1"
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center">
            Restock Uniforms
          </Text>
          <View className="w-8" />
        </View>
        {currentUser && (
          <Text className="text-accent-100 text-sm text-center mt-1">
            Restocking as: {currentUser.name}
          </Text>
        )}
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 120, // Increased padding for button space
            flexGrow: 1 
          }}
        >
          {/* Quick Actions Card - Only show if bulk restock is enabled */}
          {features.bulkRestockApply && (
            <View className="mx-4 mt-4 bg-white rounded-xl shadow-lg border border-accent-100">
              <View className="p-4 border-b border-accent-100">
                <Text className="text-primary text-lg font-bold">
                  Quick Actions
                </Text>
              </View>
              
              <View className="p-4">
                {/* Custom Amount Input */}
                <View className="mb-4">
                  <Text className="text-neutral-500 text-sm mb-2">
                    Apply custom amount to all sizes:
                  </Text>
                  <View className="flex-row">
                    <TextInput
                      className="flex-1 bg-neutral-50 border border-accent-100 rounded-lg px-4 py-3 text-primary"
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={customAmount}
                      onChangeText={setCustomAmount}
                    />
                    <TouchableOpacity
                      onPress={applyCustomAmount}
                      className="ml-2 bg-secondary rounded-lg px-4 justify-center"
                    >
                      <Text className="text-white font-semibold">Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total Restock Summary */}
                <View className="bg-primary/10 rounded-lg p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-primary font-semibold">
                      Total to Restock
                    </Text>
                    <View className="bg-primary rounded-full px-3 py-1">
                      <Text className="text-white font-bold text-lg">
                        {getTotalRestock()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-neutral-500 text-xs mt-1">
                    items across all sizes
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Size Containers */}
          <View className="mx-4 mt-6 mb-3">
            <Text className="text-primary text-lg font-bold">
              Size-wise Restocking
            </Text>
            <Text className="text-neutral-500 text-sm">
              Set restock quantities for each size
            </Text>
          </View>

          {/* Size Containers Grid */}
          <View className="mx-4 mb-6">
            {stockData.map((item) => (
              <View
                key={item.key}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
              >
                <View className="flex-row items-center justify-between">
                  {/* Size Image and Basic Info */}
                  <View className="flex-row items-center flex-1">
                    <View className="w-16 h-16 bg-neutral-50 rounded-lg border border-accent-100 overflow-hidden items-center justify-center">
                      <Image
                        source={item.image}
                        className="w-14 h-14"
                        resizeMode="contain"
                      />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-primary text-lg font-semibold">
                        {item.label}
                      </Text>
                      <Text className="text-neutral-500 text-sm">
                        Size: {item.key.toUpperCase()}
                      </Text>
                      <Text className="text-neutral-500 text-sm">
                        Current: {item.currentStock} units
                      </Text>
                    </View>
                  </View>

                  {/* Restock Count Display */}
                  <View className="items-end">
                    <View className="bg-primary/10 rounded-lg p-2">
                      <Text className="text-primary text-lg font-bold text-center">
                        {item.restockAmount}
                      </Text>
                      <Text className="text-neutral-500 text-xs text-center">
                        to add
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Input Stepper with Direct Input */}
                <View className="flex-row items-center justify-between mt-4">
                  <TouchableOpacity
                    onPress={() =>
                      updateRestockAmount(item.key, item.restockAmount - 1)
                    }
                    className={`w-10 h-10 rounded-lg items-center justify-center ${
                      item.restockAmount > 0
                        ? "bg-error/20"
                        : "bg-neutral-100"
                    }`}
                    disabled={item.restockAmount === 0}
                  >
                    <Text
                      className={`text-lg font-bold ${
                        item.restockAmount > 0 ? "text-error" : "text-neutral-400"
                      }`}
                    >
                      -
                    </Text>
                  </TouchableOpacity>

                  {/* Direct Input Field */}
                  <TouchableOpacity
                    onPress={() => startEditing(item.key, item.restockAmount)}
                    className="flex-1 mx-3"
                  >
                    {editingItem === item.key ? (
                      <TextInput
                        className="bg-neutral-50 border-2 border-secondary rounded-lg py-3 text-primary text-xl font-bold text-center"
                        value={tempAmount}
                        onChangeText={(text) => handleDirectInput(item.key, text)}
                        onBlur={() => saveDirectInput(item.key)}
                        onSubmitEditing={() => saveDirectInput(item.key)}
                        keyboardType="numeric"
                        autoFocus
                        selectTextOnFocus
                      />
                    ) : (
                      <View className="bg-neutral-50 border border-accent-100 rounded-lg py-3">
                        <Text className="text-primary text-xl font-bold text-center">
                          {item.restockAmount}
                        </Text>
                      </View>
                    )}
                    <Text className="text-neutral-500 text-xs text-center mt-1">
                      {editingItem === item.key ? "Press enter to save" : "Tap to edit"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      updateRestockAmount(item.key, item.restockAmount + 1)
                    }
                    className="w-10 h-10 bg-success/20 rounded-lg items-center justify-center"
                  >
                    <Text className="text-success text-lg font-bold">+</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Add Buttons - Only show if quick restock buttons are enabled */}
                {features.quickRestockButtons && (
                  <View className="flex-row justify-between mt-3">
                    {[5, 10, 15].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        onPress={() => handleQuickAdd(item.key, item.restockAmount + amount)}
                        className="bg-secondary/20 rounded-lg px-3 py-2 flex-1 mx-1"
                      >
                        <Text className="text-secondary text-sm font-semibold text-center">
                          +{amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Restock Button - Fixed at bottom with proper safe area handling */}
        <View className="bg-white border-t border-accent-100 pb-8 pt-4 px-4">
          <TouchableOpacity
            onPress={handleRestock}
            className={`rounded-lg py-4 items-center ${
              getTotalRestock() > 0 ? "bg-secondary" : "bg-neutral-300"
            }`}
            disabled={getTotalRestock() === 0}
          >
            <Text
              className={`text-lg font-semibold ${
                getTotalRestock() > 0 ? "text-white" : "text-neutral-500"
              }`}
            >
              📦 Confirm Restock ({getTotalRestock()} items)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RestockConfig;
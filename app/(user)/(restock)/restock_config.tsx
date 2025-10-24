// app/(tabs)/restock/restock_config.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Import shirt size images (same as in restock.tsx)
const extraSmallImg = require("../../../assets/images/size-shirt/extra-small.png");
const smallImg = require("../../../assets/images/size-shirt/small.png");
const mediumImg = require("../../../assets/images/size-shirt/medium.png");
const largeImg = require("../../../assets/images/size-shirt/large.png");
const xlImg = require("../../../assets/images/size-shirt/extra-large.png");
const xxlImg = require("../../../assets/images/size-shirt/extra-extra-large.png");
const xxxlImg = require("../../../assets/images/size-shirt/extra-extra-extra-large.png");

type SizeKey = "xs" | "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";

interface StockItem {
  key: SizeKey;
  label: string;
  image: number;
  currentStock: number;
  restockAmount: number;
}

const RestockConfig = () => {
  const router = useRouter();
  
  // Sample initial data with images
  const initialStockData: StockItem[] = [
    { key: "xs", label: "Extra Small", image: extraSmallImg, currentStock: 15, restockAmount: 0 },
    { key: "small", label: "Small", image: smallImg, currentStock: 20, restockAmount: 0 },
    { key: "medium", label: "Medium", image: mediumImg, currentStock: 25, restockAmount: 0 },
    { key: "large", label: "Large", image: largeImg, currentStock: 18, restockAmount: 0 },
    { key: "xl", label: "Extra Large", image: xlImg, currentStock: 12, restockAmount: 0 },
    { key: "xxl", label: "2X Large", image: xxlImg, currentStock: 8, restockAmount: 0 },
    { key: "xxxl", label: "3X Large", image: xxxlImg, currentStock: 3, restockAmount: 0 },
  ];

  const [stockData, setStockData] = useState<StockItem[]>(initialStockData);
  const [customAmount, setCustomAmount] = useState("");
  const [editingItem, setEditingItem] = useState<SizeKey | null>(null);
  const [tempAmount, setTempAmount] = useState("");

  const handleBack = () => {
    router.back();
  };

  const updateRestockAmount = (key: SizeKey, amount: number) => {
    setStockData(prevData =>
      prevData.map(item =>
        item.key === key
          ? { ...item, restockAmount: Math.max(0, amount) }
          : item
      )
    );
  };

  const handleDirectInput = (key: SizeKey, text: string) => {
    // Allow only numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setTempAmount(numericValue);
  };

  const saveDirectInput = (key: SizeKey) => {
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
  };

  const startEditing = (key: SizeKey, currentAmount: number) => {
    setEditingItem(key);
    setTempAmount(currentAmount.toString());
  };

  const applyCustomAmount = () => {
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
  };

  const handleRestock = () => {
    const totalRestock = stockData.reduce(
      (sum, item) => sum + item.restockAmount,
      0
    );

    if (totalRestock === 0) {
      Alert.alert("No Items", "Please add some items to restock first");
      return;
    }

    // Here you would typically send the restock data to your backend
    Alert.alert(
      "Restock Confirmed",
      `Successfully restocked ${totalRestock} items across all sizes!`
    );

    // Reset after restock
    setStockData(initialStockData);
  };

  const getTotalRestock = () => {
    return stockData.reduce((sum, item) => sum + item.restockAmount, 0);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header with Back Button */}
      <View className="bg-primary p-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.replace('../(tabs)/restock')}
            className="mr-3 p-1"
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center">
            Restock Uniforms
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Quick Actions Card */}
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

        {/* Size Containers */}
        <View className="mx-4 mt-6 mb-3">
          <Text className="text-primary text-lg font-bold">
            Size-wise Restocking
          </Text>
          <Text className="text-neutral-500 text-sm">
            Set restock quantities for each size
          </Text>
        </View>

        {/* Size Containers Grid - Updated Design */}
        <View className="mx-4 mb-4">
          {stockData.map((item) => (
            <View
              key={item.key}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
            >
              <View className="flex-row items-center justify-between">
                {/* Size Image and Basic Info - Same as restock.tsx */}
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

              {/* Quick Add Buttons */}
              <View className="flex-row justify-between mt-3">
                {[5, 10, 15].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() =>
                      updateRestockAmount(item.key, item.restockAmount + amount)
                    }
                    className="bg-secondary/20 rounded-lg px-3 py-2 flex-1 mx-1"
                  >
                    <Text className="text-secondary text-sm font-semibold text-center">
                      +{amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Restock Button */}
      <View className="p-4 border-t border-accent-100 bg-white">
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
  );
};

export default RestockConfig;
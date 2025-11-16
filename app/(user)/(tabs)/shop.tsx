// app/(user)/(tabs)/shop.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { configService } from "../../../services/database";
import { shopService } from "../../../services/shopService";

type TabType = "available" | "rejected" | "returned";

interface Quantities {
  [key: string]: number; // Dynamic keys based on items
}

interface SizeItem {
  key: string;
  label: string;
  image: any;
  price: number;
  stock: number;
  image_key: string;
}

interface ShopConfiguration {
  shopEnabled: boolean;
  allowDirectQuantityInput: boolean;
  showStockLevels: boolean;
  lowStockWarnings: boolean;
  reservationEnabled: boolean;
  returnsEnabled: boolean;
}

const Shop = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [configuration, setConfiguration] = useState<ShopConfiguration>({
    shopEnabled: true,
    allowDirectQuantityInput: true,
    showStockLevels: true,
    lowStockWarnings: true,
    reservationEnabled: true,
    returnsEnabled: true
  });

  const [availableStock, setAvailableStock] = useState<Quantities>({});
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantities, setQuantities] = useState<Quantities>({});
  const [rejectedQuantities, setRejectedQuantities] = useState<Quantities>({});
  const [returnedQuantities, setReturnedQuantities] = useState<Quantities>({});

  const [isReservation, setIsReservation] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("available");

  // Parse user data from params
  useEffect(() => {
    const parseUserData = () => {
      if (params.user) {
        try {
          return JSON.parse(params.user as string);
        } catch (error) {
          console.error('Error parsing user data:', error);
          if (params.userId && params.userName) {
            return {
              id: parseInt(params.userId as string),
              username: params.userUsername as string || params.userId as string,
              name: params.userName as string,
              role: params.userRole as string || 'cashier'
            };
          }
        }
      }
      return null;
    };

    const userData = parseUserData();
    setCurrentUser(userData);
  }, [params.user, params.userId, params.userName, params.userUsername, params.userRole]);

  // Load configuration and data
  useEffect(() => {
    const loadConfigurationAndData = async () => {
      try {
        setIsLoading(true);
        
        const config = await configService.getConfiguration();
        setConfiguration(prevConfig => ({
          ...prevConfig,
          ...config
        }));

        if (config.shopEnabled === false) {
          Alert.alert(
            "Shop Disabled",
            "The shop module is currently disabled. Please contact administrator.",
            [{ text: "OK" }]
          );
          return;
        }

        // Load items from database using shopService
        const items = await shopService.getAvailableItems();
        
        // Cast items to include image_key for TypeScript
        const itemsWithImageKey = items.map((item: any) => ({
          ...item,
          image_key: item.key // Use key as image_key since that's what your service returns
        }));
        
        setSizes(itemsWithImageKey);
        
        // Set available stock dynamically
        const stock: Quantities = {};
        
        itemsWithImageKey.forEach((item: SizeItem) => {
          stock[item.key] = item.stock;
        });
        
        setAvailableStock(stock);
        
        // Initialize quantities
        const initialQuantities: Quantities = {};
        const initialRejected: Quantities = {};
        const initialReturned: Quantities = {};
        
        itemsWithImageKey.forEach((item: SizeItem) => {
          initialQuantities[item.key] = 0;
          initialRejected[item.key] = 0;
          initialReturned[item.key] = 0;
        });
        
        setQuantities(initialQuantities);
        setRejectedQuantities(initialRejected);
        setReturnedQuantities(initialReturned);
        
      } catch (error) {
        console.error('Error loading shop data:', error);
        Alert.alert('Error', 'Failed to load shop data');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigurationAndData();
  }, []);

  const getCurrentQuantities = () => {
    switch (activeTab) {
      case "rejected":
        return rejectedQuantities;
      case "returned":
        return returnedQuantities;
      case "available":
      default:
        return quantities;
    }
  };

  const setCurrentQuantities = (newQuantities: Quantities) => {
    switch (activeTab) {
      case "rejected":
        setRejectedQuantities(newQuantities);
        break;
      case "returned":
        setReturnedQuantities(newQuantities);
        break;
      case "available":
      default:
        setQuantities(newQuantities);
        break;
    }
  };

  const updateQuantity = (size: string, change: number) => {
    const currentQuantities = getCurrentQuantities();
    const currentStock = availableStock[size] || 0;

    let newQuantity;

    if (activeTab === "rejected") {
      newQuantity = Math.max(0, Math.min(currentQuantities[size] + change, currentStock));
    } else if (activeTab === "returned") {
      newQuantity = Math.max(0, currentQuantities[size] + change);
    } else {
      newQuantity = Math.max(0, Math.min(currentQuantities[size] + change, currentStock));
    }

    setCurrentQuantities({
      ...currentQuantities,
      [size]: newQuantity,
    });
  };

  const handleInputChange = (size: string, text: string) => {
    if (!configuration.allowDirectQuantityInput) {
      Alert.alert(
        "Direct Input Disabled",
        "Direct quantity input is disabled. Please use the + and - buttons.",
        [{ text: "OK" }]
      );
      return;
    }

    const currentQuantities = getCurrentQuantities();
    const currentStock = availableStock[size] || 0;

    if (text === "") {
      setCurrentQuantities({ ...currentQuantities, [size]: 0 });
      return;
    }

    const numericValue = text.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setCurrentQuantities({ ...currentQuantities, [size]: 0 });
      return;
    }

    const newQuantity = parseInt(numericValue, 10);

    if (activeTab === "rejected") {
      if (newQuantity > currentStock) {
        Alert.alert(
          "Quantity Exceeds Stock",
          `Cannot reject more than available stock (${currentStock}) for ${size.toUpperCase()}`,
          [{ text: "OK" }]
        );
        setCurrentQuantities({ ...currentQuantities, [size]: currentStock });
      } else {
        setCurrentQuantities({ ...currentQuantities, [size]: newQuantity });
      }
    } else if (activeTab === "returned") {
      setCurrentQuantities({ ...currentQuantities, [size]: newQuantity });
    } else {
      if (newQuantity > currentStock) {
        Alert.alert(
          "Quantity Exceeds Stock",
          `Maximum available for ${size.toUpperCase()} is ${currentStock}`,
          [{ text: "OK" }]
        );
        setCurrentQuantities({ ...currentQuantities, [size]: currentStock });
      } else {
        setCurrentQuantities({ ...currentQuantities, [size]: newQuantity });
      }
    }
  };

  const handleNext = () => {
    const currentQuantities = getCurrentQuantities();
    const totalItems = getTotalItems();

    if (totalItems === 0) {
      Alert.alert("No Items", "Please select at least one item to proceed.");
      return;
    }

    if (activeTab === "available") {
      if (isReservation) {
        if (!configuration.reservationEnabled) {
          Alert.alert(
            "Reservation Disabled",
            "The reservation system is currently disabled.",
            [{ text: "OK" }]
          );
          return;
        }
        
        // Get item data for reservation
        const firstItem = sizes[0];
        
        // Navigate to reservation screen
        router.push({
          pathname: "../(shop)/reserve_information",
          params: {
            quantities: JSON.stringify(currentQuantities),
            user: JSON.stringify(currentUser),
            availableStock: JSON.stringify(availableStock),
            itemData: JSON.stringify({
              id: firstItem.key,
              name: firstItem.label,
              price: firstItem.price,
              image: firstItem.image_key,
              description: `${firstItem.label} Shirt`
            })
          },
        });
      } else {
        // Get item data for sale
        const firstItem = sizes[0];
        
        // Navigate to sale information screen
        router.push({
          pathname: "../(shop)/information",
          params: {
            quantities: JSON.stringify(currentQuantities),
            user: JSON.stringify(currentUser),
            availableStock: JSON.stringify(availableStock),
            itemData: JSON.stringify({
              id: firstItem.key,
              name: firstItem.label,
              price: firstItem.price,
              image: firstItem.image_key,
              description: `${firstItem.label} Shirt`
            })
          },
        });
      }
    } else if (activeTab === "rejected") {
      // Process rejected items
      router.push({
        pathname: "../(shop)/rejected_confirmation",
        params: {
          rejectedQuantities: JSON.stringify(currentQuantities),
          user: JSON.stringify(currentUser),
          availableStock: JSON.stringify(availableStock)
        },
      });
    } else if (activeTab === "returned") {
      if (!configuration.returnsEnabled) {
        Alert.alert(
          "Returns Disabled",
          "The returns system is currently disabled.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Process returned items
      router.push({
        pathname: "../(shop)/returned_confirmation",
        params: {
          returnedQuantities: JSON.stringify(currentQuantities),
          user: JSON.stringify(currentUser),
          availableStock: JSON.stringify(availableStock)
        },
      });
    }
  };

  const getTotalItems = () => {
    const currentQuantities = getCurrentQuantities();
    return Object.values(currentQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getStockDisplayText = (size: string) => {
    const stock = availableStock[size] || 0;

    if (!configuration.showStockLevels) {
      switch (activeTab) {
        case "rejected":
          const rejectedQty = rejectedQuantities[size] || 0;
          return `Rejecting: ${rejectedQty}`;
        case "returned":
          const returnedQty = returnedQuantities[size] || 0;
          return `Returning: ${returnedQty}`;
        case "available":
        default:
          if (stock === 0) return "Out of Stock";
          return "Available";
      }
    }

    switch (activeTab) {
      case "rejected":
        const rejectedQty = rejectedQuantities[size] || 0;
        return `Available: ${stock} • Rejecting: ${rejectedQty}`;
      case "returned":
        const returnedQty = returnedQuantities[size] || 0;
        return `Available: ${stock} • Returning: ${returnedQty}`;
      case "available":
      default:
        if (stock === 0) return "Out of Stock";
        if (stock < 5 && configuration.lowStockWarnings) return `Low Stock: ${stock}`;
        return `In Stock: ${stock}`;
    }
  };

  const getStockTextColor = (size: string) => {
    const stock = availableStock[size] || 0;

    switch (activeTab) {
      case "rejected":
        return "text-orange-500";
      case "returned":
        return "text-purple-500";
      case "available":
      default:
        if (stock === 0) return "text-error";
        if (stock < 5 && configuration.lowStockWarnings) return "text-warning";
        return "text-success";
    }
  };

  // Add empty state handling
  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-lg text-neutral-600">Loading shop data...</Text>
      </View>
    );
  }

  if (!configuration.shopEnabled) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center p-8">
        <Text className="text-error text-xl font-bold text-center mb-4">
          Shop Module Disabled
        </Text>
        <Text className="text-neutral-500 text-center">
          The shop module is currently disabled. Please contact administrator.
        </Text>
      </View>
    );
  }

  // Add empty items state
  if (sizes.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50">
        <View className="bg-primary p-4">
          <Text className="text-white text-xl font-bold text-center">
            Shop
          </Text>
          {currentUser && (
            <Text className="text-accent-100 text-sm text-center mt-1">
              Welcome, {currentUser.name}
            </Text>
          )}
        </View>
        
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-primary/10 rounded-full p-6 mb-4">
            <Text className="text-primary text-2xl">🛒</Text>
          </View>
          <Text className="text-primary text-xl font-bold text-center mb-2">
            No Items Available
          </Text>
          <Text className="text-neutral-500 text-center mb-4">
            There are no items available for sale at the moment.
          </Text>
          <Text className="text-neutral-500 text-center mb-6">
            Please contact the administrator to add items to the system.
          </Text>
          <TouchableOpacity 
            className="bg-primary rounded-lg py-3 px-6"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold text-lg">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalItems = getTotalItems();
  const availableTabs = [
    { key: "available" as TabType, label: "Available" },
    { key: "rejected" as TabType, label: "Reject" },
    { key: "returned" as TabType, label: "Return" },
  ].filter(tab => tab.key !== "returned" || configuration.returnsEnabled);

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">
          {activeTab === "available" ? "Shirt Size Selection" :
           activeTab === "rejected" ? "Reject Items" : "Return Items"}
        </Text>
        {totalItems > 0 && (
          <Text className="text-accent-100 text-center mt-1">
            {totalItems} item{totalItems !== 1 ? "s" : ""} selected
            {isReservation && activeTab === "available" && " • Reservation"}
          </Text>
        )}
      </View>

      {/* Reservation Toggle */}
      {activeTab === "available" && configuration.reservationEnabled && (
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm border border-accent-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-primary font-semibold text-lg">
                Reservation Mode
              </Text>
              <Text className="text-neutral-500 text-sm mt-1">
                {isReservation
                  ? "Items will be reserved for later pickup"
                  : "Process immediate sale"}
              </Text>
            </View>
            <Switch
              value={isReservation}
              onValueChange={setIsReservation}
              trackColor={{ false: "#f0f0f0", true: "#3B82F6" }}
              thumbColor={isReservation ? "#ffffff" : "#f4f3f4"}
            />
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View className="mx-4 mt-4 bg-white rounded-lg border border-accent-100">
        <View className="flex-row">
          {availableTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key ? "border-primary" : "border-transparent"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text className={`font-medium text-xs ${
                activeTab === tab.key ? "text-primary" : "text-neutral-500"
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-neutral-500 text-lg mb-4 text-center">
          {activeTab === "available" && "Select shirt quantities by size"}
          {activeTab === "rejected" && "Select items to reject (will decrease stock)"}
          {activeTab === "returned" && "Select items to return (will increase stock)"}
        </Text>

        {sizes.map((size) => {
          const currentQuantities = getCurrentQuantities();
          const stock = availableStock[size.key] || 0;
          const quantity = currentQuantities[size.key] || 0;

          return (
            <View
              key={size.key}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-accent-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="w-20 h-20 bg-neutral-50 rounded-lg border border-accent-100 overflow-hidden items-center justify-center">
                  <Image
                    source={size.image}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>

                <View className="flex-1 ml-4">
                  <Text className="text-primary text-lg font-semibold">
                    {size.label}
                  </Text>
                  <Text className="text-neutral-500 text-sm">
                    Size: {size.key.toUpperCase()}
                  </Text>
                  <Text className={`text-xs mt-1 ${getStockTextColor(size.key)}`}>
                    {getStockDisplayText(size.key)}
                  </Text>
                  {activeTab === "available" && (
                    <Text className="text-success text-xs mt-1">
                      Price: ₱{size.price}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => updateQuantity(size.key, -1)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      quantity > 0
                        ? activeTab === "rejected" ? "bg-orange-500" :
                          activeTab === "returned" ? "bg-purple-500" : "bg-error"
                        : "bg-neutral-400"
                    }`}
                    disabled={quantity === 0}
                  >
                    <Text className="text-white text-lg font-bold">-</Text>
                  </TouchableOpacity>

                  <TextInput
                    className={`text-primary text-lg font-bold text-center border rounded-lg py-1 px-2 w-12 ${
                      !configuration.allowDirectQuantityInput ? "bg-neutral-100 text-neutral-400" : "border-accent-100 bg-white"
                    }`}
                    value={quantity.toString()}
                    onChangeText={(text) => handleInputChange(size.key, text)}
                    keyboardType="numeric"
                    maxLength={3}
                    selectTextOnFocus
                    editable={configuration.allowDirectQuantityInput}
                  />

                  <TouchableOpacity
                    onPress={() => updateQuantity(size.key, 1)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      activeTab === "returned" || quantity < stock
                        ? activeTab === "rejected" ? "bg-orange-500" :
                          activeTab === "returned" ? "bg-purple-500" : "bg-success"
                        : "bg-neutral-400"
                    }`}
                    disabled={activeTab !== "returned" && quantity >= stock}
                  >
                    <Text className="text-white text-lg font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="p-4 bg-white border-t border-accent-100">
        <TouchableOpacity
          onPress={handleNext}
          className={`rounded-lg py-4 ${
            totalItems > 0 ? "bg-secondary" : "bg-neutral-400"
          }`}
          disabled={totalItems === 0}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {activeTab === "available" && isReservation && "Reserve Items"}
            {activeTab === "available" && !isReservation && "Proceed to Sale"}
            {activeTab === "rejected" && "Process Rejection"}
            {activeTab === "returned" && "Process Return"}
            {totalItems > 0 && ` (${totalItems} item${totalItems !== 1 ? "s" : ""})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Shop;
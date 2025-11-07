// app/(user)/(tabs)/restock.tsx
import { router, useLocalSearchParams } from "expo-router";
import { Info, Package } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { restockService } from "../../../services/restockService";
import Modal from "../../components/Modal";

interface StockItem {
  key: string;
  label: string;
  image: number;
  stock: number;
  lowStockThreshold: number;
  reserved: number;
  rejected: number;
  returned: number;
}

interface UserData {
  id: number;
  username: string;
  name: string;
  role: string;
}

const Restock = () => {
  const params = useLocalSearchParams();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Parse user data
  useEffect(() => {
    const parseUserData = () => {
      if (params.user) {
        try {
          const userData = JSON.parse(params.user as string);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    
    parseUserData();
  }, [params.user]);

  // Load stock data
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setIsLoading(true);
        const data = await restockService.getCurrentStock();
        setStockData(data as StockItem[]);
      } catch (error) {
        console.error('Error loading stock data:', error);
        Alert.alert('Error', 'Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStockData();
  }, []);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);
    const totalReserved = stockData.reduce((sum, item) => sum + item.reserved, 0);
    const totalRejected = stockData.reduce((sum, item) => sum + item.rejected, 0);
    const totalReturned = stockData.reduce((sum, item) => sum + item.returned, 0);

    return {
      totalStock,
      totalReserved,
      totalRejected,
      totalReturned
    };
  }, [stockData]);

  // Helper functions
  const getStockStatusColor = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return "text-error";
    if (stock <= lowStockThreshold) return "text-warning";
    return "text-success";
  };

  const getStockStatusText = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= lowStockThreshold) return "Low Stock";
    return "In Stock";
  };

  const getProgressBarColor = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return "bg-error";
    if (stock <= lowStockThreshold) return "bg-warning";
    return "bg-success";
  };

  const getStockPercentage = (stock: number, max: number = 30) => {
    return Math.min((stock / max) * 100, 100);
  };

  const handleAddRestock = () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    router.push({
      pathname: '../(restock)/restock_config',
      params: { user: JSON.stringify(currentUser) }
    });
  };

  const handleItemPress = (item: StockItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Empty state component
  const EmptyStockState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="bg-primary/10 rounded-full p-6 mb-4">
        <Package size={48} color="#3B82F6" />
      </View>
      <Text className="text-primary text-xl font-bold text-center mb-2">
        No Items Available
      </Text>
      <Text className="text-neutral-500 text-center mb-4">
        There are no items available for restocking at the moment.
      </Text>
      <Text className="text-neutral-500 text-center mb-6">
        Please contact the administrator to add items to the system.
      </Text>
      <TouchableOpacity 
        className="bg-primary rounded-lg py-3 px-6"
        onPress={handleBackToDashboard}
      >
        <Text className="text-white font-semibold text-lg">Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-lg text-gray-700">Loading stock data...</Text>
      </View>
    );
  }

  // Show empty state if no items
  if (stockData.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50">
        {/* Header */}
        <View className="bg-primary p-4">
          <Text className="text-white text-xl font-bold text-center">
            Stock Management
          </Text>
          {currentUser && (
            <Text className="text-accent-100 text-sm text-center mt-1">
              Welcome, {currentUser.name}
            </Text>
          )}
        </View>
        
        <EmptyStockState />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">
          Stock Management
        </Text>
        {currentUser && (
          <Text className="text-accent-100 text-sm text-center mt-1">
            Welcome, {currentUser.name}
          </Text>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Stock Summary Card */}
        <View className="mx-4 mt-4 bg-white rounded-xl shadow-lg border border-accent-100">
          <View className="p-4 border-b border-accent-100">
            <Text className="text-primary text-xl font-bold text-center">
              Stock Summary
            </Text>
          </View>

          <View className="p-4">
            {/* Main Stats Row */}
            <View className="flex-row justify-between mb-4">
              {/* Total Stock */}
              <View className="items-center flex-1">
                <View className="bg-primary/20 p-3 rounded-full mb-2">
                  <Text className="text-primary text-lg font-bold">
                    {summaryStats.totalStock}
                  </Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">
                  Total Stock
                </Text>
              </View>

              {/* Reserved Items */}
              <View className="items-center flex-1">
                <View className="bg-blue-100 p-3 rounded-full mb-2">
                  <Text className="text-blue-600 text-lg font-bold">
                    {summaryStats.totalReserved}
                  </Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">
                  Reserved
                </Text>
              </View>

              {/* Rejected Items */}
              <View className="items-center flex-1">
                <View className="bg-orange-100 p-3 rounded-full mb-2">
                  <Text className="text-orange-600 text-lg font-bold">
                    {summaryStats.totalRejected}
                  </Text>
                </View>
                <Text className="text-neutral-500 text-xs text-center">
                  Rejected
                </Text>
              </View>
            </View>

            {/* Items Count */}
            <View className="bg-neutral-50 rounded-lg p-3 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-primary font-semibold">
                  Available Items
                </Text>
                <View className="bg-primary rounded-full px-3 py-1">
                  <Text className="text-white font-bold">
                    {stockData.length}
                  </Text>
                </View>
              </View>
              <Text className="text-neutral-500 text-xs mt-1">
                enabled items in system
              </Text>
            </View>
          </View>
        </View>

        {/* Stock Details Header */}
        <View className="mx-4 mt-6 mb-3">
          <Text className="text-primary text-lg font-bold">
            Size-wise Stock Details
          </Text>
          <Text className="text-neutral-500 text-sm">
            Tap on any size to view detailed information
          </Text>
        </View>

        {/* Stock Items List */}
        <View className="mx-4 mb-4">
          {stockData.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleItemPress(item)}
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

                    {/* Stock Status with Icon */}
                    <View className="flex-row items-center mt-1">
                      <View
                        className={`w-2 h-2 rounded-full mr-2 ${
                          item.stock === 0
                            ? "bg-error"
                            : item.stock <= item.lowStockThreshold
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                      />
                      <Text
                        className={`text-sm font-medium ${getStockStatusColor(item.stock, item.lowStockThreshold)}`}
                      >
                        {getStockStatusText(item.stock, item.lowStockThreshold)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stock Count and Info Icon */}
                <View className="items-end">
                  <View
                    className={`p-2 rounded-lg ${
                      item.stock === 0
                        ? "bg-error/10"
                        : item.stock <= item.lowStockThreshold
                          ? "bg-warning/10"
                          : "bg-success/10"
                    }`}
                  >
                    <Text
                      className={`text-lg font-bold ${getStockStatusColor(item.stock, item.lowStockThreshold)}`}
                    >
                      {item.stock}
                    </Text>
                    <Text className="text-neutral-500 text-xs text-center">
                      units
                    </Text>
                  </View>
                  <View className="mt-2 bg-primary/10 rounded-full p-1">
                    <Info size={14} color="#3B82F6" />
                  </View>
                </View>
              </View>

              {/* Enhanced Progress Bar */}
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-neutral-500 text-xs">Stock Level</Text>
                  <Text className="text-neutral-500 text-xs">
                    {getStockPercentage(item.stock).toFixed(0)}%
                  </Text>
                </View>
                <View className="w-full bg-accent-100 rounded-full h-3">
                  <View
                    className={`h-3 rounded-full ${getProgressBarColor(item.stock, item.lowStockThreshold)}`}
                    style={{
                      width: `${getStockPercentage(item.stock)}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-neutral-500 text-xs">0</Text>
                  <Text className="text-warning text-xs">
                    Low: {item.lowStockThreshold}
                  </Text>
                  <Text className="text-neutral-500 text-xs">30</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Restock Button */}
      <View className="p-4 border-t border-accent-100 bg-white">
        <TouchableOpacity
          onPress={handleAddRestock}
          className="rounded-lg py-4 items-center bg-secondary"
        >
          <Text className="text-white text-lg font-semibold text-center">
            📦 Add Restock
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item Detail Modal */}
      <Modal
        visible={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={selectedItem ? `${selectedItem.label} Details` : "Item Details"}
        showCloseButton={true}
      >
        {selectedItem && (
          <View className="p-4">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
              {/* Header with Image */}
              <View className="flex-row items-center mb-4">
                <View className="w-20 h-20 bg-neutral-50 rounded-lg border border-accent-100 overflow-hidden items-center justify-center">
                  <Image
                    source={selectedItem.image}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary text-xl font-bold">
                    {selectedItem.label}
                  </Text>
                  <Text className="text-neutral-500">
                    Size: {selectedItem.key.toUpperCase()}
                  </Text>
                  <View className={`px-2 py-1 rounded-full mt-1 ${
                    selectedItem.stock === 0
                      ? "bg-error/20"
                      : selectedItem.stock <= selectedItem.lowStockThreshold
                        ? "bg-warning/20"
                        : "bg-success/20"
                  }`}>
                    <Text className={`text-xs font-medium ${
                      selectedItem.stock === 0
                        ? "text-error"
                        : selectedItem.stock <= selectedItem.lowStockThreshold
                          ? "text-warning"
                          : "text-success"
                    }`}>
                      {getStockStatusText(selectedItem.stock, selectedItem.lowStockThreshold)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stock Information Grid */}
              <View className="grid grid-cols-2 gap-3 mb-4">
                {/* Current Stock */}
                <View className="bg-primary/5 rounded-lg p-3">
                  <Text className="text-neutral-500 text-xs mb-1">Current Stock</Text>
                  <Text className="text-primary text-2xl font-bold">
                    {formatNumber(selectedItem.stock)}
                  </Text>
                  <Text className="text-neutral-500 text-xs">units available</Text>
                </View>

                {/* Reserved Items */}
                <View className="bg-blue-50 rounded-lg p-3">
                  <Text className="text-neutral-500 text-xs mb-1">Reserved Items</Text>
                  <Text className="text-blue-600 text-2xl font-bold">
                    {formatNumber(selectedItem.reserved)}
                  </Text>
                  <Text className="text-neutral-500 text-xs">on hold</Text>
                </View>

                {/* Rejected Items */}
                <View className="bg-orange-50 rounded-lg p-3">
                  <Text className="text-neutral-500 text-xs mb-1">Rejected Items</Text>
                  <Text className="text-orange-600 text-2xl font-bold">
                    {formatNumber(selectedItem.rejected)}
                  </Text>
                  <Text className="text-neutral-500 text-xs">quality issues</Text>
                </View>

                {/* Returned Items */}
                <View className="bg-purple-50 rounded-lg p-3">
                  <Text className="text-neutral-500 text-xs mb-1">Returned Items</Text>
                  <Text className="text-purple-600 text-2xl font-bold">
                    {formatNumber(selectedItem.returned)}
                  </Text>
                  <Text className="text-neutral-500 text-xs">customer returns</Text>
                </View>
              </View>

              {/* Stock Level Progress */}
              <View className="bg-neutral-50 rounded-lg p-4 mb-4">
                <Text className="text-primary font-semibold mb-2">Stock Level</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-neutral-500 text-sm">Current: {selectedItem.stock} units</Text>
                  <Text className="text-neutral-500 text-sm">
                    {getStockPercentage(selectedItem.stock).toFixed(0)}%
                  </Text>
                </View>
                <View className="w-full bg-accent-100 rounded-full h-4">
                  <View
                    className={`h-4 rounded-full ${getProgressBarColor(selectedItem.stock, selectedItem.lowStockThreshold)}`}
                    style={{
                      width: `${getStockPercentage(selectedItem.stock)}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-neutral-500 text-xs">Empty</Text>
                  <Text className="text-warning text-xs">
                    Low: {selectedItem.lowStockThreshold}
                  </Text>
                  <Text className="text-neutral-500 text-xs">Full (30)</Text>
                </View>
              </View>

              {/* Available for Sale */}
              <View className="bg-success/10 rounded-lg p-4 border border-success/20">
                <Text className="text-success font-semibold mb-1">Available for Sale</Text>
                <Text className="text-success text-2xl font-bold">
                  {formatNumber(selectedItem.stock - selectedItem.reserved)} units
                </Text>
                <Text className="text-success text-xs">
                  Current stock minus reserved items
                </Text>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default Restock;
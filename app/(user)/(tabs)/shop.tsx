// app/(tabs)/shop.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

// Import your components
import Button from "../../components/Button";
import Modal from "../../components/Modal";

// These return numbers (image resource IDs), not strings
const extraSmallImg = require("../../../assets/images/size-shirt/extra-small.png");
const smallImg = require("../../../assets/images/size-shirt/small.png");
const mediumImg = require("../../../assets/images/size-shirt/medium.png");
const largeImg = require("../../../assets/images/size-shirt/large.png");
const xlImg = require("../../../assets/images/size-shirt/extra-large.png");
const xxlImg = require("../../../assets/images/size-shirt/extra-extra-large.png");
const xxxlImg = require("../../../assets/images/size-shirt/extra-extra-extra-large.png");

// Define the type for sizes
type SizeKey = "xs" | "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";
type TabType = "available" | "rejected" | "returned" | "reservations";
type ReservationStatus = "pending" | "completed" | "cancelled";

interface Quantities {
  xs: number;
  small: number;
  medium: number;
  large: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

interface SizeItem {
  key: SizeKey;
  label: string;
  image: number;
  price: number;
}

interface Reservation {
  id: string;
  fullName: string;
  studentId: string;
  quantities: Quantities;
  date: string;
  status: ReservationStatus;
  totalItems: number;
  totalAmount: number;
}

const Shop = () => {
  const router = useRouter();

  // Available stock reference
  const availableStock: Quantities = {
    xs: 15,
    small: 20,
    medium: 25,
    large: 18,
    xl: 12,
    xxl: 8,
    xxxl: 5,
  };

  const [quantities, setQuantities] = useState<Quantities>({
    xs: 0,
    small: 0,
    medium: 0,
    large: 0,
    xl: 0,
    xxl: 0,
    xxxl: 0,
  });

  const [rejectedQuantities, setRejectedQuantities] = useState<Quantities>({
    xs: 0,
    small: 0,
    medium: 0,
    large: 0,
    xl: 0,
    xxl: 0,
    xxxl: 0,
  });

  const [returnedQuantities, setReturnedQuantities] = useState<Quantities>({
    xs: 0,
    small: 0,
    medium: 0,
    large: 0,
    xl: 0,
    xxl: 0,
    xxxl: 0,
  });

  const [isReservation, setIsReservation] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [reservationFilter, setReservationFilter] = useState<
    ReservationStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Track which input is currently focused
  const [focusedInput, setFocusedInput] = useState<{
    type: TabType;
    size: SizeKey;
  } | null>(null);

  // Sample reservation data
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      fullName: "Juan Dela Cruz",
      studentId: "2023-00123",
      quantities: {
        xs: 1,
        small: 2,
        medium: 0,
        large: 0,
        xl: 0,
        xxl: 0,
        xxxl: 0,
      },
      date: "2024-01-15",
      status: "pending",
      totalItems: 3,
      totalAmount: 897,
    },
    {
      id: "2",
      fullName: "Maria Santos",
      studentId: "2023-00456",
      quantities: {
        xs: 0,
        small: 0,
        medium: 1,
        large: 1,
        xl: 0,
        xxl: 0,
        xxxl: 0,
      },
      date: "2024-01-14",
      status: "completed",
      totalItems: 2,
      totalAmount: 598,
    },
    {
      id: "3",
      fullName: "Pedro Reyes",
      studentId: "2023-00789",
      quantities: {
        xs: 0,
        small: 0,
        medium: 0,
        large: 0,
        xl: 1,
        xxl: 0,
        xxxl: 0,
      },
      date: "2024-01-13",
      status: "cancelled",
      totalItems: 1,
      totalAmount: 299,
    },
  ]);

  const sizes: SizeItem[] = [
    { key: "xs", label: "Extra Small", image: extraSmallImg, price: 299 },
    { key: "small", label: "Small", image: smallImg, price: 299 },
    { key: "medium", label: "Medium", image: mediumImg, price: 299 },
    { key: "large", label: "Large", image: largeImg, price: 299 },
    { key: "xl", label: "Extra Large", image: xlImg, price: 299 },
    { key: "xxl", label: "2X Large", image: xxlImg, price: 299 },
    { key: "xxxl", label: "3X Large", image: xxxlImg, price: 299 },
  ];

  // Get current quantities based on active tab
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

  const updateQuantity = (size: SizeKey, change: number) => {
    const currentQuantities = getCurrentQuantities();
    const currentStock = availableStock[size];

    let newQuantity;

    if (activeTab === "rejected") {
      // For rejected items: can reject up to available stock
      newQuantity = Math.max(
        0,
        Math.min(currentQuantities[size] + change, currentStock)
      );
    } else if (activeTab === "returned") {
      // For returned items: no upper limit (can return any number)
      newQuantity = Math.max(0, currentQuantities[size] + change);
    } else {
      // For available items: normal stock limits
      newQuantity = Math.max(
        0,
        Math.min(currentQuantities[size] + change, currentStock)
      );
    }

    setCurrentQuantities({
      ...currentQuantities,
      [size]: newQuantity,
    });
  };

  const handleInputChange = (size: SizeKey, text: string) => {
    const currentQuantities = getCurrentQuantities();
    const currentStock = availableStock[size];

    // Allow empty string for better UX during typing
    if (text === "") {
      setCurrentQuantities({ ...currentQuantities, [size]: 0 });
      return;
    }

    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setCurrentQuantities({ ...currentQuantities, [size]: 0 });
      return;
    }

    const newQuantity = parseInt(numericValue, 10);

    if (activeTab === "rejected") {
      // For rejected: validate against available stock
      if (newQuantity > currentStock) {
        Alert.alert(
          "Quantity Exceeds Stock",
          `Cannot reject more than available stock (${currentStock}) for ${size.toUpperCase()}`,
          [{ text: "OK" }]
        );
        setCurrentQuantities({
          ...currentQuantities,
          [size]: currentStock,
        });
      } else {
        setCurrentQuantities({
          ...currentQuantities,
          [size]: newQuantity,
        });
      }
    } else if (activeTab === "returned") {
      // For returned: no upper limit validation
      setCurrentQuantities({
        ...currentQuantities,
        [size]: newQuantity,
      });
    } else {
      // For available: normal stock validation
      if (newQuantity > currentStock) {
        Alert.alert(
          "Quantity Exceeds Stock",
          `Maximum available for ${size.toUpperCase()} is ${currentStock}`,
          [{ text: "OK" }]
        );
        setCurrentQuantities({
          ...currentQuantities,
          [size]: currentStock,
        });
      } else {
        setCurrentQuantities({
          ...currentQuantities,
          [size]: newQuantity,
        });
      }
    }
  };

  const handleInputBlur = (size: SizeKey) => {
    setFocusedInput(null);

    const currentQuantities = getCurrentQuantities();
    // Ensure quantity is at least 0 when input loses focus
    if (currentQuantities[size] < 0) {
      setCurrentQuantities({ ...currentQuantities, [size]: 0 });
    }
  };

  const handleInputFocus = (type: TabType, size: SizeKey) => {
    setFocusedInput({ type, size });
  };

  const handleNext = () => {
    const currentQuantities = getCurrentQuantities();
    console.log("Selected quantities:", currentQuantities);
    console.log("Is Reservation:", isReservation);

    if (activeTab === "available") {
      if (isReservation) {
        // Navigate to reservation information screen
        router.push({
          pathname: "../(shop)/reserve_information",
          params: {
            quantities: JSON.stringify(currentQuantities),
            isReservation: isReservation.toString(),
          },
        });
      } else {
        // Navigate to regular sale information screen
        router.push({
          pathname: "../(shop)/information",
          params: {
            quantities: JSON.stringify(currentQuantities),
            isReservation: isReservation.toString(),
          },
        });
      }
    } else if (activeTab === "rejected") {
      // Navigate to rejected confirmation
      router.push({
        pathname: "../(shop)/rejected_confirmation",
        params: {
          rejectedQuantities: JSON.stringify(currentQuantities),
          availableStock: JSON.stringify(availableStock),
        },
      });
    } else if (activeTab === "returned") {
      // Navigate to returned confirmation
      router.push({
        pathname: "../(shop)/returned_confirmation",
        params: {
          returnedQuantities: JSON.stringify(currentQuantities),
          availableStock: JSON.stringify(availableStock),
        },
      });
    }
  };

  const getTotalItems = () => {
    const currentQuantities = getCurrentQuantities();
    return Object.values(currentQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const totalItems = getTotalItems();

  const getStockDisplayText = (size: SizeKey) => {
    const stock = availableStock[size];

    switch (activeTab) {
      case "rejected":
        const rejectedQty = rejectedQuantities[size];
        return `Available: ${stock} units • Rejecting: ${rejectedQty}`;
      case "returned":
        const returnedQty = returnedQuantities[size];
        return `Available: ${stock} units • Returning: ${returnedQty}`;
      case "available":
      default:
        if (stock === 0) return "Out of Stock";
        if (stock < 5) return `Low Stock: ${stock} units`;
        return `In Stock: ${stock} units`;
    }
  };

  const getStockTextColor = (size: SizeKey) => {
    const stock = availableStock[size];

    switch (activeTab) {
      case "rejected":
        return "text-orange-500";
      case "returned":
        return "text-purple-500";
      case "available":
      default:
        if (stock === 0) return "text-error";
        if (stock < 5) return "text-warning";
        return "text-success";
    }
  };

  const getTabColor = (tab: TabType) => {
    return activeTab === tab ? "text-primary" : "text-neutral-500";
  };

  const getTabBorderColor = (tab: TabType) => {
    return activeTab === tab ? "border-primary" : "border-transparent";
  };

  const getButtonText = () => {
    switch (activeTab) {
      case "rejected":
        return "Process Rejected Items";
      case "returned":
        return "Process Returned Items";
      case "available":
      default:
        return isReservation ? "Reserve" : "Next";
    }
  };

  const getAvailableStockTotal = () => {
    return Object.values(availableStock).reduce((sum, count) => sum + count, 0);
  };

  // Reservation functions
  const handleReservationPress = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const updateReservationStatus = (
    reservationId: string,
    newStatus: ReservationStatus
  ) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, status: newStatus } : res
      )
    );
    setShowReservationModal(false);
    Alert.alert("Success", `Reservation status updated to ${newStatus}`);
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ReservationStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Filter reservations based on search query and status filter
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      reservationFilter === "all" || reservation.status === reservationFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render reservation tab content
  const renderReservationsTab = () => {
    return (
      <View className="flex-1 p-4">
        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            className="bg-white border border-accent-100 rounded-lg p-4 text-neutral-800"
            placeholder="Search by name or student ID..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View className="bg-white rounded-lg p-1 flex-row border border-accent-100 mb-4">
          {(["all", "pending", "completed", "cancelled"] as const).map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                className={`flex-1 py-2 rounded-md ${reservationFilter === filter ? "bg-primary" : "bg-transparent"}`}
                onPress={() => setReservationFilter(filter)}
              >
                <Text
                  className={`text-center font-medium text-xs ${reservationFilter === filter ? "text-white" : "text-neutral-500"}`}
                >
                  {filter === "all"
                    ? "All"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Reservations List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredReservations.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center justify-center mt-4">
              <Text className="text-neutral-500 text-lg text-center">
                No reservations found
              </Text>
              <Text className="text-neutral-400 text-sm text-center mt-2">
                {searchQuery || reservationFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "There are no reservations yet."}
              </Text>
            </View>
          ) : (
            filteredReservations.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                onPress={() => handleReservationPress(reservation)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-primary text-lg font-semibold">
                      {reservation.fullName}
                    </Text>
                    <Text className="text-neutral-500 text-sm">
                      ID: {reservation.studentId}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${getStatusColor(reservation.status)}`}
                  >
                    <Text className="text-white text-xs font-medium">
                      {getStatusText(reservation.status)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-neutral-500 text-sm">
                    {new Date(reservation.date).toLocaleDateString()}
                  </Text>
                  <Text className="text-primary font-semibold">
                    {reservation.totalItems} item{reservation.totalItems !== 1 ? "s" : ""}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-neutral-500 text-sm">
                    Total: ₱{reservation.totalAmount}
                  </Text>
                  <Text className="text-secondary text-sm font-medium">
                    Tap to manage
                  </Text>
                </View>

                {/* Size quantities summary */}
                <View className="mt-3 pt-3 border-t border-accent-100">
                  <Text className="text-neutral-500 text-sm mb-2">Items:</Text>
                  <View className="flex-row flex-wrap">
                    {Object.entries(reservation.quantities).map(
                      ([size, qty]) => {
                        if (qty > 0) {
                          return (
                            <View
                              key={size}
                              className="bg-primary/10 rounded-lg px-2 py-1 mr-2 mb-1"
                            >
                              <Text className="text-primary text-xs font-medium">
                                {sizeLabels[size as keyof typeof sizeLabels]}: {qty}
                              </Text>
                            </View>
                          );
                        }
                        return null;
                      }
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">
          {activeTab === "available"
            ? "Shirt Size Selection"
            : activeTab === "rejected"
              ? "Reject Items"
              : activeTab === "returned"
                ? "Return Items"
                : "Reservation Management"}
        </Text>
        {totalItems > 0 && activeTab !== "reservations" && (
          <Text className="text-accent-100 text-center mt-1">
            {totalItems} item{totalItems !== 1 ? "s" : ""} selected
            {isReservation && activeTab === "available" && " • Reservation"}
          </Text>
        )}
      </View>

      {/* Reservation Toggle - Only show for available tab */}
      {activeTab === "available" && (
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm border border-accent-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-primary font-semibold text-lg">
                {isReservation ? "Reservation Mode" : "Reservation Mode"}
              </Text>
              <Text className="text-neutral-500 text-sm mt-1">
                {isReservation
                  ? "Items will be reserved for later pickup"
                  : "Items will be reserved for later pickup"}
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

      {/* Tab Navigation - Fixed to fit content */}
      <View className="mx-4 mt-4 bg-white rounded-lg border border-accent-100">
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 items-center border-b-2 ${getTabBorderColor("available")}`}
            onPress={() => setActiveTab("available")}
          >
            <Text className={`font-medium text-xs ${getTabColor("available")}`}>
              Available
            </Text>
            <Text className={`text-xs mt-1 ${getTabColor("available")}`}>
              ({getAvailableStockTotal()})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 items-center border-b-2 ${getTabBorderColor("rejected")}`}
            onPress={() => setActiveTab("rejected")}
          >
            <Text className={`font-medium text-xs ${getTabColor("rejected")}`}>
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 items-center border-b-2 ${getTabBorderColor("returned")}`}
            onPress={() => setActiveTab("returned")}
          >
            <Text className={`font-medium text-xs ${getTabColor("returned")}`}>
              Return
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 items-center border-b-2 ${getTabBorderColor("reservations")}`}
            onPress={() => setActiveTab("reservations")}
          >
            <Text className={`font-medium text-xs ${getTabColor("reservations")}`}>
              Reservations
            </Text>
            <Text className={`text-xs mt-1 ${getTabColor("reservations")}`}>
              ({reservations.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "reservations" ? (
        renderReservationsTab()
      ) : (
        <>
          <ScrollView className="flex-1 p-4">
            <Text className="text-neutral-500 text-lg mb-4 text-center">
              {activeTab === "available" && "Select shirt quantities by size"}
              {activeTab === "rejected" &&
                "Select items to reject (will decrease stock)"}
              {activeTab === "returned" &&
                "Select items to return (will increase stock)"}
            </Text>

            {sizes.map((size) => {
              const currentQuantities = getCurrentQuantities();
              const stock = availableStock[size.key];
              const quantity = currentQuantities[size.key];

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

                    {/* Size Label */}
                    <View className="flex-1 ml-4">
                      <Text className="text-primary text-lg font-semibold">
                        {size.label}
                      </Text>
                      <Text className="text-neutral-500 text-sm">
                        Size: {size.key.toUpperCase()}
                      </Text>
                      {/* Stock Number Display */}
                      <Text
                        className={`text-xs mt-1 ${getStockTextColor(size.key)}`}
                      >
                        {getStockDisplayText(size.key)}
                      </Text>
                      {activeTab === "available" && (
                        <Text className="text-success text-xs mt-1">
                          Price: ₱{size.price}
                        </Text>
                      )}
                    </View>

                    {/* Stepper Controls with TextInput */}
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity
                        onPress={() => updateQuantity(size.key, -1)}
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          quantity > 0
                            ? activeTab === "rejected"
                              ? "bg-orange-500"
                              : activeTab === "returned"
                                ? "bg-purple-500"
                                : "bg-error"
                            : "bg-neutral-400"
                        }`}
                        disabled={quantity === 0}
                      >
                        <Text className="text-white text-lg font-bold">-</Text>
                      </TouchableOpacity>

                      {/* TextInput for direct number entry */}
                      <TextInput
                        className={`text-primary text-lg font-bold text-center border rounded-lg py-1 px-2 w-12 ${
                          focusedInput?.type === activeTab &&
                          focusedInput?.size === size.key
                            ? "border-secondary bg-neutral-50"
                            : "border-accent-100 bg-white"
                        }`}
                        value={quantity.toString()}
                        onChangeText={(text) =>
                          handleInputChange(size.key, text)
                        }
                        onBlur={() => handleInputBlur(size.key)}
                        onFocus={() => handleInputFocus(activeTab, size.key)}
                        keyboardType="numeric"
                        maxLength={3}
                        selectTextOnFocus
                      />

                      <TouchableOpacity
                        onPress={() => updateQuantity(size.key, 1)}
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          activeTab === "returned" || quantity < stock
                            ? activeTab === "rejected"
                              ? "bg-orange-500"
                              : activeTab === "returned"
                                ? "bg-purple-500"
                                : "bg-success"
                            : "bg-neutral-400"
                        }`}
                        disabled={activeTab !== "returned" && quantity >= stock}
                      >
                        <Text className="text-white text-lg font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Additional information for rejected and returned tabs */}
                  {activeTab !== "available" && quantity > 0 && (
                    <View
                      className={`mt-3 p-3 rounded-lg ${
                        activeTab === "rejected"
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-purple-50 border border-purple-200"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          activeTab === "rejected"
                            ? "text-orange-700"
                            : "text-purple-700"
                        }`}
                      >
                        {activeTab === "rejected"
                          ? `⚠️ Rejecting ${quantity} item${quantity !== 1 ? "s" : ""} will decrease available stock from ${stock} to ${stock - quantity}`
                          : `🔄 Returning ${quantity} item${quantity !== 1 ? "s" : ""} will increase available stock from ${stock} to ${stock + quantity}`}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Next Button */}
          <View className="p-4 border-t border-accent-100">
            <TouchableOpacity
              onPress={totalItems === 0 ? undefined : handleNext}
              disabled={totalItems === 0}
              className={`w-full rounded-lg py-4 items-center ${
                totalItems === 0
                  ? "bg-neutral-400"
                  : activeTab === "rejected"
                    ? "bg-orange-500"
                    : activeTab === "returned"
                      ? "bg-purple-500"
                      : "bg-secondary"
              }`}
            >
              <Text className="text-white text-lg font-semibold">
                {getButtonText()} {totalItems > 0 ? `(${totalItems})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Reservation Management Modal */}
      <Modal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        title="Reservation Details"
        showCloseButton={true}
      >
        {selectedReservation && (
          <View className="p-4">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
              {/* Reservation Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-primary text-xl font-bold">
                    {selectedReservation.fullName}
                  </Text>
                  <Text className="text-neutral-500">
                    Student ID: {selectedReservation.studentId}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(selectedReservation.status)}`}
                >
                  <Text className="text-white text-sm font-medium">
                    {getStatusText(selectedReservation.status)}
                  </Text>
                </View>
              </View>

              {/* Reservation Details */}
              <View className="space-y-3 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-neutral-500">Date:</Text>
                  <Text className="text-primary font-medium">
                    {new Date(selectedReservation.date).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-500">Total Items:</Text>
                  <Text className="text-primary font-medium">
                    {selectedReservation.totalItems}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-500">Total Amount:</Text>
                  <Text className="text-primary font-medium">
                    ₱{selectedReservation.totalAmount}
                  </Text>
                </View>
              </View>

              {/* Size Quantities */}
              <View className="mb-6">
                <Text className="text-primary font-semibold mb-2">
                  Items Reserved:
                </Text>
                <View className="space-y-2">
                  {Object.entries(selectedReservation.quantities).map(
                    ([size, qty]) => {
                      if (qty > 0) {
                        return (
                          <View
                            key={size}
                            className="flex-row justify-between items-center bg-primary/5 rounded-lg p-3"
                          >
                            <Text className="text-primary font-medium">
                              {sizeLabels[size as keyof typeof sizeLabels]}
                            </Text>
                            <Text className="text-primary font-bold">
                              x{qty}
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    }
                  )}
                </View>
              </View>

              {/* Status Update Buttons */}
              <Text className="text-primary font-semibold mb-3">
                Update Status:
              </Text>
              <View className="space-y-2">
                <Button
                  onPress={() =>
                    updateReservationStatus(selectedReservation.id, "completed")
                  }
                  containerClassName={`w-full ${
                    selectedReservation.status === "completed"
                      ? "bg-green-600"
                      : "bg-green-500"
                  }`}
                >
                  Mark as Completed
                </Button>

                <Button
                  onPress={() =>
                    updateReservationStatus(selectedReservation.id, "cancelled")
                  }
                  containerClassName={`w-full ${
                    selectedReservation.status === "cancelled"
                      ? "bg-red-600"
                      : "bg-red-500"
                  }`}
                >
                  Mark as Cancelled
                </Button>

                <Button
                  onPress={() =>
                    updateReservationStatus(selectedReservation.id, "pending")
                  }
                  containerClassName={`w-full ${
                    selectedReservation.status === "pending"
                      ? "bg-yellow-600"
                      : "bg-yellow-500"
                  }`}
                >
                  Mark as Pending
                </Button>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

// Add the missing sizeLabels constant
const sizeLabels = {
  xs: "Extra Small",
  small: "Small",
  medium: "Medium",
  large: "Large",
  xl: "Extra Large",
  xxl: "2X Large",
  xxxl: "3X Large",
};

export default Shop;
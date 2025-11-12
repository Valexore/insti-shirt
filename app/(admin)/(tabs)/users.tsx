import { Edit2, Trash2, UserPlus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  initDatabase,
  itemService,
  userService,
} from "../../../services/database";
import Modal from "../../components/Modal";

// Sample images - replace with your actual images
const extraSmallImg = require("../../../assets/images/size-shirt/extra-small.png");
const smallImg = require("../../../assets/images/size-shirt/small.png");
const mediumImg = require("../../../assets/images/size-shirt/medium.png");
const largeImg = require("../../../assets/images/size-shirt/large.png");
const xlImg = require("../../../assets/images/size-shirt/extra-large.png");
const xxlImg = require("../../../assets/images/size-shirt/extra-extra-large.png");
const xxxlImg = require("../../../assets/images/size-shirt/extra-extra-extra-large.png");

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "stocks">("summary");
  const [stockData, setStockData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get screen dimensions for responsive layout
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;

  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    password: "",
  });

  const [editUser, setEditUser] = useState({
    id: "",
    username: "",
    name: "",
    password: "",
  });

  // Load users and stock data
  const loadData = async () => {
    try {
      setIsLoading(true);
      // Ensure database is initialized
      await initDatabase();

      const usersData = await userService.getUsers();
      const itemsData = await itemService.getItems();

      // Filter out admin users (role = 'admin')
      const cashierUsers = usersData.filter(
        (user: any) => user.role !== "admin"
      );

      // Ensure all user data has proper default values
      const usersWithDefaults = cashierUsers.map((user: any) => ({
        ...user,
        total_stock: user.total_stock || 0,
        today_restock: user.today_restock || 0,
        total_sold: user.total_sold || 0,
        today_sold: user.today_sold || 0,
        total_revenue: user.total_revenue || 0,
        today_revenue: user.today_revenue || 0,
        total_rejected: user.total_rejected || 0,
        today_rejected: user.today_rejected || 0,
        last_active: user.last_active || "Never",
      }));

      setUsers(usersWithDefaults);

      // Transform items data for display
      const stockDataTransformed = itemsData.map((item: any) => ({
        key: item.key,
        label: item.label,
        image: getImageByKey(item.image_key),
        stock: item.stock || 0,
        rejected: item.rejected || 0,
        lowStockThreshold: item.low_stock_threshold || 5,
      }));

      setStockData(stockDataTransformed);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get image by key
  const getImageByKey = (key: string) => {
    const imageMap: { [key: string]: any } = {
      xs: extraSmallImg,
      small: smallImg,
      medium: mediumImg,
      large: largeImg,
      xl: xlImg,
      xxl: xxlImg,
      xxxl: xxxlImg,
    };
    return imageMap[key] || extraSmallImg;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
    setActiveTab("summary");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setNewUser({ username: "", name: "", password: "" });
    setAddModalVisible(true);
  };

  const handleEditUser = (user: any) => {
    setEditUser({
      id: user.id.toString(),
      username: user.username,
      name: user.name,
      password: "", // Empty for security
    });
    setEditModalVisible(true);
    setModalVisible(false);
  };

  const handleSaveNewUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // Create user with cashier role and active status by default
      const createdUser = await userService.createUser({
        ...newUser,
        role: "cashier",
        status: "active",
      });

      console.log("User created successfully:", createdUser);

      // Verify the user was actually created with correct status
      const allUsers = await userService.getUsers();
      const verifiedUser = allUsers.find((u: any) => u.id === createdUser.id);
      console.log("Verified user from database:", verifiedUser);

      setAddModalVisible(false);
      setNewUser({ username: "", name: "", password: "" });
      await loadData(); // Reload users
      Alert.alert("Success", "Cashier added successfully");
    } catch (error: any) {
      console.error("Error creating user:", error);
      Alert.alert("Error", error.message || "Failed to add cashier");
    }
  };

  const handleSaveEditUser = async () => {
    if (!editUser.username || !editUser.name) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const updateData: any = {
        username: editUser.username,
        name: editUser.name,
      };

      if (editUser.password) {
        updateData.password = editUser.password;
      }

      await userService.updateUser(parseInt(editUser.id), updateData);
      setEditModalVisible(false);
      setEditUser({ id: "", username: "", name: "", password: "" });
      await loadData(); // Reload users
      Alert.alert("Success", "Cashier updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update cashier");
    }
  };

  const handleDeleteUser = async (user: any) => {
    Alert.alert(
      "Delete Cashier",
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Convert id to number to ensure proper type
              const userId = parseInt(user.id);

              if (isNaN(userId)) {
                Alert.alert("Error", "Invalid user ID");
                return;
              }

              await userService.deleteUser(userId);
              await loadData(); // Reload users
              setModalVisible(false);
              Alert.alert("Success", "Cashier deleted successfully");
            } catch (error: any) {
              console.error("Delete error:", error);
              Alert.alert("Error", error.message || "Failed to delete cashier");
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await userService.updateUser(user.id, { status: newStatus });
      await loadData(); // Reload users
      setModalVisible(false);
      Alert.alert(
        "Success",
        `Cashier ${newStatus === "active" ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update cashier status");
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-success" : "bg-neutral-300";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Active" : "Inactive";
  };

  const getStockStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return "bg-error";
    if (stock <= threshold) return "bg-warning";
    return "bg-success";
  };

  const getStockStatusText = (stock: number, threshold: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= threshold) return "Low Stock";
    return "In Stock";
  };

  const formatCurrency = (amount: number | undefined | null) => {
    // Handle undefined, null, or NaN values
    const safeAmount = amount || 0;
    return `₱${safeAmount.toLocaleString()}`;
  };

  // Responsive font sizes and spacing
  const responsiveFont = {
    xs: isSmallScreen ? 10 : 12,
    sm: isSmallScreen ? 12 : 14,
    base: isSmallScreen ? 14 : 16,
    lg: isSmallScreen ? 16 : 18,
    xl: isSmallScreen ? 18 : 20,
    xxl: isSmallScreen ? 20 : 24,
  };

  const responsivePadding = {
    base: isSmallScreen ? 2 : 4,
    lg: isSmallScreen ? 3 : 6,
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 justify-center items-center">
        <Text className="text-primary text-lg">Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-4 pb-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Cashier Management
            </Text>
            <Text className="text-accent-100 text-sm mt-1">
              Manage cashiers and monitor performance
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white rounded-lg p-3 ml-4"
            onPress={handleAddUser}
          >
            <UserPlus size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User List */}
      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary text-xl font-bold">
            Cashiers ({users.length})
          </Text>
          <Text className="text-neutral-500 text-sm">
            {users.filter((u) => u.status === "active").length} active
          </Text>
        </View>

        {users.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center min-h-[200px]">
            <Text className="text-neutral-500 text-lg mb-2 text-center">
              No cashiers found
            </Text>
            <Text className="text-neutral-400 text-center">
              Add your first cashier to get started with managing your team.
            </Text>
          </View>
        ) : (
          users.map((user) => (
            <TouchableOpacity
              key={user.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
              onPress={() => handleUserPress(user)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      className="text-primary font-bold text-lg flex-1 mr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {user.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${getStatusColor(user.status)} min-w-[70px]`}
                    >
                      <Text className="text-white text-xs font-medium text-center">
                        {getStatusText(user.status)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-neutral-500 text-sm mb-3">
                    @{user.username}
                  </Text>

                  {/* Stats Grid - using actual user data with safe defaults */}
                  <View className="flex-row flex-wrap justify-between">
                    {/* Total Stock */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-primary font-bold text-lg">
                        {user.total_stock || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Total Stock
                      </Text>
                    </View>

                    {/* Today Restock */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-success font-bold text-lg">
                        {user.today_restock || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Today Restock
                      </Text>
                    </View>

                    {/* Total Sold */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-secondary font-bold text-lg">
                        {user.total_sold || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Total Sold
                      </Text>
                    </View>

                    {/* Today Sold */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-warning font-bold text-lg">
                        {user.today_sold || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Today Sold
                      </Text>
                    </View>

                    {/* Total Rejected */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-error font-bold text-lg">
                        {user.total_rejected || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Total Rejected
                      </Text>
                    </View>

                    {/* Today Rejected */}
                    <View className="w-[48%] mb-3">
                      <Text className="text-orange-500 font-bold text-lg">
                        {user.today_rejected || 0}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Today Rejected
                      </Text>
                    </View>

                    {/* Total Revenue */}
                    <View className="w-[48%]">
                      <Text className="text-purple-600 font-bold text-lg">
                        {formatCurrency(user.total_revenue)}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Total Revenue
                      </Text>
                    </View>

                    {/* Today Revenue */}
                    <View className="w-[48%]">
                      <Text className="text-green-600 font-bold text-lg">
                        {formatCurrency(user.today_revenue)}
                      </Text>
                      <Text className="text-neutral-500 text-xs">
                        Today Revenue
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text
                      className="text-neutral-500 text-xs flex-1"
                      numberOfLines={1}
                    >
                      Last active: {user.last_active || "Never"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* User Detail Modal */}
      <Modal
        visible={modalVisible}
        onClose={handleCloseModal}
        title={selectedUser?.name || "Cashier Details"}
        showCloseButton={true}
      >
        {selectedUser && (
          <View className="flex-1">
            {/* Tab Navigation */}
            <View className="flex-row border-b border-accent-100 bg-white">
              <TouchableOpacity
                className={`flex-1 py-3 items-center ${
                  activeTab === "summary" ? "border-b-2 border-primary" : ""
                }`}
                onPress={() => setActiveTab("summary")}
              >
                <Text
                  className={`font-medium text-sm ${
                    activeTab === "summary"
                      ? "text-primary"
                      : "text-neutral-500"
                  }`}
                >
                  Sales Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 items-center ${
                  activeTab === "stocks" ? "border-b-2 border-primary" : ""
                }`}
                onPress={() => setActiveTab("stocks")}
              >
                <Text
                  className={`font-medium text-sm ${
                    activeTab === "stocks" ? "text-primary" : "text-neutral-500"
                  }`}
                >
                  Stocks Summary
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 p-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {activeTab === "summary" ? (
                /* Sales Summary Tab */
                <View>
                  {/* Basic Info Card */}
                  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-accent-100">
                    <Text className="text-primary text-lg font-bold mb-3">
                      Basic Information
                    </Text>

                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500 text-sm">
                          Username
                        </Text>
                        <Text className="text-primary font-medium text-sm">
                          @{selectedUser.username}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500 text-sm">Status</Text>
                        <View
                          className={`px-2 py-1 rounded-full ${getStatusColor(selectedUser.status)} min-w-[70px]`}
                        >
                          <Text className="text-white text-xs font-medium text-center">
                            {getStatusText(selectedUser.status)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500 text-sm">
                          Join Date
                        </Text>
                        <Text className="text-primary font-medium text-sm">
                          {selectedUser.join_date || "N/A"}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500 text-sm">
                          Last Active
                        </Text>
                        <Text className="text-primary font-medium text-sm">
                          {selectedUser.last_active || "Never"}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500 text-sm">Role</Text>
                        <Text className="text-primary font-medium text-sm capitalize">
                          {selectedUser.role || "cashier"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Sales Statistics Card */}
                  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-accent-100">
                    <Text className="text-primary text-lg font-bold mb-3">
                      Sales Statistics
                    </Text>

                    <View className="flex-row flex-wrap justify-between">
                      {/* Total Stock */}
                      <View className="bg-primary/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-primary font-bold text-lg">
                          {selectedUser.total_stock || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Stock
                        </Text>
                      </View>

                      {/* Today Restock */}
                      <View className="bg-success/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-success font-bold text-lg">
                          {selectedUser.today_restock || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Restock
                        </Text>
                      </View>

                      {/* Total Sold */}
                      <View className="bg-secondary/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-secondary font-bold text-lg">
                          {selectedUser.total_sold || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Sold
                        </Text>
                      </View>

                      {/* Today Sold */}
                      <View className="bg-warning/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-warning font-bold text-lg">
                          {selectedUser.today_sold || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Sold
                        </Text>
                      </View>

                      {/* Total Rejected */}
                      <View className="bg-error/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-error font-bold text-lg">
                          {selectedUser.total_rejected || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Rejected
                        </Text>
                      </View>

                      {/* Today Rejected */}
                      <View className="bg-orange-100 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-orange-500 font-bold text-lg">
                          {selectedUser.today_rejected || 0}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Rejected
                        </Text>
                      </View>

                      {/* Total Revenue */}
                      <View className="bg-purple-100 rounded-lg p-3 w-[48%] items-center">
                        <Text className="text-purple-600 font-bold text-lg">
                          {formatCurrency(selectedUser.total_revenue)}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Revenue
                        </Text>
                      </View>

                      {/* Today Revenue */}
                      <View className="bg-green-100 rounded-lg p-3 w-[48%] items-center">
                        <Text className="text-green-600 font-bold text-lg">
                          {formatCurrency(selectedUser.today_revenue)}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Revenue
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                /* Stocks Summary Tab */
                <View>
                  <Text className="text-primary text-lg font-bold mb-3">
                    Current Stock Levels
                  </Text>

                  <View className="space-y-3">
                    {stockData.map((item) => (
                      <View
                        key={item.key}
                        className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 mb-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <Image
                              source={item.image}
                              className="w-10 h-10 rounded-lg mr-3"
                            />
                            <View className="flex-1">
                              <Text className="text-primary font-bold text-base">
                                {item.label}
                              </Text>
                              <View className="mt-1">
                                <View className="mb-1">
                                  <Text className="text-neutral-500 text-sm">
                                    Current Stock:{" "}
                                    <Text className="text-primary font-semibold">
                                      {item.stock}
                                    </Text>
                                  </Text>
                                </View>
                                <View>
                                  <Text className="text-neutral-500 text-sm">
                                    Rejected:{" "}
                                    <Text className="text-error font-semibold">
                                      {item.rejected}
                                    </Text>
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          <View
                            className={`px-2 py-1 rounded-full ${getStockStatusColor(item.stock, item.lowStockThreshold)} min-w-[80px]`}
                          >
                            <Text className="text-white text-xs font-medium text-center">
                              {getStockStatusText(
                                item.stock,
                                item.lowStockThreshold
                              )}
                            </Text>
                          </View>
                        </View>

                        {/* Low Stock Warning */}
                        {item.stock <= item.lowStockThreshold && (
                          <View className="mt-2 bg-warning/10 rounded-lg p-2">
                            <Text className="text-warning text-xs">
                              {item.stock === 0
                                ? "Out of stock - urgent restock needed"
                                : `Low stock - only ${item.stock} items left`}
                            </Text>
                          </View>
                        )}

                        {/* Rejected Items Warning */}
                        {item.rejected > 0 && (
                          <View className="mt-2 bg-error/10 rounded-lg p-2">
                            <Text className="text-error text-xs">
                              {item.rejected} rejected item(s) - needs
                              inspection
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="bg-white rounded-xl p-4 mt-4 shadow-sm border border-accent-100">
                <Text className="text-primary text-lg font-bold mb-3">
                  Actions
                </Text>

                <View className="flex-row justify-between mb-2">
                  <TouchableOpacity
                    className="bg-primary rounded-lg py-3 px-4 flex-1 mr-2 items-center flex-row justify-center"
                    onPress={() => handleEditUser(selectedUser)}
                  >
                    <Edit2 size={16} color="white" />
                    <Text className="text-white font-semibold ml-2 text-sm">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`rounded-lg py-3 px-4 flex-1 mx-2 items-center flex-row justify-center ${
                      selectedUser.status === "active"
                        ? "bg-error"
                        : "bg-success"
                    }`}
                    onPress={() => handleToggleStatus(selectedUser)}
                  >
                    <Text className="text-white font-semibold text-sm">
                      {selectedUser.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="bg-error/20 rounded-lg py-3 px-4 items-center flex-row justify-center mt-2"
                  onPress={() => handleDeleteUser(selectedUser)}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text className="text-error font-semibold ml-2 text-sm">
                    Delete Cashier
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        title="Add New Cashier"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <Text className="text-primary text-lg font-bold mb-3">
              Cashier Information
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  Username *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChangeText={(text) =>
                    setNewUser((prev) => ({ ...prev, username: text }))
                  }
                />
              </View>

              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  Full Name *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChangeText={(text) =>
                    setNewUser((prev) => ({ ...prev, name: text }))
                  }
                />
              </View>

              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  Password *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter password"
                  secureTextEntry
                  value={newUser.password}
                  onChangeText={(text) =>
                    setNewUser((prev) => ({ ...prev, password: text }))
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary rounded-lg py-3 px-4 mt-6 items-center"
              onPress={handleSaveNewUser}
            >
              <Text className="text-white font-semibold text-lg">
                Add Cashier
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Cashier"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <Text className="text-primary text-lg font-bold mb-3">
              Edit Cashier Information
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  Username *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter username"
                  value={editUser.username}
                  onChangeText={(text) =>
                    setEditUser((prev) => ({ ...prev, username: text }))
                  }
                />
              </View>

              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  Full Name *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter full name"
                  value={editUser.name}
                  onChangeText={(text) =>
                    setEditUser((prev) => ({ ...prev, name: text }))
                  }
                />
              </View>

              <View>
                <Text className="text-neutral-500 text-sm mb-2">
                  New Password (leave blank to keep current)
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary text-sm"
                  placeholder="Enter new password"
                  secureTextEntry
                  value={editUser.password}
                  onChangeText={(text) =>
                    setEditUser((prev) => ({ ...prev, password: text }))
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary rounded-lg py-3 px-4 mt-6 items-center"
              onPress={handleSaveEditUser}
            >
              <Text className="text-white font-semibold text-lg">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Users;

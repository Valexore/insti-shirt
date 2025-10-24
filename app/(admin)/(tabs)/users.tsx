import { Edit2, Trash2, UserPlus } from "lucide-react-native";
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
import Modal from "../../components/Modal"; // Adjust path as needed

// Sample images - replace with your actual images
const extraSmallImg = require("../../../assets/images/size-shirt/extra-small.png");
const smallImg = require("../../../assets/images/size-shirt/small.png");
const mediumImg = require("../../../assets/images/size-shirt/medium.png");
const largeImg = require("../../../assets/images/size-shirt/large.png");
const xlImg = require("../../../assets/images/size-shirt/extra-large.png");
const xxlImg = require("../../../assets/images/size-shirt/extra-extra-large.png");
const xxxlImg = require("../../../assets/images/size-shirt/extra-extra-extra-large.png");

// Stock data structure with rejected items
const stockData = [
  {
    key: "xs",
    label: "Extra Small",
    image: extraSmallImg,
    stock: 15,
    rejected: 2,
    lowStockThreshold: 5,
  },
  {
    key: "small",
    label: "Small",
    image: smallImg,
    stock: 20,
    rejected: 1,
    lowStockThreshold: 5,
  },
  {
    key: "medium",
    label: "Medium",
    image: mediumImg,
    stock: 25,
    rejected: 0,
    lowStockThreshold: 5,
  },
  {
    key: "large",
    label: "Large",
    image: largeImg,
    stock: 18,
    rejected: 3,
    lowStockThreshold: 5,
  },
  {
    key: "xl",
    label: "Extra Large",
    image: xlImg,
    stock: 12,
    rejected: 1,
    lowStockThreshold: 5,
  },
  {
    key: "xxl",
    label: "2X Large",
    image: xxlImg,
    stock: 8,
    rejected: 2,
    lowStockThreshold: 5,
  },
  {
    key: "xxxl",
    label: "3X Large",
    image: xxxlImg,
    stock: 3,
    rejected: 1,
    lowStockThreshold: 5,
  },
];

// Sample user data
const initialUsers = [
  {
    id: "1",
    username: "juan_cruz",
    name: "Juan Dela Cruz",
    password: "••••••",
    status: "active",
    totalStock: 450,
    todayRestock: 5,
    totalSold: 125,
    todaySold: 8,
    totalRevenue: 312500,
    todayRevenue: 20000,
    totalRejected: 10,
    todayRejected: 2,
    lastActive: "2 hours ago",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    username: "maria_santos",
    name: "Maria Santos",
    password: "••••••",
    status: "active",
    totalStock: 320,
    todayRestock: 12,
    totalSold: 98,
    todaySold: 15,
    totalRevenue: 245000,
    todayRevenue: 37500,
    totalRejected: 8,
    todayRejected: 1,
    lastActive: "30 minutes ago",
    joinDate: "2024-02-10",
  },
  {
    id: "3",
    username: "pedro_reyes",
    name: "Pedro Reyes",
    password: "••••••",
    status: "active",
    totalStock: 520,
    todayRestock: 8,
    totalSold: 156,
    todaySold: 10,
    totalRevenue: 390000,
    todayRevenue: 25000,
    totalRejected: 15,
    todayRejected: 3,
    lastActive: "1 hour ago",
    joinDate: "2023-11-20",
  },
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "stocks">("summary");

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
      id: user.id,
      username: user.username,
      name: user.name,
      password: "", // Empty for security
    });
    setEditModalVisible(true);
    setModalVisible(false);
  };

  const handleSaveNewUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Check if username already exists
    if (users.find((user) => user.username === newUser.username)) {
      Alert.alert("Error", "Username already exists");
      return;
    }

    const userToAdd = {
      id: Date.now().toString(),
      username: newUser.username,
      name: newUser.name,
      password: "••••••",
      status: "active",
      totalStock: 0,
      todayRestock: 0,
      totalSold: 0,
      todaySold: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      totalRejected: 0,
      todayRejected: 0,
      lastActive: "Never",
      joinDate: new Date().toISOString().split("T")[0],
    };

    setUsers([...users, userToAdd]);
    setAddModalVisible(false);
    setNewUser({ username: "", name: "", password: "" });
    Alert.alert("Success", "Cashier added successfully");
  };

  const handleSaveEditUser = () => {
    if (!editUser.username || !editUser.name) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editUser.id
        ? {
            ...user,
            username: editUser.username,
            name: editUser.name,
            ...(editUser.password && { password: "••••••" }),
          }
        : user
    );

    setUsers(updatedUsers);
    setEditModalVisible(false);
    setEditUser({ id: "", username: "", name: "", password: "" });
    Alert.alert("Success", "Cashier updated successfully");
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      "Delete Cashier",
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const filteredUsers = users.filter((u) => u.id !== user.id);
            setUsers(filteredUsers);
            setModalVisible(false);
            Alert.alert("Success", "Cashier deleted successfully");
          },
        },
      ]
    );
  };

  const handleToggleStatus = (user: any) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id
        ? { ...u, status: u.status === "active" ? "inactive" : "active" }
        : u
    );

    setUsers(updatedUsers);
    setModalVisible(false);
    Alert.alert(
      "Success",
      `Cashier ${user.status === "active" ? "deactivated" : "activated"} successfully`
    );
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

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-12 pb-4">
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
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary text-xl font-bold">
            Cashiers ({users.length})
          </Text>
          <Text className="text-neutral-500 text-sm">
            {users.filter((u) => u.status === "active").length} active
          </Text>
        </View>

        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100"
            onPress={() => handleUserPress(user)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-primary font-bold text-lg">
                    {user.name}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${getStatusColor(user.status)}`}
                  >
                    <Text className="text-white text-xs font-medium">
                      {getStatusText(user.status)}
                    </Text>
                  </View>
                </View>

                <Text className="text-neutral-500 text-sm mb-3">
                  @{user.username}
                </Text>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between">
                  {/* Total Stock */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-primary font-bold text-lg">
                      {user.totalStock}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Total Stock
                    </Text>
                  </View>

                  {/* Today Restock */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-success font-bold text-lg">
                      {user.todayRestock}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Today Restock
                    </Text>
                  </View>

                  {/* Total Sold */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-secondary font-bold text-lg">
                      {user.totalSold}
                    </Text>
                    <Text className="text-neutral-500 text-xs">Total Sold</Text>
                  </View>

                  {/* Today Sold */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-warning font-bold text-lg">
                      {user.todaySold}
                    </Text>
                    <Text className="text-neutral-500 text-xs">Today Sold</Text>
                  </View>

                  {/* Total Rejected */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-error font-bold text-lg">
                      {user.totalRejected}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Total Rejected
                    </Text>
                  </View>

                  {/* Today Rejected */}
                  <View className="w-[48%] mb-3">
                    <Text className="text-orange-500 font-bold text-lg">
                      {user.todayRejected}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Today Rejected
                    </Text>
                  </View>

                  {/* Total Revenue */}
                  <View className="w-[48%]">
                    <Text className="text-purple-600 font-bold text-lg">
                      {formatCurrency(user.totalRevenue)}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Total Revenue
                    </Text>
                  </View>

                  {/* Today Revenue */}
                  <View className="w-[48%]">
                    <Text className="text-green-600 font-bold text-lg">
                      {formatCurrency(user.todayRevenue)}
                    </Text>
                    <Text className="text-neutral-500 text-xs">
                      Today Revenue
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-neutral-500 text-xs">
                    Last active: {user.lastActive}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
                  className={`font-medium ${
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
                  className={`font-medium ${
                    activeTab === "stocks" ? "text-primary" : "text-neutral-500"
                  }`}
                >
                  Stocks Summary
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
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
                        <Text className="text-neutral-500">Username</Text>
                        <Text className="text-primary font-medium">
                          @{selectedUser.username}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500">Status</Text>
                        <View
                          className={`px-2 py-1 rounded-full ${getStatusColor(selectedUser.status)}`}
                        >
                          <Text className="text-white text-xs font-medium">
                            {getStatusText(selectedUser.status)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500">Join Date</Text>
                        <Text className="text-primary font-medium">
                          {selectedUser.joinDate}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-neutral-500">Last Active</Text>
                        <Text className="text-primary font-medium">
                          {selectedUser.lastActive}
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
                        <Text className="text-primary font-bold text-xl">
                          {selectedUser.totalStock}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Stock
                        </Text>
                      </View>

                      {/* Today Restock */}
                      <View className="bg-success/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-success font-bold text-xl">
                          {selectedUser.todayRestock}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Restock
                        </Text>
                      </View>

                      {/* Total Sold */}
                      <View className="bg-secondary/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-secondary font-bold text-xl">
                          {selectedUser.totalSold}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Sold
                        </Text>
                      </View>

                      {/* Today Sold */}
                      <View className="bg-warning/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-warning font-bold text-xl">
                          {selectedUser.todaySold}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Sold
                        </Text>
                      </View>

                      {/* Total Rejected */}
                      <View className="bg-error/5 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-error font-bold text-xl">
                          {selectedUser.totalRejected}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Rejected
                        </Text>
                      </View>

                      {/* Today Rejected */}
                      <View className="bg-orange-100 rounded-lg p-3 mb-2 w-[48%] items-center">
                        <Text className="text-orange-500 font-bold text-xl">
                          {selectedUser.todayRejected}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Today Rejected
                        </Text>
                      </View>

                      {/* Total Revenue */}
                      <View className="bg-purple-100 rounded-lg p-3 w-[48%] items-center">
                        <Text className="text-purple-600 font-bold text-xl">
                          {formatCurrency(selectedUser.totalRevenue)}
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center">
                          Total Revenue
                        </Text>
                      </View>

                      {/* Today Revenue */}
                      <View className="bg-green-100 rounded-lg p-3 w-[48%] items-center">
                        <Text className="text-green-600 font-bold text-xl">
                          {formatCurrency(selectedUser.todayRevenue)}
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
                              className="w-12 h-12 rounded-lg mr-3"
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
                            className={`px-2 py-1 rounded-full ${getStockStatusColor(item.stock, item.lowStockThreshold)}`}
                          >
                            <Text className="text-white text-xs font-medium">
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
                    <Text className="text-white font-semibold ml-2">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`rounded-lg py-3 px-4 flex-1 mx-2 items-center flex-row justify-center ${
                      selectedUser.status === "active"
                        ? "bg-error"
                        : "bg-success"
                    }`}
                    onPress={() => handleToggleStatus(selectedUser)}
                  >
                    <Text className="text-white font-semibold">
                      {selectedUser.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="bg-error/20 rounded-lg py-3 px-4 items-center flex-row justify-center"
                  onPress={() => handleDeleteUser(selectedUser)}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text className="text-error font-semibold ml-2">
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
                  className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-primary"
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
    </View>
  );
};

export default Users;

// app/(user)/(tabs)/index.tsx
import Loading from "@/app/components/Loading";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronRight,
  Filter,
  LogOut,
  Package,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  activityService,
  itemService,
  userService,
} from "../../../services/database";
import Modal from "../../components/Modal";

interface UserData {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface UserStats {
  todaySold: number;
  todayRevenue: number;
  todayRestock: number;
  totalSold: number;
  totalRevenue: number;
  lastActive: string;
}

interface LowStockItem {
  key: string;
  label: string;
  stock: number;
  lowStockThreshold: number;
}

interface RecentActivity {
  id: number;
  type: "sale" | "restock" | "login" | "rejected" | "returned";
  description: string;
  timestamp: string;
  amount?: number;
  items?: string;
}

interface ActivityFilters {
  timeRange: "all" | "today" | "week" | "month";
  type: "all" | "sale" | "restock" | "login" | "rejected" | "returned";
  size: "all" | string;
}

const { width: screenWidth } = Dimensions.get("window");

const UserIndex = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    todaySold: 0,
    todayRevenue: 0,
    todayRestock: 0,
    totalSold: 0,
    totalRevenue: 0,
    lastActive: "Never",
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [allActivities, setAllActivities] = useState<RecentActivity[]>([]);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({
    timeRange: "all",
    type: "all",
    size: "all",
  });
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Calculate responsive values
  const cardWidth = (screenWidth - 48) / 2;
  const isSmallScreen = screenWidth < 375;

  // Parse user data from params (only once on mount)
  useEffect(() => {
    const parseUserData = () => {
      if (params.user) {
        try {
          const userData = JSON.parse(params.user as string);
          return userData;
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Fallback: try to get from individual params
          if (params.userId && params.userName) {
            return {
              id: parseInt(params.userId as string),
              username:
                (params.userUsername as string) || (params.userId as string),
              name: params.userName as string,
              role: (params.userRole as string) || "cashier",
            };
          }
        }
      }
      return null;
    };

    const userData = parseUserData();
    setCurrentUser(userData);
  }, []);

  // Load user stats, low stock items, total stock, and recent activities
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);

        // Load user-specific stats
        const user = await userService.getUserById(currentUser.id);
        if (user) {
          setUserStats({
            todaySold: user.today_sold || 0,
            todayRevenue: user.today_revenue || 0,
            todayRestock: user.today_restock || 0,
            totalSold: user.total_sold || 0,
            totalRevenue: user.total_revenue || 0,
            lastActive: user.last_active || "Never",
          });
        }

        // Load items data and calculate total stock
        const items = await itemService.getItems();
        const enabledItems = items.filter((item: any) => item.enabled);
        const totalStockCount = enabledItems.reduce(
          (sum: number, item: any) => sum + (item.stock || 0),
          0
        );
        setTotalStock(totalStockCount);

        // Load low stock items
        const lowStock = enabledItems
          .filter(
            (item: any) => (item.stock || 0) <= (item.low_stock_threshold || 5)
          )
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5,
          }));

        setLowStockItems(lowStock);

        // Load sizes from current inventory for filters
        const sizes = new Set<string>();
        enabledItems.forEach((item) => {
          if (item.key) {
            // Convert size keys to display format (XS, S, M, L, XL, XXL, XXXL)
            const sizeDisplay = getSizeDisplayName(item.key);
            sizes.add(sizeDisplay);
          }
        });
        setAvailableSizes(
          Array.from(sizes).sort((a, b) => {
            // Sort sizes in logical order
            const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
            return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
          })
        );

        // Load recent activities for current cashier
        await loadRecentActivities();
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Fallback: if no user from params, try to get from database
  useEffect(() => {
    const loadFallbackUser = async () => {
      if (currentUser) return;

      try {
        const users = await userService.getUsers();
        const cashierUser = users.find(
          (user: any) => user.role === "cashier" && user.status === "active"
        );
        if (cashierUser) {
          const userData = {
            id: cashierUser.id,
            username: cashierUser.username,
            name: cashierUser.name,
            role: cashierUser.role,
          };
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error loading fallback user:", error);
      }
    };

    const timer = setTimeout(() => {
      if (!currentUser) {
        loadFallbackUser();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const loadRecentActivities = async () => {
    if (!currentUser) {
      console.log("No current user found");
      return;
    }

    try {
      console.log("Loading activities for user:", currentUser.id);

      // Get limited activities for dashboard (5 items)
      const recentActivitiesData = await activityService.getUserActivities(
        currentUser.id,
        5
      );
      console.log("Recent activities from database:", recentActivitiesData);

      const formattedRecentActivities: RecentActivity[] =
        recentActivitiesData.map((activity) => ({
          id: activity.id,
          type: activity.type as
            | "sale"
            | "restock"
            | "login"
            | "rejected"
            | "returned",
          description: activity.description,
          timestamp: activity.timestamp,
          amount: activity.amount || undefined,
          items: activity.items || undefined,
        }));

      // Get ALL activities for the "View All" modal using the new method
      const allActivitiesData = await activityService.getAllUserActivities(
        currentUser.id
      );
      console.log("All activities from database:", allActivitiesData);

      const formattedAllActivities: RecentActivity[] = allActivitiesData.map(
        (activity) => ({
          id: activity.id,
          type: activity.type as
            | "sale"
            | "restock"
            | "login"
            | "rejected"
            | "returned",
          description: activity.description,
          timestamp: activity.timestamp,
          amount: activity.amount || undefined,
          items: activity.items || undefined,
        })
      );

      console.log("Formatted recent activities:", formattedRecentActivities);
      console.log("Formatted all activities:", formattedAllActivities);

      setRecentActivities(formattedRecentActivities);
      setAllActivities(formattedAllActivities);
    } catch (error) {
      console.error("Error loading recent activities:", error);
      // Fallback: if getAllUserActivities doesn't exist, use the limited data for both
      try {
        const fallbackActivities = await activityService.getUserActivities(
          currentUser.id,
          50
        );
        const formattedFallback: RecentActivity[] = fallbackActivities.map(
          (activity) => ({
            id: activity.id,
            type: activity.type as
              | "sale"
              | "restock"
              | "login"
              | "rejected"
              | "returned",
            description: activity.description,
            timestamp: activity.timestamp,
            amount: activity.amount || undefined,
            items: activity.items || undefined,
          })
        );

        setRecentActivities(formattedFallback.slice(0, 5));
        setAllActivities(formattedFallback);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setRecentActivities([]);
        setAllActivities([]);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (currentUser) {
        // Reload user stats
        const user = await userService.getUserById(currentUser.id);
        if (user) {
          setUserStats({
            todaySold: user.today_sold || 0,
            todayRevenue: user.today_revenue || 0,
            todayRestock: user.today_restock || 0,
            totalSold: user.total_sold || 0,
            totalRevenue: user.total_revenue || 0,
            lastActive: user.last_active || "Never",
          });
        }

        // Reload items data and calculate total stock
        const items = await itemService.getItems();
        const enabledItems = items.filter((item: any) => item.enabled);
        const totalStockCount = enabledItems.reduce(
          (sum: number, item: any) => sum + (item.stock || 0),
          0
        );
        setTotalStock(totalStockCount);

        // Reload low stock items
        const lowStock = enabledItems
          .filter(
            (item: any) => (item.stock || 0) <= (item.low_stock_threshold || 5)
          )
          .map((item: any) => ({
            key: item.key,
            label: item.label,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5,
          }));

        setLowStockItems(lowStock);

        // Reload sizes from current inventory
        const sizes = new Set<string>();
        enabledItems.forEach((item) => {
          if (item.key) {
            const sizeDisplay = getSizeDisplayName(item.key);
            sizes.add(sizeDisplay);
          }
        });
        setAvailableSizes(
          Array.from(sizes).sort((a, b) => {
            const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
            return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
          })
        );

        // Reload recent activities
        await loadRecentActivities();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "shop":
        router.push("/(user)/(tabs)/shop");
        break;
      case "restock":
        router.push("/(user)/(tabs)/restock");
        break;
      case "add-restock":
        router.push("../(restock)/restock_config");
        break;
      case "analytics":
        router.push("/(user)/(tabs)/analytics");
        break;
      default:
        Alert.alert("Action", `${action} clicked`);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return "💰";
      case "restock":
        return "📦";
      case "login":
        return "🔐";
      case "rejected":
        return "❌";
      case "returned":
        return "🔄";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-success";
      case "restock":
        return "text-secondary";
      case "login":
        return "text-primary";
      case "rejected":
        return "text-error";
      case "returned":
        return "text-warning";
      default:
        return "text-neutral-500";
    }
  };

  const getStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return "bg-error";
    if (stock <= threshold) return "bg-warning";
    return "bg-success";
  };

  const getStatusText = (stock: number, threshold: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= threshold) return "Low Stock";
    return "In Stock";
  };

  // Helper function to convert size keys to display names
  const getSizeDisplayName = (sizeKey: string): string => {
    const sizeMap: { [key: string]: string } = {
      xs: "XS",
      small: "S",
      medium: "M",
      large: "L",
      xl: "XL",
      xxl: "XXL",
      xxxl: "XXXL",
    };
    return sizeMap[sizeKey.toLowerCase()] || sizeKey.toUpperCase();
  };

  // Get the most critical low stock item (lowest stock percentage)
  const getMostCriticalLowStockItem = () => {
    if (lowStockItems.length === 0) return null;

    return lowStockItems.reduce((mostCritical, item) => {
      const currentPercentage = (item.stock / item.lowStockThreshold) * 100;
      const mostCriticalPercentage =
        (mostCritical.stock / mostCritical.lowStockThreshold) * 100;
      return currentPercentage < mostCriticalPercentage ? item : mostCritical;
    });
  };

  // Filter activities based on current filters
  const filterActivities = (activities: RecentActivity[]): RecentActivity[] => {
    return activities.filter((activity) => {
      // Time range filter
      if (activityFilters.timeRange !== "all") {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();

        switch (activityFilters.timeRange) {
          case "today":
            const isToday = activityDate.toDateString() === now.toDateString();
            if (!isToday) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (activityDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (activityDate < monthAgo) return false;
            break;
        }
      }

      // Activity type filter
      if (
        activityFilters.type !== "all" &&
        activity.type !== activityFilters.type
      ) {
        return false;
      }

      // Size filter - matches against size keys in activity items
      if (activityFilters.size !== "all") {
        const sizeKey = activityFilters.size.toLowerCase();
        if (!activity.items?.toLowerCase().includes(sizeKey)) {
          return false;
        }
      }

      return true;
    });
  };

  // Filter Modal Component
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      title="Filter Activities"
    >
      <View className="p-4">
        {/* Header with Clear All */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary text-xl font-bold">
            Filter Activities
          </Text>
          <TouchableOpacity
            onPress={() =>
              setActivityFilters({
                timeRange: "all",
                type: "all",
                size: "all",
              })
            }
            className="bg-neutral-100 rounded-lg px-3 py-1"
          >
            <Text className="text-neutral-600 text-sm">Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Filter */}
        <View className="mb-6">
          <Text className="text-primary font-semibold text-lg mb-3">
            Time Range
          </Text>
          <View className="flex-row flex-wrap">
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
            ].map((time) => (
              <TouchableOpacity
                key={time.key}
                onPress={() =>
                  setActivityFilters((prev) => ({
                    ...prev,
                    timeRange: time.key as any,
                  }))
                }
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  activityFilters.timeRange === time.key
                    ? "bg-primary"
                    : "bg-neutral-100"
                }`}
              >
                <Text
                  className={
                    activityFilters.timeRange === time.key
                      ? "text-white font-medium"
                      : "text-neutral-600"
                  }
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Type Filter */}
        <View className="mb-6">
          <Text className="text-primary font-semibold text-lg mb-3">
            Activity Type
          </Text>
          <View className="flex-row flex-wrap">
            {[
              { key: "all", label: "All Types" },
              { key: "sale", label: "Sales", emoji: "💰" },
              { key: "restock", label: "Restocks", emoji: "📦" },
              { key: "login", label: "Logins", emoji: "🔐" },
              { key: "rejected", label: "Rejected", emoji: "❌" },
              { key: "returned", label: "Returned", emoji: "🔄" },
            ].map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() =>
                  setActivityFilters((prev) => ({
                    ...prev,
                    type: type.key as any,
                  }))
                }
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  activityFilters.type === type.key
                    ? "bg-secondary"
                    : "bg-neutral-100"
                }`}
              >
                <Text
                  className={
                    activityFilters.type === type.key
                      ? "text-white font-medium"
                      : "text-neutral-600"
                  }
                >
                  {type.emoji && <Text>{type.emoji} </Text>}
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size Filter */}
        {availableSizes.length > 0 && (
          <View className="mb-6">
            <Text className="text-primary font-semibold text-lg mb-3">
              Size
            </Text>
            <Text className="text-neutral-500 text-sm mb-2">
              Filter by shirt sizes currently in your inventory
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() =>
                    setActivityFilters((prev) => ({ ...prev, size: "all" }))
                  }
                  className={`mr-2 px-4 py-2 rounded-full ${
                    activityFilters.size === "all"
                      ? "bg-success"
                      : "bg-neutral-100"
                  }`}
                >
                  <Text
                    className={
                      activityFilters.size === "all"
                        ? "text-white font-medium"
                        : "text-neutral-600"
                    }
                  >
                    All Sizes
                  </Text>
                </TouchableOpacity>
                {availableSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() =>
                      setActivityFilters((prev) => ({ ...prev, size }))
                    }
                    className={`mr-2 px-4 py-2 rounded-full ${
                      activityFilters.size === size
                        ? "bg-success"
                        : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={
                        activityFilters.size === size
                          ? "text-white font-medium"
                          : "text-neutral-600"
                      }
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            onPress={() =>
              setActivityFilters({
                timeRange: "all",
                type: "all",
                size: "all",
              })
            }
            className="flex-1 bg-neutral-200 rounded-lg py-3 px-4"
          >
            <Text className="text-neutral-600 font-semibold text-center">
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilterModal(false)}
            className="flex-1 bg-primary rounded-lg py-3 px-4"
          >
            <Text className="text-white font-semibold text-center">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <Loading
        message="Loading dashboard..."
        type="spinner"
        fullScreen={true}
      />
    );
  }

  const mostCriticalItem = getMostCriticalLowStockItem();

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Enhanced Header with User Info */}
      <View className="bg-primary px-4 pt-12 pb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <User size={isSmallScreen ? 14 : 16} color="white" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-white text-xl font-bold"
                  numberOfLines={1}
                >
                  {currentUser
                    ? `Welcome, ${currentUser.name}`
                    : "Cashier Dashboard"}
                </Text>
                {currentUser && (
                  <Text
                    className="text-accent-100 text-xs mt-1"
                    numberOfLines={1}
                  >
                    @{currentUser.username} • {currentUser.role}
                  </Text>
                )}
              </View>
            </View>
            <Text className="text-accent-100 text-sm" numberOfLines={1}>
              {currentUser ? "Ready for today's sales!" : "Welcome back!"}
            </Text>
            <Text className="text-accent-100 text-xs mt-1">
              Last active: {userStats.lastActive}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-white/20 rounded-lg p-2 ml-2"
            onPress={handleLogout}
          >
            <LogOut size={isSmallScreen ? 18 : 20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Overview */}
        <View className="px-4 mt-4">
          <Text className="text-primary text-lg font-bold mb-3">
            Quick Overview
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {/* Total Stock Card */}
            <View
              className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Total Stock</Text>
                  <Text className="text-primary text-lg font-bold mt-1">
                    {formatNumber(totalStock)}
                  </Text>
                </View>
                <View className="bg-primary/20 p-1 rounded-lg">
                  <Package size={isSmallScreen ? 16 : 18} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-primary text-xs font-medium mt-1">
                Items in inventory
              </Text>
            </View>

            {/* Low Stock Alert Card */}
            <View
              className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Low Stock</Text>
                  <Text className="text-warning text-lg font-bold mt-1">
                    {lowStockItems.length}
                  </Text>
                </View>
                <View className="bg-warning/20 p-1 rounded-lg">
                  <Text className="text-warning text-sm">⚠️</Text>
                </View>
              </View>
              <Text
                className="text-warning text-xs font-medium mt-1"
                numberOfLines={1}
              >
                {mostCriticalItem
                  ? mostCriticalItem.label
                  : "All items stocked"}
              </Text>
            </View>

            {/* Total Sales Card */}
            <View
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">
                    Total Revenue
                  </Text>
                  <Text className="text-secondary text-lg font-bold mt-1">
                    {formatCurrency(userStats.totalRevenue)}
                  </Text>
                </View>
                <View className="bg-secondary/20 p-1 rounded-lg">
                  <TrendingUp size={isSmallScreen ? 16 : 18} color="#831843" />
                </View>
              </View>
              <Text className="text-secondary text-xs font-medium mt-1">
                All time revenue
              </Text>
            </View>

            {/* Today's Sold Card */}
            <View
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs">Today's Sold</Text>
                  <Text className="text-success text-lg font-bold mt-1">
                    {formatNumber(userStats.todaySold)}
                  </Text>
                </View>
                <View className="bg-success/20 p-1 rounded-lg">
                  <ShoppingCart
                    size={isSmallScreen ? 16 : 18}
                    color="#10B981"
                  />
                </View>
              </View>
              <Text className="text-success text-xs font-medium mt-1">
                Items sold today
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Quick Actions
          </Text>

          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction("shop")}
            >
              <View className="bg-primary/20 p-2 rounded-full mb-2">
                <ShoppingCart size={isSmallScreen ? 20 : 22} color="#3B82F6" />
              </View>
              <Text className="text-primary font-semibold text-center text-sm">
                Process Sale
              </Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Sell Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction("restock")}
            >
              <View className="bg-secondary/20 p-2 rounded-full mb-2">
                <Package size={isSmallScreen ? 20 : 22} color="#831843" />
              </View>
              <Text className="text-secondary font-semibold text-center text-sm">
                View Stock
              </Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                Check Inventory
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-3 shadow-sm border border-accent-100 flex-1 mx-1 items-center"
              onPress={() => handleQuickAction("add-restock")}
            >
              <View className="bg-success/20 p-2 rounded-full mb-2">
                <Text className="text-success text-lg">➕</Text>
              </View>
              <Text className="text-success font-semibold text-center text-sm">
                Add Stock
              </Text>
              <Text className="text-neutral-500 text-xs text-center mt-1">
                New Restock
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {recentActivities.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-lg font-bold">
                Recent Activity
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setShowAllActivitiesModal(true)}
              >
                <Text className="text-primary text-sm font-medium mr-1">
                  View All
                </Text>
                <ChevronRight size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-xl shadow-sm border border-accent-100">
              {recentActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  className={`flex-row items-center p-3 ${
                    index !== recentActivities.length - 1
                      ? "border-b border-accent-100"
                      : ""
                  }`}
                >
                  <View className="bg-primary/10 rounded-full p-2 mr-3">
                    <Text className="text-sm">
                      {getActivityIcon(activity.type)}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-primary font-medium text-sm">
                      {activity.description}
                    </Text>
                    {activity.amount && (
                      <Text className="text-success text-xs font-medium mt-1">
                        {formatCurrency(activity.amount)}
                      </Text>
                    )}
                    {activity.items && (
                      <Text
                        className="text-neutral-500 text-xs mt-1"
                        numberOfLines={1}
                      >
                        {activity.items}
                      </Text>
                    )}
                  </View>

                  <Text className="text-neutral-400 text-xs">
                    {formatTime(activity.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View className="px-4 mt-6 mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-primary text-lg font-bold">
                Low Stock Alerts
              </Text>
              <Text className="text-error text-sm font-medium">
                {lowStockItems.length} item
                {lowStockItems.length !== 1 ? "s" : ""} need attention
              </Text>
            </View>

            <View className="bg-warning/10 rounded-xl p-4 border border-warning/20">
              {lowStockItems.map((item, index) => (
                <View
                  key={item.key}
                  className={`flex-row justify-between items-center py-2 ${
                    index !== lowStockItems.length - 1
                      ? "border-b border-warning/20"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(item.stock, item.lowStockThreshold)}`}
                    />
                    <Text
                      className="text-primary font-medium text-sm flex-1"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center ml-2">
                    <Text className="text-neutral-500 text-xs mr-2">
                      {item.stock} / {item.lowStockThreshold}
                    </Text>
                    <Text
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.stock === 0
                          ? "bg-error/20 text-error"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {getStatusText(item.stock, item.lowStockThreshold)}
                    </Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                className="bg-warning rounded-lg py-2 px-4 mt-3 items-center"
                onPress={() => handleQuickAction("add-restock")}
              >
                <Text className="text-white font-semibold text-sm">
                  Restock Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* All Activities Modal with Filters */}
      <Modal
        visible={showAllActivitiesModal}
        onClose={() => {
          setShowAllActivitiesModal(false);
          // Reset filters when closing modal
          setActivityFilters({
            timeRange: "all",
            type: "all",
            size: "all",
          });
        }}
        title="All Activities"
      >
        <View className="flex-1">
          {/* Filter Header */}
          <View className="bg-white border-b border-accent-100 p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-primary font-semibold text-lg">
                Activity History
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                className="flex-row items-center bg-primary/10 rounded-lg px-3 py-2"
              >
                <Filter size={16} color="#3B82F6" />
                <Text className="text-primary font-medium mr-2 ml-1">
                  Filter
                </Text>
                <Text className="bg-primary text-white rounded-full w-5 h-5 text-xs text-center">
                  {(() => {
                    let count = 0;
                    if (activityFilters.timeRange !== "all") count++;
                    if (activityFilters.type !== "all") count++;
                    if (activityFilters.size !== "all") count++;
                    return count;
                  })()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Filters Display */}
            <View className="flex-row flex-wrap">
              {activityFilters.timeRange !== "all" && (
                <View className="bg-primary/20 rounded-full px-2 py-1 mr-2 mb-1">
                  <Text className="text-primary text-xs">
                    {activityFilters.timeRange.charAt(0).toUpperCase() +
                      activityFilters.timeRange.slice(1)}
                  </Text>
                </View>
              )}
              {activityFilters.type !== "all" && (
                <View className="bg-secondary/20 rounded-full px-2 py-1 mr-2 mb-1">
                  <Text className="text-secondary text-xs">
                    {activityFilters.type.charAt(0).toUpperCase() +
                      activityFilters.type.slice(1)}
                  </Text>
                </View>
              )}
              {activityFilters.size !== "all" && (
                <View className="bg-success/20 rounded-full px-2 py-1 mr-2 mb-1">
                  <Text className="text-success text-xs">
                    Size: {activityFilters.size}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Activities List */}
          <ScrollView className="flex-1">
            <View className="p-4">
              {filterActivities(allActivities).map((activity) => (
                <View
                  key={activity.id}
                  className="flex-row items-start p-3 border-b border-accent-100"
                >
                  <View className="bg-primary/10 rounded-full p-2 mr-3 mt-1">
                    <Text className="text-sm">
                      {getActivityIcon(activity.type)}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-primary font-medium text-base">
                      {activity.description}
                    </Text>
                    {activity.amount && (
                      <Text className="text-success text-sm font-medium mt-1">
                        Amount: {formatCurrency(activity.amount)}
                      </Text>
                    )}
                    {activity.items && (
                      <Text className="text-neutral-500 text-sm mt-1">
                        Items: {activity.items}
                      </Text>
                    )}
                    <Text className="text-neutral-400 text-xs mt-2">
                      {formatDateTime(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}

              {filterActivities(allActivities).length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-neutral-500 text-lg">
                    No activities found
                  </Text>
                  <Text className="text-neutral-400 text-sm mt-2">
                    {allActivities.length === 0
                      ? "Your activities will appear here"
                      : "No activities match your current filters"}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Filter Modal */}
      <FilterModal />
    </View>
  );
};

export default UserIndex;

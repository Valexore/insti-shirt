// app/(analytics)/history_restock.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BackButton } from '../../components/Button';

const HistoryRestock = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [supplierFilter, setSupplierFilter] = useState<'all' | 'Uniforms Inc.' | 'Campus Wear'>('all');

  // Sample restock data
  const restockHistory = [
    {
      id: 'ST001',
      date: '2024-01-15',
      items: 45,
      cost: 11250,
      supplier: 'Uniforms Inc.',
      status: 'completed',
      sizes: { xs: 5, small: 8, medium: 12, large: 10, xl: 6, xxl: 3, xxxl: 1 }
    },
    {
      id: 'ST002',
      date: '2024-01-10',
      items: 32,
      cost: 8000,
      supplier: 'Campus Wear',
      status: 'completed',
      sizes: { xs: 3, small: 6, medium: 8, large: 7, xl: 5, xxl: 2, xxxl: 1 }
    },
    {
      id: 'ST003',
      date: '2024-01-05',
      items: 28,
      cost: 7000,
      supplier: 'Uniforms Inc.',
      status: 'completed',
      sizes: { xs: 2, small: 5, medium: 7, large: 6, xl: 4, xxl: 3, xxxl: 1 }
    },
    {
      id: 'ST004',
      date: '2024-01-01',
      items: 50,
      cost: 12500,
      supplier: 'Campus Wear',
      status: 'completed',
      sizes: { xs: 6, small: 9, medium: 13, large: 11, xl: 7, xxl: 3, xxxl: 1 }
    },
    {
      id: 'ST005',
      date: '2023-12-28',
      items: 40,
      cost: 10000,
      supplier: 'Uniforms Inc.',
      status: 'completed',
      sizes: { xs: 4, small: 7, medium: 10, large: 9, xl: 6, xxl: 3, xxxl: 1 }
    }
  ];

  // Filter items based on search and filters
  const filteredItems = restockHistory.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSupplier = supplierFilter === 'all' || item.supplier === supplierFilter;
    
    const matchesDate = !dateFilter.startDate || !dateFilter.endDate || 
      (item.date >= dateFilter.startDate && item.date <= dateFilter.endDate);
    
    return matchesSearch && matchesSupplier && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString();
  };

const getSizeBreakdown = (sizes: any) => {
  return Object.entries(sizes)
    .filter(([_, count]) => Number(count) > 0)
    .map(([size, count]) => `${size.toUpperCase()}: ${count}`)
    .join(', ');
};

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter({ startDate: '', endDate: '' });
    setSupplierFilter('all');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-blue-500 p-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <BackButton onPress={() => router.back()}/>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-4">
          Restock History
        </Text>
      </View>

      {/* Search and Filters */}
      <View className="p-4 bg-white border-b border-accent-100">
        {/* Search Bar */}
        <TextInput
          className="bg-neutral-50 border border-accent-100 rounded-lg p-4 text-neutral-800 mb-3"
          placeholder="Search by ID or supplier..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Date Range Filter */}
        <View className="flex-row space-x-2 mb-3">
          <View className="flex-1">
            <Text className="text-neutral-500 text-sm mb-1">Start Date</Text>
            <TextInput
              className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-neutral-800"
              placeholder="YYYY-MM-DD"
              value={dateFilter.startDate}
              onChangeText={(text) => setDateFilter(prev => ({ ...prev, startDate: text }))}
            />
          </View>
          <View className="flex-1">
            <Text className="text-neutral-500 text-sm mb-1">End Date</Text>
            <TextInput
              className="bg-neutral-50 border border-accent-100 rounded-lg p-3 text-neutral-800"
              placeholder="YYYY-MM-DD"
              value={dateFilter.endDate}
              onChangeText={(text) => setDateFilter(prev => ({ ...prev, endDate: text }))}
            />
          </View>
        </View>

        {/* Supplier Filter */}
        <View className="mb-3">
          <Text className="text-neutral-500 text-sm mb-2">Supplier</Text>
          <View className="flex-row space-x-2">
            {(['all', 'Uniforms Inc.', 'Campus Wear'] as const).map((supplier) => (
              <TouchableOpacity
                key={supplier}
                className={`flex-1 py-2 rounded-lg ${
                  supplierFilter === supplier ? 'bg-blue-500' : 'bg-neutral-100'
                }`}
                onPress={() => setSupplierFilter(supplier)}
              >
                <Text className={`text-center font-medium text-xs ${
                  supplierFilter === supplier ? 'text-white' : 'text-neutral-600'
                }`}>
                  {supplier === 'all' ? 'All Suppliers' : supplier}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clear Filters */}
        <TouchableOpacity 
          onPress={clearFilters}
          className="bg-neutral-200 rounded-lg py-2 items-center"
        >
          <Text className="text-neutral-600 font-medium">Clear All Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Results Summary */}
      <View className="bg-blue-50 p-3 border-b border-blue-200">
        <Text className="text-blue-700 text-center">
          Showing {filteredItems.length} of {restockHistory.length} restock orders
        </Text>
      </View>

      {/* Restock History List */}
      <ScrollView className="flex-1 p-4">
        {filteredItems.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center">
            <Text className="text-neutral-500 text-lg text-center">
              No restock orders found
            </Text>
            <Text className="text-neutral-400 text-sm text-center mt-2">
              {searchQuery || supplierFilter !== 'all' || dateFilter.startDate ? 
                'Try adjusting your filters' : 
                'No restock orders in history'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-blue-600 font-bold text-lg">{item.id}</Text>
                <View className="bg-green-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Completed</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-neutral-800 font-medium">{item.supplier}</Text>
                <Text className="text-blue-600 font-semibold">
                  {formatNumber(item.items)} items
                </Text>
              </View>

              <View className="bg-blue-50 rounded-lg p-3 mb-3">
                <Text className="text-blue-700 text-sm font-medium mb-1">Size Breakdown:</Text>
                <Text className="text-blue-600 text-xs">{getSizeBreakdown(item.sizes)}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-neutral-500 text-sm">Total Cost</Text>
                  <Text className="text-green-600 font-semibold">{formatCurrency(item.cost)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-neutral-500 text-sm">Date</Text>
                  <Text className="text-neutral-600 font-medium">{item.date}</Text>
                </View>
              </View>

              <View className="mt-2 pt-2 border-t border-accent-100">
                <Text className="text-neutral-400 text-xs">
                  Unit Cost: {formatCurrency(item.cost / item.items)} per item
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryRestock;
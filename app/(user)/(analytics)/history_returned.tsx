// app/(analytics)/history_returned.tsx
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

const HistoryReturned = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'exchanged' | 'refunded'>('all');

  // Sample returned items data
  const returnedItems = [
    {
      id: 'RT001',
      date: '2024-01-15',
      reason: 'Size too small',
      items: 1,
      size: 'Medium',
      status: 'exchanged',
      studentId: '2023-00123',
      studentName: 'Juan Dela Cruz',
      newSize: 'Large'
    },
    {
      id: 'RT002',
      date: '2024-01-14',
      reason: 'Customer changed mind',
      items: 2,
      size: 'Large',
      status: 'refunded',
      studentId: '2023-00456',
      studentName: 'Maria Santos',
      newSize: null
    },
    {
      id: 'RT003',
      date: '2024-01-13',
      reason: 'Wrong item received',
      items: 1,
      size: 'Small',
      status: 'exchanged',
      studentId: '2023-00789',
      studentName: 'Pedro Reyes',
      newSize: 'Medium'
    },
    {
      id: 'RT004',
      date: '2024-01-12',
      reason: 'Fabric allergy',
      items: 1,
      size: 'XL',
      status: 'refunded',
      studentId: '2023-00234',
      studentName: 'Ana Lopez',
      newSize: null
    },
    {
      id: 'RT005',
      date: '2024-01-11',
      reason: 'Color mismatch',
      items: 1,
      size: 'Medium',
      status: 'exchanged',
      studentId: '2023-00567',
      studentName: 'Carlos Garcia',
      newSize: 'Medium'
    }
  ];

  // Filter items based on search and filters
  const filteredItems = returnedItems.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    const matchesDate = !dateFilter.startDate || !dateFilter.endDate || 
      (item.date >= dateFilter.startDate && item.date <= dateFilter.endDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    return status === 'exchanged' ? 'bg-blue-500' : 'bg-purple-500';
  };

  const getStatusText = (status: string) => {
    return status === 'exchanged' ? 'Exchanged' : 'Refunded';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-purple-500 p-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <BackButton onPress={() => router.back()}/>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-4">
          Returned Items History
        </Text>
      </View>

      {/* Search and Filters */}
      <View className="p-4 bg-white border-b border-accent-100">
        {/* Search Bar */}
        <TextInput
          className="bg-neutral-50 border border-accent-100 rounded-lg p-4 text-neutral-800 mb-3"
          placeholder="Search by ID, reason, or student..."
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

        {/* Status Filter */}
        <View className="mb-3">
          <Text className="text-neutral-500 text-sm mb-2">Status</Text>
          <View className="flex-row space-x-2">
            {(['all', 'exchanged', 'refunded'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                className={`flex-1 py-2 rounded-lg ${
                  statusFilter === status ? 'bg-purple-500' : 'bg-neutral-100'
                }`}
                onPress={() => setStatusFilter(status)}
              >
                <Text className={`text-center font-medium ${
                  statusFilter === status ? 'text-white' : 'text-neutral-600'
                }`}>
                  {status === 'all' ? 'All' : status === 'exchanged' ? 'Exchanged' : 'Refunded'}
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
      <View className="bg-purple-50 p-3 border-b border-purple-200">
        <Text className="text-purple-700 text-center">
          Showing {filteredItems.length} of {returnedItems.length} returned items
        </Text>
      </View>

      {/* Returned Items List */}
      <ScrollView className="flex-1 p-4">
        {filteredItems.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center">
            <Text className="text-neutral-500 text-lg text-center">
              No returned items found
            </Text>
            <Text className="text-neutral-400 text-sm text-center mt-2">
              {searchQuery || statusFilter !== 'all' || dateFilter.startDate ? 
                'Try adjusting your filters' : 
                'No returned items in history'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-purple-600 font-bold text-lg">{item.id}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                  <Text className="text-white text-xs font-medium">
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
              
              <Text className="text-neutral-800 font-medium mb-2">{item.reason}</Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-600">Original Size: {item.size}</Text>
                {item.newSize && (
                  <Text className="text-blue-600 font-medium">New Size: {item.newSize}</Text>
                )}
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-purple-600 font-semibold">
                  {item.items} item{item.items !== 1 ? 's' : ''}
                </Text>
                <Text className="text-neutral-500 text-sm">{item.date}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-neutral-500 text-sm">{item.studentName}</Text>
                  <Text className="text-neutral-400 text-xs">ID: {item.studentId}</Text>
                </View>
                <Text className={`text-xs font-medium ${
                  item.status === 'exchanged' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {item.status === 'exchanged' ? 'Size Exchange' : 'Full Refund'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryReturned;
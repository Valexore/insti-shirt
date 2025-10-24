import { Calendar, Download, Eye, Filter, Search, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from '../../components/Modal';

// Sample PDF report data
const sampleReports = [
  {
    id: '1',
    fileName: 'Sales_Report_2024_01_15.pdf',
    title: 'Sales Stock Report - January 15, 2024',
    generatedBy: 'Juan Dela Cruz',
    fileSize: '2.4 MB',
    dateGenerated: '2024-01-15T14:30:00',
    timeRange: 'Weekly',
    totalSales: 12540,
    totalItems: 342,
    pages: 12,
    type: 'sales_stock'
  },
  {
    id: '2',
    fileName: 'Sales_Report_2024_01_08.pdf',
    title: 'Sales Stock Report - January 8, 2024',
    generatedBy: 'Maria Santos',
    fileSize: '1.8 MB',
    dateGenerated: '2024-01-08T09:15:00',
    timeRange: 'Weekly',
    totalSales: 11870,
    totalItems: 298,
    pages: 10,
    type: 'sales_stock'
  },
  {
    id: '3',
    fileName: 'Sales_Report_2024_01_01.pdf',
    title: 'Sales Stock Monthly Report - January 2024',
    generatedBy: 'Admin User',
    fileSize: '3.2 MB',
    dateGenerated: '2024-01-01T16:45:00',
    timeRange: 'Monthly',
    totalSales: 45200,
    totalItems: 1250,
    pages: 18,
    type: 'sales_stock'
  },
  {
    id: '4',
    fileName: 'Sales_Report_2023_12_25.pdf',
    title: 'Sales Stock Report - December 25, 2023',
    generatedBy: 'Pedro Reyes',
    fileSize: '2.1 MB',
    dateGenerated: '2023-12-25T11:20:00',
    timeRange: 'Weekly',
    totalSales: 14200,
    totalItems: 385,
    pages: 11,
    type: 'sales_stock'
  },
  {
    id: '5',
    fileName: 'Sales_Report_2023_12_18.pdf',
    title: 'Sales Stock Report - December 18, 2023',
    generatedBy: 'Juan Dela Cruz',
    fileSize: '1.9 MB',
    dateGenerated: '2023-12-18T13:10:00',
    timeRange: 'Weekly',
    totalSales: 15680,
    totalItems: 412,
    pages: 13,
    type: 'sales_stock'
  },
  {
    id: '6',
    fileName: 'Sales_Report_2023_12_01.pdf',
    title: 'Sales Stock Monthly Report - December 2023',
    generatedBy: 'Admin User',
    fileSize: '3.5 MB',
    dateGenerated: '2023-12-01T15:30:00',
    timeRange: 'Monthly',
    totalSales: 48900,
    totalItems: 1345,
    pages: 20,
    type: 'sales_stock'
  },
  {
    id: '7',
    fileName: 'Sales_Report_2023_11_20.pdf',
    title: 'Sales Stock Report - November 20, 2023',
    generatedBy: 'Maria Santos',
    fileSize: '2.2 MB',
    dateGenerated: '2023-11-20T10:45:00',
    timeRange: 'Weekly',
    totalSales: 13200,
    totalItems: 356,
    pages: 12,
    type: 'sales_stock'
  },
  {
    id: '8',
    fileName: 'Sales_Report_2023_11_01.pdf',
    title: 'Sales Stock Monthly Report - November 2023',
    generatedBy: 'Admin User',
    fileSize: '3.1 MB',
    dateGenerated: '2023-11-01T14:20:00',
    timeRange: 'Monthly',
    totalSales: 51200,
    totalItems: 1420,
    pages: 17,
    type: 'sales_stock'
  }
];

const timeRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' }
];

const Reports = () => {
  const [reports, setReports] = useState(sampleReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter function to handle time range filtering
  const filterReportsByTimeRange = (reports: any[], range: string) => {
    const now = new Date();
    
    return reports.filter(report => {
      const reportDate = new Date(report.dateGenerated);
      
      switch (range) {
        case 'today':
          return reportDate.toDateString() === now.toDateString();
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return reportDate >= startOfWeek;
        case 'month':
          return reportDate.getMonth() === now.getMonth() && 
                 reportDate.getFullYear() === now.getFullYear();
        case 'last_month':
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          return reportDate.getMonth() === lastMonth.getMonth() && 
                 reportDate.getFullYear() === lastMonth.getFullYear();
        case 'Weekly':
          return report.timeRange === 'Weekly';
        case 'Monthly':
          return report.timeRange === 'Monthly';
        case 'all':
        default:
          return true;
      }
    });
  };

  // Filter reports based on search and time range
  const filteredReports = filterReportsByTimeRange(reports, selectedTimeRange).filter(report => {
    return (
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDownloadReport = (report: any) => {
    // Simulate download functionality
    Alert.alert('Download Started', `Downloading ${report.fileName}`);
  };

  const handleDeleteReport = (report: any) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${report.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReports(prev => prev.filter(r => r.id !== report.id));
            Alert.alert('Success', 'Report deleted successfully');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const getTimeRangeColor = (timeRange: string) => {
    switch (timeRange) {
      case 'Weekly': return 'bg-blue-100 text-blue-600';
      case 'Monthly': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const ReportCard = ({ report }: { report: any }) => {
    const { date, time } = formatDate(report.dateGenerated);
    
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-primary font-bold text-lg mb-1">
              {report.title}
            </Text>
            <View className="flex-row items-center mb-2">
              <View className={`px-2 py-1 rounded-full ${getTimeRangeColor(report.timeRange)}`}>
                <Text className="text-xs font-medium">
                  {report.timeRange}
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-neutral-500 text-sm">
            {report.fileSize}
          </Text>
        </View>

        {/* Report Details */}
        <View className="flex-row justify-between mb-3">
          <View className="flex-1">
            <Text className="text-neutral-500 text-sm mb-1">Generated by</Text>
            <Text className="text-primary font-semibold">{report.generatedBy}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-neutral-500 text-sm mb-1">Date Generated</Text>
            <Text className="text-primary font-semibold">{date}</Text>
            <Text className="text-neutral-500 text-xs">{time}</Text>
          </View>
        </View>

        {/* Report Stats */}
        <View className="flex-row justify-between mb-4 bg-primary/5 rounded-lg p-3">
          <View className="items-center">
            <Text className="text-neutral-500 text-xs">Total Sales</Text>
            <Text className="text-secondary font-bold">{formatCurrency(report.totalSales)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-neutral-500 text-xs">Items Sold</Text>
            <Text className="text-primary font-bold">{report.totalItems}</Text>
          </View>
          <View className="items-center">
            <Text className="text-neutral-500 text-xs">Pages</Text>
            <Text className="text-success font-bold">{report.pages}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="flex-1 mr-2 bg-primary rounded-lg py-2 px-3 items-center flex-row justify-center"
            onPress={() => handleViewReport(report)}
          >
            <Eye size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 mx-2 bg-success rounded-lg py-2 px-3 items-center flex-row justify-center"
            onPress={() => handleDownloadReport(report)}
          >
            <Download size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 ml-2 bg-error/20 rounded-lg py-2 px-3 items-center flex-row justify-center"
            onPress={() => handleDeleteReport(report)}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text className="text-error font-semibold text-sm ml-2">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-6 pt-12 pb-4">
        <View className="flex-row items-center">
          <Calendar size={24} color="white" />
          <Text className="text-white text-2xl font-bold ml-3">PDF Reports History</Text>
        </View>
        <Text className="text-accent-100 text-sm mt-1">
          View and manage generated sales stock reports
        </Text>
      </View>

      {/* Search and Filter Bar */}
      <View className="p-4 bg-white border-b border-accent-100">
        <View className="flex-row items-center">
          {/* Search Input */}
          <View className="flex-1 mr-3">
            <View className="relative">
              <Search size={20} color="#6B7280" className="absolute left-3 top-3 z-10" />
              <TextInput
                className="bg-neutral-50 border border-accent-100 rounded-lg pl-10 pr-4 py-3 text-primary"
                placeholder="Search reports by title, user, or filename..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          
          {/* Filter Button */}
          <TouchableOpacity 
            className="bg-primary rounded-lg p-3"
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {selectedTimeRange !== 'all' && (
          <View className="flex-row items-center mt-3">
            <Text className="text-neutral-500 text-sm mr-2">Active filter:</Text>
            <View className="bg-primary/20 rounded-full px-3 py-1">
              <Text className="text-primary text-xs font-medium">
                {timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}
              </Text>
            </View>
            <TouchableOpacity 
              className="ml-2"
              onPress={() => setSelectedTimeRange('all')}
            >
              <Text className="text-error text-xs font-medium">Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reports List */}
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-primary text-lg font-bold">
            Generated Reports ({filteredReports.length})
          </Text>
          <Text className="text-neutral-500 text-sm">
            Sales Stock Reports Only
          </Text>
        </View>

        {filteredReports.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Calendar size={64} color="#9CA3AF" />
            <Text className="text-neutral-500 text-lg font-semibold mt-4">
              No reports found
            </Text>
            <Text className="text-neutral-500 text-center mt-2">
              {searchQuery || selectedTimeRange !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No PDF reports have been generated yet'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            renderItem={({ item }) => <ReportCard report={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Reports"
        showCloseButton={true}
      >
        <View className="p-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <Text className="text-primary text-lg font-bold mb-4">
              Filter by Time Range
            </Text>
            
            <View className="space-y-2">
              {timeRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-row items-center justify-between p-3 rounded-lg border ${
                    selectedTimeRange === option.value 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-neutral-50 border-accent-100'
                  }`}
                  onPress={() => {
                    setSelectedTimeRange(option.value);
                    setShowFilterModal(false);
                  }}
                >
                  <Text className={`font-medium ${
                    selectedTimeRange === option.value ? 'text-primary' : 'text-neutral-700'
                  }`}>
                    {option.label}
                  </Text>
                  {selectedTimeRange === option.value && (
                    <View className="w-3 h-3 bg-primary rounded-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              className="mt-6 bg-primary rounded-lg py-3 px-4 items-center"
              onPress={() => {
                setSelectedTimeRange('all');
                setShowFilterModal(false);
              }}
            >
              <Text className="text-white font-semibold text-lg">Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Details Modal */}
      <Modal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Details"
        showCloseButton={true}
      >
        {selectedReport && (
          <View className="p-4">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
              <Text className="text-primary text-2xl font-bold mb-4 text-center">
                {selectedReport.title}
              </Text>

              <View className="space-y-4">
                {/* Basic Info */}
                <View className="bg-primary/5 rounded-lg p-4">
                  <Text className="text-primary font-bold text-lg mb-3">Report Information</Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Filename</Text>
                      <Text className="text-primary font-medium">{selectedReport.fileName}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Generated by</Text>
                      <Text className="text-primary font-medium">{selectedReport.generatedBy}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">File Size</Text>
                      <Text className="text-primary font-medium">{selectedReport.fileSize}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Pages</Text>
                      <Text className="text-primary font-medium">{selectedReport.pages}</Text>
                    </View>
                  </View>
                </View>

                {/* Date & Time */}
                <View className="bg-success/5 rounded-lg p-4">
                  <Text className="text-success font-bold text-lg mb-3">Generation Details</Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Date Generated</Text>
                      <Text className="text-success font-medium">
                        {formatDate(selectedReport.dateGenerated).date}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Time Generated</Text>
                      <Text className="text-success font-medium">
                        {formatDate(selectedReport.dateGenerated).time}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Time Range</Text>
                      <View className={`px-2 py-1 rounded-full ${getTimeRangeColor(selectedReport.timeRange)}`}>
                        <Text className="text-xs font-medium">
                          {selectedReport.timeRange}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sales Data */}
                <View className="bg-secondary/5 rounded-lg p-4">
                  <Text className="text-secondary font-bold text-lg mb-3">Sales Summary</Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Total Sales</Text>
                      <Text className="text-secondary font-bold text-lg">
                        {formatCurrency(selectedReport.totalSales)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-500">Items Sold</Text>
                      <Text className="text-primary font-bold text-lg">
                        {selectedReport.totalItems}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between mt-6">
                <TouchableOpacity 
                  className="flex-1 mr-2 bg-success rounded-lg py-3 px-4 items-center flex-row justify-center"
                  onPress={() => {
                    handleDownloadReport(selectedReport);
                    setShowReportModal(false);
                  }}
                >
                  <Download size={20} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Download</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 ml-2 bg-error/20 rounded-lg py-3 px-4 items-center flex-row justify-center"
                  onPress={() => {
                    handleDeleteReport(selectedReport);
                    setShowReportModal(false);
                  }}
                >
                  <Trash2 size={20} color="#EF4444" />
                  <Text className="text-error font-semibold text-lg ml-2">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default Reports;
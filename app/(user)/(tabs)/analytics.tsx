import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const Analytics = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [isPrinting, setIsPrinting] = useState(false);

  // Sample analytics data with Philippine Peso
  const analyticsData = {
    overview: {
      totalRevenue: 12540,
      totalItemsSold: 342,
      averageSale: 36.67,
      restockCost: 8450,
      profit: 4090,
      profitMargin: 32.6
    },
    
    salesData: {
      week: [1250, 1890, 1420, 2100, 1780, 1950, 2250],
      month: [12540, 11870, 14200, 15680],
      quarter: [45200, 48900, 51200, 52500]
    },
    
    restockData: {
      week: [45, 28, 35, 52, 40, 38, 45],
      month: [200, 185, 220, 240],
      quarter: [850, 920, 880, 950]
    },
    
    topSellingSizes: [
      { size: 'Medium', sold: 89, revenue: 3204, percentage: 26 },
      { size: 'Large', sold: 76, revenue: 2736, percentage: 22 },
      { size: 'Small', sold: 65, revenue: 2340, percentage: 19 },
      { size: 'XL', sold: 52, revenue: 1872, percentage: 15 },
      { size: 'XXL', sold: 35, revenue: 1260, percentage: 10 },
      { size: 'XS', sold: 18, revenue: 648, percentage: 5 },
      { size: 'XXXL', sold: 7, revenue: 252, percentage: 3 }
    ],
    
    stockTurnover: [
      { size: 'Medium', turnover: 3.2, days: 9.4 },
      { size: 'Large', turnover: 2.8, days: 10.7 },
      { size: 'Small', turnover: 2.5, days: 12.0 },
      { size: 'XL', turnover: 2.1, days: 14.3 },
      { size: 'XXL', turnover: 1.8, days: 16.7 },
      { size: 'XS', turnover: 1.2, days: 25.0 },
      { size: 'XXXL', turnover: 0.8, days: 37.5 }
    ],
    
    performanceMetrics: {
      sellThroughRate: 76.4,
      stockoutFrequency: 12.3,
      grossMarginReturn: 4.2,
      inventoryAccuracy: 94.7
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString();
  };

  const generatePDF = async () => {
    try {
      setIsPrinting(true);

      const htmlContent = generateHTMLContent();
      
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      // Share the PDF file
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Inventory Analytics Report',
        UTI: 'com.adobe.pdf'
      });

      Alert.alert('Success', 'PDF report generated and ready to share!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const generateHTMLContent = () => {
    const timestamp = new Date().toLocaleString();
    const timeRangeLabel = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inventory Analytics Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #2c5aa0;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
            color: #666;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            background-color: #f0f0f0;
            padding: 8px 12px;
            font-weight: bold;
            border-left: 4px solid #2c5aa0;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          th {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .text-bold {
            font-weight: bold;
          }
          .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
          }
          .performance-good { color: #28a745; }
          .performance-warning { color: #ffc107; }
          .performance-poor { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVENTORY ANALYTICS REPORT</h1>
          <h2>Performance Insights and Inventory Metrics</h2>
          <div class="info-row">
            <div>Generated on: ${timestamp}</div>
            <div>Time Range: ${timeRangeLabel}</div>
          </div>
        </div>

        <!-- Financial Overview -->
        <div class="section">
          <div class="section-title">FINANCIAL OVERVIEW</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">${formatCurrency(analyticsData.overview.totalRevenue)}</div>
              <div style="color: #28a745; font-size: 10px;">↑ 12.4% from last ${timeRange}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Items Sold</div>
              <div class="stat-value">${formatNumber(analyticsData.overview.totalItemsSold)}</div>
              <div style="color: #28a745; font-size: 10px;">↑ 8.2% from last ${timeRange}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Profit</div>
              <div class="stat-value">${formatCurrency(analyticsData.overview.profit)}</div>
              <div style="color: #28a745; font-size: 10px;">${analyticsData.overview.profitMargin}% margin</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Average Sale</div>
              <div class="stat-value">₱${analyticsData.overview.averageSale.toFixed(2)}</div>
              <div style="color: #ffc107; font-size: 10px;">↓ 2.1% from last ${timeRange}</div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="section">
          <div class="section-title">PERFORMANCE METRICS</div>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sell-Through Rate</td>
                <td>${analyticsData.performanceMetrics.sellThroughRate}%</td>
                <td>>70%</td>
                <td class="performance-good">Excellent</td>
              </tr>
              <tr>
                <td>Stockout Frequency</td>
                <td>${analyticsData.performanceMetrics.stockoutFrequency}%</td>
                <td><10%</td>
                <td class="performance-warning">Needs Improvement</td>
              </tr>
              <tr>
                <td>GMROI</td>
                <td>${analyticsData.performanceMetrics.grossMarginReturn}x</td>
                <td>>3x</td>
                <td class="performance-good">Good</td>
              </tr>
              <tr>
                <td>Inventory Accuracy</td>
                <td>${analyticsData.performanceMetrics.inventoryAccuracy}%</td>
                <td>>95%</td>
                <td class="performance-good">High</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Top Selling Sizes -->
        <div class="section">
          <div class="section-title">TOP SELLING SIZES</div>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Market Share</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.topSellingSizes.map(item => `
                <tr>
                  <td>${item.size}</td>
                  <td class="text-right">${formatNumber(item.sold)}</td>
                  <td class="text-right">${formatCurrency(item.revenue)}</td>
                  <td class="text-right">${item.percentage}%</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td class="text-right">${formatNumber(analyticsData.topSellingSizes.reduce((sum, item) => sum + item.sold, 0))}</td>
                <td class="text-right">${formatCurrency(analyticsData.topSellingSizes.reduce((sum, item) => sum + item.revenue, 0))}</td>
                <td class="text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Stock Turnover -->
        <div class="section">
          <div class="section-title">STOCK TURNOVER RATES</div>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Turnover Rate</th>
                <th>Days Inventory</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.stockTurnover.map(item => {
                const performance = item.turnover >= 2.5 ? 'performance-good' : 
                                  item.turnover >= 1.5 ? 'performance-warning' : 'performance-poor';
                const performanceText = item.turnover >= 2.5 ? 'Excellent' : 
                                      item.turnover >= 1.5 ? 'Good' : 'Needs Attention';
                return `
                  <tr>
                    <td>${item.size}</td>
                    <td class="text-right">${item.turnover}x</td>
                    <td class="text-right">${item.days}</td>
                    <td class="${performance}">${performanceText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Sales Data -->
        <div class="section">
          <div class="section-title">SALES DATA - ${timeRangeLabel.toUpperCase()}</div>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Sales</th>
                <th>Restock Units</th>
                <th>Net Change</th>
              </tr>
            </thead>
            <tbody>
              ${getTimeLabels(timeRange).map((label, index) => {
                const sales = analyticsData.salesData[timeRange][index];
                const restock = analyticsData.restockData[timeRange][index];
                const netChange = sales - (restock * 25); // Sample calculation
                return `
                  <tr>
                    <td>${label}</td>
                    <td class="text-right">${formatCurrency(sales)}</td>
                    <td class="text-right">${formatNumber(restock)}</td>
                    <td class="text-right">${formatCurrency(netChange)}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td>TOTAL</td>
                <td class="text-right">${formatCurrency(analyticsData.salesData[timeRange].reduce((a, b) => a + b, 0))}</td>
                <td class="text-right">${formatNumber(analyticsData.restockData[timeRange].reduce((a, b) => a + b, 0))}</td>
                <td class="text-right">${formatCurrency(
                  analyticsData.salesData[timeRange].reduce((a, b) => a + b, 0) - 
                  (analyticsData.restockData[timeRange].reduce((a, b) => a + b, 0) * 25)
                )}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>Report generated by Inventory Management System</div>
          <div>For internal use only</div>
        </div>
      </body>
      </html>
    `;
  };

  const getTimeLabels = (range: string) => {
    switch (range) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'quarter':
        return ['Q1', 'Q2', 'Q3', 'Q4'];
      default:
        return [];
    }
  };

  const getBarWidth = (value: number, max: number) => {
    return (value / max) * (screenWidth - 120);
  };

  const getPerformanceColor = (value: number, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      if (value >= 80) return 'text-success';
      if (value >= 60) return 'text-warning';
      return 'text-error';
    } else {
      if (value <= 5) return 'text-success';
      if (value <= 15) return 'text-warning';
      return 'text-error';
    }
  };

  const SimpleBarChart = ({ data, labels, color = 'primary' }: any) => {
    const maxValue = Math.max(...data);
    
    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-end h-32 mb-2">
          {data.map((value: number, index: number) => (
            <View key={index} className="items-center flex-1">
              <View 
                className={`bg-${color} rounded-t-lg`}
                style={{
                  height: (value / maxValue) * 80,
                  width: (screenWidth - 80) / data.length - 4
                }}
              />
              <Text className="text-neutral-500 text-xs mt-1 text-center">
                {labels[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">
          Analytics Dashboard
        </Text>
        <Text className="text-accent-100 text-sm text-center mt-1">
          Performance insights and inventory metrics
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View className="mx-4 mt-4">
          <View className="bg-white rounded-lg p-1 flex-row border border-accent-100">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                className={`flex-1 py-2 rounded-md ${
                  timeRange === range ? 'bg-primary' : 'bg-transparent'
                }`}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  className={`text-center font-medium ${
                    timeRange === range ? 'text-white' : 'text-neutral-500'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overview Cards */}
        <View className="mx-4 mt-4">
          <Text className="text-primary text-lg font-bold mb-3">
            Financial Overview
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm">Total Revenue</Text>
              <Text className="text-primary text-xl font-bold mt-1">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                ↑ 12.4% from last {timeRange}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm">Items Sold</Text>
              <Text className="text-secondary text-xl font-bold mt-1">
                {analyticsData.overview.totalItemsSold}
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                ↑ 8.2% from last {timeRange}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm">Profit</Text>
              <Text className="text-success text-xl font-bold mt-1">
                {formatCurrency(analyticsData.overview.profit)}
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                {analyticsData.overview.profitMargin}% margin
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm">Avg. Sale</Text>
              <Text className="text-tertiary text-xl font-bold mt-1">
                ₱{analyticsData.overview.averageSale}
              </Text>
              <Text className="text-warning text-xs font-medium mt-1">
                ↓ 2.1% from last {timeRange}
              </Text>
            </View>
          </View>
        </View>

        {/* Sales Chart */}
        <View className="mx-4 mt-6 bg-white rounded-xl p-4 shadow-sm border border-accent-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-lg font-bold">Sales Performance</Text>
            <Text className="text-success text-sm font-medium">
              +12.4% growth
            </Text>
          </View>
          <SimpleBarChart 
            data={analyticsData.salesData[timeRange]}
            labels={getTimeLabels(timeRange)}
            color="primary"
          />
        </View>

        {/* Restock Chart */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm border border-accent-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary text-lg font-bold">Restock Activity</Text>
            <Text className="text-secondary text-sm font-medium">
              {analyticsData.restockData[timeRange].reduce((a, b) => a + b, 0)} units
            </Text>
          </View>
          <SimpleBarChart 
            data={analyticsData.restockData[timeRange]}
            labels={getTimeLabels(timeRange)}
            color="secondary"
          />
        </View>

        {/* Top Selling Sizes */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm border border-accent-100">
          <Text className="text-primary text-lg font-bold mb-4">
            Top Selling Sizes
          </Text>
          
          {analyticsData.topSellingSizes.map((item, index) => (
            <View key={item.size} className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-primary font-medium">{item.size}</Text>
                <View className="flex-row items-center">
                  <Text className="text-neutral-500 text-sm mr-2">
                    {item.sold} sold
                  </Text>
                  <Text className="text-success font-semibold">
                    {formatCurrency(item.revenue)}
                  </Text>
                </View>
              </View>
              
              <View className="w-full bg-accent-100 rounded-full h-2">
                <View 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </View>
              
              <Text className="text-neutral-500 text-xs mt-1">
                {item.percentage}% of total sales
              </Text>
            </View>
          ))}
        </View>

        {/* Stock Turnover */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm border border-accent-100">
          <Text className="text-primary text-lg font-bold mb-4">
            Stock Turnover Rate
          </Text>
          
          {analyticsData.stockTurnover.map((item) => (
            <View key={item.size} className="flex-row justify-between items-center py-2 border-b border-accent-100 last:border-b-0">
              <Text className="text-primary font-medium flex-1">{item.size}</Text>
              
              <View className="flex-row items-center flex-1 justify-end">
                <View className="items-center mr-4">
                  <Text className="text-neutral-500 text-xs">Rate</Text>
                  <Text className={`font-bold ${
                    item.turnover >= 2.5 ? 'text-success' : 
                    item.turnover >= 1.5 ? 'text-warning' : 'text-error'
                  }`}>
                    {item.turnover}x
                  </Text>
                </View>
                
                <View className="items-center">
                  <Text className="text-neutral-500 text-xs">Days</Text>
                  <Text className={`font-bold ${
                    item.days <= 14 ? 'text-success' : 
                    item.days <= 21 ? 'text-warning' : 'text-error'
                  }`}>
                    {item.days}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Metrics */}
        <View className="mx-4 mt-4 mb-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Key Performance Indicators
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm mb-2">Sell-Through Rate</Text>
              <Text className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performanceMetrics.sellThroughRate, 'positive')}`}>
                {analyticsData.performanceMetrics.sellThroughRate}%
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                Excellent
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm mb-2">Stockout Frequency</Text>
              <Text className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performanceMetrics.stockoutFrequency, 'negative')}`}>
                {analyticsData.performanceMetrics.stockoutFrequency}%
              </Text>
              <Text className="text-warning text-xs font-medium mt-1">
                Needs improvement
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm mb-2">GMROI</Text>
              <Text className="text-success text-2xl font-bold">
                {analyticsData.performanceMetrics.grossMarginReturn}x
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                Good return
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 w-[48%]">
              <Text className="text-neutral-500 text-sm mb-2">Inventory Accuracy</Text>
              <Text className="text-success text-2xl font-bold">
                {analyticsData.performanceMetrics.inventoryAccuracy}%
              </Text>
              <Text className="text-success text-xs font-medium mt-1">
                High accuracy
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-accent-100 bg-white">
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="flex-1 mr-2 bg-primary rounded-lg py-3 items-center"
            onPress={() => router.push('/restock')}
          >
            <Text className="text-white font-semibold">View Detailed Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 ml-2 bg-secondary rounded-lg py-3 items-center ${
              isPrinting ? 'opacity-70' : ''
            }`}
            onPress={generatePDF}
            disabled={isPrinting}
          >
            <Text className="text-white font-semibold">
              {isPrinting ? 'Generating PDF...' : 'Print as PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Analytics;
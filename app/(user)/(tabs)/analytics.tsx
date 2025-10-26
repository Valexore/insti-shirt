// app/(tabs)/analytics.tsx
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

const Analytics = () => {
  const router = useRouter();
  const [isPrinting, setIsPrinting] = useState(false);

  // Sample analytics data - all hardcoded for now
  const analyticsData = {
    overview: {
      totalRevenue: 12540,
      totalItemsSold: 342,
      averageSale: 36.67,
      profit: 4090,
      profitMargin: 32.6,
    },

    todayStats: {
      sales: 28,
      revenue: 8372,
      restocks: 45,
      rejected: 3,
      returned: 2,
    },

    topSellingSizes: [
      { size: "Medium", sold: 89, revenue: 3204, percentage: 26 },
      { size: "Large", sold: 76, revenue: 2736, percentage: 22 },
      { size: "Small", sold: 65, revenue: 2340, percentage: 19 },
      { size: "XL", sold: 52, revenue: 1872, percentage: 15 },
    ],

    performanceMetrics: {
      sellThroughRate: 76.4,
      stockoutFrequency: 12.3,
      inventoryAccuracy: 94.7,
    },
  };

  // PDF Generator function (moved from analyticsPdfGenerator.tsx)
  const generateAnalyticsPDF = ({ analyticsData }: { analyticsData: any }) => {
    const timestamp = new Date().toLocaleString();
    
    const formatCurrency = (amount: number) => {
      return `₱${amount.toLocaleString()}`;
    };

    const formatNumber = (number: number) => {
      return number.toLocaleString();
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Analytics Report</title>
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
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SALES ANALYTICS REPORT</h1>
          <div class="info-row">
            <div>Generated on: ${timestamp}</div>
            <div>Period: Today</div>
          </div>
        </div>

        <!-- Financial Overview -->
        <div class="section">
          <div class="section-title">FINANCIAL OVERVIEW</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">${formatCurrency(analyticsData.overview.totalRevenue)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Items Sold</div>
              <div class="stat-value">${formatNumber(analyticsData.overview.totalItemsSold)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Profit</div>
              <div class="stat-value">${formatCurrency(analyticsData.overview.profit)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Average Sale</div>
              <div class="stat-value">₱${analyticsData.overview.averageSale.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <!-- Today's Performance -->
        <div class="section">
          <div class="section-title">TODAY'S PERFORMANCE</div>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Today's Sales</td>
                <td class="text-right">${analyticsData.todayStats.sales}</td>
                <td>${formatCurrency(analyticsData.todayStats.revenue)} revenue</td>
              </tr>
              <tr>
                <td>Restocks</td>
                <td class="text-right">${analyticsData.todayStats.restocks}</td>
                <td>Items added to inventory</td>
              </tr>
              <tr>
                <td>Rejected Items</td>
                <td class="text-right">${analyticsData.todayStats.rejected}</td>
                <td>Quality control issues</td>
              </tr>
              <tr>
                <td>Returned Items</td>
                <td class="text-right">${analyticsData.todayStats.returned}</td>
                <td>Customer returns</td>
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
              ${analyticsData.topSellingSizes.map((item: any) => `
                <tr>
                  <td>${item.size}</td>
                  <td class="text-right">${formatNumber(item.sold)}</td>
                  <td class="text-right">${formatCurrency(item.revenue)}</td>
                  <td class="text-right">${item.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Performance Metrics -->
        <div class="section">
          <div class="section-title">PERFORMANCE METRICS</div>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sell-Through Rate</td>
                <td class="text-right">${analyticsData.performanceMetrics.sellThroughRate}%</td>
                <td>Excellent</td>
              </tr>
              <tr>
                <td>Stockout Frequency</td>
                <td class="text-right">${analyticsData.performanceMetrics.stockoutFrequency}%</td>
                <td>Needs Improvement</td>
              </tr>
              <tr>
                <td>Inventory Accuracy</td>
                <td class="text-right">${analyticsData.performanceMetrics.inventoryAccuracy}%</td>
                <td>High</td>
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

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString();
  };

  const generatePDF = async () => {
    try {
      setIsPrinting(true);

      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0"); 
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();

      const dateStr = `${month}-${day}-${year}`;
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "");
      const fileName = `sale_stock_report_${dateStr}_${timeStr}.pdf`;

      const htmlContent = generateAnalyticsPDF({ analyticsData });

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!FileSystem.documentDirectory) {
        throw new Error("Document directory not available");
      }

      // Define destination path
      const documentsDir = FileSystem.documentDirectory;
      const destinationUri = `${documentsDir}${fileName}`;

      // Copy the file to documents directory
      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri,
      });

      // Clean up the temporary file
      try {
        await FileSystem.deleteAsync(uri);
      } catch (error) {
        console.log('Could not delete temporary file:', error);
      }

      // Show success message with options
      Alert.alert(
        "PDF Saved Successfully!",
        `File saved as: ${fileName}\n\nWhat would you like to do?`,
        [
          {
            text: "View PDF Now",
            onPress: () => viewPDF(destinationUri),
          },
          {
            text: "View Saved Reports",
            onPress: () => viewSavedPDFs(),
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );

      console.log("PDF saved to:", destinationUri);
    } catch (error: any) {
      console.error("Error saving PDF:", error);
      Alert.alert("Error", `Failed to save PDF report: ${error.message}`, [
        { text: "OK" },
      ]);
    } finally {
      setIsPrinting(false);
    }
  };

  const viewPDF = async (pdfUri: string) => {
    try {
      // This will show "Share via" but it's intentional for viewing
      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: "View Sales Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error viewing PDF:", error);
      Alert.alert(
        "Cannot Open PDF",
        "PDF viewer not available on this device. The file has been saved to your device storage.",
        [{ text: "OK" }]
      );
    }
  };

  const getSavedPDFs = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );
      const pdfFiles = files
        .filter(
          (file) =>
            file.endsWith(".pdf") && file.startsWith("sale_stock_report_")
        )
        .map((file) => ({
          name: file,
          uri: `${FileSystem.documentDirectory}${file}`,
        }))
        .sort((a, b) => b.name.localeCompare(a.name));

      return pdfFiles;
    } catch (error) {
      console.error("Error reading saved PDFs:", error);
      return [];
    }
  };

  const viewSavedPDFs = async () => {
    try {
      const savedPDFs = await getSavedPDFs();

      if (savedPDFs.length === 0) {
        Alert.alert(
          "No Saved Reports",
          "You haven't saved any PDF reports yet.",
          [{ text: "OK" }]
        );
        return;
      }

      // Create a list of PDF files for selection
      const pdfOptions: any[] = savedPDFs.map((pdf) => {
        const filename = pdf.name.replace("sale_stock_report_", "").replace(".pdf", "");
        const [datePart, timePart] = filename.split("_");
        
        // Format: MM-DD-YYYY HH:MM:SS
        const formattedName = `${datePart} ${timePart.substring(0, 2)}:${timePart.substring(2, 4)}:${timePart.substring(4, 6)}`;
        
        return {
          text: formattedName,
          onPress: () => viewPDF(pdf.uri),
        };
      });

      // Add cancel option
      pdfOptions.push({
        text: "Cancel",
        style: "cancel",
      });

      Alert.alert("Saved Reports", "Select a report to view:", pdfOptions);
    } catch (error) {
      console.error("Error viewing saved PDFs:", error);
      Alert.alert("Error", "Failed to load saved reports.", [{ text: "OK" }]);
    }
  };

  // Function to get the actual file path for user reference
  const getStorageLocation = () => {
    if (Platform.OS === 'ios') {
      return 'Files app > On My iPhone > Your App Name';
    } else {
      return 'Internal Storage > Android > data > your.package.name > files';
    }
  };

  const StatCard = ({ title, value, subtitle, color = "primary" }: any) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-accent-100">
      <Text className="text-neutral-500 text-sm">{title}</Text>
      <Text className={`text-${color} text-xl font-bold mt-1`}>{value}</Text>
      {subtitle && (
        <Text className="text-success text-xs font-medium mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );

  const QuickActionCard = ({
    title,
    subtitle,
    count,
    color,
    emoji,
    onPress,
  }: any) => (
    <TouchableOpacity className="w-[48%] mb-3" onPress={onPress}>
      <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100 items-center">
        <Text className="text-lg">{emoji}</Text>
        <Text className={`font-semibold mt-2 ${color}`}>{title}</Text>
        <Text className="text-neutral-500 text-sm text-center mt-1">
          {count} today
        </Text>
        <Text className="text-neutral-400 text-xs text-center mt-1">
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-primary p-4">
        <Text className="text-white text-xl font-bold text-center">
          Sales Analytics
        </Text>
        <Text className="text-accent-100 text-sm text-center mt-1">
          Today's performance overview
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Today's Overview */}
        <View className="mb-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Today's Overview
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%]">
              <StatCard
                title="Today's Sales"
                value={analyticsData.todayStats.sales}
                subtitle={`${formatCurrency(analyticsData.todayStats.revenue)} revenue`}
                color="secondary"
              />
            </View>

            <View className="w-[48%]">
              <StatCard
                title="Items Sold"
                value={analyticsData.overview.totalItemsSold}
                subtitle="Total this month"
                color="primary"
              />
            </View>

            <View className="w-[48%]">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(analyticsData.overview.totalRevenue)}
                subtitle={`${analyticsData.overview.profitMargin}% profit margin`}
                color="success"
              />
            </View>

            <View className="w-[48%]">
              <StatCard
                title="Average Sale"
                value={`₱${analyticsData.overview.averageSale}`}
                subtitle="Per transaction"
                color="tertiary"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Quick Views
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <QuickActionCard
              title="Rejected Items"
              subtitle="View detailed history"
              count={analyticsData.todayStats.rejected}
              color="text-orange-500"
              emoji="⚠️"
              onPress={() => router.push("../(analytics)/history_rejected")}
            />

            <QuickActionCard
              title="Returned Items"
              subtitle="View exchange details"
              count={analyticsData.todayStats.returned}
              color="text-purple-500"
              emoji="🔄"
              onPress={() => router.push("../(analytics)/history_returned")}
            />

            <QuickActionCard
              title="Restock History"
              subtitle="View supplier orders"
              count={analyticsData.todayStats.restocks}
              color="text-blue-500"
              emoji="📦"
              onPress={() => router.push("../(analytics)/history_restock")}
            />

            <QuickActionCard
              title="Live Sales"
              subtitle="View real-time data"
              count="Live"
              color="text-green-500"
              emoji="📊"
              onPress={() => router.push("../(tabs)/shop")}
            />
          </View>
        </View>

        {/* Top Selling Sizes */}
        <View className="mb-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Top Selling Sizes
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            {analyticsData.topSellingSizes.map((item, index) => (
              <View
                key={item.size}
                className={`flex-row justify-between items-center py-3 ${index < analyticsData.topSellingSizes.length - 1 ? "border-b border-accent-100" : ""}`}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-primary font-bold text-xs">
                      {item.size.charAt(0)}
                    </Text>
                  </View>
                  <Text className="text-primary font-medium">{item.size}</Text>
                </View>

                <View className="items-end">
                  <Text className="text-primary font-semibold">
                    {item.sold} sold
                  </Text>
                  <Text className="text-success text-xs">
                    {formatCurrency(item.revenue)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        <View className="mb-6">
          <Text className="text-primary text-lg font-bold mb-3">
            Performance Metrics
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm border border-accent-100">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-neutral-600">Sell-Through Rate</Text>
              <Text className="text-success font-semibold">
                {analyticsData.performanceMetrics.sellThroughRate}%
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-t border-accent-100">
              <Text className="text-neutral-600">Stockout Frequency</Text>
              <Text className="text-warning font-semibold">
                {analyticsData.performanceMetrics.stockoutFrequency}%
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-t border-accent-100">
              <Text className="text-neutral-600">Inventory Accuracy</Text>
              <Text className="text-success font-semibold">
                {analyticsData.performanceMetrics.inventoryAccuracy}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-accent-100 bg-white">
        <TouchableOpacity
          className={`bg-secondary rounded-lg py-4 items-center mb-3 ${
            isPrinting ? "opacity-70" : ""
          }`}
          onPress={generatePDF}
          disabled={isPrinting}
        >
          <Text className="text-white text-lg font-semibold">
            {isPrinting ? "Saving PDF..." : "Save as PDF"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary rounded-lg py-3 items-center"
          onPress={viewSavedPDFs}
        >
          <Text className="text-white font-semibold">View Saved Reports</Text>
        </TouchableOpacity>

        <Text className="text-neutral-500 text-xs text-center mt-2">
          PDFs are automatically saved to device storage
        </Text>
      </View>
    </View>
  );
};

export default Analytics;
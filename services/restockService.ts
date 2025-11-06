// services/restockService.ts
import { itemService, userService } from './database';

export const restockService = {
  // Get current stock data from database - ONLY ENABLED ITEMS
  getCurrentStock: async () => {
    try {
      const items = await itemService.getItems();
      return items
        .filter(item => item.enabled) // Only show enabled items
        .map(item => ({
          key: item.key,
          label: item.label,
          image: getImageForSize(item.key),
          stock: item.stock || 0,
          lowStockThreshold: item.low_stock_threshold || 5,
          reserved: item.reserved || 0,
          rejected: item.rejected || 0,
          returned: 0 // You might want to track this separately
        }));
    } catch (error) {
      console.error('Error getting current stock:', error);
      return [];
    }
  },

  // Process restock - update items and user stats
  processRestock: async (restockData: Array<{key: string, amount: number}>, userId: number) => {
    try {
      let totalRestocked = 0;

      // Update each item's stock
      for (const item of restockData) {
        if (item.amount > 0) {
          const dbItem = await itemService.getItemByKey(item.key);
          if (dbItem && dbItem.enabled) { // Only update enabled items
            const newStock = (dbItem.stock || 0) + item.amount;
            await itemService.updateItem(dbItem.id, {
              stock: newStock
            });
            totalRestocked += item.amount;
          }
        }
      }

      // Update user statistics
      if (totalRestocked > 0) {
        const user = await userService.getUserById(userId);
        if (user) {
          await userService.updateUser(userId, {
            today_restock: (user.today_restock || 0) + totalRestocked,
            total_stock: (user.total_stock || 0) + totalRestocked,
            last_active: new Date().toISOString()
          });
        }
      }

      return { success: true, totalRestocked };
    } catch (error) {
      console.error('Error processing restock:', error);
      throw new Error('Failed to process restock');
    }
  }
};

// Helper function to map size keys to images
const getImageForSize = (sizeKey: string) => {
  const imageMap: Record<string, any> = {
    'xs': require('../assets/images/size-shirt/extra-small.png'),
    'small': require('../assets/images/size-shirt/small.png'),
    'medium': require('../assets/images/size-shirt/medium.png'),
    'large': require('../assets/images/size-shirt/large.png'),
    'xl': require('../assets/images/size-shirt/extra-large.png'),
    'xxl': require('../assets/images/size-shirt/extra-extra-large.png'),
    'xxxl': require('../assets/images/size-shirt/extra-extra-extra-large.png'),
  };
  
  return imageMap[sizeKey] || require('../assets/images/size-shirt/medium.png');
};
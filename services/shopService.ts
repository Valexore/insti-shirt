// services/shopService.ts
import { collegeService, itemService, userService } from './database';

// Define proper types
interface SaleData {
  quantities: Record<string, number>;
  customerInfo: any;
  userId: number;
  totalAmount: number;
}

interface RejectedData {
  quantities: Record<string, number>;
  userId: number;
}

interface ReturnedData {
  quantities: Record<string, number>;
  userId: number;
}

export const shopService = {
  // Get available items (only enabled ones)
  getAvailableItems: async () => {
    try {
      const items = await itemService.getItems();
      // Filter only enabled items and return in the format needed for shop
      return items
        .filter(item => item.enabled)
        .map(item => ({
          key: item.key,
          label: item.label,
          image: getImageByKey(item.image_key),
          price: item.price,
          stock: item.stock
        }));
    } catch (error) {
      console.error('Error getting available items:', error);
      return [];
    }
  },

  // Get available colleges (only enabled ones)
  getAvailableColleges: async () => {
    try {
      const colleges = await collegeService.getColleges();
      // Filter only enabled colleges
      return colleges
        .filter(college => college.enabled)
        .map(college => ({
          id: college.id,
          name: college.name,
          image: require('../assets/images/college-default.png') // Fixed path
        }));
    } catch (error) {
      console.error('Error getting colleges:', error);
      return [];
    }
  },

  // Get current stock levels
  getCurrentStock: async (): Promise<Record<string, number>> => {
    try {
      const items = await itemService.getItems();
      const stock: Record<string, number> = {};
      
      items.forEach(item => {
        if (item.enabled) {
          stock[item.key] = item.stock || 0;
        }
      });
      
      return stock;
    } catch (error) {
      console.error('Error getting stock:', error);
      return {};
    }
  },

  // Process a sale (update stock and user stats)
  processSale: async (saleData: SaleData) => {
    try {
      const { quantities, customerInfo, userId, totalAmount } = saleData;
      const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

      // Update stock for each item
      for (const [size, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          const item = await itemService.getItemByKey(size);
          if (item && item.enabled) {
            const newStock = Math.max(0, (item.stock || 0) - quantity);
            await itemService.updateItem(item.id, {
              stock: newStock
            });
          }
        }
      }

      // Update user sales statistics
      const user = await userService.getUserById(userId);
      if (user) {
        await userService.updateUser(userId, {
          today_sold: (user.today_sold || 0) + totalItems,
          total_sold: (user.total_sold || 0) + totalItems,
          today_revenue: (user.today_revenue || 0) + totalAmount,
          total_revenue: (user.total_revenue || 0) + totalAmount,
          last_active: new Date().toISOString()
        });
      }
      
      return { success: true, message: 'Sale processed successfully' };
    } catch (error) {
      console.error('Error processing sale:', error);
      throw new Error('Failed to process sale');
    }
  },

  // Process rejected items
  processRejected: async (rejectedData: RejectedData) => {
    try {
      const { quantities, userId } = rejectedData;

      // Update rejected count and stock for each item
      for (const [size, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          const item = await itemService.getItemByKey(size);
          if (item) {
            const newStock = Math.max(0, (item.stock || 0) - quantity);
            const newRejected = (item.rejected || 0) + quantity;
            
            await itemService.updateItem(item.id, {
              stock: newStock,
              rejected: newRejected
            });
          }
        }
      }

      // Update user rejected statistics
      const user = await userService.getUserById(userId);
      if (user) {
        const totalRejected = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
        await userService.updateUser(userId, {
          today_rejected: (user.today_rejected || 0) + totalRejected,
          total_rejected: (user.total_rejected || 0) + totalRejected,
          last_active: new Date().toISOString()
        });
      }
      
      return { success: true, message: 'Rejected items processed successfully' };
    } catch (error) {
      console.error('Error processing rejected items:', error);
      throw new Error('Failed to process rejected items');
    }
  },

  // Process returned items
  processReturned: async (returnedData: ReturnedData) => {
    try {
      const { quantities, userId } = returnedData;

      // Update stock for returned items
      for (const [size, quantity] of Object.entries(quantities)) {
        if (quantity > 0) {
          const item = await itemService.getItemByKey(size);
          if (item) {
            const newStock = (item.stock || 0) + quantity;
            await itemService.updateItem(item.id, {
              stock: newStock
            });
          }
        }
      }

      // Update user statistics if needed
      const user = await userService.getUserById(userId);
      if (user) {
        await userService.updateUser(userId, {
          last_active: new Date().toISOString()
        });
      }
      
      return { success: true, message: 'Returned items processed successfully' };
    } catch (error) {
      console.error('Error processing returned items:', error);
      throw new Error('Failed to process returned items');
    }
  },

  // Process reservation
  processReservation: async (reservationData: any) => {
    try {
      // Similar to processSale but with reservation logic
      // You might reserve stock instead of deducting immediately
      return { success: true, message: 'Reservation created successfully' };
    } catch (error) {
      console.error('Error processing reservation:', error);
      throw new Error('Failed to create reservation');
    }
  }
};

// Helper function to map image keys to images
const getImageByKey = (imageKey: string) => {
  const imageMap: Record<string, any> = {
    'xs': require('../assets/images/size-shirt/extra-small.png'),
    'small': require('../assets/images/size-shirt/small.png'),
    'medium': require('../assets/images/size-shirt/medium.png'),
    'large': require('../assets/images/size-shirt/large.png'),
    'xl': require('../assets/images/size-shirt/extra-large.png'),
    'xxl': require('../assets/images/size-shirt/extra-extra-large.png'),
    'xxxl': require('../assets/images/size-shirt/extra-extra-extra-large.png'),
  };
  
  return imageMap[imageKey] || require('../assets/images/size-shirt/medium.png');
};
import { itemService, userService } from './database';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const users = await userService.getUsers();
      const items = await itemService.getItems();
      
      const activeCashiers = users.filter((user: any) => user.role === 'cashier' && user.status === 'active').length;
      
      // Calculate totals with safe defaults
      const totalRevenue = users.reduce((sum: number, user: any) => sum + (user.total_revenue || 0), 0);
      const todayRevenue = users.reduce((sum: number, user: any) => sum + (user.today_revenue || 0), 0);
      const lowStockItems = items.filter((item: any) => (item.stock || 0) <= (item.low_stock_threshold || 5)).length;
      const rejectedItems = items.reduce((sum: number, item: any) => sum + (item.rejected || 0), 0);

      return {
        totalSales: users.reduce((sum: number, user: any) => sum + (user.total_sold || 0), 0),
        totalRevenue,
        todayRevenue,
        activeCashiers,
        lowStockItems,
        totalRestocks: users.reduce((sum: number, user: any) => sum + (user.total_stock || 0), 0),
        rejectedItems
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  // Get user activities
  getUserActivities: async () => {
    try {
      const users = await userService.getUsers();
      
      // Filter users who have activity today
      const activeUsers = users.filter((user: any) => 
        (user.today_sold && user.today_sold > 0) || 
        (user.today_restock && user.today_restock > 0)
      );

      return activeUsers.map((user: any) => {
        const hasSales = user.today_sold && user.today_sold > 0;
        return {
          user: user.name,
          action: hasSales ? 'sale' : 'restock',
          items: hasSales ? user.today_sold : user.today_restock,
          amount: user.today_revenue || 0,
          time: user.last_active || 'Recently',
          details: 'Multiple sizes'
        };
      });
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }
};
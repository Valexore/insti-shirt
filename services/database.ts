import * as SQLite from 'expo-sqlite';

// Define TypeScript interfaces for our database entities
interface User {
  id: number;
  username: string;
  name: string;
  password: string;
  role: 'admin' | 'cashier';
  status: 'active' | 'inactive';
  total_stock: number;
  today_restock: number;
  total_sold: number;
  today_sold: number;
  total_revenue: number;
  today_revenue: number;
  total_rejected: number;
  today_rejected: number;
  last_active: string;
  join_date: string;
  created_at: string;
  updated_at: string;
}

interface Item {
  id: number;
  key: string;
  label: string;
  image_key: string;
  price: number;
  stock: number;
  sold: number; // ADDED: Sold tracking
  rejected: number;
  low_stock_threshold: number;
  enabled: boolean;
  created_at: string;
  reserved?: number;
}

interface College {
  id: string;
  name: string;
  enabled: boolean;
  created_at: string;
}

interface Configuration {
  id: number;
  feature_key: string;
  feature_value: string;
  feature_type: string;
  created_at: string;
  updated_at: string;
}

interface Report {
  id: number;
  file_name: string;
  title: string;
  generated_by: string;
  file_size: string;
  date_generated: string;
  time_range: string;
  total_sales: number;
  total_items: number;
  pages: number;
  type: string;
  created_at: string;
}

interface Activity {
  id: number;
  user_id: number;
  type: 'sale' | 'restock' | 'login' | 'rejected' | 'returned';
  description: string;
  amount?: number;
  items?: string;
  timestamp: string;
  created_at: string;
  user_name?: string;
   itemKeys?: string[];
}

// Type for SQLite result
interface SQLiteResult {
  lastInsertRowId: number;
  changes: number;
}

// Open database
const db = SQLite.openDatabaseSync('shirt_management.db');

// Initialize database
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Users table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'cashier',
          status TEXT NOT NULL DEFAULT 'active',
          total_stock INTEGER DEFAULT 0,
          today_restock INTEGER DEFAULT 0,
          total_sold INTEGER DEFAULT 0,
          today_sold INTEGER DEFAULT 0,
          total_revenue INTEGER DEFAULT 0,
          today_revenue INTEGER DEFAULT 0,
          total_rejected INTEGER DEFAULT 0,
          today_rejected INTEGER DEFAULT 0,
          last_active TEXT DEFAULT 'Never',
          join_date TEXT DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Items table - UPDATED: Added sold column
      db.execSync(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          label TEXT NOT NULL,
          image_key TEXT NOT NULL,
          price INTEGER NOT NULL,
          stock INTEGER DEFAULT 0,
          sold INTEGER DEFAULT 0, -- ADDED: Sold tracking
          rejected INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 5,
          enabled BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Colleges table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS colleges (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          enabled BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Configuration table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS configuration (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          feature_key TEXT UNIQUE NOT NULL,
          feature_value TEXT NOT NULL,
          feature_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Reports table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_name TEXT NOT NULL,
          title TEXT NOT NULL,
          generated_by TEXT NOT NULL,
          file_size TEXT NOT NULL,
          date_generated DATETIME DEFAULT CURRENT_TIMESTAMP,
          time_range TEXT NOT NULL,
          total_sales INTEGER DEFAULT 0,
          total_items INTEGER DEFAULT 0,
          pages INTEGER DEFAULT 0,
          type TEXT DEFAULT 'sales_stock',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Activities table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          amount INTEGER DEFAULT 0,
          items TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );
      `);

      // NEW TABLES FOR ADDITIONAL SETTINGS
      // Reservation settings table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS reservation_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Return settings table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS return_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Monitoring settings table
      db.execSync(`
        CREATE TABLE IF NOT EXISTS monitoring_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Insert default admin user
      try {
        db.runSync(
          `INSERT OR IGNORE INTO users (username, name, password, role) VALUES (?, ?, ?, ?)`,
          ['admin', 'Admin User', '123', 'admin']
        );
      } catch (error) {
        console.log('Admin user already exists');
      }

      // Insert default cashier user
      try {
        db.runSync(
          `INSERT OR IGNORE INTO users (username, name, password, role) VALUES (?, ?, ?, ?)`,
          ['cashier', 'Cashier User', '123', 'cashier']
        );
      } catch (error) {
        console.log('Cashier user already exists');
      }

      // Check if items table is empty before inserting default items
      try {
        const existingItems = db.getAllSync('SELECT * FROM items') as Item[];
        
        // Only insert default items if the table is completely empty
        if (existingItems.length === 0) {
          const defaultItems = [
            { key: 'xs', label: 'Extra Small', image_key: 'xs', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'small', label: 'Small', image_key: 'small', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'medium', label: 'Medium', image_key: 'medium', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'large', label: 'Large', image_key: 'large', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'xl', label: 'Extra Large', image_key: 'xl', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'xxl', label: '2X Large', image_key: 'xxl', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
            { key: 'xxxl', label: '3X Large', image_key: 'xxxl', price: 299, stock: 0, sold: 0, low_stock_threshold: 5 },
          ];

          defaultItems.forEach(item => {
            try {
              db.runSync(
                `INSERT INTO items (key, label, image_key, price, stock, sold, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item.key, item.label, item.image_key, item.price, item.stock, item.sold, item.low_stock_threshold]
              );
            } catch (error) {
              console.log(`Item ${item.key} already exists`);
            }
          });
          console.log('Default items inserted for first-time setup');
        } else {
          console.log('Items table already has data, skipping default items insertion');
        }
      } catch (error) {
        console.error('Error checking/inserting default items:', error);
      }

      console.log('Database initialized successfully');
      resolve();
    } catch (error) {
      console.error('Error initializing database:', error);
      reject(error);
    }
  });
};

// User operations
export const userService = {
  // Login user
  login: (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      try {
        const user = db.getFirstSync(
          'SELECT * FROM users WHERE username = ? AND password = ? AND status = "active"',
          [username, password]
        ) as User | null;

        if (user) {
          // Update last active
          db.runSync(
            'UPDATE users SET last_active = datetime("now") WHERE id = ?',
            [user.id]
          );
          resolve(user);
        } else {
          reject(new Error('Invalid credentials or inactive account'));
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get all users
  getUsers: (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      try {
        const users = db.getAllSync('SELECT * FROM users ORDER BY created_at DESC') as User[];
        resolve(users);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get user by ID
  getUserById: (id: number): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      try {
        const user = db.getFirstSync('SELECT * FROM users WHERE id = ?', [id]) as User | null;
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  },

  // user creation
  createUser: (userData: {
    username: string;
    name: string;
    password: string;
    role?: 'admin' | 'cashier';
    status?: 'active' | 'inactive';
  }): Promise<User> => {
    return new Promise((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO users (username, name, password, role, status) VALUES (?, ?, ?, ?, ?)`,
          [
            userData.username, 
            userData.name, 
            userData.password, 
            userData.role || 'cashier',
            userData.status || 'active'
          ]
        ) as SQLiteResult;
        
        const newUser: User = {
          id: result.lastInsertRowId,
          username: userData.username,
          name: userData.name,
          password: userData.password,
          role: userData.role || 'cashier',
          status: userData.status || 'active',
          total_stock: 0,
          today_restock: 0,
          total_sold: 0,
          today_sold: 0,
          total_revenue: 0,
          today_revenue: 0,
          total_rejected: 0,
          today_rejected: 0,
          last_active: 'Never',
          join_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        resolve(newUser);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Update user
  updateUser: (id: number, userData: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
      try {
        const updates: string[] = [];
        const values: any[] = [];

        // Add all fields that need updating
        const fields: (keyof User)[] = [
          'username', 'name', 'password', 'status', 'total_stock', 'today_restock',
          'total_sold', 'today_sold', 'total_revenue', 'today_revenue', 
          'total_rejected', 'today_rejected', 'last_active'
        ];

        fields.forEach(field => {
          if (userData[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(userData[field]);
          }
        });

        updates.push('updated_at = datetime("now")');
        values.push(id);

        if (updates.length > 1) {
          db.runSync(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
          );
        }

        // Get the updated user
        const updatedUser = db.getFirstSync('SELECT * FROM users WHERE id = ?', [id]) as User;
        resolve(updatedUser);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete user
  deleteUser: (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Items operations - UPDATED: Include sold field in all operations
export const itemService = {
  getItems: (): Promise<Item[]> => {
    return new Promise((resolve, reject) => {
      try {
        const items = db.getAllSync('SELECT * FROM items ORDER BY id') as Item[];
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  },

  getItemByKey: (key: string): Promise<Item | null> => {
    return new Promise((resolve, reject) => {
      try {
        const item = db.getFirstSync('SELECT * FROM items WHERE key = ?', [key]) as Item | null;
        resolve(item);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateItem: (id: number, itemData: Partial<Item>): Promise<Item> => {
    return new Promise((resolve, reject) => {
      try {
        const updates: string[] = [];
        const values: any[] = [];

        // Add all fields that need updating - UPDATED: Added 'sold'
        const fields: (keyof Item)[] = [
          'key', 'label', 'image_key', 'price', 'stock', 'sold', 'rejected', 
          'low_stock_threshold', 'enabled'
        ];

        fields.forEach(field => {
          if (itemData[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(itemData[field]);
          }
        });

        values.push(id);

        if (updates.length > 0) {
          db.runSync(
            `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
            values
          );
        }

        // Get the updated item
        const updatedItem = db.getFirstSync('SELECT * FROM items WHERE id = ?', [id]) as Item;
        resolve(updatedItem);
      } catch (error) {
        reject(error);
      }
    });
  },

  createItem: (itemData: Omit<Item, 'id' | 'created_at'>): Promise<Item> => {
    return new Promise((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO items (key, label, image_key, price, stock, sold, rejected, low_stock_threshold, enabled) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemData.key,
            itemData.label,
            itemData.image_key,
            itemData.price,
            itemData.stock || 0,
            itemData.sold || 0, // ADDED: Sold field
            itemData.rejected || 0,
            itemData.low_stock_threshold || 5,
            itemData.enabled !== undefined ? itemData.enabled : 1
          ]
        ) as SQLiteResult;

        const newItem: Item = {
          id: result.lastInsertRowId,
          key: itemData.key,
          label: itemData.label,
          image_key: itemData.image_key,
          price: itemData.price,
          stock: itemData.stock || 0,
          sold: itemData.sold || 0, // ADDED: Sold field
          rejected: itemData.rejected || 0,
          low_stock_threshold: itemData.low_stock_threshold || 5,
          enabled: itemData.enabled !== undefined ? itemData.enabled : true,
          created_at: new Date().toISOString()
        };

        resolve(newItem);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteItem: (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM items WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Colleges operations
export const collegeService = {
  getColleges: (): Promise<College[]> => {
    return new Promise((resolve, reject) => {
      try {
        const colleges = db.getAllSync('SELECT * FROM colleges ORDER BY name') as College[];
        resolve(colleges);
      } catch (error) {
        reject(error);
      }
    });
  },

  getCollegeById: (id: string): Promise<College | null> => {
    return new Promise((resolve, reject) => {
      try {
        const college = db.getFirstSync('SELECT * FROM colleges WHERE id = ?', [id]) as College | null;
        resolve(college);
      } catch (error) {
        reject(error);
      }
    });
  },

  createCollege: (collegeData: Omit<College, 'created_at'>): Promise<College> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          'INSERT INTO colleges (id, name, enabled) VALUES (?, ?, ?)',
          [collegeData.id, collegeData.name, collegeData.enabled !== undefined ? collegeData.enabled : 1]
        );

        const newCollege: College = {
          ...collegeData,
          created_at: new Date().toISOString()
        };

        resolve(newCollege);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateCollege: (id: string, collegeData: Partial<College>): Promise<College> => {
    return new Promise((resolve, reject) => {
      try {
        const updates: string[] = [];
        const values: any[] = [];

        if (collegeData.name !== undefined) {
          updates.push('name = ?');
          values.push(collegeData.name);
        }
        if (collegeData.enabled !== undefined) {
          updates.push('enabled = ?');
          values.push(collegeData.enabled);
        }

        values.push(id);

        db.runSync(
          `UPDATE colleges SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        // Get the updated college
        const updatedCollege = db.getFirstSync('SELECT * FROM colleges WHERE id = ?', [id]) as College;
        resolve(updatedCollege);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCollege: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM colleges WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Configuration operations
export const configService = {
  getConfiguration: (): Promise<Record<string, any>> => {
    return new Promise((resolve, reject) => {
      try {
        const configRows = db.getAllSync('SELECT * FROM configuration') as Configuration[];
        const config: Record<string, any> = {};
        
        configRows.forEach((row) => {
          // Convert string values back to their original types
          let value: any = row.feature_value;
          if (row.feature_type === 'number') {
            value = Number(value);
          } else if (row.feature_type === 'boolean') {
            value = value === 'true';
          }
          
          config[row.feature_key] = value;
        });
        
        resolve(config);
      } catch (error) {
        reject(error);
      }
    });
  },

  saveConfiguration: (config: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(config).forEach(key => {
          const value = config[key];
          const type = typeof value;
          
          db.runSync(
            `INSERT OR REPLACE INTO configuration (feature_key, feature_value, feature_type) VALUES (?, ?, ?)`,
            [key, String(value), type]
          );
        });
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // NEW METHODS FOR ADDITIONAL SETTINGS
  getReservationSettings: (): Promise<Record<string, any>> => {
    return new Promise((resolve, reject) => {
      try {
        const settings = db.getAllSync('SELECT * FROM reservation_settings') as any[];
        const result: Record<string, any> = {};
        
        settings.forEach(setting => {
          result[setting.setting_key] = setting.setting_value;
        });
        
        resolve(result);
      } catch (error) {
        // If table doesn't exist yet, return empty object
        resolve({});
      }
    });
  },

  saveReservationSettings: (settings: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(settings).forEach(key => {
          db.runSync(
            `INSERT OR REPLACE INTO reservation_settings (setting_key, setting_value) VALUES (?, ?)`,
            [key, String(settings[key])]
          );
        });
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getReturnSettings: (): Promise<Record<string, any>> => {
    return new Promise((resolve, reject) => {
      try {
        const settings = db.getAllSync('SELECT * FROM return_settings') as any[];
        const result: Record<string, any> = {};
        
        settings.forEach(setting => {
          result[setting.setting_key] = setting.setting_value;
        });
        
        resolve(result);
      } catch (error) {
        resolve({});
      }
    });
  },

  saveReturnSettings: (settings: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(settings).forEach(key => {
          db.runSync(
            `INSERT OR REPLACE INTO return_settings (setting_key, setting_value) VALUES (?, ?)`,
            [key, String(settings[key])]
          );
        });
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getMonitoringSettings: (): Promise<Record<string, any>> => {
    return new Promise((resolve, reject) => {
      try {
        const settings = db.getAllSync('SELECT * FROM monitoring_settings') as any[];
        const result: Record<string, any> = {};
        
        settings.forEach(setting => {
          result[setting.setting_key] = setting.setting_value;
        });
        
        resolve(result);
      } catch (error) {
        resolve({});
      }
    });
  },

  saveMonitoringSettings: (settings: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(settings).forEach(key => {
          db.runSync(
            `INSERT OR REPLACE INTO monitoring_settings (setting_key, setting_value) VALUES (?, ?)`,
            [key, String(settings[key])]
          );
        });
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Reports operations
export const reportService = {
  getReports: (): Promise<Report[]> => {
    return new Promise((resolve, reject) => {
      try {
        const reports = db.getAllSync('SELECT * FROM reports ORDER BY date_generated DESC') as Report[];
        resolve(reports);
      } catch (error) {
        reject(error);
      }
    });
  },

  createReport: (reportData: Omit<Report, 'id' | 'created_at' | 'date_generated'>): Promise<Report> => {
    return new Promise((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO reports (file_name, title, generated_by, file_size, time_range, total_sales, total_items, pages, type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportData.file_name,
            reportData.title,
            reportData.generated_by,
            reportData.file_size,
            reportData.time_range,
            reportData.total_sales,
            reportData.total_items,
            reportData.pages,
            reportData.type || 'sales_stock'
          ]
        ) as SQLiteResult;

        const newReport: Report = {
          id: result.lastInsertRowId,
          file_name: reportData.file_name,
          title: reportData.title,
          generated_by: reportData.generated_by,
          file_size: reportData.file_size,
          date_generated: new Date().toISOString(),
          time_range: reportData.time_range,
          total_sales: reportData.total_sales,
          total_items: reportData.total_items,
          pages: reportData.pages,
          type: reportData.type || 'sales_stock',
          created_at: new Date().toISOString()
        };

        resolve(newReport);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteReport: (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM reports WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Activity operations
export const activityService = {
  // Create new activity
  createActivity: (activityData: Omit<Activity, 'id' | 'created_at' | 'user_name'>): Promise<Activity> => {
    return new Promise((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO activities (user_id, type, description, amount, items, timestamp) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            activityData.user_id,
            activityData.type,
            activityData.description,
            activityData.amount || 0,
            activityData.items ? JSON.stringify(activityData.items) : null,
            activityData.timestamp || new Date().toISOString()
          ]
        ) as SQLiteResult;

        const newActivity: Activity = {
          id: result.lastInsertRowId,
          user_id: activityData.user_id,
          type: activityData.type,
          description: activityData.description,
          amount: activityData.amount || 0,
          items: activityData.items,
          timestamp: activityData.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        resolve(newActivity);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get activities for a specific user with limit
  getUserActivities: (userId: number, limit?: number): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      try {
        const query = limit 
          ? `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.user_id = ? 
             ORDER BY a.timestamp DESC 
             LIMIT ?`
          : `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.user_id = ? 
             ORDER BY a.timestamp DESC`;
        
        const params = limit ? [userId, limit] : [userId];
        const activities = db.getAllSync(query, params) as Activity[];
        
        // Parse items JSON if exists
        const parsedActivities = activities.map(activity => ({
          ...activity,
          items: activity.items ? JSON.parse(activity.items) : undefined
        }));
        
        resolve(parsedActivities);
      } catch (error) {
        reject(error);
      }
    });
  },

  // NEW METHOD: Get all activities for a specific user without limit
  getAllUserActivities: (userId: number): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      try {
        const query = `SELECT a.*, u.name as user_name FROM activities a 
                      LEFT JOIN users u ON a.user_id = u.id 
                      WHERE a.user_id = ? 
                      ORDER BY a.timestamp DESC`;
        
        const activities = db.getAllSync(query, [userId]) as Activity[];
        
        // Parse items JSON if exists
        const parsedActivities = activities.map(activity => ({
          ...activity,
          items: activity.items ? JSON.parse(activity.items) : undefined
        }));
        
        resolve(parsedActivities);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get all activities (for admin view)
  getAllActivities: (limit?: number): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      try {
        const query = limit 
          ? `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             ORDER BY a.timestamp DESC 
             LIMIT ?`
          : `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             ORDER BY a.timestamp DESC`;
        
        const params = limit ? [limit] : [];
        const activities = db.getAllSync(query, params) as Activity[];
        
        // Parse items JSON if exists
        const parsedActivities = activities.map(activity => ({
          ...activity,
          items: activity.items ? JSON.parse(activity.items) : undefined
        }));
        
        resolve(parsedActivities);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get recent activities (last 24 hours)
  getRecentActivities: (userId?: number): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      try {
        const query = userId 
          ? `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.user_id = ? AND a.timestamp >= datetime('now', '-1 day')
             ORDER BY a.timestamp DESC`
          : `SELECT a.*, u.name as user_name FROM activities a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.timestamp >= datetime('now', '-1 day')
             ORDER BY a.timestamp DESC`;
        
        const params = userId ? [userId] : [];
        const activities = db.getAllSync(query, params) as Activity[];
        
        // Parse items JSON if exists
        const parsedActivities = activities.map(activity => ({
          ...activity,
          items: activity.items ? JSON.parse(activity.items) : undefined
        }));
        
        resolve(parsedActivities);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete activities for a user
  deleteUserActivities: (userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM activities WHERE user_id = ?', [userId]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete all activities
  deleteAllActivities: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM activities');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Database resetter
export const resetDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Resetting database...');
      
      // Drop all tables
      db.execSync('DROP TABLE IF EXISTS users;');
      db.execSync('DROP TABLE IF EXISTS items;');
      db.execSync('DROP TABLE IF EXISTS colleges;');
      db.execSync('DROP TABLE IF EXISTS configuration;');
      db.execSync('DROP TABLE IF EXISTS reports;');
      db.execSync('DROP TABLE IF EXISTS activities;');
      db.execSync('DROP TABLE IF EXISTS reservation_settings;');
      db.execSync('DROP TABLE IF EXISTS return_settings;');
      db.execSync('DROP TABLE IF EXISTS monitoring_settings;');
      
      console.log('All tables dropped successfully');
      
      // Reinitialize the database
      initDatabase().then(() => {
        console.log('Database reinitialized after reset');
        resolve();
      }).catch(error => {
        reject(error);
      });
    } catch (error) {
      console.error('Error resetting database:', error);
      reject(error);
    }
  });
};

// Function to clear only items (for development/testing)
export const clearAllItems = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      db.runSync('DELETE FROM items;');
      console.log('All items cleared from database');
      resolve();
    } catch (error) {
      console.error('Error clearing items:', error);
      reject(error);
    }
  });
};

export default db;
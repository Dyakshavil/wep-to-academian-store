const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'academic_services.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        delivery_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating orders table:', err.message);
      } else {
        console.log('✅ Orders table ready');
      }
    });

    // Create admin users table
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, async (err) => {
      if (err) {
        console.error('Error creating admin_users table:', err.message);
      } else {
        console.log('✅ Admin users table ready');
        // Create default admin user (username: admin, password: admin123)
        await createDefaultAdmin();
      }
    });
  });
}

// Create default admin user
async function createDefaultAdmin() {
  const username = 'admin';
  const password = 'admin123';
  
  db.get('SELECT * FROM admin_users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message);
    } else if (!row) {
      const passwordHash = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash],
        (err) => {
          if (err) {
            console.error('Error creating default admin:', err.message);
          } else {
            console.log('✅ Default admin created (username: admin, password: admin123)');
          }
        }
      );
    }
  });
}

// Database operations
const dbOperations = {
  // Create new order
  createOrder: (orderData) => {
    return new Promise((resolve, reject) => {
      const { service_type, customer_name, customer_email, details } = orderData;
      db.run(
        `INSERT INTO orders (service_type, customer_name, customer_email, details) 
         VALUES (?, ?, ?, ?)`,
        [service_type, customer_name, customer_email, JSON.stringify(details)],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  // Get all orders
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else {
          const orders = rows.map(row => ({
            ...row,
            details: JSON.parse(row.details)
          }));
          resolve(orders);
        }
      });
    });
  },

  // Get orders by email
  getOrdersByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
        [email],
        (err, rows) => {
          if (err) reject(err);
          else {
            const orders = rows.map(row => ({
              ...row,
              details: JSON.parse(row.details)
            }));
            resolve(orders);
          }
        }
      );
    });
  },

  // Update order
  updateOrder: (id, updates) => {
    return new Promise((resolve, reject) => {
      const { status, delivery_date } = updates;
      db.run(
        `UPDATE orders 
         SET status = COALESCE(?, status), 
             delivery_date = COALESCE(?, delivery_date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, delivery_date, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  // Delete order
  deleteOrder: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Verify admin credentials
  verifyAdmin: async (username, password) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM admin_users WHERE username = ?',
        [username],
        async (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(false);
          else {
            const isValid = await bcrypt.compare(password, row.password_hash);
            resolve(isValid);
          }
        }
      );
    });
  },

  // Get statistics
  getStats: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
         FROM orders`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
};

module.exports = { db, dbOperations };

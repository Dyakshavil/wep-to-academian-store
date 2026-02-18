const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const result = await dbOperations.createOrder(req.body);
        res.status(201).json({ success: true, orderId: result.id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: 'فشل في إنشاء الطلب' });
    }
});

// Get all orders (admin only)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await dbOperations.getAllOrders();
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'فشل في جلب الطلبات' });
    }
});

// Get orders by customer email
app.get('/api/orders/customer/:email', async (req, res) => {
    try {
        const orders = await dbOperations.getOrdersByEmail(req.params.email);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ success: false, error: 'فشل في جلب طلباتك' });
    }
});

// Update order status/delivery date
app.put('/api/orders/:id', async (req, res) => {
    try {
        const result = await dbOperations.updateOrder(req.params.id, req.body);
        if (result.changes > 0) {
            res.json({ success: true, message: 'تم تحديث الطلب بنجاح' });
        } else {
            res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, error: 'فشل في تحديث الطلب' });
    }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const result = await dbOperations.deleteOrder(req.params.id);
        if (result.changes > 0) {
            res.json({ success: true, message: 'تم حذف الطلب بنجاح' });
        } else {
            res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: 'فشل في حذف الطلب' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const isValid = await dbOperations.verifyAdmin(username, password);

        if (isValid) {
            res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
        } else {
            res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: 'فشل في تسجيل الدخول' });
    }
});

// Get statistics
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await dbOperations.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'فشل في جلب الإحصائيات' });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin-panel.html`);
    console.log(`👤 Default Admin: username=admin, password=admin123\n`);
});

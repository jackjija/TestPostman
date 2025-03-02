require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'e-commerce.sqlite',
    retry: {
        max: 5,
        match: [/SQLITE_BUSY/],
        backoffBase: 1000,
        backoffExponent: 1.5
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
// ตรวจสอบการเชื่อมต่อฐานข้อมูล
sequelize.authenticate()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Database connection failed:', err));

// สร้างโมเดล User
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { timestamps: false });

// ซิงค์โมเดลกับฐานข้อมูล (สร้างตารางถ้ายังไม่มี)
sequelize.sync()
    .then(() => console.log('✅ Users table created'))
    .catch(err => console.error('❌ Table creation failed:', err));

// API ดึงข้อมูล Users
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const newUser = await User.create({ name, email });
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

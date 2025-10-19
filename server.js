// 1. استيراد المكتبات الأساسية
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// 2. إعداد تطبيق Express
const app = express();
const PORT = 3000;

// 3. إعداد الـ Middlewares (البرمجيات الوسيطة)
app.use(cors()); // السماح بالاتصالات من نطاقات مختلفة (localhost)
app.use(express.json()); // السماح للخادم بفهم بيانات JSON القادمة

// 4. الاتصال بقاعدة البيانات (سيتم إنشاء ملف 'database.db' في مجلدك)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة بيانات SQLite.');
        // إنشاء الجدول إذا لم يكن موجوداً
        createTable();
    }
});

// 5. دالة لإنشاء جدول الاستبيانات
function createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        ageGroup TEXT,
        gender TEXT,
        incomeLevel TEXT,
        educationLevel TEXT,
        employmentStatus TEXT,
        familySize INTEGER,
        timestamp TEXT,
        programs TEXT 
    );`;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('خطأ في إنشاء الجدول:', err.message);
        } else {
            console.log('✅ جدول "surveys" جاهز.');
        }
    });
}

// ===================================================================
// 6. إعداد مسارات الـ API (API Endpoints)
// ===================================================================

// أ. مسار لجلب جميع الاستبيانات (للوحة التحكم)
app.get('/api/surveys', (req, res) => {
    const sql = "SELECT * FROM surveys ORDER BY timestamp DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // تحويل 'programs' من نص JSON إلى مصفوفة
        const data = rows.map(row => ({
            ...row,
            programs: JSON.parse(row.programs || '[]')
        }));
        res.json(data);
    });
});

// ب. مسار لحفظ استبيان جديد
app.post('/api/surveys', (req, res) => {
    const data = req.body;
    
    // تحويل مصفوفة 'programs' إلى نص JSON لحفظها في قاعدة البيانات
    const programsJson = JSON.stringify(data.programs || []);
    
    const sql = `
    INSERT INTO surveys (fullName, ageGroup, gender, incomeLevel, educationLevel, employmentStatus, familySize, timestamp, programs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        data.fullName,
        data.ageGroup,
        data.gender,
        data.incomeLevel,
        data.educationLevel,
        data.employmentStatus,
        data.familySize,
        data.timestamp,
        programsJson
    ];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ 
            message: 'تم الحفظ بنجاح', 
            id: this.lastID 
        });
    });
});

// 7. تشغيل الخادم
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`   🚀 الخادم يعمل الآن على الرابط`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`=============================================`);
});
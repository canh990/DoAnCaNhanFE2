const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MySQL Connection Setup
const connectionConfig = {
    host: 'localhost',
    user: 'root',      // Thay đổi theo cấu hình của bạn
    password: '',      // Thay đổi theo cấu hình của bạn
};

let db = mysql.createConnection(connectionConfig);

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err.message);
        return;
    }
    console.log('Đã kết nối với MySQL.');

    // 1. Tạo Database nếu chưa có
    db.query('CREATE DATABASE IF NOT EXISTS cyberpunk_portfolio', (err) => {
        if (err) {
            console.error('Lỗi tạo Database:', err.message);
            return;
        }
        
        // 2. Chuyển sang sử dụng database này
        db.query('USE cyberpunk_portfolio', (err) => {
            if (err) {
                console.error('Lỗi sử dụng Database:', err.message);
                return;
            }

            // 3. Tạo bảng nếu chưa tồn tại
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS avatars (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    image_data LONGTEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.query(createTableQuery, (err) => {
                if (err) console.error('Lỗi tạo bảng:', err.message);
                else console.log('Bảng avatars đã sẵn sàng.');
            });
        });
    });
});


// Routes
// 1. Lấy danh sách avatar
app.get('/api/avatars', (req, res) => {
    db.query('SELECT * FROM avatars ORDER BY created_at ASC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 2. Thêm avatar mới
app.post('/api/avatars', (req, res) => {
    const { image_data } = req.body;
    if (!image_data) return res.status(400).json({ error: 'Thiếu dữ liệu ảnh' });

    db.query('INSERT INTO avatars (image_data) VALUES (?)', [image_data], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, image_data });
    });
});

// 3. Xóa avatar
app.delete('/api/avatars/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM avatars WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Đã xóa avatar thành công' });
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

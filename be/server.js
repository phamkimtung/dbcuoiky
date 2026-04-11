require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   🔌 DATABASE CONNECTION
========================= */
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'new',
    password: '02032005',
    port: 5432,
});

/* =========================
   🔐 JWT SECRET
========================= */
const JWT_SECRET = "SECRET_KEY";

/* =========================
   🧪 TEST API
========================= */
app.get('/', (req, res) => {
    res.send('Server is running...');
});

/* =========================
   📝 REGISTER (DEFAULT STUDENT)
========================= */
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, student_code, major_id, admission_year } = req.body;

        // 1. Check email tồn tại
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // 2. KHÔNG mã hóa password
        const plainPassword = password;

        // 3. Lấy role student
        const roleRes = await pool.query(
            "SELECT id FROM roles WHERE name = 'student' LIMIT 1"
        );

        if (roleRes.rows.length === 0) {
            return res.status(500).json({ message: 'Role student not found' });
        }

        const role_id = roleRes.rows[0].id;

        // 4. Insert user
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, email, plainPassword, role_id]
        );

        const user_id = newUser.rows[0].id;

        // 5. Insert student
        await pool.query(
            `INSERT INTO students (user_id, student_code, major_id, admission_year)
             VALUES ($1, $2, $3, $4)`,
            [user_id, student_code, major_id, admission_year]
        );

        res.json({
            message: 'Register success',
            user_id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* =========================
   🔑 LOGIN
========================= */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Tìm user + role
        const userRes = await pool.query(
            `SELECT u.*, r.name as role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userRes.rows[0];

        // 2. So sánh password trực tiếp
        if (password !== user.password) {
            return res.status(400).json({ message: 'Wrong password' });
        }

        // 3. Lấy profile theo role
        let profile = null;

        if (user.role === 'student') {
            const studentRes = await pool.query(
                'SELECT * FROM students WHERE user_id = $1',
                [user.id]
            );
            profile = studentRes.rows[0];
        }

        if (user.role === 'lecturer') {
            const lecRes = await pool.query(
                'SELECT * FROM lecturers WHERE user_id = $1',
                [user.id]
            );
            profile = lecRes.rows[0];
        }

        // 4. Tạo token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login success',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            profile
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/* =========================================================
   👑 ADMIN - STUDENT APIs
   ========================================================= */


/* =========================
   📌 1. GET ALL STUDENTS
========================= */
/**
 * 👉 Lấy toàn bộ sinh viên (full info)
 */
app.get('/admin/students', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.id,
                s.student_code,
                s.admission_year,

                u.name,
                u.email,

                m.name AS major_name,
                f.name AS faculty_name

            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN majors m ON s.major_id = m.id
            JOIN faculties f ON m.faculty_id = f.id
            ORDER BY s.id DESC
        `);

        res.json({
            data: result.rows,
            total: result.rowCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 2. GET STUDENT DETAIL
========================= */
/**
 * 👉 Lấy chi tiết 1 sinh viên
 */
app.get('/admin/students/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.*,
                u.name,
                u.email,
                m.name AS major_name,
                f.name AS faculty_name

            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN majors m ON s.major_id = m.id
            JOIN faculties f ON m.faculty_id = f.id
            WHERE s.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Student not found' });

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 3. CREATE STUDENT
========================= */
/**
 * 👉 Admin tạo sinh viên (user + student)
 */
app.post('/admin/students', async (req, res) => {
    try {
        const { name, email, password, student_code, major_id, admission_year } = req.body;

        // check email
        const check = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if (check.rows.length > 0)
            return res.status(400).json({ message: 'Email exists' });

        const role = await pool.query("SELECT id FROM roles WHERE name='student'");

        // create user
        const user = await pool.query(
            `INSERT INTO users(name,email,password,role_id)
             VALUES($1,$2,$3,$4) RETURNING id`,
            [name, email, password, role.rows[0].id]
        );

        // create student
        const result = await pool.query(
            `INSERT INTO students(user_id,student_code,major_id,admission_year)
             VALUES($1,$2,$3,$4) RETURNING *`,
            [user.rows[0].id, student_code, major_id, admission_year]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 4. UPDATE STUDENT
========================= */
/**
 * 👉 Sửa sinh viên + user
 */
app.put('/admin/students/:id', async (req, res) => {
    try {
        const { name, email, student_code, major_id, admission_year } = req.body;

        const st = await pool.query(
            'SELECT user_id FROM students WHERE id=$1',
            [req.params.id]
        );

        if (st.rows.length === 0)
            return res.status(404).json({ message: 'Student not found' });

        const user_id = st.rows[0].user_id;

        // update user
        await pool.query(
            `UPDATE users SET name=$1,email=$2 WHERE id=$3`,
            [name, email, user_id]
        );

        // update student
        const result = await pool.query(
            `UPDATE students
             SET student_code=$1, major_id=$2, admission_year=$3
             WHERE id=$4 RETURNING *`,
            [student_code, major_id, admission_year, req.params.id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 5. DELETE STUDENT
========================= */
/**
 * 👉 Xóa sinh viên + user
 */
app.delete('/admin/students/:id', async (req, res) => {
    try {
        const st = await pool.query(
            'SELECT user_id FROM students WHERE id=$1',
            [req.params.id]
        );

        if (st.rows.length === 0)
            return res.status(404).json({ message: 'Student not found' });

        const user_id = st.rows[0].user_id;

        await pool.query('DELETE FROM students WHERE id=$1', [req.params.id]);
        await pool.query('DELETE FROM users WHERE id=$1', [user_id]);

        res.json({ message: 'Deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 6. SEARCH STUDENT
========================= */
/**
 * 👉 Tìm kiếm theo tên/email
 * 👉 /admin/students/search?keyword=tung
 */
app.get('/admin/students/search', async (req, res) => {
    try {
        const { keyword } = req.query;

        const result = await pool.query(`
            SELECT 
                s.id,
                s.student_code,
                u.name,
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.name ILIKE $1 OR u.email ILIKE $1
        `, [`%${keyword}%`]);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 7. STUDENT ENROLLMENTS
========================= */
/**
 * 👉 Xem sinh viên học những lớp nào
 */
app.get('/admin/students/:id/enrollments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id,
                e.status,

                c.id AS class_id,
                co.name AS course_name,
                co.course_code,

                se.code AS semester

            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN courses co ON c.course_id = co.id
            JOIN semesters se ON c.semester_id = se.id

            WHERE e.student_id = $1
        `, [req.params.id]);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * 📌 GET /admin/lecturers
 * 👉 Lấy toàn bộ giảng viên + thông tin user + khoa
 */
app.get('/admin/lecturers', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                l.id,
                u.name,
                u.email,
                f.name AS faculty_name
            FROM lecturers l
            JOIN users u ON l.user_id = u.id
            JOIN faculties f ON l.faculty_id = f.id
        `);

        res.json({
            data: result.rows,
            total: result.rowCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * 📌 GET /admin/courses
 * 👉 Lấy toàn bộ môn học
 */
app.get('/admin/courses', async (req, res) => {
    const result = await pool.query(`
        SELECT * FROM courses ORDER BY id DESC
    `);

    res.json({
        data: result.rows,
        total: result.rowCount
    });
});

/**
 * 📌 GET /admin/schedules
 * 👉 Lấy lịch học + tên môn + lớp
 */
/**
 * 📌 GET /admin/schedules/full
 * 👉 Lấy toàn bộ lịch học (chuẩn để render timetable)
 * 👉 Có đầy đủ: môn, lớp, giảng viên, phòng, thời gian, học kỳ
 */
app.get('/admin/schedules/full', async (req, res) => {
    try {
        const { semester_id } = req.query; // optional filter

        let query = `
            SELECT 
                sc.id,
                sc.day_of_week,
                sc.start_time,
                sc.end_time,
                sc.room,

                c.id AS class_id,
                c.status,

                co.name AS course_name,
                co.course_code,

                u.name AS lecturer_name,

                se.code AS semester_code,
                se.id AS semester_id

            FROM schedules sc
            JOIN classes c ON sc.class_id = c.id
            JOIN courses co ON c.course_id = co.id
            JOIN lecturers l ON c.lecturer_id = l.id
            JOIN users u ON l.user_id = u.id
            JOIN semesters se ON c.semester_id = se.id
        `;

        const params = [];

        if (semester_id) {
            query += ` WHERE se.id = $1`;
            params.push(semester_id);
        }

        query += ` ORDER BY sc.day_of_week, sc.start_time`;

        const result = await pool.query(query, params);

        res.json({
            data: result.rows,
            total: result.rowCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * 📌 GET /admin/enrollments
 * 👉 Xem ai đăng ký lớp nào
 */
app.get('/admin/enrollments', async (req, res) => {
    const result = await pool.query(`
        SELECT 
            e.id,
            u.name AS student_name,
            co.name AS course_name,
            e.status
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN classes c ON e.class_id = c.id
        JOIN courses co ON c.course_id = co.id
    `);

    res.json({
        data: result.rows,
        total: result.rowCount
    });
});
/**
 * 📌 GET /admin/tuition/full
 * 👉 Xem học phí + tên sinh viên + học kỳ
 */
app.get('/admin/tuition/full', async (req, res) => {
    const result = await pool.query(`
        SELECT 
            t.id,
            u.name AS student_name,
            s.code AS semester,
            t.total_amount,
            t.paid_amount,
            t.status
        FROM tuition_invoices t
        JOIN students st ON t.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN semesters s ON t.semester_id = s.id
    `);

    res.json({
        data: result.rows,
        total: result.rowCount
    });
});

/* =========================================================
   👑 ADMIN APIs
   ========================================================= */

/* =========================
   👤 1. USER MANAGEMENT
========================= */

/**
 * 📌 GET /admin/users
 * 👉 Lấy danh sách tất cả user (có role)
 */
app.get('/admin/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.name, u.email, u.is_active, r.name AS role
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 POST /admin/users
 * 👉 Tạo user mới (admin có thể tạo lecturer hoặc admin)
 */
app.post('/admin/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const roleRes = await pool.query(
            'SELECT id FROM roles WHERE name = $1',
            [role]
        );

        if (roleRes.rows.length === 0) {
            return res.status(400).json({ message: 'Role not found' });
        }

        const role_id = roleRes.rows[0].id;

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, email, password, role_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 📌 PUT /admin/users/:id
 * 👉 Sửa thông tin user
 */
app.put('/admin/users/:id', async (req, res) => {
    try {
        const { name, email, is_active } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET name = $1, email = $2, is_active = $3
             WHERE id = $4
             RETURNING *`,
            [name, email, is_active, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * 📌 DELETE /admin/users/:id
 * 👉 Xóa user (hard delete)
 */
app.delete('/admin/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/admin/lecturers/:id', async (req, res) => {
    try {
        const lecturer_id = req.params.id;
        const { name, email, faculty_id } = req.body;

        const lecturer = await pool.query(
            'SELECT user_id FROM lecturers WHERE id = $1',
            [lecturer_id]
        );

        const user_id = lecturer.rows[0].user_id;

        await pool.query(
            `UPDATE users SET name = $1, email = $2 WHERE id = $3`,
            [name, email, user_id]
        );

        const result = await pool.query(
            `UPDATE lecturers
             SET faculty_id = $1
             WHERE id = $2
             RETURNING *`,
            [faculty_id, lecturer_id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * 📌 DELETE /admin/lecturers/:id
 * 👉 Xóa giảng viên + user
 */
app.delete('/admin/lecturers/:id', async (req, res) => {
    try {
        const lecturer_id = req.params.id;

        const lecturer = await pool.query(
            'SELECT user_id FROM lecturers WHERE id = $1',
            [lecturer_id]
        );

        const user_id = lecturer.rows[0].user_id;

        await pool.query('DELETE FROM lecturers WHERE id = $1', [lecturer_id]);
        await pool.query('DELETE FROM users WHERE id = $1', [user_id]);

        res.json({ message: 'Lecturer deleted' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   🏫 2. FACULTIES & MAJORS
========================= */





/* =========================
   📚 3. COURSES & PREREQUISITES
========================= */

/**
 * 📌 POST /admin/courses
 * 👉 Tạo môn học
 */
app.post('/admin/courses', async (req, res) => {
    const { course_code, name, credits, credit_price } = req.body;

    const result = await pool.query(
        `INSERT INTO courses (course_code, name, credits, credit_price)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [course_code, name, credits, credit_price]
    );

    res.json(result.rows[0]);
});

/**
 * 📌 POST /admin/prerequisites
 * 👉 Thêm môn tiên quyết
 */
app.post('/admin/prerequisites', async (req, res) => {
    const { course_id, prerequisite_id } = req.body;

    const result = await pool.query(
        `INSERT INTO prerequisites (course_id, prerequisite_id)
         VALUES ($1, $2) RETURNING *`,
        [course_id, prerequisite_id]
    );

    res.json(result.rows[0]);
});



/* =========================
   📅 4. SEMESTERS & CLASSES
========================= */

/**
 * 📌 POST /admin/semesters
 * 👉 Tạo học kỳ + thời gian đăng ký
 */
app.post('/admin/semesters', async (req, res) => {
    const { code, year, start_date, end_date, reg_start_time, reg_end_time } = req.body;

    const result = await pool.query(
        `INSERT INTO semesters (code, year, start_date, end_date, reg_start_time, reg_end_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [code, year, start_date, end_date, reg_start_time, reg_end_time]
    );

    res.json(result.rows[0]);
});


/**
 * 📌 POST /admin/schedules
 * 👉 Thêm lịch học cho lớp
 */
app.post('/admin/schedules', async (req, res) => {
    const { class_id, day_of_week, start_time, end_time, room } = req.body;

    const result = await pool.query(
        `INSERT INTO schedules (class_id, day_of_week, start_time, end_time, room)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [class_id, day_of_week, start_time, end_time, room]
    );

    res.json(result.rows[0]);
});



/* =========================
   💰 5. TUITION MANAGEMENT
========================= */

/**
 * 📌 GET /admin/tuition
 * 👉 Xem toàn bộ học phí sinh viên
 */
app.get('/admin/tuition', async (req, res) => {
    const result = await pool.query(`
        SELECT t.*, s.student_code
        FROM tuition_invoices t
        JOIN students s ON t.student_id = s.id
    `);

    res.json(result.rows);
});

/**
 * 📌 PUT /admin/tuition/:id/pay
 * 👉 Cập nhật thanh toán học phí
 */
app.put('/admin/tuition/:id/pay', async (req, res) => {
    const { paid_amount } = req.body;

    const result = await pool.query(
        `UPDATE tuition_invoices
         SET paid_amount = $1,
             status = CASE 
                WHEN paid_amount >= total_amount THEN 'paid'
                ELSE 'partial'
             END
         WHERE id = $2
         RETURNING *`,
        [paid_amount, req.params.id]
    );

    res.json(result.rows[0]);
});



/* =========================
   📊 6. REPORTS
========================= */

/**
 * 📌 GET /admin/reports
 * 👉 Thống kê tổng quan hệ thống
 */
app.get('/admin/reports', async (req, res) => {
    try {
        const totalStudents = await pool.query('SELECT COUNT(*) FROM students');
        const totalCourses = await pool.query('SELECT COUNT(*) FROM courses');
        const totalRevenue = await pool.query('SELECT SUM(paid_amount) FROM tuition_invoices');

        res.json({
            total_students: totalStudents.rows[0].count,
            total_courses: totalCourses.rows[0].count,
            total_revenue: totalRevenue.rows[0].sum || 0
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/* =========================================================
   👑 ADMIN UPDATE & DELETE APIs
   ========================================================= */


/* =========================================================
   👑 ADMIN - FACULTIES APIs
   ========================================================= */

/* 📌 GET ALL FACULTIES */
app.get('/admin/faculties', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM faculties ORDER BY id DESC
        `);

        res.json({ data: result.rows, total: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 GET FACULTY DETAIL */
app.get('/admin/faculties/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM faculties WHERE id=$1',
            [req.params.id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Not found' });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 CREATE FACULTY */
app.post('/admin/faculties', async (req, res) => {
    try {
        const { code, name } = req.body;

        const result = await pool.query(
            `INSERT INTO faculties(code,name)
             VALUES($1,$2) RETURNING *`,
            [code, name]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 UPDATE FACULTY */
app.put('/admin/faculties/:id', async (req, res) => {
    try {
        const { code, name } = req.body;

        const result = await pool.query(
            `UPDATE faculties
             SET code=$1,name=$2
             WHERE id=$3 RETURNING *`,
            [code, name, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 DELETE FACULTY */
app.delete('/admin/faculties/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM faculties WHERE id=$1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================================================
   👑 ADMIN - MAJORS APIs
   ========================================================= */

/* 📌 GET ALL MAJORS */
app.get('/admin/majors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.id,
                m.code,
                m.name,
                f.name AS faculty_name
            FROM majors m
            JOIN faculties f ON m.faculty_id = f.id
            ORDER BY m.id DESC
        `);

        res.json({ data: result.rows, total: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 GET MAJOR DETAIL */
app.get('/admin/majors/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.*,
                f.name AS faculty_name
            FROM majors m
            JOIN faculties f ON m.faculty_id = f.id
            WHERE m.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Not found' });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 CREATE MAJOR */
app.post('/admin/majors', async (req, res) => {
    try {
        const { faculty_id, code, name } = req.body;

        const result = await pool.query(
            `INSERT INTO majors(faculty_id,code,name)
             VALUES($1,$2,$3) RETURNING *`,
            [faculty_id, code, name]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 UPDATE MAJOR */
app.put('/admin/majors/:id', async (req, res) => {
    try {
        const { faculty_id, code, name } = req.body;

        const result = await pool.query(
            `UPDATE majors
             SET faculty_id=$1,code=$2,name=$3
             WHERE id=$4 RETURNING *`,
            [faculty_id, code, name, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* 📌 DELETE MAJOR */
app.delete('/admin/majors/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM majors WHERE id=$1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================================================
   👑 ADMIN - CLASSES APIs
   ========================================================= */

/* 📌 GET ALL CLASSES (FULL INFO) */
/* =========================================================
   👑 ADMIN - CLASSES APIs (FIXED VERSION)
   ========================================================= */


/* =========================
   📌 GET ALL CLASSES (SAFE)
========================= */
app.get('/admin/classes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.status,
                c.max_students,

                co.name AS course_name,
                co.course_code,

                u.name AS lecturer_name,
                se.code AS semester

            FROM classes c
            LEFT JOIN courses co ON c.course_id = co.id
            LEFT JOIN lecturers l ON c.lecturer_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN semesters se ON c.semester_id = se.id

            ORDER BY c.id DESC
        `);

        res.json({
            data: result.rows,
            total: result.rowCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 GET CLASS DETAIL
========================= */
app.get('/admin/classes/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.*,
                co.name AS course_name,
                co.course_code,
                u.name AS lecturer_name,
                se.code AS semester

            FROM classes c
            LEFT JOIN courses co ON c.course_id = co.id
            LEFT JOIN lecturers l ON c.lecturer_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN semesters se ON c.semester_id = se.id

            WHERE c.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Class not found' });

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 CREATE CLASS (CHECK DATA)
========================= */
app.post('/admin/classes', async (req, res) => {
    try {
        const { course_id, lecturer_id, semester_id, max_students } = req.body;

        // check course
        const course = await pool.query(
            'SELECT id FROM courses WHERE id=$1',
            [course_id]
        );
        if (course.rows.length === 0)
            return res.status(400).json({ message: 'Course not found' });

        // check lecturer
        const lecturer = await pool.query(
            'SELECT id FROM lecturers WHERE id=$1',
            [lecturer_id]
        );
        if (lecturer.rows.length === 0)
            return res.status(400).json({ message: 'Lecturer not found' });

        // check semester
        const semester = await pool.query(
            'SELECT id FROM semesters WHERE id=$1',
            [semester_id]
        );
        if (semester.rows.length === 0)
            return res.status(400).json({ message: 'Semester not found' });

        // insert
        const result = await pool.query(
            `INSERT INTO classes(course_id, lecturer_id, semester_id, max_students, status)
             VALUES($1,$2,$3,$4,'planned')
             RETURNING *`,
            [course_id, lecturer_id, semester_id, max_students]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 UPDATE CLASS
========================= */
app.put('/admin/classes/:id', async (req, res) => {
    try {
        const { course_id, lecturer_id, semester_id, max_students, status } = req.body;

        const result = await pool.query(
            `UPDATE classes
             SET course_id=$1,
                 lecturer_id=$2,
                 semester_id=$3,
                 max_students=$4,
                 status=$5
             WHERE id=$6
             RETURNING *`,
            [course_id, lecturer_id, semester_id, max_students, status, req.params.id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Class not found' });

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📌 DELETE CLASS
========================= */
app.delete('/admin/classes/:id', async (req, res) => {
    try {
        const check = await pool.query(
            'SELECT id FROM classes WHERE id=$1',
            [req.params.id]
        );

        if (check.rows.length === 0)
            return res.status(404).json({ message: 'Class not found' });

        await pool.query('DELETE FROM classes WHERE id=$1', [req.params.id]);

        res.json({ message: 'Deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   📚 2. COURSES (MÔN HỌC)
========================= */

/**
 * 📌 PUT /admin/courses/:id
 * 👉 Sửa môn học
 */
app.put('/admin/courses/:id', async (req, res) => {
    try {
        const { course_code, name, credits, credit_price } = req.body;

        const result = await pool.query(
            `UPDATE courses
             SET course_code = $1,
                 name = $2,
                 credits = $3,
                 credit_price = $4
             WHERE id = $5
             RETURNING *`,
            [course_code, name, credits, credit_price, req.params.id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * 📌 DELETE /admin/courses/:id
 * 👉 Xóa môn học
 */
app.delete('/admin/courses/:id', async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM courses WHERE id = $1`,
            [req.params.id]
        );

        res.json({ message: 'Course deleted' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});







/* =========================
   🕒 4. SCHEDULES (LỊCH HỌC)
========================= */

/**
 * 📌 PUT /admin/schedules/:id
 * 👉 Sửa lịch học
 */
app.put('/admin/schedules/:id', async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, room } = req.body;

        const result = await pool.query(
            `UPDATE schedules
             SET day_of_week = $1,
                 start_time = $2,
                 end_time = $3,
                 room = $4
             WHERE id = $5
             RETURNING *`,
            [day_of_week, start_time, end_time, room, req.params.id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * 📌 DELETE /admin/schedules/:id
 * 👉 Xóa lịch học
 */
app.delete('/admin/schedules/:id', async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM schedules WHERE id = $1`,
            [req.params.id]
        );

        res.json({ message: 'Schedule deleted' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



/* =========================
   🔍 7. AUDIT LOGS
========================= */

/**
 * 📌 GET /admin/logs
 * 👉 Xem lịch sử thao tác hệ thống
 */
app.get('/admin/logs', async (req, res) => {
    const result = await pool.query(`
        SELECT a.*, u.name
        FROM audit_logs a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
});
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
    database: 'newsss',
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

/* =========================================================
   🛡️ AUTHENTICATION APIs
   ========================================================= */

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, student_code, major_id, admission_year } = req.body;

        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'student' LIMIT 1");
        if (roleRes.rows.length === 0) return res.status(500).json({ message: 'Role student not found' });

        const role_id = roleRes.rows[0].id;
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, password, role_id]
        );

        const user_id = newUser.rows[0].id;
        await pool.query(
            `INSERT INTO students (user_id, student_code, major_id, admission_year) VALUES ($1, $2, $3, $4)`,
            [user_id, student_code, major_id, admission_year]
        );

        res.json({ message: 'Register success', user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRes = await pool.query(
            `SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`,
            [email]
        );

        if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = userRes.rows[0];

        if (password !== user.password) return res.status(400).json({ message: 'Wrong password' });

        let profile = null;
        if (user.role === 'student') {
            const studentRes = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
            profile = studentRes.rows[0];
        } else if (user.role === 'lecturer') {
            const lecRes = await pool.query('SELECT * FROM lecturers WHERE user_id = $1', [user.id]);
            profile = lecRes.rows[0];
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login success',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            profile
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================================================
   👑 ACTOR 1: ADMIN APIs
   ========================================================= */

// --- USER & ROLES ---
app.get('/admin/users', async (req, res) => {
    try {
        const result = await pool.query(`SELECT u.id, u.name, u.email, u.is_active, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- FACULTIES & MAJORS ---
app.get('/admin/faculties', async (req, res) => {
    const result = await pool.query('SELECT * FROM faculties ORDER BY id DESC');
    res.json({ data: result.rows });
});

app.post('/admin/faculties', async (req, res) => {
    const { code, name } = req.body;
    const result = await pool.query('INSERT INTO faculties(code,name) VALUES($1,$2) RETURNING *', [code, name]);
    res.json(result.rows[0]);
});

app.get('/admin/majors', async (req, res) => {
    const result = await pool.query('SELECT m.*, f.name AS faculty_name FROM majors m JOIN faculties f ON m.faculty_id = f.id ORDER BY m.id DESC');
    res.json({ data: result.rows });
});

app.post('/admin/majors', async (req, res) => {
    const { faculty_id, code, name } = req.body;
    const result = await pool.query('INSERT INTO majors(faculty_id,code,name) VALUES($1,$2,$3) RETURNING *', [faculty_id, code, name]);
    res.json(result.rows[0]);
});

// --- COURSES & PREREQUISITES & GRADE COMPONENTS ---
app.get('/admin/courses', async (req, res) => {
    const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
    res.json({ data: result.rows });
});

app.post('/admin/courses', async (req, res) => {
    const { course_code, name, credits, credit_price } = req.body;
    const result = await pool.query('INSERT INTO courses(course_code, name, credits, credit_price) VALUES($1,$2,$3,$4) RETURNING *', [course_code, name, credits, credit_price]);
    res.json(result.rows[0]);
});

app.post('/admin/prerequisites', async (req, res) => {
    const { course_id, prerequisite_id } = req.body;
    const result = await pool.query('INSERT INTO prerequisites(course_id, prerequisite_id) VALUES($1,$2) RETURNING *', [course_id, prerequisite_id]);
    res.json(result.rows[0]);
});

// Cấu hình điểm (Grade Components) cho môn học
app.post('/admin/grade-components', async (req, res) => {
    const { course_id, name, weight } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO grade_components(course_id, name, weight) VALUES($1,$2,$3) RETURNING *`,
            [course_id, name, weight]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SEMESTERS, CLASSES & SCHEDULES ---
app.post('/admin/semesters', async (req, res) => {
    const { code, year, start_date, end_date, reg_start_time, reg_end_time } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO semesters (code, year, start_date, end_date, reg_start_time, reg_end_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [code, year, start_date, end_date, reg_start_time, reg_end_time]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/classes', async (req, res) => {
    const result = await pool.query(`
        SELECT c.*, co.name AS course_name, u.name AS lecturer_name, se.code AS semester
        FROM classes c
        JOIN courses co ON c.course_id = co.id
        JOIN lecturers l ON c.lecturer_id = l.id
        JOIN users u ON l.user_id = u.id
        JOIN semesters se ON c.semester_id = se.id
    `);
    res.json({ data: result.rows });
});

app.post('/admin/classes', async (req, res) => {
    const { course_id, lecturer_id, semester_id, max_students } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO classes(course_id, lecturer_id, semester_id, max_students, status) VALUES($1,$2,$3,$4,'planned') RETURNING *`,
            [course_id, lecturer_id, semester_id, max_students]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/schedules', async (req, res) => {
    const { class_id, day_of_week, start_time, end_time, room } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO schedules(class_id, day_of_week, start_time, end_time, room) VALUES($1,$2,$3,$4,$5) RETURNING *`,
            [class_id, day_of_week, start_time, end_time, room]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Additional Admin APIs for Edit/Delete ---

// PUT / DELETE for faculties
app.put('/admin/faculties/:id', async (req, res) => {
    const { code, name } = req.body;
    try {
        const result = await pool.query('UPDATE faculties SET code=$1, name=$2 WHERE id=$3 RETURNING *', [code, name, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Faculty not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/faculties/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM faculties WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ message: 'Faculty deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT / DELETE for majors
app.put('/admin/majors/:id', async (req, res) => {
    const { faculty_id, code, name } = req.body;
    try {
        const result = await pool.query('UPDATE majors SET faculty_id=$1, code=$2, name=$3 WHERE id=$4 RETURNING *', [faculty_id, code, name, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Major not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/majors/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM majors WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Major not found' });
        res.json({ message: 'Major deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT / DELETE for courses
app.put('/admin/courses/:id', async (req, res) => {
    const { course_code, name, credits, credit_price } = req.body;
    try {
        const result = await pool.query('UPDATE courses SET course_code=$1, name=$2, credits=$3, credit_price=$4 WHERE id=$5 RETURNING *', [course_code, name, credits, credit_price, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/courses/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM courses WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET prerequisites
app.get('/admin/prerequisites', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c1.course_code AS course_code, c1.name AS course_name, 
                   c2.course_code AS prereq_code, c2.name AS prereq_name
            FROM prerequisites p
            JOIN courses c1 ON p.course_id = c1.id
            JOIN courses c2 ON p.prerequisite_id = c2.id
            ORDER BY p.id DESC
        `);
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/prerequisites/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM prerequisites WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Prerequisite not found' });
        res.json({ message: 'Prerequisite deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET / PUT / DELETE grade_components
app.get('/admin/grade-components', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT gc.*, c.course_code, c.name AS course_name
            FROM grade_components gc
            JOIN courses c ON gc.course_id = c.id
            ORDER BY gc.id DESC
        `);
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/grade-components/:id', async (req, res) => {
    const { course_id, name, weight } = req.body;
    try {
        const result = await pool.query('UPDATE grade_components SET course_id=$1, name=$2, weight=$3 WHERE id=$4 RETURNING *', [course_id, name, weight, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Grade component not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/grade-components/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM grade_components WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Grade component not found' });
        res.json({ message: 'Grade component deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET semesters
app.get('/admin/semesters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM semesters ORDER BY id DESC');
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/semesters/:id', async (req, res) => {
    const { code, year, start_date, end_date, reg_start_time, reg_end_time } = req.body;
    try {
        const result = await pool.query('UPDATE semesters SET code=$1, year=$2, start_date=$3, end_date=$4, reg_start_time=$5, reg_end_time=$6 WHERE id=$7 RETURNING *', [code, year, start_date, end_date, reg_start_time, reg_end_time, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Semester not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/semesters/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM semesters WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Semester not found' });
        res.json({ message: 'Semester deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT / DELETE for classes
app.put('/admin/classes/:id', async (req, res) => {
    const { course_id, lecturer_id, semester_id, max_students } = req.body;
    try {
        const result = await pool.query('UPDATE classes SET course_id=$1, lecturer_id=$2, semester_id=$3, max_students=$4 WHERE id=$5 RETURNING *', [course_id, lecturer_id, semester_id, max_students, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Class not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/classes/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM classes WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Class not found' });
        res.json({ message: 'Class deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET / PUT / DELETE schedules
app.get('/admin/schedules', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, c.course_code, c.name AS course_name, se.code AS semester
            FROM schedules s
            JOIN classes cl ON s.class_id = cl.id
            JOIN courses c ON cl.course_id = c.id
            JOIN semesters se ON cl.semester_id = se.id
            ORDER BY s.id DESC
        `);
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/schedules/:id', async (req, res) => {
    const { class_id, day_of_week, start_time, end_time, room } = req.body;
    try {
        const result = await pool.query('UPDATE schedules SET class_id=$1, day_of_week=$2, start_time=$3, end_time=$4, room=$5 WHERE id=$6 RETURNING *', [class_id, day_of_week, start_time, end_time, room, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/schedules/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM schedules WHERE id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
        res.json({ message: 'Schedule deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API to create lecturer user
app.post('/admin/create-lecturer', async (req, res) => {
    try {
        const { name, email, password, faculty_id } = req.body;

        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'Lecturer' LIMIT 1");
        if (roleRes.rows.length === 0) return res.status(500).json({ message: 'Role Lecturer not found' });

        const role_id = roleRes.rows[0].id;
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, password, role_id]
        );

        const user_id = newUser.rows[0].id;
        await pool.query(
            `INSERT INTO lecturers (user_id, faculty_id) VALUES ($1, $2)`,
            [user_id, faculty_id]
        );

        res.json({ message: 'Lecturer created successfully', user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to create admin user
app.post('/admin/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'Admin' LIMIT 1");
        if (roleRes.rows.length === 0) return res.status(500).json({ message: 'Role Admin not found' });

        const role_id = roleRes.rows[0].id;
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, email, password, role_id]
        );

        res.json({ message: 'Admin created successfully', user_id: newUser.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET lecturers
app.get('/admin/lecturers', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.id, u.name, u.email, f.name AS faculty_name
            FROM lecturers l
            JOIN users u ON l.user_id = u.id
            JOIN faculties f ON l.faculty_id = f.id
            ORDER BY l.id DESC
        `);
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TUITION & FINANCIAL ---
app.get('/admin/tuition', async (req, res) => {
    const result = await pool.query(`
        SELECT t.*, u.name AS student_name, s.code AS semester
        FROM tuition_invoices t
        JOIN students st ON t.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN semesters s ON t.semester_id = s.id
    `);
    res.json(result.rows);
});


/* =========================================================
   👨‍🏫 ACTOR 2: LECTURER APIs
   ========================================================= */

/**
 * 1. Xem lịch giảng dạy (Danh sách các lớp học phần được phân công)
 */
app.get('/lecturer/:id/classes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id AS class_id, co.course_code, co.name AS course_name, c.status, 
                   s.day_of_week, s.start_time, s.end_time, s.room, se.code AS semester
            FROM classes c
            JOIN courses co ON c.course_id = co.id
            JOIN schedules s ON c.id = s.class_id
            JOIN semesters se ON c.semester_id = se.id
            WHERE c.lecturer_id = $1
            ORDER BY se.start_date DESC, s.day_of_week
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 2. Xem danh sách sinh viên của lớp
 */
app.get('/lecturer/classes/:class_id/students', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id AS enrollment_id, s.student_code, u.name AS student_name, e.status
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE e.class_id = $1 AND e.status != 'dropped'
        `, [req.params.class_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 3. Lấy cấu hình điểm của một môn (Để render form nhập điểm)
 */
app.get('/lecturer/classes/:class_id/grade-components', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT gc.* FROM grade_components gc
            JOIN classes c ON gc.course_id = c.course_id
            WHERE c.id = $1
        `, [req.params.class_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 4. Nhập / Chỉnh sửa điểm cho sinh viên (Sử dụng trigger để tính final_grade tự động)
 */
app.post('/lecturer/grades', async (req, res) => {
    const { enrollment_id, component_id, score } = req.body;
    try {
        // Kiểm tra xem đã có điểm chưa, nếu có thì UPDATE, chưa có thì INSERT
        const check = await pool.query(`SELECT id FROM grade_results WHERE enrollment_id = $1 AND component_id = $2`, [enrollment_id, component_id]);
        
        if (check.rows.length > 0) {
            // DB Trigger trg_prevent_grade_update sẽ chặn nếu điểm đã bị khoá
            await pool.query(`UPDATE grade_results SET score = $1 WHERE id = $2`, [score, check.rows[0].id]);
        } else {
            await pool.query(`INSERT INTO grade_results(enrollment_id, component_id, score) VALUES($1, $2, $3)`, [enrollment_id, component_id, score]);
        }
        
        res.json({ message: 'Grade updated successfully' });
    } catch (err) { 
        // Lỗi từ các DB Triggers (vd: "Điểm đã bị khóa!") sẽ được bắt ở đây
        res.status(400).json({ error: err.message }); 
    }
});

/**
 * 5. Lấy tất cả điểm của sinh viên trong lớp
 */
app.get('/lecturer/classes/:class_id/grades', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id AS enrollment_id, s.student_code, u.name AS student_name, 
                   gc.id AS component_id, gc.name AS component_name, gc.weight,
                   gr.score, fg.total_score, fg.letter_grade, fg.is_passed
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN classes c ON e.class_id = c.id
            JOIN grade_components gc ON gc.course_id = c.course_id
            LEFT JOIN grade_results gr ON gr.enrollment_id = e.id AND gr.component_id = gc.id
            LEFT JOIN final_grades fg ON fg.enrollment_id = e.id
            WHERE e.class_id = $1 AND e.status != 'dropped'
            ORDER BY s.student_code, gc.id
        `, [req.params.class_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


/* =========================================================
   🎓 ACTOR 3: STUDENT APIs
   ========================================================= */

/**
 * 1. Xem danh sách các lớp đang mở trong kỳ (Để đăng ký)
 */
app.get('/student/available-classes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id AS class_id, co.course_code, co.name AS course_name, co.credits,
                   u.name AS lecturer_name, c.max_students,
                   (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id AND status != 'dropped') AS enrolled_count,
                   s.day_of_week, s.start_time, s.end_time, s.room, se.code AS semester_code
            FROM classes c
            JOIN courses co ON c.course_id = co.id
            JOIN lecturers l ON c.lecturer_id = l.id
            JOIN users u ON l.user_id = u.id
            JOIN semesters se ON c.semester_id = se.id
            JOIN schedules s ON c.id = s.class_id
            WHERE c.status = 'open' OR c.status = 'planned'
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 2. CORE FEATURE: Đăng ký học phần
 * Mọi Logic (Sĩ số, Trùng lịch, Môn tiên quyết, Thời gian) đều được DB Triggers xử lý!
 */
app.post('/student/enroll', async (req, res) => {
    const { student_id, class_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO enrollments (student_id, class_id, status) VALUES ($1, $2, 'enrolled') RETURNING *`,
            [student_id, class_id]
        );
        res.json({ message: 'Đăng ký thành công!', data: result.rows[0] });
    } catch (err) {
        // Trả lỗi từ Trigger về thẳng UI (vd: "Class is full!", "Prerequisite not satisfied!")
        res.status(400).json({ error: err.message });
    }
});

/**
 * 3. Hủy đăng ký học phần (Drop course)
 * Trigger trg_update_tuition sẽ tự động trừ học phí.
 */
app.delete('/student/:student_id/enroll/:class_id', async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM enrollments WHERE student_id = $1 AND class_id = $2`,
            [req.params.student_id, req.params.class_id]
        );
        res.json({ message: 'Hủy đăng ký thành công. Đã cập nhật công nợ học phí.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * 4. Xem thời khóa biểu cá nhân
 */
app.get('/student/:id/timetable', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT co.course_code, co.name AS course_name, s.day_of_week, s.start_time, s.end_time, s.room, u.name AS lecturer_name
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN courses co ON c.course_id = co.id
            JOIN schedules s ON c.id = s.class_id
            JOIN lecturers l ON c.lecturer_id = l.id
            JOIN users u ON l.user_id = u.id
            WHERE e.student_id = $1 AND e.status != 'dropped'
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 5. Xem điểm & Kết quả học tập
 */
app.get('/student/:id/grades', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT co.course_code, co.name AS course_name, co.credits,
                   fg.total_score, fg.letter_grade, fg.is_passed
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN courses co ON c.course_id = co.id
            LEFT JOIN final_grades fg ON e.id = fg.enrollment_id
            WHERE e.student_id = $1 AND e.status != 'dropped'
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 6. Xem công nợ học phí
 */
app.get('/student/:id/tuition', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT se.code AS semester_code, t.total_amount, t.paid_amount, t.status, t.due_date
            FROM tuition_invoices t
            JOIN semesters se ON t.semester_id = se.id
            WHERE t.student_id = $1
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 7. Sinh viên tự thanh toán học phí (Giả lập)
 * Trigger trg_update_invoice tự động update trạng thái hoá đơn
 */
app.post('/student/pay', async (req, res) => {
    const { invoice_id, amount, payment_method } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO payment_transactions(invoice_id, amount, payment_method, status) 
             VALUES($1, $2, $3, 'success') RETURNING *`,
            [invoice_id, amount, payment_method]
        );
        res.json({ message: 'Thanh toán thành công!', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
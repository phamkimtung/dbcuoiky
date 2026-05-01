import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);

    // States for data
    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [prerequisites, setPrerequisites] = useState([]);
    const [gradeComponents, setGradeComponents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [users, setUsers] = useState([]);

    // Form states
    const [facultyForm, setFacultyForm] = useState({ code: '', name: '' });
    const [majorForm, setMajorForm] = useState({ faculty_id: '', code: '', name: '' });
    const [courseForm, setCourseForm] = useState({ course_code: '', name: '', credits: '', credit_price: '' });
    const [prereqForm, setPrereqForm] = useState({ course_id: '', prerequisite_id: '' });
    const [gradeForm, setGradeForm] = useState({ course_id: '', name: '', weight: '' });
    const [semesterForm, setSemesterForm] = useState({ code: '', year: '', start_date: '', end_date: '', reg_start_time: '', reg_end_time: '' });
    const [classForm, setClassForm] = useState({ course_id: '', lecturer_id: '', semester_id: '', max_students: '' });
    const [scheduleForm, setScheduleForm] = useState({ class_id: '', day_of_week: '', start_time: '', end_time: '', room: '' });
    const [lecturerForm, setLecturerForm] = useState({ name: '', email: '', password: '', faculty_id: '' });
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

    const API_BASE = 'http://localhost:3000';

    // Fetch functions
    const fetchStats = async () => {
        const res = await fetch(`${API_BASE}/admin/stats`);
        const data = await res.json();
        setStats(data);
    };

    const fetchFaculties = async () => {
        const res = await fetch(`${API_BASE}/admin/faculties`);
        const data = await res.json();
        setFaculties(data.data);
    };

    const fetchMajors = async () => {
        const res = await fetch(`${API_BASE}/admin/majors`);
        const data = await res.json();
        setMajors(data.data);
    };

    const fetchCourses = async () => {
        const res = await fetch(`${API_BASE}/admin/courses`);
        const data = await res.json();
        setCourses(data.data);
    };

    const fetchPrerequisites = async () => {
        const res = await fetch(`${API_BASE}/admin/prerequisites`);
        const data = await res.json();
        setPrerequisites(data.data);
    };

    const fetchGradeComponents = async () => {
        const res = await fetch(`${API_BASE}/admin/grade-components`);
        const data = await res.json();
        setGradeComponents(data.data);
    };

    const fetchSemesters = async () => {
        const res = await fetch(`${API_BASE}/admin/semesters`);
        const data = await res.json();
        setSemesters(data.data);
    };

    const fetchClasses = async () => {
        const res = await fetch(`${API_BASE}/admin/classes`);
        const data = await res.json();
        setClasses(data.data);
    };

    const fetchSchedules = async () => {
        const res = await fetch(`${API_BASE}/admin/schedules`);
        const data = await res.json();
        setSchedules(data.data);
    };

    const fetchLecturers = async () => {
        const res = await fetch(`${API_BASE}/admin/lecturers`);
        const data = await res.json();
        setLecturers(data.data);
    };

    const fetchUsers = async () => {
        const res = await fetch(`${API_BASE}/admin/users`);
        const data = await res.json();
        setUsers(data);
    };

    useEffect(() => {
        fetchStats();
        fetchFaculties();
        fetchMajors();
        fetchCourses();
        fetchPrerequisites();
        fetchGradeComponents();
        fetchSemesters();
        fetchClasses();
        fetchSchedules();
        fetchLecturers();
        fetchUsers();
    }, []);

    // Handle form submissions
    const handleFacultySubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/faculties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(facultyForm)
        });
        setFacultyForm({ code: '', name: '' });
        fetchFaculties();
    };

    const handleMajorSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/majors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(majorForm)
        });
        setMajorForm({ faculty_id: '', code: '', name: '' });
        fetchMajors();
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseForm)
        });
        setCourseForm({ course_code: '', name: '', credits: '', credit_price: '' });
        fetchCourses();
    };

    const handlePrereqSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/prerequisites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prereqForm)
        });
        setPrereqForm({ course_id: '', prerequisite_id: '' });
        fetchPrerequisites();
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/grade-components`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gradeForm)
        });
        setGradeForm({ course_id: '', name: '', weight: '' });
        fetchGradeComponents();
    };

    const handleSemesterSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/semesters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(semesterForm)
        });
        setSemesterForm({ code: '', year: '', start_date: '', end_date: '', reg_start_time: '', reg_end_time: '' });
        fetchSemesters();
    };

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classForm)
        });
        setClassForm({ course_id: '', lecturer_id: '', semester_id: '', max_students: '' });
        fetchClasses();
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleForm)
        });
        setScheduleForm({ class_id: '', day_of_week: '', start_time: '', end_time: '', room: '' });
        fetchSchedules();
    };

    const handleLecturerSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/create-lecturer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lecturerForm)
        });
        setLecturerForm({ name: '', email: '', password: '', faculty_id: '' });
        fetchLecturers();
        fetchUsers();
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE}/admin/create-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminForm)
        });
        setAdminForm({ name: '', email: '', password: '' });
        fetchUsers();
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleStatusUpdate = async (classId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/admin/classes/${classId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) { fetchClasses(); fetchStats(); }
            else alert('Cập nhật thất bại');
        } catch { alert('Lỗi kết nối'); }
    };

    const formatVND = (n) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0);

    return (
        <div className="admin-dashboard">
            <header>
                <h1>Chào mừng, {user?.name}!</h1>
                <p>Vai trò: Quản trị viên (Admin)</p>
                <button onClick={handleLogout} className="logout-button">Đăng Xuất</button>
            </header>

            <nav className="admin-nav">
                <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>📊 Thống Kê</button>
                <button onClick={() => setActiveTab('faculties')} className={activeTab === 'faculties' ? 'active' : ''}>Khoa</button>
                <button onClick={() => setActiveTab('majors')} className={activeTab === 'majors' ? 'active' : ''}>Chuyên ngành</button>
                <button onClick={() => setActiveTab('courses')} className={activeTab === 'courses' ? 'active' : ''}>Môn học</button>
                <button onClick={() => setActiveTab('prerequisites')} className={activeTab === 'prerequisites' ? 'active' : ''}>Môn tiên quyết</button>
                <button onClick={() => setActiveTab('grades')} className={activeTab === 'grades' ? 'active' : ''}>Cấu hình điểm</button>
                <button onClick={() => setActiveTab('semesters')} className={activeTab === 'semesters' ? 'active' : ''}>Học kỳ</button>
                <button onClick={() => setActiveTab('classes')} className={activeTab === 'classes' ? 'active' : ''}>Lớp học phần</button>
                <button onClick={() => setActiveTab('schedules')} className={activeTab === 'schedules' ? 'active' : ''}>Lịch học</button>
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Tài khoản</button>
            </nav>

            <main className="admin-content">
                {activeTab === 'stats' && (
                    <div className="section">
                        <h2>📊 Thống Kê Tổng Quan</h2>
                        {stats ? (
                            <div>
                                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px',marginBottom:'32px'}}>
                                    {[{icon:'🎓',label:'Tổng Sinh Viên',val:stats.total_students,color:'#6366f1'},
                                      {icon:'👨‍🏫',label:'Tổng Giảng Viên',val:stats.total_lecturers,color:'#0ea5e9'},
                                      {icon:'📚',label:'Tổng Lớp Học',val:stats.total_classes,color:'#8b5cf6'},
                                      {icon:'🟢',label:'Lớp Đang Mở',val:stats.open_classes,color:'#16a34a'},
                                      {icon:'💰',label:'Tổng Học Phí',val:formatVND(stats.total_revenue),color:'#d97706'},
                                      {icon:'✅',label:'Đã Thu',val:formatVND(stats.paid_revenue),color:'#059669'},
                                    ].map((s,i) => (
                                        <div key={i} style={{background:`linear-gradient(135deg,${s.color}22,${s.color}11)`,border:`2px solid ${s.color}44`,borderRadius:'16px',padding:'24px',textAlign:'center'}}>
                                            <div style={{fontSize:'2.2rem',marginBottom:'8px'}}>{s.icon}</div>
                                            <div style={{fontSize:'1.8rem',fontWeight:800,color:s.color}}>{s.val}</div>
                                            <div style={{fontSize:'0.85rem',color:'#6b7280',marginTop:'4px',fontWeight:500}}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{background:'#f0fdf4',border:'2px solid #bbf7d0',borderRadius:'12px',padding:'20px'}}>
                                    <strong style={{color:'#16a34a'}}>💡 Tỉ lệ thu học phí: </strong>
                                    <span style={{fontWeight:700}}>
                                        {stats.total_revenue > 0 ? ((stats.paid_revenue/stats.total_revenue)*100).toFixed(1) : 0}%
                                    </span>
                                    <span style={{color:'#6b7280',marginLeft:'8px'}}>({formatVND(stats.total_revenue - stats.paid_revenue)} chưa thu)</span>
                                </div>
                            </div>
                        ) : <p>Đang tải...</p>}
                    </div>
                )}
                {activeTab === 'faculties' && (
                    <div className="section">
                        <h2>Quản lý Khoa</h2>
                        <form onSubmit={handleFacultySubmit}>
                            <input type="text" placeholder="Mã khoa" value={facultyForm.code} onChange={e => setFacultyForm({...facultyForm, code: e.target.value})} required />
                            <input type="text" placeholder="Tên khoa" value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} required />
                            <button type="submit">Thêm Khoa</button>
                        </form>
                        <ul>
                            {faculties.map(f => <li key={f.id}>{f.code} - {f.name}</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'majors' && (
                    <div className="section">
                        <h2>Quản lý Chuyên ngành</h2>
                        <form onSubmit={handleMajorSubmit}>
                            <select value={majorForm.faculty_id} onChange={e => setMajorForm({...majorForm, faculty_id: e.target.value})} required>
                                <option value="">Chọn khoa</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                            <input type="text" placeholder="Mã chuyên ngành" value={majorForm.code} onChange={e => setMajorForm({...majorForm, code: e.target.value})} required />
                            <input type="text" placeholder="Tên chuyên ngành" value={majorForm.name} onChange={e => setMajorForm({...majorForm, name: e.target.value})} required />
                            <button type="submit">Thêm Chuyên ngành</button>
                        </form>
                        <ul>
                            {majors.map(m => <li key={m.id}>{m.code} - {m.name} ({m.faculty_name})</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="section">
                        <h2>Quản lý Môn học</h2>
                        <form onSubmit={handleCourseSubmit}>
                            <input type="text" placeholder="Mã môn học" value={courseForm.course_code} onChange={e => setCourseForm({...courseForm, course_code: e.target.value})} required />
                            <input type="text" placeholder="Tên môn học" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} required />
                            <input type="number" placeholder="Số tín chỉ" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: e.target.value})} required />
                            <input type="number" step="0.01" placeholder="Giá tín chỉ" value={courseForm.credit_price} onChange={e => setCourseForm({...courseForm, credit_price: e.target.value})} required />
                            <button type="submit">Thêm Môn học</button>
                        </form>
                        <ul>
                            {courses.map(c => <li key={c.id}>{c.course_code} - {c.name} ({c.credits} tín chỉ)</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'prerequisites' && (
                    <div className="section">
                        <h2>Quản lý Môn tiên quyết</h2>
                        <form onSubmit={handlePrereqSubmit}>
                            <select value={prereqForm.course_id} onChange={e => setPrereqForm({...prereqForm, course_id: e.target.value})} required>
                                <option value="">Chọn môn học</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>)}
                            </select>
                            <select value={prereqForm.prerequisite_id} onChange={e => setPrereqForm({...prereqForm, prerequisite_id: e.target.value})} required>
                                <option value="">Chọn môn tiên quyết</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>)}
                            </select>
                            <button type="submit">Thêm Môn tiên quyết</button>
                        </form>
                        <ul>
                            {prerequisites.map(p => <li key={p.id}>{p.course_code} yêu cầu {p.prereq_code}</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="section">
                        <h2>Quản lý Cấu hình điểm</h2>
                        <form onSubmit={handleGradeSubmit}>
                            <select value={gradeForm.course_id} onChange={e => setGradeForm({...gradeForm, course_id: e.target.value})} required>
                                <option value="">Chọn môn học</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>)}
                            </select>
                            <input type="text" placeholder="Tên thành phần điểm" value={gradeForm.name} onChange={e => setGradeForm({...gradeForm, name: e.target.value})} required />
                            <input type="number" step="0.01" placeholder="Trọng số (%)" value={gradeForm.weight} onChange={e => setGradeForm({...gradeForm, weight: e.target.value})} required />
                            <button type="submit">Thêm Thành phần điểm</button>
                        </form>
                        <ul>
                            {gradeComponents.map(g => <li key={g.id}>{g.course_code}: {g.name} ({g.weight}%)</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'semesters' && (
                    <div className="section">
                        <h2>Quản lý Học kỳ</h2>
                        <form onSubmit={handleSemesterSubmit}>
                            <input type="text" placeholder="Mã học kỳ" value={semesterForm.code} onChange={e => setSemesterForm({...semesterForm, code: e.target.value})} required />
                            <input type="number" placeholder="Năm" value={semesterForm.year} onChange={e => setSemesterForm({...semesterForm, year: e.target.value})} required />
                            <input type="date" placeholder="Ngày bắt đầu" value={semesterForm.start_date} onChange={e => setSemesterForm({...semesterForm, start_date: e.target.value})} required />
                            <input type="date" placeholder="Ngày kết thúc" value={semesterForm.end_date} onChange={e => setSemesterForm({...semesterForm, end_date: e.target.value})} required />
                            <input type="datetime-local" placeholder="Thời gian mở đăng ký" value={semesterForm.reg_start_time} onChange={e => setSemesterForm({...semesterForm, reg_start_time: e.target.value})} required />
                            <input type="datetime-local" placeholder="Thời gian đóng đăng ký" value={semesterForm.reg_end_time} onChange={e => setSemesterForm({...semesterForm, reg_end_time: e.target.value})} required />
                            <button type="submit">Thêm Học kỳ</button>
                        </form>
                        <ul>
                            {semesters.map(s => <li key={s.id}>{s.code} - {s.year}</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="section">
                        <h2>Quản lý Lớp học phần</h2>
                        <form onSubmit={handleClassSubmit}>
                            <select value={classForm.course_id} onChange={e => setClassForm({...classForm, course_id: e.target.value})} required>
                                <option value="">Chọn môn học</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>)}
                            </select>
                            <select value={classForm.lecturer_id} onChange={e => setClassForm({...classForm, lecturer_id: e.target.value})} required>
                                <option value="">Chọn giảng viên</option>
                                {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                            <select value={classForm.semester_id} onChange={e => setClassForm({...classForm, semester_id: e.target.value})} required>
                                <option value="">Chọn học kỳ</option>
                                {semesters.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                            </select>
                            <input type="number" placeholder="Sĩ số tối đa" value={classForm.max_students} onChange={e => setClassForm({...classForm, max_students: e.target.value})} required />
                            <button type="submit">Thêm Lớp học phần</button>
                        </form>
                        <table style={{width:'100%',borderCollapse:'collapse',marginTop:'20px'}}>
                            <thead style={{background:'#6366f1',color:'white'}}>
                                <tr><th style={{padding:'12px',textAlign:'left'}}>Môn học</th><th style={{padding:'12px',textAlign:'left'}}>Giảng viên</th><th style={{padding:'12px',textAlign:'left'}}>Học kỳ</th><th style={{padding:'12px',textAlign:'left'}}>Trạng thái</th><th style={{padding:'12px',textAlign:'left'}}>Đổi trạng thái</th></tr>
                            </thead>
                            <tbody>
                                {classes.map(c => {
                                    const statusColors = {planned:'#6b7280',open:'#16a34a',closed:'#dc2626'};
                                    return (
                                        <tr key={c.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                                            <td style={{padding:'12px'}}>{c.course_name}</td>
                                            <td style={{padding:'12px'}}>{c.lecturer_name}</td>
                                            <td style={{padding:'12px'}}>{c.semester}</td>
                                            <td style={{padding:'12px'}}>
                                                <span style={{background:statusColors[c.status]||'#6b7280',color:'white',padding:'3px 10px',borderRadius:'12px',fontSize:'0.82rem',fontWeight:600}}>{c.status}</span>
                                            </td>
                                            <td style={{padding:'12px'}}>
                                                <select value={c.status} onChange={e=>handleStatusUpdate(c.id,e.target.value)} style={{padding:'5px 8px',borderRadius:'6px',border:'1.5px solid #e5e7eb',fontSize:'0.85rem',cursor:'pointer'}}>
                                                    <option value="planned">planned</option>
                                                    <option value="open">open</option>
                                                    <option value="closed">closed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="section">
                        <h2>Quản lý Lịch học</h2>
                        <form onSubmit={handleScheduleSubmit}>
                            <select value={scheduleForm.class_id} onChange={e => setScheduleForm({...scheduleForm, class_id: e.target.value})} required>
                                <option value="">Chọn lớp học phần</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.course_name} - {c.lecturer_name}</option>)}
                            </select>
                            <select value={scheduleForm.day_of_week} onChange={e => setScheduleForm({...scheduleForm, day_of_week: e.target.value})} required>
                                <option value="">Chọn ngày</option>
                                <option value="2">Thứ 2</option>
                                <option value="3">Thứ 3</option>
                                <option value="4">Thứ 4</option>
                                <option value="5">Thứ 5</option>
                                <option value="6">Thứ 6</option>
                                <option value="7">Thứ 7</option>
                                <option value="8">Chủ nhật</option>
                            </select>
                            <input type="time" placeholder="Giờ bắt đầu" value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} required />
                            <input type="time" placeholder="Giờ kết thúc" value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} required />
                            <input type="text" placeholder="Phòng học" value={scheduleForm.room} onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})} required />
                            <button type="submit">Thêm Lịch học</button>
                        </form>
                        <ul>
                            {schedules.map(s => <li key={s.id}>{s.course_name} - Thứ {s.day_of_week} {s.start_time}-{s.end_time} phòng {s.room}</li>)}
                        </ul>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="section">
                        <h2>Quản lý Tài khoản</h2>
                        <div className="sub-section">
                            <h3>Tạo Giảng viên</h3>
                            <form onSubmit={handleLecturerSubmit}>
                                <input type="text" placeholder="Tên" value={lecturerForm.name} onChange={e => setLecturerForm({...lecturerForm, name: e.target.value})} required />
                                <input type="email" placeholder="Email" value={lecturerForm.email} onChange={e => setLecturerForm({...lecturerForm, email: e.target.value})} required />
                                <input type="password" placeholder="Mật khẩu" value={lecturerForm.password} onChange={e => setLecturerForm({...lecturerForm, password: e.target.value})} required />
                                <select value={lecturerForm.faculty_id} onChange={e => setLecturerForm({...lecturerForm, faculty_id: e.target.value})} required>
                                    <option value="">Chọn khoa</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <button type="submit">Tạo Giảng viên</button>
                            </form>
                        </div>
                        <div className="sub-section">
                            <h3>Tạo Admin</h3>
                            <form onSubmit={handleAdminSubmit}>
                                <input type="text" placeholder="Tên" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
                                <input type="email" placeholder="Email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
                                <input type="password" placeholder="Mật khẩu" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required />
                                <button type="submit">Tạo Admin</button>
                            </form>
                        </div>
                        <h3>Danh sách Người dùng</h3>
                        <ul>
                            {users.map(u => <li key={u.id}>{u.name} - {u.email} ({u.role})</li>)}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
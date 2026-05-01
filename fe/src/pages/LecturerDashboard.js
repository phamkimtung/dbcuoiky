import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LecturerDashboard.css';

const LecturerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('schedule');

    // States
    const [myClasses, setMyClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [gradeComponents, setGradeComponents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [gradeForm, setGradeForm] = useState({ enrollment_id: '', component_id: '', score: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isClassLocked, setIsClassLocked] = useState(false);
    const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

    const API_BASE = 'http://localhost:3000';

    // Fetch lecturer's classes
    const fetchMyClasses = async () => {
        try {
            const res = await fetch(`${API_BASE}/lecturer/${user?.id}/classes`);
            const data = await res.json();
            setMyClasses(data);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setMessage('Lỗi khi tải danh sách lớp');
        }
    };

    // Fetch students in class
    const fetchStudents = async (classId) => {
        try {
            const res = await fetch(`${API_BASE}/lecturer/classes/${classId}/students`);
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
            setMessage('Lỗi khi tải danh sách sinh viên');
        }
    };

    // Fetch grade components
    const fetchGradeComponents = async (classId) => {
        try {
            const res = await fetch(`${API_BASE}/lecturer/classes/${classId}/grade-components`);
            const data = await res.json();
            setGradeComponents(data);
        } catch (err) {
            console.error('Error fetching grade components:', err);
            setMessage('Lỗi khi tải cấu hình điểm');
        }
    };

    // Fetch all grades for class
    const fetchGrades = async (classId) => {
        try {
            const res = await fetch(`${API_BASE}/lecturer/classes/${classId}/grades`);
            const data = await res.json();
            setGrades(data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setMessage('Lỗi khi tải điểm số');
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchMyClasses();
        }
    }, [user?.id]);

    const handleClassSelect = (classData) => {
        setSelectedClass(classData);
        setIsClassLocked(classData.is_locked || false);
        fetchStudents(classData.class_id);
        fetchGradeComponents(classData.class_id);
        fetchGrades(classData.class_id);
    };

    const handleLockGrades = async (lock) => {
        if (!selectedClass) return;
        const endpoint = lock ? 'lock-grades' : 'unlock-grades';
        const confirm = window.confirm(lock ? 'Khoá điểm lớp này? Sau khi khoá không thể chỉnh sửa điểm!' : 'Mở khoá điểm lớp này?');
        if (!confirm) return;
        try {
            const res = await fetch(`${API_BASE}/lecturer/classes/${selectedClass.class_id}/${endpoint}`, { method: 'POST' });
            const data = await res.json();
            setMessage(res.ok ? data.message : 'Lỗi: ' + data.error);
            if (res.ok) setIsClassLocked(lock);
        } catch { setMessage('Lỗi kết nối'); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.new_password !== pwForm.confirm_password) { setMessage('Mật khẩu mới không khớp!'); return; }
        try {
            const res = await fetch(`${API_BASE}/user/${user.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password })
            });
            const data = await res.json();
            setMessage(res.ok ? '✓ ' + data.message : '✗ ' + (data.message || data.error));
            if (res.ok) setPwForm({ old_password: '', new_password: '', confirm_password: '' });
        } catch { setMessage('Lỗi kết nối'); }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!gradeForm.enrollment_id || !gradeForm.component_id || gradeForm.score === '') {
            setMessage('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/lecturer/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollment_id: parseInt(gradeForm.enrollment_id),
                    component_id: parseInt(gradeForm.component_id),
                    score: parseFloat(gradeForm.score)
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Cập nhật điểm thành công!');
                setGradeForm({ enrollment_id: '', component_id: '', score: '' });
                fetchGrades(selectedClass.class_id);
            } else {
                setMessage('Lỗi: ' + data.error);
            }
        } catch (err) {
            setMessage('Lỗi kết nối: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Group grades by student
    const getStudentGrades = (enrollmentId) => {
        return grades.filter(g => g.enrollment_id === enrollmentId);
    };

    return (
        <div className="lecturer-dashboard">
            <header>
                <h1>Chào mừng, {user?.name}!</h1>
                <p>Vai trò: Giảng viên (Lecturer)</p>
                <button onClick={handleLogout} className="logout-button">Đăng Xuất</button>
            </header>

            <nav className="lecturer-nav">
                <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'active' : ''}>Lịch giảng dạy</button>
                <button onClick={() => setActiveTab('students')} className={activeTab === 'students' ? 'active' : ''}>Danh sách lớp</button>
                <button onClick={() => setActiveTab('grades')} className={activeTab === 'grades' ? 'active' : ''}>Quản lý điểm</button>
                <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? 'active' : ''}>🔑 Đổi Mật Khẩu</button>
            </nav>

            <main className="lecturer-content">
                {message && <div className="message">{message}</div>}

                {activeTab === 'schedule' && (
                    <div className="section">
                        <h2>Lịch giảng dạy</h2>
                        {myClasses.length === 0 ? (
                            <p>Không có lớp nào được phân công</p>
                        ) : (
                            <div className="schedule-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã môn</th>
                                            <th>Tên môn</th>
                                            <th>Thứ</th>
                                            <th>Giờ bắt đầu</th>
                                            <th>Giờ kết thúc</th>
                                            <th>Phòng</th>
                                            <th>Học kỳ</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myClasses.map((cls, idx) => (
                                            <tr key={idx} onClick={() => handleClassSelect(cls)} style={{cursor: 'pointer', backgroundColor: selectedClass?.class_id === cls.class_id ? '#e7f3ff' : ''}}>
                                                <td>{cls.course_code}</td>
                                                <td>{cls.course_name}</td>
                                                <td>Thứ {cls.day_of_week}</td>
                                                <td>{cls.start_time}</td>
                                                <td>{cls.end_time}</td>
                                                <td>{cls.room}</td>
                                                <td>{cls.semester}</td>
                                                <td>{cls.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="section">
                        <h2>Danh sách sinh viên</h2>
                        {!selectedClass ? (
                            <p>Vui lòng chọn lớp từ tab "Lịch giảng dạy"</p>
                        ) : (
                            <>
                                <h3>{selectedClass.course_name} - {selectedClass.semester}</h3>
                                {students.length === 0 ? (
                                    <p>Lớp này không có sinh viên nào đăng ký</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã sinh viên</th>
                                                <th>Tên sinh viên</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, idx) => (
                                                <tr key={student.enrollment_id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{student.student_code}</td>
                                                    <td>{student.student_name}</td>
                                                    <td>{student.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="section">
                        <h2>Quản lý điểm số</h2>
                        {!selectedClass ? (
                            <p>Vui lòng chọn lớp từ tab "Lịch giảng dạy"</p>
                        ) : (
                            <>
                                <h3>{selectedClass.course_name} - {selectedClass.semester}</h3>

                                <div className="grade-input-form">
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                                        <h4>Nhập/Chỉnh sửa điểm</h4>
                                        <div>
                                            {isClassLocked ? (
                                                <span style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                                    <span style={{background:'#fef2f2',color:'#dc2626',padding:'6px 12px',borderRadius:'6px',fontWeight:600,fontSize:'0.88rem'}}>🔒 Điểm đã bị khoá</span>
                                                    <button onClick={()=>handleLockGrades(false)} style={{background:'#f59e0b',color:'white',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600,fontSize:'0.85rem'}}>🔓 Mở Khoá</button>
                                                </span>
                                            ) : (
                                                <button onClick={()=>handleLockGrades(true)} style={{background:'#dc2626',color:'white',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontWeight:600,fontSize:'0.85rem'}}>🔒 Khoá Điểm Lớp</button>
                                            )}
                                        </div>
                                    </div>
                                    <form onSubmit={handleGradeSubmit}>
                                        <select 
                                            value={gradeForm.enrollment_id} 
                                            onChange={e => setGradeForm({...gradeForm, enrollment_id: e.target.value})} 
                                            required
                                        >
                                            <option value="">Chọn sinh viên</option>
                                            {students.map(s => (
                                                <option key={s.enrollment_id} value={s.enrollment_id}>
                                                    {s.student_code} - {s.student_name}
                                                </option>
                                            ))}
                                        </select>

                                        <select 
                                            value={gradeForm.component_id} 
                                            onChange={e => setGradeForm({...gradeForm, component_id: e.target.value})} 
                                            required
                                        >
                                            <option value="">Chọn thành phần điểm</option>
                                            {gradeComponents.map(gc => (
                                                <option key={gc.id} value={gc.id}>
                                                    {gc.name} ({gc.weight}%)
                                                </option>
                                            ))}
                                        </select>

                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="10" 
                                            placeholder="Điểm (0-10)" 
                                            value={gradeForm.score}
                                            onChange={e => setGradeForm({...gradeForm, score: e.target.value})}
                                            required
                                        />

                                        <button type="submit" disabled={loading}>
                                            {loading ? 'Đang cập nhật...' : 'Cập nhật điểm'}
                                        </button>
                                    </form>
                                </div>

                                <div className="grade-table">
                                    <h4>Bảng điểm</h4>
                                    {students.length === 0 ? (
                                        <p>Không có sinh viên nào</p>
                                    ) : (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Mã SV</th>
                                                    <th>Tên sinh viên</th>
                                                    {gradeComponents.map(gc => (
                                                        <th key={gc.id}>{gc.name}</th>
                                                    ))}
                                                    <th>Điểm tổng kết</th>
                                                    <th>Kết quả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map(student => {
                                                    const studentGrades = getStudentGrades(student.enrollment_id);
                                                    const totalScore = studentGrades.length > 0 ? studentGrades[0].total_score : null;
                                                    const letterGrade = studentGrades.length > 0 ? studentGrades[0].letter_grade : '-';

                                                    return (
                                                        <tr key={student.enrollment_id}>
                                                            <td>{student.student_code}</td>
                                                            <td>{student.student_name}</td>
                                                            {gradeComponents.map(gc => {
                                                                const gradeData = studentGrades.find(g => g.component_id === gc.id);
                                                                return (
                                                                    <td key={gc.id}>
                                                                        {gradeData?.score !== null && gradeData?.score !== undefined ? gradeData.score.toFixed(2) : '-'}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td style={{fontWeight: 'bold'}}>
                                                                {totalScore !== null ? totalScore.toFixed(2) : '-'}
                                                            </td>
                                                            <td>{letterGrade}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="section">
                        <h2>🔑 Đổi Mật Khẩu</h2>
                        <div style={{maxWidth:'480px'}}>
                            <form onSubmit={handleChangePassword}>
                                <div style={{marginBottom:'16px'}}><label style={{display:'block',marginBottom:'6px',fontWeight:600}}>Mật khẩu hiện tại</label>
                                    <input type="password" value={pwForm.old_password} onChange={e=>setPwForm({...pwForm,old_password:e.target.value})} required placeholder="Nhập mật khẩu hiện tại" style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1.5px solid #e5e7eb',fontSize:'0.95rem',boxSizing:'border-box'}} /></div>
                                <div style={{marginBottom:'16px'}}><label style={{display:'block',marginBottom:'6px',fontWeight:600}}>Mật khẩu mới</label>
                                    <input type="password" value={pwForm.new_password} onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} required placeholder="Nhập mật khẩu mới" style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1.5px solid #e5e7eb',fontSize:'0.95rem',boxSizing:'border-box'}} /></div>
                                <div style={{marginBottom:'24px'}}><label style={{display:'block',marginBottom:'6px',fontWeight:600}}>Xác nhận mật khẩu mới</label>
                                    <input type="password" value={pwForm.confirm_password} onChange={e=>setPwForm({...pwForm,confirm_password:e.target.value})} required placeholder="Nhập lại mật khẩu mới" style={{width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1.5px solid #e5e7eb',fontSize:'0.95rem',boxSizing:'border-box'}} /></div>
                                <button type="submit" style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>🔑 Đổi Mật Khẩu</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LecturerDashboard;
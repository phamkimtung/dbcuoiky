import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import '../styles/StudentDashboard.css';

const API_URL = 'http://localhost:3000';

const formatVND = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getDayName = (dayOfWeek) => {
    const days = { 1: 'CN', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7' };
    return days[dayOfWeek] || 'N/A';
};

const getLetterGradeColor = (grade) => {
    if (!grade) return '#9ca3af';
    if (grade.startsWith('A')) return '#16a34a';
    if (grade.startsWith('B')) return '#2563eb';
    if (grade.startsWith('C')) return '#d97706';
    if (grade.startsWith('D')) return '#dc2626';
    return '#6b7280';
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [activeTab, setActiveTab] = useState('overview');
    const [availableClasses, setAvailableClasses] = useState([]);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [grades, setGrades] = useState([]);
    const [tuition, setTuition] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [studentId, setStudentId] = useState(user?.profile_id || null);
    const [gpaData, setGpaData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [payForm, setPayForm] = useState({ invoice_id: null, amount: '', payment_method: 'Chuyển khoản ngân hàng' });
    const [expandedInvoice, setExpandedInvoice] = useState(null);
    const [transactions, setTransactions] = useState({});

    useEffect(() => {
        if (!user || user.role.toLowerCase() !== 'student') {
            navigate('/login');
            return;
        }
        // Nếu profile_id bị null (localStorage cũ trước khi fix),
        // tự động fetch từ server rồi mới load data
        if (!user.profile_id) {
            fetch(`${API_URL}/student/profile-by-user/${user.id}`)
                .then(r => r.json())
                .then(data => {
                    if (data && data.id) {
                        const updated = { ...user, profile_id: data.id, student_code: data.student_code };
                        localStorage.setItem('user', JSON.stringify(updated));
                        setStudentId(data.id);
                    } else {
                        showMsg('Không tìm thấy hồ sơ sinh viên. Liên hệ phòng đào tạo.', 'error');
                    }
                })
                .catch(() => showMsg('Lỗi kết nối server.', 'error'));
        }
    }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    // Khi studentId được set (kể cả từ fallback fetch), load data
    useEffect(() => {
        if (studentId) {
            loadAllData(studentId);
        }
    }, [studentId]);

    const loadAllData = async (sid = studentId) => {
        if (!sid) return;
        setLoading(true);
        try {
            const [clsRes, enrollRes, ttRes, grRes, tuRes, gpaRes] = await Promise.all([
                fetch(`${API_URL}/student/available-classes`),
                fetch(`${API_URL}/student/${sid}/enrolled-classes`),
                fetch(`${API_URL}/student/${sid}/timetable`),
                fetch(`${API_URL}/student/${sid}/grades`),
                fetch(`${API_URL}/student/${sid}/tuition`),
                fetch(`${API_URL}/student/${sid}/gpa`),
            ]);

            const [clsData, enrollData, ttData, grData, tuData, gpaDataRes] = await Promise.all([
                clsRes.json(), enrollRes.json(), ttRes.json(), grRes.json(), tuRes.json(), gpaRes.json()
            ]);

            setAvailableClasses(Array.isArray(clsData) ? clsData : []);
            setEnrolledClasses(Array.isArray(enrollData) ? enrollData : []);
            setTimetable(Array.isArray(ttData) ? ttData : []);
            setGrades(Array.isArray(grData) ? grData : []);
            setTuition(Array.isArray(tuData) ? tuData : []);
            if (gpaDataRes && !gpaDataRes.error) setGpaData(gpaDataRes);
        } catch (err) {
            showMsg('⚠️ Lỗi tải dữ liệu: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (classId) => {
        if (!window.confirm('Bạn có chắc chắn muốn đăng ký lớp này?')) return;
        try {
            const res = await fetch(`${API_URL}/student/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId, class_id: classId })
            });
            const data = await res.json();
            if (res.ok) {
                showMsg('✓ Đăng ký thành công!');
                loadAllData();
            } else {
                showMsg('✗ ' + (data.error || 'Đăng ký thất bại'), 'error');
            }
        } catch (err) {
            showMsg('✗ Lỗi kết nối', 'error');
        }
    };

    const handleDrop = async (classId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký lớp này?')) return;
        try {
            const res = await fetch(`${API_URL}/student/${studentId}/enroll/${classId}`, { method: 'DELETE' });
            if (res.ok) {
                showMsg('✓ Hủy đăng ký thành công!');
                loadAllData();
            } else {
                showMsg('✗ Hủy đăng ký thất bại', 'error');
            }
        } catch (err) {
            showMsg('✗ Lỗi kết nối', 'error');
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        const amt = Number(payForm.amount);
        if (!amt || amt <= 0) { showMsg('✗ Số tiền không hợp lệ!', 'error'); return; }
        try {
            const res = await fetch(`${API_URL}/student/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_id: payForm.invoice_id, amount: amt, payment_method: payForm.payment_method })
            });
            const data = await res.json();
            if (res.ok) {
                showMsg(data.message);
                setPayForm({ invoice_id: null, amount: '', payment_method: 'Chuyển khoản ngân hàng' });
                loadAllData(studentId);
                if (expandedInvoice === payForm.invoice_id) fetchTransactions(payForm.invoice_id);
            } else {
                showMsg('✗ ' + data.error, 'error');
            }
        } catch { showMsg('✗ Lỗi kết nối', 'error'); }
    };

    const fetchTransactions = async (invoiceId) => {
        try {
            const res = await fetch(`${API_URL}/student/invoice/${invoiceId}/transactions`);
            const data = await res.json();
            setTransactions(prev => ({ ...prev, [invoiceId]: Array.isArray(data) ? data : [] }));
        } catch {}
    };

    const toggleExpand = (invoiceId) => {
        if (expandedInvoice === invoiceId) {
            setExpandedInvoice(null);
        } else {
            setExpandedInvoice(invoiceId);
            if (!transactions[invoiceId]) fetchTransactions(invoiceId);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.new_password !== pwForm.confirm_password) {
            showMsg('✗ Mật khẩu mới không khớp!', 'error'); return;
        }
        try {
            const res = await fetch(`${API_URL}/user/${user.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password })
            });
            const data = await res.json();
            if (res.ok) { showMsg('✓ ' + data.message); setPwForm({ old_password: '', new_password: '', confirm_password: '' }); }
            else showMsg('✗ ' + (data.message || data.error), 'error');
        } catch { showMsg('✗ Lỗi kết nối', 'error'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const totalTuition = tuition.reduce((s, i) => s + Number(i.total_amount || 0), 0);
    const totalPaid = tuition.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
    const totalRemaining = totalTuition - totalPaid;

    const enrolledClassIds = new Set(enrolledClasses.map(c => c.class_id));

    const semesterOptions = [...new Set(availableClasses.map(c => c.semester_code).filter(Boolean))];
    const filteredClasses = availableClasses.filter(cls => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !searchTerm ||
            cls.course_name.toLowerCase().includes(q) ||
            cls.course_code.toLowerCase().includes(q) ||
            (cls.lecturer_name && cls.lecturer_name.toLowerCase().includes(q));
        const matchSem = !filterSemester || cls.semester_code === filterSemester;
        return matchSearch && matchSem;
    });

    const getGPARating = (gpa) => {
        if (!gpa) return { label: 'N/A', color: '#9ca3af' };
        const g = parseFloat(gpa);
        if (g >= 3.6) return { label: 'Xuất Sắc', color: '#16a34a' };
        if (g >= 3.2) return { label: 'Giỏi', color: '#2563eb' };
        if (g >= 2.5) return { label: 'Khá', color: '#d97706' };
        if (g >= 2.0) return { label: 'Trung Bình', color: '#ea580c' };
        return { label: 'Yếu', color: '#dc2626' };
    };

    return (
        <div className="student-dashboard">
            {/* Header */}
            <div className="student-header">
                <div className="header-content">
                    <div>
                        <h1>🎓 Cổng Sinh Viên</h1>
                        <p className="welcome-text">
                            Xin chào, <strong>{user?.name}</strong>
                            {user?.student_code && <span> — MSSV: <strong>{user.student_code}</strong></span>}
                        </p>
                    </div>
                    <button onClick={handleLogout} className="logout-button">🚪 Đăng Xuất</button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
                    {message.text}
                    <button onClick={() => setMessage({ text: '', type: '' })} className="close-message">×</button>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                {[
                    { key: 'overview', label: '📊 Tổng Quan' },
                    { key: 'register', label: '✏️ Đăng Ký Học Phần' },
                    { key: 'timetable', label: '📅 Thời Khóa Biểu' },
                    { key: 'grades', label: '📈 Điểm & Kết Quả' },
                    { key: 'gpa', label: '🎓 GPA & Học Bạ' },
                    { key: 'tuition', label: '💳 Công Nợ Học Phí' },
                    { key: 'password', label: '🔑 Đổi Mật Khẩu' },
                ].map(t => (
                    <button
                        key={t.key}
                        className={`tab ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                    >{t.label}</button>
                ))}
            </div>

            <div className="tab-content">
                {loading && <p className="loading">⏳ Đang tải dữ liệu...</p>}

                {/* OVERVIEW */}
                {!loading && activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>📊 Tổng Quan</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📚</div>
                                <div className="stat-info">
                                    <h3>Lớp Đã Đăng Ký</h3>
                                    <p className="stat-number">{enrolledClasses.length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📖</div>
                                <div className="stat-info">
                                    <h3>Tổng Tín Chỉ</h3>
                                    <p className="stat-number">{enrolledClasses.reduce((s, c) => s + (Number(c.credits) || 0), 0)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Còn Nợ</h3>
                                    <p className="stat-number" style={{ fontSize: '1.2em' }}>{formatVND(totalRemaining)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-info">
                                    <h3>Môn Đã Có Điểm</h3>
                                    <p className="stat-number">{grades.filter(g => g.total_score !== null).length}/{grades.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h3>🚀 Hành Động Nhanh</h3>
                            <div className="action-buttons">
                                <button onClick={() => setActiveTab('register')} className="action-btn register-btn">✏️ Đăng Ký Lớp</button>
                                <button onClick={() => setActiveTab('timetable')} className="action-btn timetable-btn">📅 Xem Lịch</button>
                                <button onClick={() => setActiveTab('grades')} className="action-btn grades-btn">📈 Xem Điểm</button>
                                <button onClick={() => setActiveTab('tuition')} className="action-btn tuition-btn">💳 Xem Học Phí</button>
                            </div>
                        </div>

                        {/* Danh sách lớp đã đăng ký */}
                        {enrolledClasses.length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3>📋 Lớp Học Đang Đăng Ký</h3>
                                <table className="classes-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Môn</th>
                                            <th>Tên Môn</th>
                                            <th>Tín Chỉ</th>
                                            <th>Giảng Viên</th>
                                            <th>Thứ</th>
                                            <th>Giờ Học</th>
                                            <th>Phòng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledClasses.map((cls, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{cls.course_code}</strong></td>
                                                <td>{cls.course_name}</td>
                                                <td className="credits">{cls.credits}</td>
                                                <td>{cls.lecturer_name}</td>
                                                <td>{getDayName(cls.day_of_week)}</td>
                                                <td>{cls.start_time} - {cls.end_time}</td>
                                                <td>{cls.room}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ĐĂNG KÝ HỌC PHẦN */}
                {!loading && activeTab === 'register' && (
                    <div className="register-section">
                        <h2>✏️ Đăng Ký Học Phần</h2>

                        <div className="registration-info">
                            <div className="info-box">
                                <span className="info-icon">ℹ️</span>
                                <div>
                                    <strong>Chú ý:</strong> Hệ thống tự động kiểm tra trùng lịch, sức chứa và môn tiên quyết khi đăng ký.
                                </div>
                            </div>
                        </div>

                        <div className="register-filters">
                            <input
                                type="text"
                                placeholder="🔍 Tìm kiếm tên môn, mã môn, giảng viên..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="filter-select">
                                <option value="">📅 Tất cả học kỳ</option>
                                {semesterOptions.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                            </select>
                            {(searchTerm || filterSemester) && (
                                <button onClick={() => { setSearchTerm(''); setFilterSemester(''); }} className="clear-filter-btn">✕ Xóa lọc</button>
                            )}
                        </div>

                        <h3>📋 Danh Sách Lớp Đang Mở ({filteredClasses.length}/{availableClasses.length} lớp)</h3>
                        {filteredClasses.length > 0 ? (
                            <table className="classes-table">
                                <thead>
                                    <tr>
                                        <th>Mã Môn</th>
                                        <th>Tên Môn</th>
                                        <th>Giảng Viên</th>
                                        <th>Tín Chỉ</th>
                                        <th>Lịch Học</th>
                                        <th>Phòng</th>
                                        <th>Sĩ Số</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClasses.map((cls) => {
                                        const isFull = Number(cls.enrolled_count) >= Number(cls.max_students);
                                        const isEnrolled = enrolledClassIds.has(cls.class_id);
                                        return (
                                            <tr key={cls.class_id} style={isEnrolled ? { backgroundColor: '#f0fdf4' } : {}}>
                                                <td><strong>{cls.course_code}</strong></td>
                                                <td>{cls.course_name}</td>
                                                <td>{cls.lecturer_name}</td>
                                                <td className="credits">{cls.credits}</td>
                                                <td>{getDayName(cls.day_of_week)} {cls.start_time} - {cls.end_time}</td>
                                                <td>{cls.room}</td>
                                                <td className={isFull ? 'full' : ''}>{cls.enrolled_count}/{cls.max_students}</td>
                                                <td>
                                                    {isEnrolled ? (
                                                        <button onClick={() => handleDrop(cls.class_id)} className="drop-button">Hủy ĐK</button>
                                                    ) : (
                                                        <button onClick={() => handleEnroll(cls.class_id)} disabled={isFull} className="enroll-button">
                                                            {isFull ? 'Hết chỗ' : 'Đăng Ký'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">{availableClasses.length === 0 ? 'Không có lớp nào đang mở' : 'Không tìm thấy lớp phù hợp'}</p>
                        )}

                        <div style={{ marginTop: '40px' }}>
                            <h3>✅ Các Lớp Đã Đăng Ký ({enrolledClasses.length} lớp)</h3>
                            {enrolledClasses.length > 0 ? (
                                <table className="classes-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Môn</th>
                                            <th>Tên Môn</th>
                                            <th>Tín Chỉ</th>
                                            <th>Giảng Viên</th>
                                            <th>Học Kỳ</th>
                                            <th>Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledClasses.map((cls, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{cls.course_code}</strong></td>
                                                <td>{cls.course_name}</td>
                                                <td className="credits">{cls.credits}</td>
                                                <td>{cls.lecturer_name}</td>
                                                <td>{cls.semester_code}</td>
                                                <td>
                                                    <button onClick={() => handleDrop(cls.class_id)} className="drop-button">Hủy Đăng Ký</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">Bạn chưa đăng ký lớp nào</p>
                            )}
                        </div>
                    </div>
                )}

                {/* THỜI KHÓA BIỂU */}
                {!loading && activeTab === 'timetable' && (
                    <div className="timetable-section">
                        <h2>📅 Thời Khóa Biểu</h2>
                        {timetable.length > 0 ? (
                            <div className="timetable-container">
                                {/* Lịch tuần dạng grid */}
                                <div className="weekly-view">
                                    <h3>📆 Lịch Theo Tuần</h3>
                                    <div className="week-grid">
                                        {[2,3,4,5,6,7,1].map((dayNum) => {
                                            const dayName = getDayName(dayNum);
                                            const dayClasses = timetable.filter(item => item.day_of_week === dayNum);
                                            return (
                                                <div key={dayNum} className="day-column">
                                                    <h4>{dayName}</h4>
                                                    <div className="day-classes">
                                                        {dayClasses.length > 0 ? dayClasses.map((item, i) => (
                                                            <div key={i} className="class-slot">
                                                                <div className="class-name">{item.course_code}</div>
                                                                <div className="class-time">{item.start_time} - {item.end_time}</div>
                                                                <div className="class-room">📍 {item.room}</div>
                                                            </div>
                                                        )) : <div style={{ color: '#ccc', fontSize: '0.8em', textAlign: 'center', padding: '8px' }}>Không có lớp</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bảng chi tiết */}
                                <h3 style={{ marginTop: '40px' }}>📋 Chi Tiết Lịch Học</h3>
                                <table className="timetable">
                                    <thead>
                                        <tr>
                                            <th>Môn Học</th>
                                            <th>Giảng Viên</th>
                                            <th>Thứ</th>
                                            <th>Giờ Bắt Đầu</th>
                                            <th>Giờ Kết Thúc</th>
                                            <th>Phòng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timetable
                                            .slice()
                                            .sort((a, b) => a.day_of_week - b.day_of_week)
                                            .map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <strong>{item.course_code}</strong>
                                                        <br /><small>{item.course_name}</small>
                                                    </td>
                                                    <td>{item.lecturer_name}</td>
                                                    <td className="day-cell">{getDayName(item.day_of_week)}</td>
                                                    <td>{item.start_time}</td>
                                                    <td>{item.end_time}</td>
                                                    <td className="room-cell">{item.room}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="no-data">Bạn chưa đăng ký lớp nào nên chưa có thời khóa biểu</p>
                        )}
                    </div>
                )}

                {/* ĐIỂM & KẾT QUẢ */}
                {!loading && activeTab === 'grades' && (
                    <div className="grades-section">
                        <h2>📈 Điểm & Kết Quả Học Tập</h2>
                        {grades.length > 0 ? (
                            <div>
                                <table className="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Môn</th>
                                            <th>Tên Môn</th>
                                            <th>Tín Chỉ</th>
                                            <th>Điểm Tổng</th>
                                            <th>Xếp Loại</th>
                                            <th>Kết Quả</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((g, idx) => (
                                            <tr key={idx} className={g.total_score === null ? '' : (g.is_passed ? 'passed' : 'failed')}>
                                                <td><strong>{g.course_code}</strong></td>
                                                <td>{g.course_name}</td>
                                                <td>{g.credits}</td>
                                                <td className="score">
                                                    {g.total_score !== null ? Number(g.total_score).toFixed(2) : <em style={{ color: '#aaa' }}>Chưa có</em>}
                                                </td>
                                                <td>
                                                    <span className="letter-grade" style={{
                                                        backgroundColor: getLetterGradeColor(g.letter_grade),
                                                        color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 700
                                                    }}>
                                                        {g.letter_grade || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {g.total_score === null
                                                        ? <em style={{ color: '#aaa' }}>Chưa có điểm</em>
                                                        : <span className={g.is_passed ? 'result-pass' : 'result-fail'}>
                                                            {g.is_passed ? '✓ Đạt' : '✗ Không Đạt'}
                                                        </span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="grade-stats">
                                    <h3>📊 Thống Kê</h3>
                                    <div className="stats-row">
                                        <div className="stat"><strong>Tổng Tín Chỉ:</strong><span>{grades.reduce((s, g) => s + (Number(g.credits) || 0), 0)}</span></div>
                                        <div className="stat"><strong>Môn Đạt:</strong><span style={{ color: '#16a34a' }}>{grades.filter(g => g.is_passed).length}</span></div>
                                        <div className="stat"><strong>Môn Không Đạt:</strong><span style={{ color: '#dc2626' }}>{grades.filter(g => g.total_score !== null && !g.is_passed).length}</span></div>
                                        <div className="stat"><strong>Chưa Có Điểm:</strong><span style={{ color: '#9ca3af' }}>{grades.filter(g => g.total_score === null).length}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">Chưa có điểm nào được công bố</p>
                        )}
                    </div>
                )}

                {/* CÔNG NỢ HỌC PHÍ */}
                {!loading && activeTab === 'tuition' && (
                    <div className="tuition-section">
                        <h2>💳 Công Nợ Học Phí</h2>

                        <div className="tuition-summary">
                            <div className="summary-card total">
                                <span className="label">💰 Tổng Học Phí</span>
                                <span className="amount">{formatVND(totalTuition)}</span>
                            </div>
                            <div className="summary-card paid">
                                <span className="label">✓ Đã Thanh Toán</span>
                                <span className="amount">{formatVND(totalPaid)}</span>
                            </div>
                            <div className="summary-card remaining">
                                <span className="label">⚠️ Còn Nợ</span>
                                <span className="amount">{formatVND(totalRemaining)}</span>
                            </div>
                        </div>

                        {tuition.length > 0 ? (
                            <div className="invoice-list">
                                {tuition.map((inv, idx) => {
                                    const rem = Number(inv.total_amount) - Number(inv.paid_amount);
                                    const isPaid = inv.status === 'paid' || rem <= 0;
                                    const isExpanded = expandedInvoice === inv.id;
                                    const isPayingThis = payForm.invoice_id === inv.id;
                                    const statusLabel = isPaid ? '✓ Đã Thanh Toán' : inv.status === 'partial' ? '⚠️ Đã đóng một phần' : '❌ Chưa Thanh Toán';
                                    const statusClass = isPaid ? 'paid' : inv.status === 'partial' ? 'partial' : 'unpaid';
                                    return (
                                        <div key={idx} className={`invoice-card ${statusClass}`}>
                                            <div className="invoice-header">
                                                <div className="invoice-meta">
                                                    <span className="invoice-semester">📅 {inv.semester_code}</span>
                                                    <span className={`invoice-status-badge ${statusClass}`}>{statusLabel}</span>
                                                </div>
                                                <div className="invoice-amounts">
                                                    <div className="inv-amt-row"><span>Tổng:</span><strong>{formatVND(inv.total_amount)}</strong></div>
                                                    <div className="inv-amt-row"><span>Đã nộp:</span><strong style={{color:'#16a34a'}}>{formatVND(inv.paid_amount)}</strong></div>
                                                    {!isPaid && <div className="inv-amt-row"><span>Còn nợ:</span><strong style={{color:'#dc2626'}}>{formatVND(rem)}</strong></div>}
                                                    {inv.due_date && <div className="inv-amt-row"><span>Hạn nộp:</span><span>{new Date(inv.due_date).toLocaleDateString('vi-VN')}</span></div>}
                                                </div>
                                                <div className="invoice-actions">
                                                    {!isPaid && (
                                                        <button
                                                            className={`pay-now-btn ${isPayingThis ? 'active' : ''}`}
                                                            onClick={() => setPayForm(isPayingThis ? {invoice_id:null,amount:'',payment_method:'Chuyển khoản ngân hàng'} : {invoice_id:inv.id,amount:rem.toFixed(0),payment_method:'Chuyển khoản ngân hàng'})}
                                                        >
                                                            {isPayingThis ? '× Đóng' : '💳 Thanh Toán'}
                                                        </button>
                                                    )}
                                                    <button className="history-btn" onClick={() => toggleExpand(inv.id)}>
                                                        {isExpanded ? '▲ Ẩn lịch sử' : '🕒 Lịch sử'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* FORM THANH TOÁN */}
                                            {isPayingThis && (
                                                <div className="pay-form-area">
                                                    <h4>💳 Thanh Toán Học Phí — {inv.semester_code}</h4>
                                                    <form onSubmit={handlePay} className="pay-form">
                                                        <div className="pay-form-row">
                                                            <div className="pay-field">
                                                                <label>Số tiền nộp (VND)</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={payForm.amount}
                                                                    onChange={e => setPayForm({...payForm, amount: e.target.value})}
                                                                    placeholder={`Tối đa ${rem.toLocaleString('vi-VN')}`}
                                                                    required
                                                                />
                                                                <div className="pay-shortcuts">
                                                                    <span>Nhanh:</span>
                                                                    <button type="button" onClick={() => setPayForm({...payForm, amount: Math.round(rem*0.5).toString()})}>50%</button>
                                                                    <button type="button" onClick={() => setPayForm({...payForm, amount: rem.toFixed(0)})}>Toàn bộ</button>
                                                                </div>
                                                            </div>
                                                            <div className="pay-field">
                                                                <label>Phương thức thanh toán</label>
                                                                <select value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}>
                                                                    <option>Chuyển khoản ngân hàng</option>
                                                                    <option>Tiền mặt</option>
                                                                    <option>Thẻ ATM</option>
                                                                    <option>Ví điện tử (MoMo/ZaloPay)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="pay-summary-bar">
                                                            <span>Số tiền sẽ nộp: <strong style={{color:'#6366f1',fontSize:'1.1rem'}}>{formatVND(Number(payForm.amount)||0)}</strong></span>
                                                            <span>Còn lại sau khi nộp: <strong style={{color: Number(payForm.amount)>=rem?'#16a34a':'#ea580c'}}>{formatVND(Math.max(0, rem - (Number(payForm.amount)||0)))}</strong></span>
                                                        </div>
                                                        <button type="submit" className="pay-submit-btn">✓ Xác Nhận Thanh Toán</button>
                                                    </form>
                                                </div>
                                            )}

                                            {/* LỊCH SỬ GIAO DỊCH */}
                                            {isExpanded && (
                                                <div className="transaction-history">
                                                    <h4>🕒 Lịch Sử Giao Dịch</h4>
                                                    {transactions[inv.id] ? (
                                                        transactions[inv.id].length > 0 ? (
                                                            <table className="tx-table">
                                                                <thead><tr><th>Thời gian</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th></tr></thead>
                                                                <tbody>
                                                                    {transactions[inv.id].map((tx, ti) => (
                                                                        <tr key={ti}>
                                                                            <td>{new Date(tx.paid_at).toLocaleString('vi-VN')}</td>
                                                                            <td style={{color:'#16a34a',fontWeight:600}}>{formatVND(tx.amount)}</td>
                                                                            <td>{tx.payment_method}</td>
                                                                            <td><span style={{background:'#d1fae5',color:'#065f46',padding:'2px 8px',borderRadius:'4px',fontSize:'0.82rem',fontWeight:600}}>✓ {tx.status}</span></td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : <p style={{color:'#9ca3af',fontStyle:'italic',padding:'12px 0'}}>Chưa có giao dịch nào</p>
                                                    ) : <p style={{color:'#9ca3af',padding:'12px 0'}}>⏳ Đang tải...</p>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-data">Không có thông tin học phí</p>
                        )}

                        <div className="tuition-note">
                            <p><strong>ℹ️ Lưu ý:</strong> Thanh toán được xử lý ngay lập tức. Bạn có thể nộp nhiều lần cho cùng một hóa đơn. Nếu có thắc mắc, liên hệ phòng tài chính.</p>
                        </div>
                    </div>
                )}

                {/* GPA & HỌC BẠ */}
                {!loading && activeTab === 'gpa' && (
                    <div className="gpa-section">
                        <h2>🎓 GPA & Bảng Điểm Toàn Khóa</h2>
                        {gpaData ? (
                            <div>
                                <div className="gpa-summary-cards">
                                    {(() => { const r = getGPARating(gpaData.gpa); return (
                                        <div className="gpa-main-card" style={{ borderColor: r.color }}>
                                            <div className="gpa-main-value" style={{ color: r.color }}>{gpaData.gpa || 'N/A'}<span className="gpa-scale">/4.0</span></div>
                                            <div className="gpa-main-label">GPA Tích Lũy</div>
                                            <div className="gpa-rating-badge" style={{ background: r.color }}>{r.label}</div>
                                        </div>
                                    ); })()}
                                    <div className="gpa-stat-card"><div className="gpa-stat-val">{gpaData.total_credits}</div><div className="gpa-stat-lbl">Tổng Tín Chỉ</div></div>
                                    <div className="gpa-stat-card"><div className="gpa-stat-val" style={{color:'#16a34a'}}>{gpaData.transcript?.filter(t=>t.is_passed).length||0}</div><div className="gpa-stat-lbl">Môn Đạt</div></div>
                                    <div className="gpa-stat-card"><div className="gpa-stat-val" style={{color:'#dc2626'}}>{gpaData.transcript?.filter(t=>t.total_score!==null&&!t.is_passed).length||0}</div><div className="gpa-stat-lbl">Môn Không Đạt</div></div>
                                </div>
                                <h3 style={{marginTop:'32px'}}>📋 Bảng Điểm Chi Tiết</h3>
                                {gpaData.transcript?.length > 0 ? (
                                    <table className="grades-table">
                                        <thead><tr><th>Học Kỳ</th><th>Mã Môn</th><th>Tên Môn</th><th>Tín Chỉ</th><th>Điểm</th><th>Xếp Loại</th><th>Kết Quả</th></tr></thead>
                                        <tbody>
                                            {gpaData.transcript.map((row, idx) => (
                                                <tr key={idx} className={row.total_score===null?'':(row.is_passed?'passed':'failed')}>
                                                    <td>{row.semester_code}</td>
                                                    <td><strong>{row.course_code}</strong></td>
                                                    <td>{row.course_name}</td>
                                                    <td className="credits">{row.credits}</td>
                                                    <td className="score">{row.total_score!==null?Number(row.total_score).toFixed(2):<em style={{color:'#aaa'}}>Chưa có</em>}</td>
                                                    <td><span className="letter-grade" style={{backgroundColor:getLetterGradeColor(row.letter_grade),color:'white',padding:'3px 8px',borderRadius:'4px',fontWeight:700}}>{row.letter_grade||'N/A'}</span></td>
                                                    <td>{row.total_score===null?<em style={{color:'#aaa'}}>Chưa có</em>:<span className={row.is_passed?'result-pass':'result-fail'}>{row.is_passed?'✓ Đạt':'✗ Không Đạt'}</span>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p className="no-data">Chưa có dữ liệu điểm</p>}
                            </div>
                        ) : <p className="no-data">Đang tải dữ liệu GPA...</p>}
                    </div>
                )}

                {/* ĐỔI MẬT KHẨU */}
                {!loading && activeTab === 'password' && (
                    <div className="password-section">
                        <h2>🔑 Đổi Mật Khẩu</h2>
                        <div className="password-form-container">
                            <form onSubmit={handleChangePassword} className="password-form">
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <input type="password" value={pwForm.old_password} onChange={e=>setPwForm({...pwForm,old_password:e.target.value})} required placeholder="Nhập mật khẩu hiện tại" />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input type="password" value={pwForm.new_password} onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} required placeholder="Nhập mật khẩu mới" />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input type="password" value={pwForm.confirm_password} onChange={e=>setPwForm({...pwForm,confirm_password:e.target.value})} required placeholder="Nhập lại mật khẩu mới" />
                                </div>
                                <button type="submit" className="pw-submit-btn">🔑 Đổi Mật Khẩu</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
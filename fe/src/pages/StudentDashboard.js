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
            const [clsRes, enrollRes, ttRes, grRes, tuRes] = await Promise.all([
                fetch(`${API_URL}/student/available-classes`),
                fetch(`${API_URL}/student/${sid}/enrolled-classes`),
                fetch(`${API_URL}/student/${sid}/timetable`),
                fetch(`${API_URL}/student/${sid}/grades`),
                fetch(`${API_URL}/student/${sid}/tuition`),
            ]);

            const [clsData, enrollData, ttData, grData, tuData] = await Promise.all([
                clsRes.json(), enrollRes.json(), ttRes.json(), grRes.json(), tuRes.json()
            ]);

            setAvailableClasses(Array.isArray(clsData) ? clsData : []);
            setEnrolledClasses(Array.isArray(enrollData) ? enrollData : []);
            setTimetable(Array.isArray(ttData) ? ttData : []);
            setGrades(Array.isArray(grData) ? grData : []);
            setTuition(Array.isArray(tuData) ? tuData : []);
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const totalTuition = tuition.reduce((s, i) => s + Number(i.total_amount || 0), 0);
    const totalPaid = tuition.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
    const totalRemaining = totalTuition - totalPaid;

    const enrolledClassIds = new Set(enrolledClasses.map(c => c.class_id));

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
                    { key: 'tuition', label: '💳 Công Nợ Học Phí' },
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

                        <h3>📋 Danh Sách Lớp Đang Mở ({availableClasses.length} lớp)</h3>
                        {availableClasses.length > 0 ? (
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
                                    {availableClasses.map((cls) => {
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
                            <p className="no-data">Không có lớp nào đang mở để đăng ký</p>
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
                            <table className="tuition-table">
                                <thead>
                                    <tr>
                                        <th>Học Kỳ</th>
                                        <th>Tổng Cộng</th>
                                        <th>Đã Thanh Toán</th>
                                        <th>Còn Nợ</th>
                                        <th>Hạn Thanh Toán</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tuition.map((inv, idx) => {
                                        const rem = Number(inv.total_amount) - Number(inv.paid_amount);
                                        return (
                                            <tr key={idx} className={inv.status === 'paid' ? 'paid' : 'unpaid'}>
                                                <td><strong>{inv.semester_code}</strong></td>
                                                <td className="amount">{formatVND(inv.total_amount)}</td>
                                                <td className="amount paid-cell">{formatVND(inv.paid_amount)}</td>
                                                <td className="amount remaining-cell">{formatVND(rem)}</td>
                                                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                                <td>
                                                    <span className={`status ${inv.status}`}>
                                                        {inv.status === 'paid' ? '✓ Đã Thanh Toán' : rem > 0 ? '⚠️ Còn Nợ' : '✓ Hoàn Thành'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">Không có thông tin học phí</p>
                        )}

                        <div className="tuition-note">
                            <p><strong>ℹ️ Lưu ý:</strong> Vui lòng thanh toán học phí đúng hạn. Nếu có thắc mắc, liên hệ phòng tài chính.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <h1>Chào mừng, {user?.name}!</h1>
            <p>Bạn đã đăng nhập với vai trò: <strong>Sinh viên (Student)</strong></p>
            <p>Đây là trang thông tin của bạn.</p>
            <button onClick={handleLogout} className="logout-button">Đăng Xuất</button>
        </div>
    );
};

export default StudentDashboard;
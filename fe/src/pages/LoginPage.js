import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Attempting login with email:', email);

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', response.status, data);

            if (!response.ok) {
                const errorMessage = data.message || 'Đã có lỗi xảy ra.';
                console.error('Login failed:', errorMessage);
                throw new Error(errorMessage);
            }

            // Lưu token và thông tin người dùng vào localStorage
            // data.profile chứa student/lecturer id từ bảng tương ứng
            const userData = {
                token: data.token,
                id: data.user.id,           // users.id
                profile_id: data.profile?.id || null, // students.id hoặc lecturers.id
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                student_code: data.profile?.student_code || null
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User data stored in localStorage:', userData);

            // Chuyển hướng dựa trên vai trò
            const role = data.user.role.toLowerCase();
            switch (role) {
                case 'admin':
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin');
                    break;
                case 'lecturer':
                    console.log('Redirecting to lecturer dashboard');
                    navigate('/lecturer');
                    break;
                case 'student':
                    console.log('Redirecting to student dashboard');
                    navigate('/student');
                    break;
                default:
                    const roleError = 'Vai trò người dùng không xác định.';
                    console.error('Unknown role:', data.user.role);
                    setError(roleError);
                    localStorage.removeItem('user'); // Xóa thông tin nếu đăng nhập không hợp lệ
                    setLoading(false);
                    return;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Đăng Nhập</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
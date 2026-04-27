import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

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
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Đã có lỗi xảy ra.');

            const userData = {
                token: data.token,
                id: data.user.id,
                profile_id: data.profile?.id || null,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                student_code: data.profile?.student_code || null,
            };
            localStorage.setItem('user', JSON.stringify(userData));

            const role = data.user.role.toLowerCase();
            if (role === 'admin') navigate('/admin');
            else if (role === 'lecturer') navigate('/lecturer');
            else if (role === 'student') navigate('/student');
            else setError('Vai trò không xác định.');
        } catch (err) {
            setError(err.message || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-logo">🎓</div>
                    <h1>EduPortal</h1>
                    <p>Hệ thống Quản lý Giáo dục</p>
                </div>
                <div className="login-features">
                    <div className="login-feature-item">
                        <span>📚</span>
                        <div>
                            <strong>Đăng ký học phần</strong>
                            <p>Kiểm tra lịch & sức chứa tự động</p>
                        </div>
                    </div>
                    <div className="login-feature-item">
                        <span>📅</span>
                        <div>
                            <strong>Thời khóa biểu</strong>
                            <p>Xem lịch học theo tuần trực quan</p>
                        </div>
                    </div>
                    <div className="login-feature-item">
                        <span>📈</span>
                        <div>
                            <strong>Kết quả học tập</strong>
                            <p>Điểm chi tiết từng thành phần</p>
                        </div>
                    </div>
                    <div className="login-feature-item">
                        <span>💳</span>
                        <div>
                            <strong>Học phí</strong>
                            <p>Theo dõi công nợ & thanh toán</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <form onSubmit={handleLogin} className="login-form-card">
                    <div className="login-form-header">
                        <h2>Đăng Nhập</h2>
                        <p>Vui lòng nhập thông tin tài khoản</p>
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email" id="email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            required disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '28px' }}>
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password" id="password" value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            required disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                        {loading ? (
                            <><span className="btn-spinner" />  Đang đăng nhập...</>
                        ) : (
                            '🔐 Đăng Nhập'
                        )}
                    </button>

                    <p className="login-hint">
                        Hệ thống dành cho Sinh viên, Giảng viên và Admin.
                    </p>
                </form>
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    background: var(--page-bg);
                }
                .login-left {
                    flex: 1;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    padding: 60px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 48px;
                }
                .login-brand { text-align: center; }
                .login-logo { font-size: 5rem; margin-bottom: 12px; }
                .login-brand h1 { margin: 0; font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
                .login-brand p  { margin: 8px 0 0; font-size: 1rem; opacity: 0.8; }
                .login-features { display: flex; flex-direction: column; gap: 20px; }
                .login-feature-item {
                    display: flex; align-items: flex-start; gap: 14px;
                    background: rgba(255,255,255,0.1);
                    padding: 14px 18px; border-radius: var(--radius);
                    backdrop-filter: blur(4px);
                }
                .login-feature-item > span { font-size: 1.6rem; line-height: 1; margin-top: 2px; }
                .login-feature-item strong { display: block; font-weight: 600; font-size: 0.95rem; }
                .login-feature-item p { margin: 3px 0 0; font-size: 0.82rem; opacity: 0.78; }

                .login-right {
                    width: 460px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 32px;
                    background: white;
                }
                .login-form-card { width: 100%; max-width: 380px; }
                .login-form-header { margin-bottom: 28px; }
                .login-form-header h2 { margin: 0 0 6px; font-size: 1.7rem; font-weight: 800; color: var(--gray-800); }
                .login-form-header p  { margin: 0; color: var(--gray-500); font-size: 0.9rem; }
                .login-submit { width: 100%; padding: 13px; font-size: 1rem; justify-content: center; border-radius: var(--radius); }
                .login-hint { text-align: center; color: var(--gray-400); font-size: 0.8rem; margin: 16px 0 0; }
                .btn-spinner {
                    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white; border-radius: 50%;
                    animation: spin 0.7s linear infinite; display: inline-block;
                }
                @media (max-width: 768px) {
                    .login-page { flex-direction: column; }
                    .login-left { padding: 40px 24px; gap: 32px; }
                    .login-right { width: 100%; padding: 32px 24px; }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
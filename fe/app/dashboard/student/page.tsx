'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredRole="student">
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sinh Viên</h1>
              <p className="text-slate-600 text-sm mt-1">Dashboard Quản Lý Đăng Ký Tín Chỉ</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Đăng Xuất
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Thông Tin Sinh Viên</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Họ và Tên</p>
                <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
              </div>

              {/* Email */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
              </div>

              {/* Student Code */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Mã Sinh Viên</p>
                <p className="text-lg font-semibold text-slate-900">{user?.student_code || 'N/A'}</p>
              </div>

              {/* Major */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Ngành Học</p>
                <p className="text-lg font-semibold text-slate-900">{user?.major || 'N/A'}</p>
              </div>

              {/* Admission Year */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Năm Nhập Học</p>
                <p className="text-lg font-semibold text-slate-900">{user?.admission_year || 'N/A'}</p>
              </div>

              {/* Role */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Vai Trò</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {user?.role === 'student' ? 'Sinh Viên' : user?.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Tổng Tín Chỉ Đã Đăng Ký</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Điểm Trung Bình</p>
              <p className="text-3xl font-bold text-green-600 mt-2">3.5</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Khóa Học Hoàn Thành</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">8</p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

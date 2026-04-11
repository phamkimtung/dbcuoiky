'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredRole="lecturer">
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Giảng Viên</h1>
              <p className="text-slate-600 text-sm mt-1">Dashboard Quản Lý Lớp Học và Điểm</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Thông Tin Giảng Viên</h2>
            
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

              {/* Department */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Bộ Môn</p>
                <p className="text-lg font-semibold text-slate-900">{user?.department || 'N/A'}</p>
              </div>

              {/* Specialization */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Chuyên Môn</p>
                <p className="text-lg font-semibold text-slate-900">{user?.specialization || 'N/A'}</p>
              </div>

              {/* Role */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Vai Trò</p>
                <p className="text-lg font-semibold text-slate-900">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Giảng Viên
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Teaching Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Lớp Học Đang Dạy</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">4</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Tổng Số Sinh Viên</p>
              <p className="text-3xl font-bold text-green-600 mt-2">120</p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
              <p className="text-sm text-slate-600 font-medium">Bài Tập Chờ Chấm</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">23</p>
            </div>
          </div>

          {/* Recent Classes */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8 mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Lớp Học Gần Đây</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">Lập Trình Python Nâng Cao</p>
                  <p className="text-sm text-slate-600">Thứ 2, 3, 5 - 7:00 AM</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">45 SV</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">Cơ Sở Dữ Liệu</p>
                  <p className="text-sm text-slate-600">Thứ 4, 6 - 9:00 AM</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">38 SV</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">Mạng Máy Tính</p>
                  <p className="text-sm text-slate-600">Thứ 2, 4 - 1:00 PM</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">37 SV</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

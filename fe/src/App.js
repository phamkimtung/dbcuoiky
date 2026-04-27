import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

// Component để bảo vệ các route, yêu cầu đăng nhập và đúng vai trò
const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!user || !user.token) {
    return <Navigate to="/login" />;
  }

  // Nếu đã đăng nhập nhưng không có quyền, chuyển về trang login
  const userRole = user.role.toLowerCase();
  const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());
  if (!allowedRolesLower.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/lecturer" 
            element={
              <PrivateRoute allowedRoles={['Lecturer']}>
                <LecturerDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student" 
            element={
              <PrivateRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
          {/* Mặc định chuyển hướng về trang login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
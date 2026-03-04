import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import MyAttendance from './pages/MyAttendance';
import MyLeave from './pages/MyLeave';
import ChangePassword from './pages/ChangePassword';
import Rekap from './pages/Rekap';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_staff) return <Navigate to="/dashboard" />;
  return children;
};

const KaryawanRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.is_staff) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Admin only */}
          <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
          <Route path="/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
          <Route path="/rekap" element={<AdminRoute><Rekap /></AdminRoute>} />
          <Route path="/leave-requests" element={<AdminRoute><LeaveRequests /></AdminRoute>} />

          {/* Karyawan only */}
          <Route path="/my-attendance" element={<KaryawanRoute><MyAttendance /></KaryawanRoute>} />
          <Route path="/my-leave" element={<KaryawanRoute><MyLeave /></KaryawanRoute>} />

          {/* Semua role */}
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentOccupancy } from './pages/student/StudentOccupancy';
import { StudentLibraryMap } from './pages/student/StudentLibraryMap';
import { StudentBooks } from './pages/student/StudentBooks';
import { StudentRecommendations } from './pages/student/StudentRecommendations';
import { StudentReservations } from './pages/student/StudentReservations';
import { StudentAssistant } from './pages/student/StudentAssistant';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminOccupancy } from './pages/admin/AdminOccupancy';
import { AdminPredictions } from './pages/admin/AdminPredictions';
import { AdminMLLab } from './pages/admin/AdminMLLab';
import { AdminSensors } from './pages/admin/AdminSensors';
import { AdminSettings } from './pages/admin/AdminSettings';

// Layout wrappers
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight text-softwhite flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const StudentPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight text-softwhite flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar portal="student" />
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AdminPortalLayout: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-midnight text-softwhite flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar portal="admin" />
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Student portal routes */}
            <Route path="/student" element={<StudentPortalLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="occupancy" element={<StudentOccupancy />} />
              <Route path="library-map" element={<StudentLibraryMap />} />
              <Route path="books" element={<StudentBooks />} />
              <Route path="recommendations" element={<StudentRecommendations />} />
              <Route path="reservations" element={<StudentReservations />} />
              <Route path="assistant" element={<StudentAssistant />} />
            </Route>

            {/* Admin portal routes */}
            <Route path="/admin" element={<AdminPortalLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="occupancy" element={<AdminOccupancy />} />
              <Route path="predictions" element={<AdminPredictions />} />
              <Route path="ml-lab" element={<AdminMLLab />} />
              <Route path="sensors" element={<AdminSensors />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;

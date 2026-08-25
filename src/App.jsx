import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CollegeProvider } from './context/CollegeContext';

import Navbar from './components/Navbar';
import Page3DBackground from './components/Page3DBackground';
import InstallPwaButton from './components/InstallPwaButton';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import LiveTracking from './pages/LiveTracking';

// Protected Route Guard
function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={
          user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'driver'
            ? '/driver/dashboard'
            : '/student/dashboard'
        }
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <CollegeProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
              {/* Ambient 3D Particle & Grid Background */}
              <Page3DBackground />

              {/* Floating Corner PWA Install Button */}
              <InstallPwaButton />

              {/* Application Content */}
              <Navbar />
              <main className="flex-1 relative z-10">
                <Routes>
                  {/* Public Landing Route */}
                  <Route path="/" element={<Home />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Driver Routes */}
                  <Route path="/driver/login" element={<DriverLogin />} />
                  <Route
                    path="/driver/dashboard"
                    element={
                      <ProtectedRoute allowedRole="driver">
                        <DriverDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/driver/trip"
                    element={
                      <ProtectedRoute allowedRole="driver">
                        <DriverDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Routes */}
                  <Route path="/student/login" element={<StudentLogin />} />
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/track/:busId"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <LiveTracking />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </CollegeProvider>
  );
}

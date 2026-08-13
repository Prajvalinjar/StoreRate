import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AdminLayout from './components/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AuthPlaceholderPage from './pages/AuthPlaceholderPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import UserDetailsPage from './pages/UserDetailsPage';
import StoreManagementPage from './pages/StoreManagementPage';
import UserStoresPage from './pages/UserStoresPage';
import UserRatingsPage from './pages/UserRatingsPage';
import UserProfilePage from './pages/UserProfilePage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerProfilePage from './pages/OwnerProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';

const SmartDashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'USER') return <Navigate to="/user/stores" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <AuthPlaceholderPage />;
};

const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen font-sans bg-[#F7F6F1] text-[#171A18] selection:bg-[#173D32] selection:text-white">
      {!isLandingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SmartDashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Normal User Routes */}
        <Route
          path="/user/stores"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['USER']}>
                <UserStoresPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/ratings"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['USER']}>
                <UserRatingsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['USER']}>
                <UserProfilePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/user" element={<Navigate to="/user/stores" replace />} />

        {/* Store Owner Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['STORE_OWNER']}>
                <OwnerDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['STORE_OWNER']}>
                <OwnerProfilePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="stores" element={<StoreManagementPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

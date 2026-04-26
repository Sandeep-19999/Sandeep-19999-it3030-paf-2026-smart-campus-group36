import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import CheckInPage from './pages/CheckInPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import ProfilePage from './pages/ProfilePage';
import ResourcesPage from './pages/ResourcesPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TicketsPage from './pages/TicketsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { useAuth } from './contexts/AuthContext';

function AdminPage() {
  return (
    <div className="resource-catalogue-page admin-resource-page">
      <section className="panel resource-list-card">
        <div className="panel-header">
          <h3>Admin Console</h3>
        </div>
        <p className="muted-text">Admin-only workspace. Add user management, reporting, and system controls here.</p>
      </section>
    </div>
  );
}

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/facilities" element={<FacilitiesPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/login/*" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register/*" element={<Navigate to="/auth/register" replace />} />
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleHomeRedirect />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="bookings" element={<BookingsPage />} />
        <Route
          path="check-in"
          element={
            <ProtectedRoute roles={['USER', 'TECHNICIAN']}>
              <CheckInPage />
            </ProtectedRoute>
          }
        />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
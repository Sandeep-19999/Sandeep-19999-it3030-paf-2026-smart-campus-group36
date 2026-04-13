import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
<<<<<<< HEAD
import FacilitiesPage from './pages/FacilitiesPage';
import HomePage from './pages/HomePage';
=======
import BookingsPage from './pages/BookingsPage';
>>>>>>> 44c5330cd856ecdd7f491c8f5d9798e1bc1e39c3
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import ResourcesPage from './pages/ResourcesPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TicketsPage from './pages/TicketsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { useAuth } from './contexts/AuthContext';

function AdminPage() {
  return (
    <div className="content-grid">
      <section className="panel">
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
      <Route path="/login" element={<LoginPage />} />
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
<<<<<<< HEAD
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="resources" element={<ResourcesPage />} />
=======
        <Route path="bookings" element={<BookingsPage />} />
>>>>>>> 44c5330cd856ecdd7f491c8f5d9798e1bc1e39c3
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

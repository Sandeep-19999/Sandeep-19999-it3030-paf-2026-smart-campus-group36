import { NavLink, Outlet } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1 className="brand-title">Smart Campus</h1>
          <p className="brand-subtitle">Modules B + C + D + E</p>
        </div>
        <nav className="nav-list">
<<<<<<< HEAD
          <NavLink to="/app/dashboard">Dashboard</NavLink>
          {user?.role === 'ADMIN' ? <NavLink to="/app/admin">Admin</NavLink> : null}
          <NavLink to="/app/resources">Resources</NavLink>
          <NavLink to="/app/tickets">Tickets</NavLink>
          <NavLink to="/app/notifications">Notifications</NavLink>
=======
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
>>>>>>> 44c5330cd856ecdd7f491c8f5d9798e1bc1e39c3
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="secondary-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Operations Workspace</h2>
            <p className="muted-text">Incident ticketing, notifications and access control.</p>
          </div>
          <NotificationBell />
        </header>
        <Outlet />
      </main>
    </div>
  );
}

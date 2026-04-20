import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { resolveAvatarUrl } from '../utils/helpers';

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(true);
  const [brandLogoVisible, setBrandLogoVisible] = useState(true);
  const profileMenuRef = useRef(null);
  const campusIdMatch = user?.email?.match(/^(IT\d{8})@my\.sliit\.lk$/i);
  const campusId = campusIdMatch ? campusIdMatch[1].toUpperCase() : '';
  const fullName = user?.fullName || 'User';
  const profileTitle = campusId ? `${campusId} ${fullName}` : fullName;
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
  const avatarSrc = resolveAvatarUrl(user?.avatarUrl);

  useEffect(() => {
    setAvatarVisible(true);
  }, [avatarSrc]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/app/profile');
  };

  const handleSettingsClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/app/notifications');
  };

  const handleTopbarLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            {brandLogoVisible ? (
              <img
                src="/smartcampus-logo.jpg"
                alt=""
                className="brand-mark-image"
                onError={() => setBrandLogoVisible(false)}
              />
            ) : 'SC'}
          </span>
          <h1 className="brand-title">SmartCampus</h1>
        </div>
        <nav className="nav-list">
          <NavLink to="/" title="Go to home page">
            <span className="nav-home-icon" aria-hidden="true">⌂</span>
            <span>Home</span>
          </NavLink>
          <NavLink to="/app/dashboard">Dashboard</NavLink>
          {user?.role === 'ADMIN' ? <NavLink to="/app/admin">Admin</NavLink> : null}
          <NavLink to="/app/bookings">Bookings</NavLink>
          {user?.role !== 'ADMIN' ? <NavLink to="/app/check-in">Check-In</NavLink> : null}
          <NavLink to="/app/resources">Resources</NavLink>
          <NavLink to="/app/tickets">Tickets</NavLink>
          <NavLink to="/app/notifications">Notifications</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-card user-card-profile">
            <div className="user-card-avatar" aria-hidden="true">
              {avatarSrc && avatarVisible ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="user-card-avatar-image"
                  onError={() => setAvatarVisible(false)}
                />
              ) : initials}
            </div>
            <div className="user-card-body">
              <span className="user-card-kicker">Signed in</span>
              <strong>{user?.fullName || 'User'}</strong>
              <span className="user-card-email">{user?.email}</span>
            </div>
          </div>
          <button className="secondary-btn sidebar-logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Operations Workspace</h2>
            <p className="muted-text">Incident ticketing, notifications and access control.</p>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="topbar-profile-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className="topbar-profile"
                title={profileTitle}
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="topbar-profile-name">{profileTitle}</span>
                <span className="topbar-profile-caret" aria-hidden="true">v</span>
                <span className="topbar-profile-avatar" aria-hidden="true">
                  {avatarSrc && avatarVisible ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="topbar-profile-avatar-image"
                      onError={() => setAvatarVisible(false)}
                    />
                  ) : initials}
                </span>
              </button>
              {isProfileMenuOpen ? (
                <div className="topbar-profile-menu" role="menu" aria-label="Account menu">
                  <button type="button" className="topbar-profile-menu-item" role="menuitem" onClick={handleProfileClick}>Profile</button>
                  <button type="button" className="topbar-profile-menu-item" role="menuitem" onClick={handleSettingsClick}>Settings</button>
                  <button type="button" className="topbar-profile-menu-item danger" role="menuitem" onClick={handleTopbarLogout}>Logout</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

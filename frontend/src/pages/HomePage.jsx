import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiBookOpen, FiFileText, FiBell, FiGrid, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import RealtimeCalendar from '../components/RealtimeCalendar';

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [logoVisible, setLogoVisible] = useState(true);
  const spotlightCards = [
    {
      title: 'Facilities',
      text: 'Browse campus resources, inspect availability, and manage resource details.',
      icon: FiGrid
    },
    {
      title: 'Bookings',
      text: 'Submit reservations, track approval status, and use QR check-in for approved slots.',
      icon: FiCalendar
    },
    {
      title: 'Maintenance',
      text: 'Report issues with photos, comments, assignments, and status updates.',
      icon: FiSettings
    },
    {
      title: 'Admin Control',
      text: 'Manage users, roles, approvals, resources, and operational dashboards.',
      icon: FiShield
    }
  ];

  return (
    <div className="course-home-shell">
      <header className="course-top-header">
        <div className="course-brand-block">
          <div className="course-brand-logo" aria-hidden="true">
            {logoVisible ? (
              <img
                src="/smartcampus-logo.jpg"
                alt=""
                className="course-brand-logo-image"
                onError={() => setLogoVisible(false)}
              />
            ) : 'SC'}
          </div>
          <div>
            <h1 className="course-brand-title">SmartCampus | CourseHub</h1>
            <p className="course-brand-subtitle">Digital Learning and Facilities Portal</p>
          </div>
        </div>
        <div className="course-account-box">
          {isAuthenticated ? (
            <>
              <p className="course-auth-kicker">Signed in</p>
              <div className="course-user-summary course-user-summary-elevated">
                <strong>{user?.fullName}</strong>
                <span className="course-user-email">{user?.email}</span>
              </div>
              <div className="course-login-actions">
                <Link to="/app/dashboard" className="course-login-link course-login-link-primary">Dashboard</Link>
                <button type="button" className="course-login-link course-login-link-ghost" onClick={logout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <p>Access your smart campus account</p>
              <div className="course-login-actions">
                <Link to="/auth/login" className="course-login-link course-login-link-login">Login</Link>
                <Link to="/auth/register" className="course-login-link course-login-link-register">Register</Link>
              </div>
            </>
          )}
        </div>
      </header>

      <nav className="course-main-nav">
        <Link to="/app/bookings"><FiCalendar aria-hidden="true" /> Bookings</Link>
        <Link to="/app/resources"><FiBookOpen aria-hidden="true" /> Resources</Link>
        <Link to="/app/tickets"><FiFileText aria-hidden="true" /> Tickets</Link>
        <Link to="/app/notifications"><FiBell aria-hidden="true" /> Notifications</Link>
        <Link to="/facilities"><FiGrid aria-hidden="true" /> Facilities</Link>
      </nav>

      <section className="course-hero">
        <div className="course-hero-overlay" aria-hidden="true" />
        <div className="course-hero-content">
          <div className="course-hero-panel">
            <p className="course-hero-tag">Do you need any help?</p>
            <h2>WELCOME TO OUR UNIVERSITY</h2>
            <p>
              Manage bookings, resources, tickets, notifications, and support from one secure
              student dashboard built for everyday campus operations.
            </p>
          </div>
        </div>
      </section>

      <section className="course-shortcuts-grid" aria-label="Key campus services">
        {spotlightCards.map((card) => (
          <article key={card.title} className="course-shortcut-card">
            <span className="course-shortcut-mark" aria-hidden="true">
              <card.icon />
            </span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="course-support-section">
        <div className="course-support-box">
          <p className="course-support-tag">Do you need any</p>
          <h3>SUPPORT ?</h3>
          <p>support.smartcampus.lk</p>
          <p>+94 11 754 4801</p>
          <button className="course-feedback-btn" type="button">Provide Feedback</button>
        </div>
        <RealtimeCalendar />
      </section>

      <footer className="course-footer">
        <p>Copyright © 2026 Smart Campus. All rights reserved.</p>
        <div className="course-socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="YouTube">yt</a>
        </div>
      </footer>
    </div>
  );
}

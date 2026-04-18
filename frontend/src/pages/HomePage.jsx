import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RealtimeCalendar from '../components/RealtimeCalendar';

const HERO_IMAGE_CANDIDATES = [
  '/homepage-students.jpg',
  '/homepage-students.jpeg',
  '/homepage-students.png',
  '/students.jpg',
  '/students.jpeg',
  '/students.png'
];

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const handleHeroImageError = () => {
    setHeroImageIndex((index) => Math.min(index + 1, HERO_IMAGE_CANDIDATES.length - 1));
  };

  return (
    <div className="course-home-shell">
      <header className="course-top-header">
        <div className="course-brand-block">
          <div className="course-brand-logo">SC</div>
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
                <Link to="/auth/login" className="course-login-link">Login</Link>
                <Link to="/auth/register" className="course-login-link">Register</Link>
              </div>
            </>
          )}
        </div>
      </header>

      <nav className="course-main-nav">
        <Link to="/app/bookings">Bookings</Link>
        <Link to="/app/resources">Resources</Link>
        <Link to="/app/tickets">Tickets</Link>
        <Link to="/app/notifications">Notifications</Link>
        <Link to="/facilities">Facilities</Link>
      </nav>

      <section className="course-hero">
        <div className="course-hero-content">
          <p className="course-hero-tag">Smart Campus Module</p>
          <h2>EVOLVE BEYOND</h2>
          <p>
            Access facilities, learning resources, and student services through one streamlined
            campus experience.
          </p>
          <div className="course-hero-actions">
            <Link to="/facilities" className="primary-btn">View Facilities</Link>
            <Link to={isAuthenticated ? '/app/dashboard' : '/auth/login'} className="secondary-btn">
              {isAuthenticated ? 'Open Dashboard' : 'Open Portal'}
            </Link>
          </div>
        </div>
        <div className="course-hero-visual" aria-hidden="true">
          <img
            className="course-hero-image"
            src={HERO_IMAGE_CANDIDATES[heroImageIndex]}
            alt="Students reading books together"
            onError={handleHeroImageError}
          />
        </div>
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

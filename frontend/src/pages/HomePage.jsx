import { useState } from 'react';
import { Link } from 'react-router-dom';

const HERO_IMAGE_CANDIDATES = [
  '/homepage-students.jpg',
  '/homepage-students.jpeg',
  '/homepage-students.png',
  '/students.jpg',
  '/students.jpeg',
  '/students.png'
];

export default function HomePage() {
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
          <p>Log in using your smart campus account</p>
          <Link to="/login" className="course-login-link">Staff Login</Link>
        </div>
      </header>

      <nav className="course-main-nav">
        <a href="#">Programmes</a>
        <a href="#">Support</a>
        <a href="#">Resources</a>
        <Link to="/facilities">Facilities</Link>
        <a href="#">Email</a>
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
            <Link to="/login" className="secondary-btn">Open Staff Portal</Link>
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
        <div className="course-calendar-box">
          <h3>Calendar</h3>
          <div className="course-calendar-grid">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            <span className="muted">6</span><span className="muted">7</span><span className="muted">8</span><span className="muted">9</span><span className="course-active-day">10</span><span className="muted">11</span><span className="muted">12</span>
          </div>
          <a href="#">Full calendar</a>
        </div>
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

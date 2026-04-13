import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGIN_VARIANTS = {
  staff: {
    title: 'Staff Login',
    subtitle: 'Use an admin or technician account to manage campus operations.',
    submitLabel: 'Sign in as staff',
    accounts: [
      { role: 'Admin', email: 'admin@smartcampus.local', password: 'Admin@123' },
      { role: 'Technician', email: 'tech@smartcampus.local', password: 'Tech@123' }
    ]
  },
  student: {
    title: 'Student Login',
    subtitle: 'Use a student account to access bookings, tickets, and resources.',
    submitLabel: 'Sign in as student',
    accounts: [
      { role: 'Student', email: 'user@smartcampus.local', password: 'User@123' }
    ]
  }
};

export default function LoginPage({ variant = 'staff' }) {
  const { devLogin } = useAuth();
  const navigate = useNavigate();
  const loginVariant = LOGIN_VARIANTS[variant] || LOGIN_VARIANTS.staff;
  const [form, setForm] = useState({
    email: loginVariant.accounts[0].email,
    password: loginVariant.accounts[0].password
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const backendOrigin = useMemo(() => import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080', []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const currentUser = await devLogin(form);
      navigate(currentUser?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div>
          <h1>Smart Campus Operations Hub</h1>
          <p className="muted-text">{loginVariant.title} for Modules A, B, C, D and E.</p>
          <p className="login-role-copy">{loginVariant.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : loginVariant.submitLabel}
          </button>
        </form>

        <div className="quick-login-grid">
          {loginVariant.accounts.map((account) => (
            <button
              key={account.role}
              type="button"
              className="quick-login-card"
              onClick={() => setForm({ email: account.email, password: account.password })}
            >
              <strong>{account.role}</strong>
              <span>{account.email}</span>
            </button>
          ))}
        </div>

        {variant === 'student' ? (
          <p className="muted-text small-text">
            New student? <Link to="/register/student" className="text-btn">Register first</Link>
          </p>
        ) : null}

        <div className="separator">or</div>
        <a className="secondary-btn full-width-anchor" href={`${backendOrigin}/oauth2/authorization/google`}>
          Continue with Google OAuth
        </a>
        <p className="muted-text small-text">Google login will work after adding GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend environment.</p>
      </div>
    </div>
  );
}

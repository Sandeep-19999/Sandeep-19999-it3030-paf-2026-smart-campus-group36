import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { devLogin, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(user?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const currentUser = await devLogin(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Sign in as Student, Admin, or Lecturer.</p>

        <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
          <label>
            Email
            <input
              type="email"
              placeholder="you@uni.edu"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="........"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" className="primary-btn auth-submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="muted-text auth-meta-text">
          No account? <Link to="/auth/register" className="text-btn">Register</Link>
        </p>
        <Link to="/" className="text-btn auth-back-link">Back to landing</Link>
      </div>
    </div>
  );
}

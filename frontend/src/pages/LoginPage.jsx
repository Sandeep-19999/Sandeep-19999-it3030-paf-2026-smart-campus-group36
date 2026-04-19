import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export default function LoginPage() {
  const { devLogin, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthInfo, setOauthInfo] = useState({ googleLoginUrl: '' });
  const [loadingOAuthInfo, setLoadingOAuthInfo] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(user?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard', {
        replace: true
      });
    }
  }, [loading, isAuthenticated, user, navigate]);

  useEffect(() => {
    let active = true;

    const fetchOauthInfo = async () => {
      try {
        const data = await authService.oauthInfo();

        if (!active) return;

        setOauthInfo({
          googleLoginUrl: data.googleLoginUrl || ''
        });
      } catch {
        if (!active) return;

        setOauthInfo({
          googleLoginUrl: ''
        });
      } finally {
        if (!active) return;
        setLoadingOAuthInfo(false);
      }
    };

    fetchOauthInfo();

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleLogin = () => {
    const url = oauthInfo.googleLoginUrl || '/oauth2/authorization/google';
    window.location.href = url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      const currentUser = await devLogin(form);

      navigate(currentUser?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard', {
        replace: true
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value
                }))
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="........"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  password: e.target.value
                }))
              }
              required
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button
            type="submit"
            className="primary-btn auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="separator">or continue with</div>

        <button
          type="button"
          className="secondary-btn oauth-btn"
          onClick={handleGoogleLogin}
          disabled={loadingOAuthInfo}
        >
          {loadingOAuthInfo ? 'Loading Google login…' : 'Continue with Google'}
        </button>

        <p className="muted-text auth-meta-text">
          No account?{' '}
          <Link to="/auth/register" className="text-btn">
            Register
          </Link>
        </p>

        <Link to="/" className="text-btn auth-back-link">
          Back to landing
        </Link>
      </div>
    </div>
  );
}
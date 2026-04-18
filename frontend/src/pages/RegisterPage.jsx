import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_PATTERN = /^IT\d{8}@my\.sliit\.lk$/i;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,72}$/;

const INITIAL_FORM = {
  name: '',
  role: 'USER',
  email: '',
  password: '',
  confirmPassword: '',
  adminPasscode: ''
};

export default function RegisterPage() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 3) {
      nextErrors.name = 'Enter your name';
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Use email format like IT23842458@my.sliit.lk';
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      nextErrors.password = 'Use 8+ chars with letter, number, and special character';
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    if (form.role === 'ADMIN' && form.adminPasscode.trim().length === 0) {
      nextErrors.adminPasscode = 'Admin passcode is required for admin registration';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    try {
      await registerStudent({
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        adminPasscode: form.role === 'ADMIN' ? form.adminPasscode.trim() : null
      });
      navigate('/');
    } catch (err) {
      const validationFieldErrors = err?.fieldErrors;
      if (validationFieldErrors && typeof validationFieldErrors === 'object') {
        setFieldErrors(validationFieldErrors);
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">Create an account with a role.</p>

        <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
          <label>
            Name
            <input
              value={form.name}
              placeholder="Your name"
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.name)}
              required
            />
            {fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="USER">Student</option>
              <option value="ADMIN">Admin</option>
              <option value="TECHNICIAN">Lecturer</option>
            </select>
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@uni.edu"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="8+ chars with A-Z, 0-9, and special char"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.password)}
              required
            />
            {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              required
            />
            {fieldErrors.confirmPassword ? <span className="field-error">{fieldErrors.confirmPassword}</span> : null}
          </label>

          {form.role === 'ADMIN' ? (
            <label>
              Admin Passcode
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={form.adminPasscode}
                onChange={(e) => setForm((prev) => ({ ...prev, adminPasscode: e.target.value }))}
                aria-invalid={Boolean(fieldErrors.adminPasscode)}
                required
              />
              {fieldErrors.adminPasscode ? <span className="field-error">{fieldErrors.adminPasscode}</span> : null}
            </label>
          ) : null}

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" className="primary-btn auth-submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="muted-text auth-meta-text">
          Already have an account? <Link to="/auth/login" className="text-btn">Login</Link>
        </p>
        <Link to="/" className="text-btn auth-back-link">Back to landing</Link>
      </div>
    </div>
  );
}
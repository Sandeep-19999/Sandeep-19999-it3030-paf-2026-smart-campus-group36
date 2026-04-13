import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_PATTERN = /^IT\d{8}@my\.sliit\.lk$/i;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,72}$/;

const INITIAL_FORM = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
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
    if (form.fullName.trim().length < 3) {
      nextErrors.fullName = 'Enter your full name';
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Use your university email like IT23842458@my.sliit.lk';
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      nextErrors.password = 'Use 8+ characters with a letter, number, and special character';
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
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
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/app/dashboard');
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
      <div className="login-card register-card">
        <div>
          <p className="course-hero-tag">Student Registration</p>
          <h1>Create your account</h1>
          <p className="muted-text">Register with your SLIIT email before signing in.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Full Name
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
            {fieldErrors.fullName ? <span className="field-error">{fieldErrors.fullName}</span> : null}
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="IT23842458@my.sliit.lk"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            {fieldErrors.confirmPassword ? <span className="field-error">{fieldErrors.confirmPassword}</span> : null}
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register Student'}
          </button>
        </form>

        <p className="muted-text small-text">
          Already have an account? <Link to="/login/student" className="text-btn">Go to student login</Link>
        </p>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const IT_NUMBER_PATTERN = /^IT\d{8}$/i;
const EMAIL_PATTERN = /^IT\d{8}@my\.sliit\.lk$/i;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^._-])[A-Za-z\d@$!%*#?&^._-]{8,72}$/;

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  universityId: '',
  role: 'USER',
  email: '',
  password: '',
  confirmPassword: '',
  adminPasscode: '',
};

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);
const IdIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h4M7 16h7" />
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function normalizeItNo(value) {
  return value.trim().toUpperCase();
}

function expectedEmail(value) {
  const itNo = normalizeItNo(value);
  return IT_NUMBER_PATTERN.test(itNo) ? `${itNo.toLowerCase()}@my.sliit.lk` : '';
}

function getStrength(password) {
  if (!password) return { pct: 0, color: '#e2e8f0', label: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*#?&^._-]/.test(password)) score += 1;
  if (score <= 2) return { pct: 35, color: '#ef4444', label: 'Weak' };
  if (score === 3) return { pct: 60, color: '#f59e0b', label: 'Fair' };
  if (score === 4) return { pct: 80, color: '#3b82f6', label: 'Good' };
  return { pct: 100, color: '#22c55e', label: 'Strong' };
}

const S = {
  page: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' },
  panel: {
    background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '2.2rem 2.8rem', borderRight: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  brandIcon: { width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(145deg,#0c7bdc,#0354ab)', display: 'grid', placeItems: 'center', fontSize: 18 },
  brandName: { margin: 0, fontFamily: "Sora,'Trebuchet MS',sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' },
  panelBody: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  panelHeading: { margin: '0 0 1rem', fontFamily: "Sora,'Trebuchet MS',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 800, lineHeight: 1.15, color: '#0f172a' },
  panelSub: { margin: '0 0 2rem', color: '#64748b', fontSize: '1rem', maxWidth: '34ch' },
  featureList: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.85rem' },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#475569', fontSize: '0.95rem' },
  featureDot: { marginTop: 6, flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#0c7bdc' },
  panelFooter: { color: '#94a3b8', fontSize: '0.82rem' },
  formSide: { background: '#fff', display: 'flex', flexDirection: 'column', padding: '2.2rem clamp(2rem,5vw,4rem)' },
  backLink: { alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' },
  formInner: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 500, margin: '0 auto', width: '100%' },
  heading: { margin: '0 0 0.35rem', fontFamily: "Sora,'Trebuchet MS',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' },
  sub: { margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.95rem' },
  roleDropdownWrap: { position: 'relative', marginBottom: '1.2rem' },
  roleDropdownLabel: { fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem', display: 'block' },
  roleDropdown: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.82rem 2.8rem 0.82rem 1rem', fontSize: '0.95rem', color: '#0f172a', background: '#f8fafc', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s', boxSizing: 'border-box' },
  roleDropdownIcon: { position: 'absolute', right: 12, bottom: 13, pointerEvents: 'none', color: '#94a3b8' },
  formGrid: { display: 'grid', gap: '0.95rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.95rem' },
  label: { display: 'grid', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.78rem 0.9rem 0.78rem 2.5rem', fontSize: '0.95rem', color: '#0f172a', background: '#f8fafc', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s', fontFamily: 'inherit', boxSizing: 'border-box' },
  inputErr: { borderColor: '#fca5a5', background: '#fff5f5' },
  eyeBtn: { position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4 },
  fieldError: { color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 },
  helpText: { color: '#64748b', fontSize: '0.76rem', fontWeight: 600 },
  errorBox: { background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.88rem', border: '1px solid #fecaca' },
  strengthWrap: { display: 'grid', gap: '0.25rem', marginTop: 4 },
  strengthTrack: { height: 4, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' },
  adminNote: { display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.7rem 0.9rem', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.86rem', color: '#92400e', fontWeight: 600 },
  submitBtn: { width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(140deg,#0c7bdc,#0354ab)', color: '#fff', transition: 'opacity 0.2s, transform 0.2s' },
  footerNote: { textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '1.4rem' },
  footerLink: { color: '#0c7bdc', fontWeight: 800, textDecoration: 'none' },
};

function InputField({ icon, type = 'text', showToggle, hasError, ...props }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <div style={S.inputWrap}>
      <span style={S.inputIcon}>{icon}</span>
      <input
        type={showToggle ? (visible ? 'text' : 'password') : type}
        style={{ ...S.input, ...(hasError ? S.inputErr : {}), ...(focused ? { borderColor: '#0c7bdc', background: '#fff', boxShadow: '0 0 0 3px rgba(12,123,220,0.1)' } : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {showToggle && (
        <button type="button" style={S.eyeBtn} onClick={() => setVisible(v => !v)} tabIndex={-1} aria-label={visible ? 'Hide password' : 'Show password'}>
          <EyeIcon open={visible} />
        </button>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = key => e => setForm(previous => ({ ...previous, [key]: e.target.value }));

  const handleItNoChange = e => {
    const universityId = e.target.value.toUpperCase().replace(/\s/g, '');
    setForm(previous => ({
      ...previous,
      universityId,
      email: IT_NUMBER_PATTERN.test(universityId) ? expectedEmail(universityId) : previous.email,
    }));
  };

  const validate = () => {
    const errors = {};
    const universityId = normalizeItNo(form.universityId);
    const email = form.email.trim().toLowerCase();

    if (form.firstName.trim().length < 2) errors.firstName = 'First name is required';
    if (form.lastName.trim().length < 2) errors.lastName = 'Last name is required';
    if (!IT_NUMBER_PATTERN.test(universityId)) errors.universityId = 'Use format IT23817180';
    if (!EMAIL_PATTERN.test(email)) errors.email = 'Use format it23817180@my.sliit.lk';
    if (IT_NUMBER_PATTERN.test(universityId) && EMAIL_PATTERN.test(email) && email !== expectedEmail(universityId)) {
      errors.email = `Email must match IT number: ${expectedEmail(universityId)}`;
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      errors.password = 'Use 8+ chars with uppercase, lowercase, number and special character';
    }
    if (!form.confirmPassword) errors.confirmPassword = 'Confirm password is required';
    else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match';
    if (form.role === 'ADMIN' && !form.adminPasscode.trim()) errors.adminPasscode = 'Admin passcode required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registerStudent({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        universityId: normalizeItNo(form.universityId),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        adminPasscode: form.role === 'ADMIN' ? form.adminPasscode.trim() : null,
      });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .sc-page { grid-template-columns: 1fr !important; } .sc-panel { display: none !important; } .sc-two-col { grid-template-columns: 1fr !important; } }
        .sc-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sc-submit:disabled { background: #94a3b8 !important; cursor: not-allowed; }
        .sc-back:hover { color: #0c7bdc !important; }
        .sc-role-select:focus { border-color: #0c7bdc !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(12,123,220,0.1) !important; }
      `}</style>

      <div style={S.page} className="sc-page">
        <div style={S.panel} className="sc-panel">
          <div style={S.brandRow}>
            <span style={S.brandIcon}>🏫</span>
            <p style={S.brandName}>SmartCampus</p>
          </div>
          <div style={S.panelBody}>
            <h1 style={S.panelHeading}>Join the future of digital campus life.</h1>
            <p style={S.panelSub}>Register with your SLIIT IT number and campus email to access campus services securely.</p>
            <ul style={S.featureList}>
              {['IT number and email are validated together.', 'Strong password protection is required.', 'Role based access is applied after login.'].map(item => (
                <li key={item} style={S.featureItem}><span style={S.featureDot} />{item}</li>
              ))}
            </ul>
          </div>
          <p style={S.panelFooter}>© 2026 SmartCampus Platform.</p>
        </div>

        <div style={S.formSide}>
          <Link to="/" className="sc-back" style={S.backLink}>← Back to Home</Link>
          <div style={S.formInner}>
            <h1 style={S.heading}>Create an account</h1>
            <p style={S.sub}>Use format: IT23817180 and it23817180@my.sliit.lk</p>

            <div style={S.roleDropdownWrap}>
              <span style={S.roleDropdownLabel}>I am signing up as a…</span>
              <select
                className="sc-role-select"
                style={S.roleDropdown}
                value={form.role}
                onChange={e => setForm(previous => ({ ...previous, role: e.target.value, adminPasscode: '' }))}
              >
                <option value="USER">Student</option>
                <option value="TECHNICIAN">Lecturer / Technician</option>
                <option value="ADMIN">Admin</option>
              </select>
              <span style={S.roleDropdownIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </div>

            {form.role === 'ADMIN' && <div style={{ ...S.adminNote, marginBottom: '1.1rem' }}>⚠️ Admin registration requires an institutional passcode.</div>}

            <form onSubmit={handleSubmit} style={S.formGrid} noValidate>
              <div style={S.twoCol} className="sc-two-col">
                <label style={S.label}>
                  First Name
                  <InputField icon={<UserIcon />} placeholder="Maleesha" value={form.firstName} onChange={set('firstName')} hasError={Boolean(fieldErrors.firstName)} required />
                  {fieldErrors.firstName && <span style={S.fieldError}>{fieldErrors.firstName}</span>}
                </label>
                <label style={S.label}>
                  Last Name
                  <InputField icon={<UserIcon />} placeholder="Sandeep" value={form.lastName} onChange={set('lastName')} hasError={Boolean(fieldErrors.lastName)} required />
                  {fieldErrors.lastName && <span style={S.fieldError}>{fieldErrors.lastName}</span>}
                </label>
              </div>

              <div style={S.twoCol} className="sc-two-col">
                <label style={S.label}>
                  IT Number
                  <InputField icon={<IdIcon />} placeholder="IT23817180" value={form.universityId} onChange={handleItNoChange} hasError={Boolean(fieldErrors.universityId)} required />
                  {fieldErrors.universityId && <span style={S.fieldError}>{fieldErrors.universityId}</span>}
                </label>
                <label style={S.label}>
                  Email Address
                  <InputField icon={<MailIcon />} type="email" placeholder="it23817180@my.sliit.lk" value={form.email} onChange={set('email')} hasError={Boolean(fieldErrors.email)} required />
                  {fieldErrors.email && <span style={S.fieldError}>{fieldErrors.email}</span>}
                </label>
              </div>

              <div style={S.twoCol} className="sc-two-col">
                <label style={S.label}>
                  Password
                  <InputField icon={<LockIcon />} showToggle placeholder="••••••••" value={form.password} onChange={set('password')} hasError={Boolean(fieldErrors.password)} required />
                  {form.password && (
                    <div style={S.strengthWrap}>
                      <div style={S.strengthTrack}>
                        <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, borderRadius: 999, transition: 'width 0.35s, background 0.35s' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                  <span style={S.helpText}>Example: Campus@123</span>
                  {fieldErrors.password && <span style={S.fieldError}>{fieldErrors.password}</span>}
                </label>

                <label style={S.label}>
                  Confirm Password
                  <InputField icon={<LockIcon />} showToggle placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} hasError={Boolean(fieldErrors.confirmPassword)} required />
                  {fieldErrors.confirmPassword && <span style={S.fieldError}>{fieldErrors.confirmPassword}</span>}
                </label>
              </div>

              {form.role === 'ADMIN' && (
                <label style={S.label}>
                  Admin Passcode
                  <InputField icon={<LockIcon />} showToggle placeholder="Institutional passcode" value={form.adminPasscode} onChange={set('adminPasscode')} hasError={Boolean(fieldErrors.adminPasscode)} required />
                  {fieldErrors.adminPasscode && <span style={S.fieldError}>{fieldErrors.adminPasscode}</span>}
                </label>
              )}

              {error && <div style={S.errorBox}>{error}</div>}

              <button type="submit" className="sc-submit" style={S.submitBtn} disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p style={S.footerNote}>Already have an account? <Link to="/auth/login" style={S.footerLink}>Sign in here</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}

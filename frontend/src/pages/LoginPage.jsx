import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const S = {
  page: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '100vh',
  },
  panel: {
    background: 'linear-gradient(160deg, #0c7bdc 0%, #0354ab 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2.2rem 2.8rem',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  panelOrb1: {
    position: 'absolute', width: 340, height: 340, borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)', top: -80, left: -80, pointerEvents: 'none',
  },
  panelOrb2: {
    position: 'absolute', width: 220, height: 220, borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)', bottom: 60, right: -60, pointerEvents: 'none',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative' },
  brandIcon: {
    width: 38, height: 38, borderRadius: 8,
    background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontSize: 18,
  },
  brandName: {
    margin: 0, fontFamily: "Sora,'Trebuchet MS',sans-serif",
    fontSize: '1.3rem', fontWeight: 800, color: '#fff',
  },
  panelBody: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' },
  panelHeading: {
    margin: '0 0 1.2rem',
    fontFamily: "Sora,'Trebuchet MS',sans-serif",
    fontSize: 'clamp(1.9rem,3.5vw,2.7rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff',
  },
  panelSub: { margin: '0 0 2rem', color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '32ch' },
  featureList: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.85rem' },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' },
  featureDot: { marginTop: 6, flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#fff' },
  panelFooter: { color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', position: 'relative' },

  formSide: {
    background: '#fff', display: 'flex', flexDirection: 'column',
    padding: '2.2rem clamp(2rem,6vw,4.5rem)',
  },
  backLink: {
    alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.35rem',
    color: '#64748b', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
    transition: 'color 0.18s',
  },
  formInner: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', maxWidth: 420, margin: '0 auto', width: '100%',
  },
  heading: {
    margin: '0 0 0.35rem', fontFamily: "Sora,'Trebuchet MS',sans-serif",
    fontSize: '2rem', fontWeight: 800, color: '#0f172a',
  },
  sub: { margin: '0 0 2.2rem', color: '#64748b', fontSize: '0.95rem' },
  formGrid: { display: 'grid', gap: '1.1rem' },
  label: { display: 'grid', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '0.8rem 0.9rem 0.8rem 2.5rem',
    fontSize: '0.95rem', color: '#0f172a', background: '#f8fafc', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: 10, background: 'none', border: 'none',
    cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4,
  },
  submitBtn: {
    width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem',
    background: 'linear-gradient(140deg,#0c7bdc,#0354ab)',
    color: '#fff', transition: 'opacity 0.2s, transform 0.2s',
  },
  oauthBtn: {
    width: '100%', padding: '0.82rem', borderRadius: 10, border: '1.5px solid #e2e8f0',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem',
    background: '#fff', color: '#1e293b', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '0.65rem', transition: 'background 0.18s, transform 0.18s',
  },
  orRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 },
  orLine: { flex: 1, height: 1, background: '#e2e8f0' },
  errorBox: { background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.88rem', border: '1px solid #fecaca' },
  footerNote: { textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '1.5rem' },
  footerLink: { color: '#0c7bdc', fontWeight: 800, textDecoration: 'none' },
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function InputField({ icon, type = 'text', showToggle, ...props }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <div style={S.inputWrap}>
      <span style={S.inputIcon}>{icon}</span>
      <input
        type={showToggle ? (visible ? 'text' : 'password') : type}
        style={{ ...S.input, ...(focused ? { borderColor: '#0c7bdc', background: '#fff', boxShadow: '0 0 0 3px rgba(12,123,220,0.1)' } : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {showToggle && (
        <button type="button" style={S.eyeBtn} onClick={() => setVisible(v => !v)} tabIndex={-1}>
          <EyeIcon open={visible} />
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { devLogin, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthInfo, setOauthInfo] = useState({ googleLoginUrl: '' });
  const [loadingOAuth, setLoadingOAuth] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated)
      navigate(user?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard', { replace: true });
  }, [loading, isAuthenticated, user, navigate]);

  useEffect(() => {
    let active = true;
    authService.oauthInfo()
      .then(d => { if (active) setOauthInfo({ googleLoginUrl: d.googleLoginUrl || '' }); })
      .catch(() => { if (active) setOauthInfo({ googleLoginUrl: '' }); })
      .finally(() => { if (active) setLoadingOAuth(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const u = await devLogin(form);
      navigate(u?.role === 'ADMIN' ? '/app/admin' : '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .sc-page { grid-template-columns: 1fr !important; } .sc-panel { display: none !important; } }
        .sc-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sc-submit:disabled { background: #94a3b8 !important; cursor: not-allowed; }
        .sc-oauth:hover { background: #f8fafc !important; transform: translateY(-1px); }
        .sc-back:hover { color: #0c7bdc !important; }
      `}</style>

      <div style={S.page} className="sc-page">
        {/* Left panel */}
        <div style={S.panel} className="sc-panel">
          <div style={S.panelOrb1} /><div style={S.panelOrb2} />
          <div style={S.brandRow}>
            <span style={S.brandIcon}>🏫</span>
            <p style={S.brandName}>SmartCampus</p>
          </div>
          <div style={S.panelBody}>
            <h1 style={S.panelHeading}>Welcome back to smarter campus life.</h1>
            <p style={S.panelSub}>Access your bookings, resources, and student services all in one place.</p>
            <ul style={S.featureList}>
              {['Book labs, lecture halls, and campus facilities.',
                'Raise and track support tickets instantly.',
                'Access learning resources and course materials.'].map(f => (
                <li key={f} style={S.featureItem}><span style={S.featureDot} />{f}</li>
              ))}
            </ul>
          </div>
          <p style={S.panelFooter}>© 2026 SmartCampus Platform.</p>
        </div>

        {/* Right form */}
        <div style={S.formSide}>
          <Link to="/" className="sc-back" style={S.backLink}>← Back to Home</Link>
          <div style={S.formInner}>
            <h1 style={S.heading}>Sign in</h1>
            <p style={S.sub}>Enter your details to access your account.</p>

            <form onSubmit={handleSubmit} style={S.formGrid} noValidate>
              <label style={S.label}>
                Email address
                <InputField icon={<MailIcon />} type="email" placeholder="it238xxxxx@my.sliit.lk"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </label>
              <label style={S.label}>
                Password
                <InputField icon={<LockIcon />} showToggle placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </label>
              {error && <div style={S.errorBox}>{error}</div>}
              <button type="submit" className="sc-submit" style={S.submitBtn} disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div style={{ ...S.orRow, margin: '1.2rem 0' }}>
              <div style={S.orLine} />or continue with<div style={S.orLine} />
            </div>

            <button type="button" className="sc-oauth" style={S.oauthBtn}
              onClick={() => { window.location.href = oauthInfo.googleLoginUrl || '/oauth2/authorization/google'; }}
              disabled={loadingOAuth}>
              <GoogleIcon />{loadingOAuth ? 'Loading…' : 'Continue with Google'}
            </button>

            <p style={S.footerNote}>
              Don't have an account?{' '}
              <Link to="/auth/register" style={S.footerLink}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

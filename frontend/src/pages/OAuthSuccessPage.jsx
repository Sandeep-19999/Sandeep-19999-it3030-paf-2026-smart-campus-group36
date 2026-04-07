import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('OAuth token not found in callback URL.');
      return;
    }
    completeOAuth(token)
      .then(() => navigate('/dashboard'))
      .catch((err) => setError(err.message));
  }, [params, completeOAuth, navigate]);

  return <div className="page-center">{error || 'Completing Google sign-in...'}</div>;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationBell() {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationService.getSummary(token);
        setCount(data.unreadCount || 0);
      } catch {
        setCount(0);
      }
    }
    if (token) load();
  }, [token]);

  return (
    <Link to="/app/notifications" className="notification-link" aria-label="Notifications">
      <span className="notification-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false" role="img">
          <path d="M12 3a5 5 0 0 0-5 5v2.6c0 1.2-.4 2.3-1.2 3.2l-1.1 1.4a1 1 0 0 0 .8 1.6h13a1 1 0 0 0 .8-1.6l-1.1-1.4a5 5 0 0 1-1.2-3.2V8a5 5 0 0 0-5-5zM9.7 18.5a2.5 2.5 0 0 0 4.6 0H9.7z" />
        </svg>
      </span>
      {count > 0 ? <span className="notification-count">{count > 999 ? '999+' : count}</span> : null}
    </Link>
  );
}

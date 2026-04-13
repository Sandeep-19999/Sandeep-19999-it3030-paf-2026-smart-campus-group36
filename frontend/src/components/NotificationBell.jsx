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
    <Link to="/app/notifications" className="notification-link">
      <span>Notifications</span>
      {count > 0 ? <span className="notification-count">{count}</span> : null}
    </Link>
  );
}

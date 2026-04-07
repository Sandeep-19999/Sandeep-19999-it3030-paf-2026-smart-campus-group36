import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  async function load() {
    const data = await notificationService.getAll(token);
    setNotifications(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [token]);

  const markOne = async (id) => {
    await notificationService.markRead(id, token);
    await load();
  };

  const markAll = async () => {
    await notificationService.markAllRead(token);
    await load();
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Notifications</h3>
        <button className="secondary-btn" onClick={markAll}>Mark all as read</button>
      </div>
      <div className="list-stack">
        {notifications.map((item) => (
          <div key={item.id} className={`notification-card ${item.read ? 'notification-read' : 'notification-unread'}`}>
            <div className="comment-header">
              <strong>{item.title}</strong>
              <span className="muted-text">{formatDate(item.createdAt)}</span>
            </div>
            <p>{item.message}</p>
            <div className="comment-actions">
              <span className="muted-text">{item.type}</span>
              {!item.read ? <button className="text-btn" onClick={() => markOne(item.id)}>Mark as read</button> : null}
            </div>
          </div>
        ))}
        {!notifications.length ? <p className="muted-text">No notifications found.</p> : null}
      </div>
    </section>
  );
}

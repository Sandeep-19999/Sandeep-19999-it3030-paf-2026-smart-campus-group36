import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ unreadCount: 0 });

  useEffect(() => {
    async function load() {
      const [ticketData, summaryData] = await Promise.all([
        ticketService.getTickets(token),
        notificationService.getSummary(token)
      ]);
      setTickets(ticketData);
      setSummary(summaryData);
    }
    load().catch(console.error);
  }, [token]);

  const openTickets = tickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status));

  return (
    <div className="content-grid">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Tickets</span>
          <strong>{tickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Active Tickets</span>
          <strong>{openTickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Unread Notifications</span>
          <strong>{summary.unreadCount || 0}</strong>
        </article>
        <article className="stat-card">
          <span>Logged In As</span>
          <strong>{user?.role}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent Tickets</h3>
        </div>
        <div className="list-stack">
          {tickets.slice(0, 5).map((ticket) => (
            <div key={ticket.id} className="ticket-row">
              <div>
                <strong>#{ticket.id} {ticket.title}</strong>
                <p className="muted-text">{ticket.locationLabel}</p>
              </div>
              <StatusBadge value={ticket.status} />
            </div>
          ))}
          {!tickets.length ? <p className="muted-text">No tickets yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

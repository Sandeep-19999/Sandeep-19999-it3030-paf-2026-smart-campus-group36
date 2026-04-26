import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { ticketService } from '../services/ticketService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatRoleLabel } from '../utils/helpers';

function formatBookingRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid booking time';
  }

  const dateLabel = start.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const startLabel = start.toLocaleTimeString(undefined, timeOptions);
  const endLabel = end.toLocaleTimeString(undefined, timeOptions);

  return `${dateLabel} • ${startLabel} - ${endLabel}`;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ unreadCount: 0 });

  useEffect(() => {
    async function load() {
      const [ticketData, summaryData, bookingData] = await Promise.all([
        ticketService.getTickets(token),
        notificationService.getSummary(token),
        bookingService.getMyBookings(token)
      ]);
      setTickets(Array.isArray(ticketData) ? ticketData : []);
      setSummary(summaryData || { unreadCount: 0 });
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    }
    load().catch(console.error);
  }, [token, user]);

  const openTickets = tickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status));
  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING');
  const recentTickets = tickets.slice(0, 5);
  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.startTime).getTime() - new Date(left.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="resource-catalogue-page dashboard-resource-page">
      <section className="resource-hero-card dashboard-resource-hero">
        <div className="resource-hero-main">
          <p className="dashboard-kicker">Welcome Back</p>
          <h1>{user?.fullName || 'User'} Dashboard</h1>
          <p>
            You are signed in as <strong>{formatRoleLabel(user?.role)}</strong>. This view shows your current tickets, bookings, and notifications.
          </p>
        </div>
        <aside className="resource-hero-snapshot dashboard-user-chip">
          <span className="dashboard-user-label">Logged in as</span>
          <h3>{user?.fullName}</h3>
          <p>{user?.email}</p>
          <div className="resource-snapshot-chips">
            <span>{formatRoleLabel(user?.role)}</span>
            <span>{summary.unreadCount || 0} unread</span>
          </div>
        </aside>
      </section>

      <section className="resource-stats-grid dashboard-resource-stats-grid">
        <article className="resource-stat-card">
          <span>Total Tickets</span>
          <strong>{tickets.length}</strong>
          <p>All tickets created by you across the smart campus operations workspace.</p>
        </article>
        <article className="resource-stat-card active">
          <span>Active Tickets</span>
          <strong>{openTickets.length}</strong>
          <p>Tickets currently open or in progress and waiting for completion.</p>
        </article>
        <article className="resource-stat-card">
          <span>Unread Notifications</span>
          <strong>{summary.unreadCount || 0}</strong>
          <p>Real-time updates requiring your attention from the operations center.</p>
        </article>
        <article className="resource-stat-card issue">
          <span>Pending Bookings</span>
          <strong>{pendingBookings.length}</strong>
          <p>Bookings still awaiting approval or final action from authorized staff.</p>
        </article>
        <article className="resource-stat-card">
          <span>Logged In As</span>
          <strong>{formatRoleLabel(user?.role)}</strong>
          <p>Your current role controls access to each module in this workspace.</p>
        </article>
      </section>

      <div className="resource-bottom-grid dashboard-resource-bottom-grid">
        <section className="resource-list-card">
          <div className="panel-header">
            <h3>Recent Tickets</h3>
          </div>
          <div className="resource-cards-grid dashboard-resource-cards-grid">
            {recentTickets.map((ticket) => (
              <article key={ticket.id} className="resource-catalogue-item dashboard-resource-item">
                <div>
                  <strong>#{ticket.id} {ticket.title}</strong>
                  <p>{ticket.locationLabel || 'No location provided'}</p>
                </div>
                <StatusBadge value={ticket.status} />
              </article>
            ))}
            {!recentTickets.length ? <p className="muted-text">No tickets yet.</p> : null}
          </div>
        </section>

        <section className="resource-list-card">
          <div className="panel-header">
            <h3>Recent Bookings</h3>
          </div>
          <div className="resource-cards-grid dashboard-resource-cards-grid">
            {recentBookings.map((booking) => (
              <article key={booking.id} className="resource-catalogue-item dashboard-resource-item">
                <div className="dashboard-booking-summary">
                  <strong>#{booking.id} {booking.facility?.name || 'Unknown Facility'}</strong>
                  <p>{formatBookingRange(booking.startTime, booking.endTime)}</p>
                </div>
                <div className="ticket-right booking-actions dashboard-booking-actions">
                  <StatusBadge value={booking.status} />
                  {booking.status === 'APPROVED' ? (
                    <Link className="text-btn" to="/app/bookings">
                      View QR
                    </Link>
                  ) : null}
                  {booking.status === 'CHECKED_IN' ? (
                    <span className="booking-inline-label">Checked In</span>
                  ) : null}
                </div>
              </article>
            ))}
            {!recentBookings.length ? <p className="muted-text">No bookings yet.</p> : null}
          </div>
          <div className="dashboard-section-footer">
            <Link className="secondary-btn" to="/app/bookings">View All Bookings</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

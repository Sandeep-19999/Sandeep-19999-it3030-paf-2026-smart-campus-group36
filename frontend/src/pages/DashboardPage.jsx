import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { ticketService } from '../services/ticketService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatRoleLabel } from '../utils/helpers';

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
  const isAdmin = user?.role === 'ADMIN';
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ unreadCount: 0 });

  useEffect(() => {
    async function load() {
      const [ticketData, summaryData, bookingData] = await Promise.all([
        ticketService.getTickets(token),
        notificationService.getSummary(token),
        isAdmin ? bookingService.getBookings({}, token) : bookingService.getMyBookings(token)
      ]);
      setTickets(Array.isArray(ticketData) ? ticketData : []);
      setSummary(summaryData || { unreadCount: 0 });
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    }
    load().catch(console.error);
  }, [token, user, isAdmin]);

  const openTickets = tickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status));
  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING');
  const bookingSummaryCount = isAdmin ? bookings.length : pendingBookings.length;
  const bookingSummaryLabel = isAdmin ? 'All Bookings' : 'Pending Bookings';
  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.startTime).getTime() - new Date(left.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="content-grid dashboard-grid">
      <section className="dashboard-hero panel">
        <div>
          <p className="dashboard-kicker">Welcome back</p>
          <h3>{user?.fullName || 'User'} Dashboard</h3>
          <p className="muted-text">
            You are signed in as <strong>{formatRoleLabel(user?.role)}</strong>. This view shows your current tickets, bookings, and notifications.
          </p>
        </div>
        <div className="dashboard-user-chip">
          <span className="dashboard-user-label">Logged in as</span>
          <strong>{user?.fullName}</strong>
          <span>{user?.email}</span>
        </div>
      </section>

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
          <span>{bookingSummaryLabel}</span>
          <strong>{bookingSummaryCount}</strong>
        </article>
        <article className="stat-card">
          <span>Logged In As</span>
          <strong>{formatRoleLabel(user?.role)}</strong>
        </article>
      </section>

      <div className="dashboard-recent-grid">
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

        <section className="panel">
          <div className="panel-header">
            <h3>Recent Bookings</h3>
          </div>
          <div className="list-stack">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="ticket-row booking-row dashboard-booking-row">
                <div className="dashboard-booking-summary">
                  <strong>#{booking.id} {booking.facility?.name || 'Unknown Facility'}</strong>
                  <p className="muted-text">{formatBookingRange(booking.startTime, booking.endTime)}</p>
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
              </div>
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

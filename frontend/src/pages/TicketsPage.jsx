import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { initialValuesForTicket } from '../utils/helpers';

export default function TicketsPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(initialValuesForTicket());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = user?.role === 'USER' ? await ticketService.getMyTickets(token) : await ticketService.getTickets(token);
    setTickets(data);
  }

  useEffect(() => {
    if (token && user) load().catch(console.error);
  }, [token, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await ticketService.createTicket(form, token);
      setForm(initialValuesForTicket());
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-grid two-column">
      <section className="panel">
        <div className="panel-header">
          <h3>Create New Incident Ticket</h3>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Title<input name="title" value={form.title} onChange={handleChange} /></label>
          <label>Category<input name="category" value={form.category} onChange={handleChange} /></label>
          <label>Description<textarea name="description" rows="4" value={form.description} onChange={handleChange} /></label>
          <label>Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
          <label>Location<input name="locationLabel" value={form.locationLabel} onChange={handleChange} /></label>
          <label>Resource Name<input name="resourceName" value={form.resourceName} onChange={handleChange} /></label>
          <label>Related Resource ID<input name="relatedResourceId" value={form.relatedResourceId} onChange={handleChange} /></label>
          <label>Preferred Contact<input name="preferredContact" value={form.preferredContact} onChange={handleChange} /></label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Create Ticket'}</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>{user?.role === 'USER' ? 'My Tickets' : 'All Tickets'}</h3>
        </div>
        <div className="list-stack">
          {tickets.map((ticket) => (
            <Link key={ticket.id} to={`/app/tickets/${ticket.id}`} className="ticket-card-link">
              <div className="ticket-row">
                <div>
                  <strong>#{ticket.id} {ticket.title}</strong>
                  <p className="muted-text">{ticket.locationLabel}</p>
                </div>
                <div className="ticket-right">
                  <StatusBadge value={ticket.status} />
                  <span className="muted-text">{ticket.priority}</span>
                </div>
              </div>
            </Link>
          ))}
          {!tickets.length ? <p className="muted-text">No tickets available.</p> : null}
        </div>
      </section>
    </div>
  );
}

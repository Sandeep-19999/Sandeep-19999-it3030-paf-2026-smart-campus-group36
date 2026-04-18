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
  const [photoFiles, setPhotoFiles] = useState([]);
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
      if (photoFiles.length > 3) {
        throw new Error('You can upload up to 3 photos only.');
      }
      const invalidFile = photoFiles.find((file) => !file.type.startsWith('image/'));
      if (invalidFile) {
        throw new Error('Only image files are allowed.');
      }

      const createdTicket = await ticketService.createTicket(form, token);
      if (photoFiles.length) {
        await ticketService.addAttachments(createdTicket.id, photoFiles, token);
      }

      setForm(initialValuesForTicket());
      setPhotoFiles([]);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canCreateTicket = user?.role === 'USER';

  return (
    <div className={canCreateTicket ? 'content-grid two-column' : 'content-grid'}>
      {canCreateTicket ? (
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
            <label>Photos (max 3)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
              />
            </label>
            <p className="muted-text">You can upload up to 3 photos when creating the ticket.</p>
            {error ? <div className="error-box">{error}</div> : null}
            <button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Create Ticket'}</button>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h3>{user?.role === 'USER' ? 'My Tickets' : user?.role === 'TECHNICIAN' ? 'Assigned Tickets' : 'All Tickets'}</h3>
        </div>
        {!canCreateTicket && error ? <div className="error-box">{error}</div> : null}
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

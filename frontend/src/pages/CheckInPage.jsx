import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';

export default function CheckInPage() {
  const { token } = useAuth();
  const [qrCodeToken, setQrCodeToken] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitCheckIn = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBooking(null);

    if (!qrCodeToken.trim()) {
      setError('QR code token is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bookingService.checkIn(qrCodeToken.trim(), token);
      setBooking(response);
      setSuccess('Check-in successful');
      setQrCodeToken('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-grid">
      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <section className="panel narrow-panel">
        <div className="panel-header">
          <h3>Booking Check-In</h3>
        </div>
        <form className="form-grid" onSubmit={submitCheckIn}>
          <label>QR Code Token
            <input
              type="text"
              value={qrCodeToken}
              onChange={(event) => setQrCodeToken(event.target.value)}
              placeholder="Paste QR code token"
              required
            />
          </label>
          <button className="primary-btn" disabled={submitting}>
            {submitting ? 'Checking in...' : 'Check In'}
          </button>
        </form>
      </section>

      {booking ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Checked-In Booking</h3>
          </div>
          <div className="list-stack">
            <div className="ticket-row booking-row">
              <div>
                <strong>#{booking.id} {booking.facility?.name}</strong>
                <p className="muted-text">{booking.purpose}</p>
                <p className="muted-text">{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</p>
                <p className="muted-text">Requested by {booking.requester?.fullName}</p>
              </div>
              <div className="ticket-right booking-actions">
                <StatusBadge value={booking.status} />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

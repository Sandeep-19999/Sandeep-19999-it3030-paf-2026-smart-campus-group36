import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { bookingService } from '../services/bookingService';
import { formatDate } from '../utils/helpers';

const MAX_BOOKING_DURATION_MS = 4 * 60 * 60 * 1000;

function toTimeValue(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function calculateEndTimeMax(startDateTimeValue) {
  if (!startDateTimeValue) {
    return '';
  }
  const start = new Date(startDateTimeValue);
  if (Number.isNaN(start.getTime())) {
    return '';
  }
  const maxByDuration = new Date(start.getTime() + MAX_BOOKING_DURATION_MS);
  const endOfStartDay = new Date(start);
  endOfStartDay.setHours(23, 59, 0, 0);
  return toTimeValue(maxByDuration > endOfStartDay ? endOfStartDay : maxByDuration);
}

function getBookingTimeValidationMessage(startDateTimeValue, endTimeValue) {
  if (!startDateTimeValue || !endTimeValue) {
    return '';
  }

  const [startDate] = startDateTimeValue.split('T');
  if (!startDate) {
    return '';
  }

  const start = new Date(startDateTimeValue);
  const end = new Date(`${startDate}T${endTimeValue}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '';
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return 'End time must be after start time';
  }
  if (diffMs > MAX_BOOKING_DURATION_MS) {
    return 'Booking duration cannot exceed 4 hours';
  }

  return '';
}

function initialBookingForm() {
  return {
    facilityId: '',
    purpose: '',
    startTime: '',
    startDate: '',
    endTime: ''
  };
}

export default function BookingsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState(initialBookingForm());
  const [bookingTimeError, setBookingTimeError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const activeFacilities = useMemo(
    () => facilities.filter((facility) => facility.active),
    [facilities]
  );

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const bookingData = await (isAdmin
        ? bookingService.getBookings(token)
        : bookingService.getMyBookings(token));

      let facilityData = [];
      if (!isAdmin) {
        facilityData = await bookingService.getFacilities(token);
      }

      setFacilities(facilityData);
      setBookings(bookingData);
      setBookingForm((prev) => ({
        ...prev,
        facilityId: prev.facilityId || (facilityData[0]?.id ? String(facilityData[0].id) : '')
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && user) {
      loadData().catch(console.error);
    }
  }, [token, user]);

  const handleBookingChange = (event) => {
    const { name, value } = event.target;

    if (name === 'startTime') {
      const [startDate = ''] = value.split('T');
      const endTimeMax = calculateEndTimeMax(value);
      let nextEndTime = bookingForm.endTime;

      setBookingForm((prev) => {
        const next = {
          ...prev,
          startTime: value,
          startDate
        };

        if (next.endTime) {
          const isAfterStart = new Date(`${startDate}T${next.endTime}`) > new Date(value);
          const withinRange = !endTimeMax || next.endTime <= endTimeMax;
          if (!isAfterStart || !withinRange) {
            next.endTime = '';
            nextEndTime = '';
          }
        }

        return next;
      });

      setBookingTimeError(getBookingTimeValidationMessage(value, nextEndTime));
      return;
    }

    if (name === 'endTime') {
      setBookingForm((prev) => {
        const next = { ...prev, endTime: value };
        setBookingTimeError(getBookingTimeValidationMessage(next.startTime, value));
        return next;
      });
      return;
    }

    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const timeValidationMessage = getBookingTimeValidationMessage(
      bookingForm.startTime,
      bookingForm.endTime
    );
    if (!bookingForm.startDate) {
      setError('Start time is required');
      return;
    }
    if (timeValidationMessage) {
      setBookingTimeError(timeValidationMessage);
      setError(timeValidationMessage);
      return;
    }

    const combinedEndTime = `${bookingForm.startDate}T${bookingForm.endTime}`;

    try {
      await bookingService.createBooking({
        facilityId: Number(bookingForm.facilityId),
        purpose: bookingForm.purpose,
        startTime: bookingForm.startTime,
        endTime: combinedEndTime
      }, token);
      setBookingForm(initialBookingForm());
      setBookingTimeError('');
      setSuccess('Booking submitted successfully');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const decideBooking = async (bookingId, status) => {
    const reason = status === 'REJECTED' ? window.prompt('Enter rejection reason') || '' : '';
    if (status === 'REJECTED' && !reason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await bookingService.decideBooking(bookingId, { status, reason }, token);
      setSuccess(`Booking ${status.toLowerCase()}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    const reason = window.prompt('Enter cancellation reason (optional)') || '';
    setError('');
    setSuccess('');
    try {
      await bookingService.cancelBooking(bookingId, reason, token);
      setSuccess('Booking cancelled');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`content-grid${isAdmin ? '' : ' two-column'}`}>
      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      {!isAdmin ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Book a Facility</h3>
          </div>
          <form className="form-grid" onSubmit={submitBooking}>
            <label>Facility
              <select name="facilityId" value={bookingForm.facilityId} onChange={handleBookingChange} required>
                <option value="">Select a facility</option>
                {activeFacilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type})
                  </option>
                ))}
              </select>
            </label>
            <label>Purpose
              <textarea name="purpose" rows="3" value={bookingForm.purpose} onChange={handleBookingChange} required />
            </label>
            <label>Start Time
              <input type="datetime-local" name="startTime" value={bookingForm.startTime} onChange={handleBookingChange} required />
            </label>
            <label>End Time
              <input
                type="time"
                name="endTime"
                value={bookingForm.endTime}
                min={bookingForm.startTime ? toTimeValue(new Date(bookingForm.startTime)) : ''}
                max={calculateEndTimeMax(bookingForm.startTime)}
                onChange={handleBookingChange}
                step="60"
                disabled={!bookingForm.startTime}
                required
              />
              {bookingTimeError ? <span className="danger-text">{bookingTimeError}</span> : null}
            </label>
            <button className="primary-btn">Submit Booking</button>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h3>{isAdmin ? 'All Booking Requests' : 'My Booking Requests'}</h3>
        </div>
        {loading ? <p className="muted-text">Loading...</p> : null}
        <div className="list-stack">
          {bookings.map((booking) => (
            <div key={booking.id} className="ticket-row booking-row">
              <div>
                <strong>#{booking.id} {booking.facility?.name}</strong>
                <p className="muted-text">{booking.purpose}</p>
                <p className="muted-text">{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</p>
                <p className="muted-text">Requested by {booking.requester?.fullName}</p>
              </div>
              <div className="ticket-right booking-actions">
                <StatusBadge value={booking.status} />
                {(booking.status === 'PENDING' || booking.status === 'APPROVED') ? (
                  <button className="text-btn danger-text" onClick={() => cancelBooking(booking.id)}>
                    Cancel
                  </button>
                ) : null}
                {isAdmin && booking.status === 'PENDING' ? (
                  <>
                    <button className="text-btn" onClick={() => decideBooking(booking.id, 'APPROVED')}>Approve</button>
                    <button className="text-btn danger-text" onClick={() => decideBooking(booking.id, 'REJECTED')}>Reject</button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          {!bookings.length && !loading ? <p className="muted-text">No booking requests found.</p> : null}
        </div>
      </section>
    </div>
  );
}

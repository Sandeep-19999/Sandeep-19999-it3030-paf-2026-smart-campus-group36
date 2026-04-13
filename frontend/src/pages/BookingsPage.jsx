import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { bookingService } from '../services/bookingService';
import { formatDate } from '../utils/helpers';

function initialFacilityForm() {
  return {
    name: '',
    type: '',
    location: '',
    capacity: 1,
    description: '',
    active: true
  };
}

function initialBookingForm() {
  return {
    facilityId: '',
    purpose: '',
    startTime: '',
    endTime: ''
  };
}

export default function BookingsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [facilityForm, setFacilityForm] = useState(initialFacilityForm());
  const [bookingForm, setBookingForm] = useState(initialBookingForm());
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
      const [facilityData, bookingData] = await Promise.all([
        bookingService.getFacilities(token),
        isAdmin ? bookingService.getBookings(token) : bookingService.getMyBookings(token)
      ]);
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

  const handleFacilityChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFacilityForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitFacility = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await bookingService.createFacility({
        ...facilityForm,
        capacity: Number(facilityForm.capacity)
      }, token);
      setFacilityForm(initialFacilityForm());
      setSuccess('Facility created successfully');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await bookingService.createBooking({
        ...bookingForm,
        facilityId: Number(bookingForm.facilityId)
      }, token);
      setBookingForm(initialBookingForm());
      setSuccess('Booking submitted successfully');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateFacilityStatus = async (facility) => {
    setError('');
    setSuccess('');
    try {
      await bookingService.updateFacility(
        facility.id,
        {
          name: facility.name,
          type: facility.type,
          location: facility.location,
          capacity: facility.capacity,
          description: facility.description,
          active: !facility.active
        },
        token
      );
      setSuccess(`Facility ${facility.active ? 'deactivated' : 'activated'}`);
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
              <input type="datetime-local" name="endTime" value={bookingForm.endTime} onChange={handleBookingChange} required />
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

      {isAdmin ? (
        <section className="panel full-span">
          <div className="panel-header">
            <h3>Facility Administration</h3>
          </div>
          <div className="content-grid two-column">
            <form className="form-grid" onSubmit={submitFacility}>
              <label>Name<input name="name" value={facilityForm.name} onChange={handleFacilityChange} required /></label>
              <label>Type<input name="type" value={facilityForm.type} onChange={handleFacilityChange} required /></label>
              <label>Location<input name="location" value={facilityForm.location} onChange={handleFacilityChange} required /></label>
              <label>Capacity<input type="number" min="1" name="capacity" value={facilityForm.capacity} onChange={handleFacilityChange} required /></label>
              <label>Description<textarea rows="3" name="description" value={facilityForm.description} onChange={handleFacilityChange} required /></label>
              <label className="inline-checkbox">
                <input type="checkbox" name="active" checked={facilityForm.active} onChange={handleFacilityChange} />
                Active
              </label>
              <button className="primary-btn">Create Facility</button>
            </form>
            <div className="list-stack">
              {facilities.map((facility) => (
                <div key={facility.id} className="ticket-row">
                  <div>
                    <strong>{facility.name}</strong>
                    <p className="muted-text">{facility.type} | {facility.location} | Capacity {facility.capacity}</p>
                  </div>
                  <div className="ticket-right">
                    <span className={`badge ${facility.active ? 'badge-approved' : 'badge-cancelled'}`}>
                      {facility.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button className="text-btn" onClick={() => updateFacilityStatus(facility)}>
                      {facility.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

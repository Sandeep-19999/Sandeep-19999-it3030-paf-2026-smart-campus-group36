import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingFiltersPanel from '../components/BookingFiltersPanel';
import BookingQrModal from '../components/BookingQrModal';
import StatusBadge from '../components/StatusBadge';
import { bookingService } from '../services/bookingService';
import { resourceService } from '../services/resourceService';
import { formatDate } from '../utils/helpers';

const MAX_BOOKING_DURATION_MS = 4 * 60 * 60 * 1000;

function toTimeValue(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function timeToMinutes(value) {
  const [hour, minute] = String(value || '').split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return (hour * 60) + minute;
}

function isWithinAvailabilityWindow(timeValue, availabilityStart, availabilityEnd) {
  const candidate = timeToMinutes(timeValue);
  const windowStart = timeToMinutes(availabilityStart);
  const windowEnd = timeToMinutes(availabilityEnd);

  if (candidate === null || windowStart === null || windowEnd === null) {
    return true;
  }

  if (windowStart <= windowEnd) {
    return candidate >= windowStart && candidate <= windowEnd;
  }

  return candidate >= windowStart || candidate <= windowEnd;
}

function formatAvailabilityLabel(timeValue) {
  if (!timeValue) {
    return '--:--';
  }
  const parsed = new Date(`1970-01-01T${timeValue}`);
  if (Number.isNaN(parsed.getTime())) {
    return timeValue;
  }
  return parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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

function getBookingTimeValidationMessage(startDateTimeValue, endTimeValue, availabilityStart, availabilityEnd) {
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

  const bookingStartTimeValue = toTimeValue(start);
  if (availabilityStart && availabilityEnd) {
    const startInsideAvailability = isWithinAvailabilityWindow(
      bookingStartTimeValue,
      availabilityStart,
      availabilityEnd
    );
    const endInsideAvailability = isWithinAvailabilityWindow(
      endTimeValue,
      availabilityStart,
      availabilityEnd
    );

    if (!startInsideAvailability || !endInsideAvailability) {
      return 'Booking time must be within the facility availability window';
    }
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

function initialFilterState() {
  return {
    status: 'ALL',
    facility: '',
    user: '',
    startDate: ''
  };
}

export default function BookingsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [activeResources, setActiveResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState(initialBookingForm());
  const [bookingTimeError, setBookingTimeError] = useState('');
  const [facilityError, setFacilityError] = useState('');
  const [filterError, setFilterError] = useState('');
  const [filters, setFilters] = useState(initialFilterState());
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalLoading, setQrModalLoading] = useState(false);
  const [qrCodeToken, setQrCodeToken] = useState('');
  const [qrImageBase64, setQrImageBase64] = useState('');
  const [qrBookingId, setQrBookingId] = useState(null);

  const sortedActiveResources = useMemo(
    () => [...activeResources].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [activeResources]
  );
  const selectedResource = useMemo(
    () => sortedActiveResources.find((resource) => String(resource.id) === String(bookingForm.facilityId)) || null,
    [sortedActiveResources, bookingForm.facilityId]
  );
  const alertMessage = error || success;
  const alertType = error ? 'error' : success ? 'success' : '';

  const dismissAlert = () => {
    setError('');
    setSuccess('');
    setFacilityError('');
    setFilterError('');
  };

  function validateFilters(nextFilters) {
    return '';
  }

  async function loadData(nextFilters = appliedFilters) {
    setLoading(true);
    setResourceLoading(true);
    setError('');
    setFacilityError('');
    try {
      const bookingData = await (isAdmin
        ? bookingService.getBookings(nextFilters, token)
        : bookingService.getMyBookings(token));

      let resourceData = [];
      if (!isAdmin) {
        try {
          const response = await resourceService.getActiveResources(token);
          resourceData = Array.isArray(response)
            ? response.filter((resource) => String(resource.status || '').toUpperCase() === 'ACTIVE')
            : [];
        } catch (resourceErr) {
          setFacilityError('Failed to load active resources');
          resourceData = [];
          console.error('Active resource fetch failed:', resourceErr);
        }
      }

      setActiveResources(resourceData);
      setBookings(bookingData);
      setBookingForm((prev) => ({
        ...prev,
        facilityId: resourceData.some((resource) => String(resource.id) === String(prev.facilityId))
          ? prev.facilityId
          : (resourceData[0]?.id ? String(resourceData[0].id) : '')
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setResourceLoading(false);
    }
  }

  useEffect(() => {
    if (token && user) {
      loadData(appliedFilters).catch(console.error);
    }
  }, [token, user]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    const validationMessage = validateFilters(filters);
    if (validationMessage) {
      setFilterError(validationMessage);
      setError(validationMessage);
      return;
    }

    setFilterError('');
    setError('');
    setAppliedFilters({ ...filters });
    await loadData(filters);
  };

  const resetFilters = async () => {
    const defaults = initialFilterState();
    setFilters(defaults);
    setAppliedFilters(defaults);
    setFilterError('');
    setError('');
    await loadData(defaults);
  };

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

      setBookingTimeError(getBookingTimeValidationMessage(
        value,
        nextEndTime,
        selectedResource?.availabilityStart,
        selectedResource?.availabilityEnd
      ));
      return;
    }

    if (name === 'endTime') {
      setBookingForm((prev) => {
        const next = { ...prev, endTime: value };
        setBookingTimeError(getBookingTimeValidationMessage(
          next.startTime,
          value,
          selectedResource?.availabilityStart,
          selectedResource?.availabilityEnd
        ));
        return next;
      });
      return;
    }

    if (name === 'facilityId') {
      const nextResource = sortedActiveResources.find((resource) => String(resource.id) === String(value));
      setBookingTimeError(getBookingTimeValidationMessage(
        bookingForm.startTime,
        bookingForm.endTime,
        nextResource?.availabilityStart,
        nextResource?.availabilityEnd
      ));
    }

    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setFacilityError('');

    if (!bookingForm.facilityId) {
      const message = 'Please select an active facility';
      setFacilityError(message);
      setError(message);
      return;
    }

    const selectedStillActive = sortedActiveResources.some(
      (resource) => String(resource.id) === String(bookingForm.facilityId)
    );
    if (!selectedStillActive) {
      const message = 'Selected resource is no longer active';
      setFacilityError(message);
      setError(message);
      return;
    }

    const timeValidationMessage = getBookingTimeValidationMessage(
      bookingForm.startTime,
      bookingForm.endTime,
      selectedResource?.availabilityStart,
      selectedResource?.availabilityEnd
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
      setFacilityError('');
      setSuccess('Booking submitted successfully');
      await loadData();
    } catch (err) {
      if (String(err.message || '').toLowerCase().includes('availability window')) {
        setBookingTimeError(err.message);
      }
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

  const viewQrCode = async (bookingId) => {
    setError('');
    setSuccess('');
    setQrModalOpen(true);
    setQrModalLoading(true);
    setQrCodeToken('');
    setQrImageBase64('');
    setQrBookingId(bookingId);

    try {
      const response = await bookingService.getBookingQr(bookingId, token);
      setQrCodeToken(response.qrCodeToken || '');
      setQrImageBase64(response.qrCodeImageBase64 || '');
    } catch (err) {
      setQrModalOpen(false);
      setError(err.message);
    } finally {
      setQrModalLoading(false);
    }
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setQrCodeToken('');
    setQrImageBase64('');
    setQrBookingId(null);
    setQrModalLoading(false);
  };

  return (
    <div className="content-grid two-column">
      {alertMessage ? (
        <div className={`booking-alert booking-alert-${alertType}`} role="alert" aria-live="polite">
          <span>{alertMessage}</span>
          <button
            type="button"
            className="booking-alert-close"
            onClick={dismissAlert}
            aria-label="Dismiss message"
          >
            x
          </button>
        </div>
      ) : null}

      {!isAdmin ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Book a Facility</h3>
          </div>
          {!resourceLoading && !sortedActiveResources.length ? (
            <div className="empty-state">
              <p className="muted-text">No active facilities available</p>
            </div>
          ) : (
            <form className="form-grid" onSubmit={submitBooking}>
              <label>Facility
                {resourceLoading ? (
                  <div className="disabled-select">
                    <p className="muted-text">Loading resources...</p>
                  </div>
                ) : (
                  <>
                    <select name="facilityId" value={bookingForm.facilityId} onChange={handleBookingChange} required>
                      <option value="">Select a facility</option>
                      {sortedActiveResources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type})
                        </option>
                      ))}
                    </select>
                    {selectedResource?.availabilityStart && selectedResource?.availabilityEnd ? (
                      <p className="muted-text">
                        Available from {formatAvailabilityLabel(selectedResource.availabilityStart)} to {formatAvailabilityLabel(selectedResource.availabilityEnd)}
                      </p>
                    ) : null}
                  </>
                )}
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
              <button
                className="primary-btn"
                disabled={!bookingForm.facilityId || !sortedActiveResources.length || resourceLoading}
              >
                Submit Booking
              </button>
            </form>
          )}
        </section>
      ) : (
        <BookingFiltersPanel
          filters={filters}
          onChange={handleFilterChange}
          onApply={applyFilters}
          onReset={resetFilters}
          loading={loading}
          error=""
        />
      )}

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
                {booking.status === 'APPROVED' ? (
                  <button type="button" className="text-btn" onClick={() => viewQrCode(booking.id)}>
                    View QR
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
          {!bookings.length && !loading ? <p className="muted-text">No bookings found</p> : null}
        </div>
      </section>

      <BookingQrModal
        open={qrModalOpen}
        loading={qrModalLoading}
        bookingId={qrBookingId}
        qrCodeToken={qrCodeToken}
        qrCodeImageBase64={qrImageBase64}
        onClose={closeQrModal}
      />
    </div>
  );
}

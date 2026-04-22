import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import { useAuth } from '../contexts/AuthContext';

const fallbackFacilities = [
  {
    id: 'F1',
    name: 'Main Computer Lab',
    type: 'Computer Lab',
    capacity: 60,
    location: 'Building A - Floor 2',
    availabilityStart: '08:00',
    availabilityEnd: '18:00',
    status: 'ACTIVE'
  },
  {
    id: 'F2',
    name: 'Innovation Lecture Hall',
    type: 'Lecture Hall',
    capacity: 180,
    location: 'Building C - Ground Floor',
    availabilityStart: '07:30',
    availabilityEnd: '20:00',
    status: 'ACTIVE'
  },
  {
    id: 'F3',
    name: 'Student Collaboration Room',
    type: 'Meeting Room',
    capacity: 20,
    location: 'Library Block - Level 1',
    availabilityStart: '09:00',
    availabilityEnd: '17:00',
    status: 'ACTIVE'
  }
];

export default function FacilitiesPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState(fallbackFacilities);
  const [loading, setLoading] = useState(true);
  const [availabilityStartFilter, setAvailabilityStartFilter] = useState('08:00');
  const [availabilityEndFilter, setAvailabilityEndFilter] = useState('17:00');
  const [facilitySearch, setFacilitySearch] = useState('');

  const toMinutes = (time) => {
    const [hour, minute] = String(time || '00:00').split(':').map(Number);
    return hour * 60 + minute;
  };

  const filteredFacilities = useMemo(() => {
    const hasStartFilter = Boolean(availabilityStartFilter);
    const hasEndFilter = Boolean(availabilityEndFilter);
    const hasSearch = Boolean(facilitySearch.trim());

    if (!hasStartFilter && !hasEndFilter && !hasSearch) {
      return facilities;
    }

    const selectedStartMinutes = hasStartFilter ? toMinutes(availabilityStartFilter) : null;
    const selectedEndMinutes = hasEndFilter ? toMinutes(availabilityEndFilter) : null;
    const searchValue = facilitySearch.trim().toLowerCase();

    return facilities.filter((facility) => {
      const facilityStart = toMinutes(facility.availabilityStart);
      const facilityEnd = toMinutes(facility.availabilityEnd);

      const matchesSearch = !hasSearch
        || facility.name.toLowerCase().includes(searchValue)
        || facility.type.toLowerCase().includes(searchValue);

      const matchesTimeWindow = (!hasStartFilter || selectedStartMinutes >= facilityStart)
        && (!hasEndFilter || selectedEndMinutes <= facilityEnd)
        && (!hasStartFilter || !hasEndFilter || selectedStartMinutes <= selectedEndMinutes);

      return facility.status === 'ACTIVE' && matchesSearch && matchesTimeWindow;
    });
  }, [facilities, availabilityStartFilter, availabilityEndFilter, facilitySearch]);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await resourceService.getResources();
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data);
        }
      } catch {
        // Keep fallback list when backend is unavailable or protected.
      } finally {
        setLoading(false);
      }
    }

    loadFacilities().catch(() => setLoading(false));
  }, []);

  return (
    <div className="facilities-shell">
      <header className="facilities-header">
        <p className="landing-tag">Campus Facilities</p>
        <h1>Available Facilities</h1>
        <p className="muted-text">
          Browse essential facility details like location, capacity, and available time.
        </p>
      </header>

      {loading ? <p className="muted-text">Loading facilities...</p> : null}

      <section className="facility-tools-card">
        <div className="panel-header">
          <h3>Facility Availability Filters</h3>
          <span className="muted-text">
            {availabilityStartFilter || availabilityEndFilter
              ? `Filtering from ${availabilityStartFilter || '--:--'} to ${availabilityEndFilter || '--:--'}`
              : 'No time filter'}
          </span>
        </div>

        <p className="muted-text">
          Filter active facilities by availability time range and search by facility name or type.
        </p>

        <div className="facility-tools-row">
          <label>
            Availability Start
            <input
              type="time"
              value={availabilityStartFilter}
              onChange={(event) => setAvailabilityStartFilter(event.target.value)}
            />
          </label>
          <label>
            Availability End
            <input
              type="time"
              value={availabilityEndFilter}
              onChange={(event) => setAvailabilityEndFilter(event.target.value)}
            />
          </label>
          <label>
            Search Facility (Name or Type)
            <input
              type="text"
              placeholder="e.g., Physics Lab or Lecture Hall"
              value={facilitySearch}
              onChange={(event) => setFacilitySearch(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setAvailabilityStartFilter('08:00');
              setAvailabilityEndFilter('17:00');
              setFacilitySearch('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="facilities-grid">
        {filteredFacilities.map((facility) => (
          <article key={facility.id} className="facility-card">
            <div className="panel-header">
              <h3>{facility.name}</h3>
              <span className={`badge ${facility.status === 'ACTIVE' ? 'badge-resolved' : 'badge-rejected'}`}>
                {facility.status}
              </span>
            </div>
            <p className="muted-text">{facility.type}</p>
            <p>
              <strong>Location:</strong> {facility.location}
            </p>
            <p>
              <strong>Capacity:</strong> {facility.capacity}
            </p>
            <p>
              <strong>Available:</strong> {facility.availabilityStart} - {facility.availabilityEnd}
            </p>
          </article>
        ))}
        {!loading && filteredFacilities.length === 0 ? (
          <article className="facility-card">
            <h3>No facilities found</h3>
            <p className="muted-text">
              No active facilities match your selected time range or search keyword.
            </p>
          </article>
        ) : null}
      </section>

      <div className="facilities-actions">
        <Link to="/" className="secondary-btn">Back to Home</Link>
        <Link to="/login/staff" className="primary-btn">Staff Login to Manage Facilities</Link>
      </div>
    </div>
  );
}

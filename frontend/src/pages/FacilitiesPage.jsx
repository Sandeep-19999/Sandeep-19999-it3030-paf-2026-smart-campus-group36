import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../services/resourceService';

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
  const [facilities, setFacilities] = useState(fallbackFacilities);
  const [loading, setLoading] = useState(true);

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

      <section className="facilities-grid">
        {facilities.map((facility) => (
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
      </section>

      <div className="facilities-actions">
        <Link to="/" className="secondary-btn">Back to Home</Link>
        <Link to="/login/staff" className="primary-btn">Staff Login to Manage Facilities</Link>
      </div>
    </div>
  );
}

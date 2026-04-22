import { useEffect, useMemo, useState } from 'react';
import { resourceService } from '../services/resourceService';
import { useAuth } from '../contexts/AuthContext';

const emptyForm = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  status: 'ACTIVE',
  availabilityStart: '08:00',
  availabilityEnd: '17:00'
};

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [availabilityStartFilter, setAvailabilityStartFilter] = useState('08:00');
  const [availabilityEndFilter, setAvailabilityEndFilter] = useState('17:00');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toMinutes = (time) => {
    const [hour, minute] = String(time || '00:00').split(':').map(Number);
    return hour * 60 + minute;
  };

  const filteredResources = useMemo(() => {
    const hasStartFilter = Boolean(availabilityStartFilter);
    const hasEndFilter = Boolean(availabilityEndFilter);
    const hasSearch = Boolean(facilitySearch.trim());

    if (!hasStartFilter && !hasEndFilter && !hasSearch) {
      return resources;
    }

    const selectedStartMinutes = hasStartFilter ? toMinutes(availabilityStartFilter) : null;
    const selectedEndMinutes = hasEndFilter ? toMinutes(availabilityEndFilter) : null;
    const searchValue = facilitySearch.trim().toLowerCase();

    return resources.filter((resource) => {
      const resourceStart = toMinutes(resource.availabilityStart);
      const resourceEnd = toMinutes(resource.availabilityEnd);

      const matchesSearch = !hasSearch
        || resource.name.toLowerCase().includes(searchValue)
        || resource.type.toLowerCase().includes(searchValue);

      const matchesTimeWindow = (!hasStartFilter || selectedStartMinutes >= resourceStart)
        && (!hasEndFilter || selectedEndMinutes <= resourceEnd)
        && (!hasStartFilter || !hasEndFilter || selectedStartMinutes <= selectedEndMinutes);

      return resource.status === 'ACTIVE' && matchesSearch && matchesTimeWindow;
    });
  }, [resources, availabilityStartFilter, availabilityEndFilter, facilitySearch]);

  async function loadResources() {
    setLoading(true);
    setError('');
    try {
      const data = await resourceService.getResources({}, token);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadResources().catch(console.error);
    }
  }, [token]);

  const onFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name ?? '',
      type: resource.type ?? '',
      capacity: resource.capacity ?? '',
      location: resource.location ?? '',
      status: resource.status ?? 'ACTIVE',
      availabilityStart: resource.availabilityStart ?? '08:00',
      availabilityEnd: resource.availabilityEnd ?? '17:00'
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      capacity: Number(form.capacity)
    };

    try {
      if (editingId) {
        await resourceService.updateResource(editingId, payload, token);
      } else {
        await resourceService.createResource(payload, token);
      }
      resetForm();
      await loadResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this resource?');
    if (!ok) return;

    setError('');
    try {
      await resourceService.deleteResource(id, token);
      await loadResources();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="content-grid two-column">
      {isAdmin ? (
        <section className="panel">
          <div className="panel-header resource-form-header">
            <h3>{editingId ? 'Update Resource' : 'Add New Resource'}</h3>
            {editingId ? (
              <button type="button" className="text-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" value={form.name} onChange={onFormChange} required />
            </label>
            <label>
              Type
              <input name="type" value={form.type} onChange={onFormChange} required />
            </label>
            <label>
              Capacity
              <input
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={onFormChange}
                required
              />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={onFormChange} required />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={onFormChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </label>
            <label>
              Availability Start
              <input
                name="availabilityStart"
                type="time"
                value={form.availabilityStart}
                onChange={onFormChange}
                required
              />
            </label>
            <label>
              Availability End
              <input
                name="availabilityEnd"
                type="time"
                value={form.availabilityEnd}
                onChange={onFormChange}
                required
              />
            </label>

            <button className="primary-btn" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h3>Resources Catalogue</h3>
          <span className="muted-text">{filteredResources.length} of {resources.length} items</span>
        </div>

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
              placeholder="e.g., Physics Lab or Classroom"
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

        {error ? <div className="error-box">{error}</div> : null}

        {loading ? (
          <p className="muted-text">Loading resources...</p>
        ) : (
          <div className="list-stack">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="resource-row">
                <div>
                  <strong>{resource.name}</strong>
                  <p className="muted-text">
                    {resource.type} | {resource.location}
                  </p>
                  <p className="muted-text">
                    Capacity: {resource.capacity} | {resource.availabilityStart} - {resource.availabilityEnd}
                  </p>
                  <span className={`badge ${resource.status === 'ACTIVE' ? 'badge-resolved' : 'badge-rejected'}`}>
                    {resource.status}
                  </span>
                </div>

                {isAdmin ? (
                  <div className="resource-actions">
                    <button type="button" className="secondary-btn" onClick={() => startEdit(resource)}>
                      Edit
                    </button>
                    <button type="button" className="text-btn danger-text" onClick={() => handleDelete(resource.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))}

            {!filteredResources.length ? (
              <p className="muted-text">No resources found for the selected time range or search keyword.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

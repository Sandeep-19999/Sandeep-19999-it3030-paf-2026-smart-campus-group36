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

const defaultFilters = {
  search: '',
  type: 'ALL',
  status: 'ALL',
  location: '',
  minCapacity: '',
  availabilityStart: '',
  availabilityEnd: ''
};

function statusBadgeClass(status) {
  if (status === 'ACTIVE') return 'badge-resolved';
  if (status === 'OUT_OF_SERVICE') return 'badge-rejected';
  return 'badge-closed';
}

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const toMinutes = (time) => {
    const [hour, minute] = String(time || '00:00').split(':').map(Number);
    return hour * 60 + minute;
  };

  const filteredResources = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();
    const locationValue = filters.location.trim().toLowerCase();
    const hasStartFilter = Boolean(filters.availabilityStart);
    const hasEndFilter = Boolean(filters.availabilityEnd);
    const selectedStartMinutes = hasStartFilter ? toMinutes(filters.availabilityStart) : null;
    const selectedEndMinutes = hasEndFilter ? toMinutes(filters.availabilityEnd) : null;
    const hasValidWindow = !hasStartFilter || !hasEndFilter || selectedStartMinutes <= selectedEndMinutes;

    if (!hasValidWindow) {
      return [];
    }

    return resources.filter((resource) => {
      const resourceStart = toMinutes(resource.availabilityStart);
      const resourceEnd = toMinutes(resource.availabilityEnd);
      const normalizedType = String(resource.type || '').trim();
      const normalizedStatus = String(resource.status || '').trim();
      const normalizedName = String(resource.name || '').trim();
      const normalizedLocation = String(resource.location || '').trim();
      const minCapacity = filters.minCapacity ? Number(filters.minCapacity) : null;

      const matchesSearch = !searchValue
        || normalizedName.toLowerCase().includes(searchValue)
        || normalizedType.toLowerCase().includes(searchValue)
        || normalizedLocation.toLowerCase().includes(searchValue);

      const matchesType = filters.type === 'ALL' || normalizedType === filters.type;
      const matchesStatus = filters.status === 'ALL' || normalizedStatus === filters.status;
      const matchesLocation = !locationValue || normalizedLocation.toLowerCase().includes(locationValue);
      const matchesCapacity = minCapacity === null || Number(resource.capacity || 0) >= minCapacity;

      const matchesTimeWindow = (!hasStartFilter || selectedStartMinutes >= resourceStart)
        && (!hasEndFilter || selectedEndMinutes <= resourceEnd);

      return matchesSearch
        && matchesType
        && matchesStatus
        && matchesLocation
        && matchesCapacity
        && matchesTimeWindow;
    });
  }, [resources, filters]);

  const stats = useMemo(() => {
    const activeCount = resources.filter((resource) => resource.status === 'ACTIVE').length;
    const outOfServiceCount = resources.filter((resource) => resource.status === 'OUT_OF_SERVICE').length;
    const inactiveCount = resources.filter((resource) => !['ACTIVE', 'OUT_OF_SERVICE'].includes(resource.status)).length;
    const resourceTypes = new Set(resources.map((resource) => String(resource.type || '').trim()).filter(Boolean)).size;
    const totalCapacity = resources.reduce((sum, resource) => sum + Number(resource.capacity || 0), 0);
    const missingDetailsResources = resources.filter(
      (resource) => !String(resource.name || '').trim()
        || !String(resource.type || '').trim()
        || !String(resource.location || '').trim()
    );
    const limitedAvailabilityResources = resources.filter(
      (resource) => toMinutes(resource.availabilityEnd) - toMinutes(resource.availabilityStart) <= 120
    );
    const healthScore = resources.length
      ? Math.max(
        0,
        Math.min(
          100,
          Math.round(((activeCount - missingDetailsResources.length) / resources.length) * 100)
        )
      )
      : 100;

    const attentionResources = resources
      .filter((resource) => resource.status === 'OUT_OF_SERVICE'
        || missingDetailsResources.some((item) => item.id === resource.id)
        || limitedAvailabilityResources.some((item) => item.id === resource.id))
      .slice(0, 4);

    return {
      activeCount,
      outOfServiceCount,
      inactiveCount,
      resourceTypes,
      totalCapacity,
      missingDetailsResources,
      limitedAvailabilityResources,
      healthScore,
      attentionResources
    };
  }, [resources]);

  const availableTypes = useMemo(
    () => [...new Set(resources.map((resource) => String(resource.type || '').trim()).filter(Boolean))].sort(),
    [resources]
  );

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

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
    if (!editingId) {
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      capacity: Number(form.capacity)
    };

    try {
      await resourceService.updateResource(editingId, payload, token);
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
    setDeletingId(id);
    try {
      await resourceService.deleteResource(id, token);
      await loadResources();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasInvalidWindow = Boolean(filters.availabilityStart && filters.availabilityEnd)
    && toMinutes(filters.availabilityStart) > toMinutes(filters.availabilityEnd);

  return (
    <div className="resource-catalogue-page">
      <section className="resource-hero-card">
        <div className="resource-hero-main">
          <h1>Smart Resource Catalogue</h1>
          <p>
            Manage lecture halls, labs, meeting rooms, and equipment with clean search,
            clear availability windows, and a polished operations dashboard.
          </p>
        </div>
        <aside className="resource-hero-snapshot">
          <span>OPERATIONS SNAPSHOT</span>
          <h3>{resources.length} resources under management</h3>
          <p>
            Track live availability, check service status, and keep the catalogue updated from one place.
          </p>
          <div className="resource-snapshot-chips">
            <span>{stats.resourceTypes} resource types</span>
            <span>{stats.totalCapacity} total capacity</span>
          </div>
        </aside>
      </section>

      <section className="resource-stats-grid">
        <article className="resource-stat-card">
          <span>Total Resources</span>
          <strong>{resources.length}</strong>
          <p>All rooms and equipment currently in your resource catalogue.</p>
        </article>
        <article className="resource-stat-card active">
          <span>Active Resources</span>
          <strong>{stats.activeCount}</strong>
          <p>Ready to use right now for normal operations and bookings.</p>
        </article>
        <article className="resource-stat-card issue">
          <span>Out of Service</span>
          <strong>{stats.outOfServiceCount}</strong>
          <p>Temporarily unavailable resources that may need repair or maintenance.</p>
        </article>
        <article className="resource-stat-card">
          <span>Inactive Resources</span>
          <strong>{stats.inactiveCount}</strong>
          <p>Resources kept in the system but not currently open for active use.</p>
        </article>
      </section>

      <section className="resource-attention-panel">
        <div className="resource-attention-head">
          <span>RESOURCE HEALTH & ALERTS</span>
          <h2>{stats.attentionResources.length} resources need admin attention</h2>
          <p>
            This operational health panel highlights service issues, limited availability windows,
            and incomplete profiles so admins can fix issues before they affect bookings.
          </p>
        </div>

        <div className="resource-attention-metrics">
          <div className="resource-metric-card">
            <span>Health score</span>
            <strong>{stats.healthScore}%</strong>
            <p>Resources currently active and operational in the catalogue.</p>
          </div>
          <div className="resource-metric-card">
            <span>Out of service</span>
            <strong>{stats.outOfServiceCount}</strong>
            <p>Resources with service interruptions.</p>
          </div>
          <div className="resource-metric-card">
            <span>Limited availability</span>
            <strong>{stats.limitedAvailabilityResources.length}</strong>
            <p>Resources available for two hours or less per day.</p>
          </div>
          <div className="resource-metric-card">
            <span>Missing details</span>
            <strong>{stats.missingDetailsResources.length}</strong>
            <p>Profiles that still need core information.</p>
          </div>
        </div>

        <div className="resource-attention-list">
          {stats.attentionResources.map((resource) => (
            <article key={resource.id} className="resource-attention-item">
              <h4>{resource.name}</h4>
              <p>{resource.type} • {resource.location}</p>
              <p>{resource.availabilityStart} - {resource.availabilityEnd}</p>
              <span className={`badge ${statusBadgeClass(resource.status)}`}>
                {resource.status}
              </span>
            </article>
          ))}
          {!stats.attentionResources.length ? (
            <article className="resource-attention-item healthy">
              <h4>All resources look healthy</h4>
              <p>No urgent operational issues detected right now.</p>
            </article>
          ) : null}
        </div>
      </section>

      <section className="resource-bottom-grid">
        <article className="resource-filter-card">
          <div className="panel-header">
            <h3>Search and filter resources</h3>
          </div>

          <form className="resource-filter-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Search
              <input
                name="search"
                type="text"
                placeholder="Search by name, type, or location"
                value={filters.search}
                onChange={onFilterChange}
              />
            </label>
            <label>
              Resource Type
              <select name="type" value={filters.type} onChange={onFilterChange}>
                <option value="ALL">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" value={filters.status} onChange={onFilterChange}>
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </label>
            <label>
              Location
              <input
                name="location"
                type="text"
                placeholder="Search by location"
                value={filters.location}
                onChange={onFilterChange}
              />
            </label>
            <label>
              Minimum Capacity
              <input
                name="minCapacity"
                type="number"
                min="1"
                placeholder="Minimum capacity"
                value={filters.minCapacity}
                onChange={onFilterChange}
              />
            </label>
            <label>
              Available From
              <input
                name="availabilityStart"
                type="time"
                value={filters.availabilityStart}
                onChange={onFilterChange}
              />
            </label>
            <label>
              Available Until
              <input
                name="availabilityEnd"
                type="time"
                value={filters.availabilityEnd}
                onChange={onFilterChange}
              />
            </label>

            <div className="resource-filter-actions">
              <button type="button" className="secondary-btn" onClick={clearFilters}>Reset Filters</button>
            </div>

            {hasInvalidWindow ? (
              <p className="field-error">Available From time should be earlier than Available Until time.</p>
            ) : null}
          </form>
        </article>

        <article className="resource-list-card">
          <div className="panel-header">
            <h3>Resource catalogue</h3>
            <span className="muted-text">{filteredResources.length} of {resources.length} shown</span>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          {loading ? (
            <p className="muted-text">Loading resources...</p>
          ) : (
            <div className="resource-cards-grid">
              {filteredResources.map((resource) => (
                <article key={resource.id} className="resource-catalogue-item">
                  <div className="resource-catalogue-item-head">
                    <h4>{resource.name}</h4>
                    <span className={`badge ${statusBadgeClass(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                  <p>{resource.type}</p>
                  <p><strong>Location:</strong> {resource.location}</p>
                  <p><strong>Capacity:</strong> {resource.capacity}</p>
                  <p><strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>

                  {isAdmin ? (
                    <div className="resource-catalogue-actions">
                      <button type="button" className="secondary-btn" onClick={() => startEdit(resource)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-btn danger-text"
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
                      >
                        {deletingId === resource.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
              {!filteredResources.length ? (
                <article className="resource-catalogue-item">
                  <h4>No resources found</h4>
                  <p>Try adjusting your search and filter values.</p>
                </article>
              ) : null}
            </div>
          )}
        </article>

        {isAdmin ? (
          <article className="resource-edit-card">
            <div className="panel-header">
              <h3>{editingId ? 'Edit resource' : 'Admin actions'}</h3>
              {editingId ? (
                <button type="button" className="text-btn" onClick={resetForm}>Cancel</button>
              ) : null}
            </div>

            {editingId ? (
              <form className="resource-admin-form" onSubmit={handleSubmit}>
                <label>
                  Resource Name
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <p className="muted-text">
                Select a resource from the catalogue and click Edit to update details.
                Admins can also delete resources directly from each resource card.
              </p>
            )}
          </article>
        ) : null}
      </section>
    </div>
  );
}

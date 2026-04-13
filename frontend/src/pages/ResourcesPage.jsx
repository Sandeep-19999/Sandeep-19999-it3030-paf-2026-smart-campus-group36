import { useEffect, useState } from 'react';
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

const emptyFilters = {
  type: '',
  minCapacity: '',
  location: '',
  status: ''
};

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadResources(activeFilters = {}) {
    setLoading(true);
    setError('');
    try {
      const data = await resourceService.getResources(activeFilters, token);
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

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    await loadResources(filters);
  };

  const resetFilters = async () => {
    setFilters(emptyFilters);
    await loadResources({});
  };

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
      <section className="panel">
        <div className="panel-header">
          <h3>Resource Filters</h3>
        </div>
        <form className="form-grid" onSubmit={applyFilters}>
          <label>
            Type
            <input
              name="type"
              value={filters.type}
              onChange={onFilterChange}
              placeholder="Lab, Lecture Hall, Projector"
            />
          </label>
          <label>
            Min Capacity
            <input
              name="minCapacity"
              type="number"
              min="0"
              value={filters.minCapacity}
              onChange={onFilterChange}
              placeholder="40"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={filters.location}
              onChange={onFilterChange}
              placeholder="Building A"
            />
          </label>
          <label>
            Status
            <select name="status" value={filters.status} onChange={onFilterChange}>
              <option value="">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </label>
          <button className="primary-btn" type="submit">Apply Filters</button>
          <button className="secondary-btn" type="button" onClick={resetFilters}>Reset Filters</button>
        </form>

        {isAdmin ? (
          <>
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
          </>
        ) : (
          <p className="muted-text">Read-only mode. Login as ADMIN to add, update, or delete resources.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Resources Catalogue</h3>
          <span className="muted-text">{resources.length} items</span>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        {loading ? (
          <p className="muted-text">Loading resources...</p>
        ) : (
          <div className="list-stack">
            {resources.map((resource) => (
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

            {!resources.length ? (
              <p className="muted-text">No resources found for the current filters.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

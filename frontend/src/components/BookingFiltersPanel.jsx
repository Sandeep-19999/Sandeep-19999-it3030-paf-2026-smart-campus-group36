export default function BookingFiltersPanel({ filters, onChange, onApply, onReset, loading, error }) {
  return (
    <section className="panel booking-filter-card resource-filter-card">
      <div className="panel-header">
        <h3>Booking Filters</h3>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="booking-filter-grid">
        <label>Status
          <select name="status" value={filters.status} onChange={onChange}>
            <option value="ALL">ALL</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>

        <label>Facility Name
          <input
            type="text"
            name="facility"
            value={filters.facility}
            onChange={onChange}
            placeholder="Search facility (Lab, Hall, Room...)"
          />
        </label>

        <label>User
          <input
            type="text"
            name="user"
            value={filters.user}
            onChange={onChange}
            placeholder="Search by user name or email"
          />
        </label>

        <label>Start Date
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={onChange}
          />
        </label>
      </div>

      <div className="booking-filter-actions">
        <button type="button" className="primary-btn" onClick={onApply} disabled={loading}>
          Apply Filters
        </button>
        <button type="button" className="secondary-btn" onClick={onReset} disabled={loading}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}
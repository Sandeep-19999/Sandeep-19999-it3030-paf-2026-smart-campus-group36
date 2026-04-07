export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{value}</span>;
}

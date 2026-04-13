import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="page-center">
      <div className="panel narrow-panel">
        <h2>Unauthorized</h2>
        <p className="muted-text">You do not have permission to access that page.</p>
        <Link to="/app/dashboard" className="primary-btn">Go back to dashboard</Link>
      </div>
    </div>
  );
}

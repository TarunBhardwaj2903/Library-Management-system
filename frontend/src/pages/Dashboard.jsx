import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <div className="card">
        <p>Signed in as <b>{user?.role}</b>. Modules available to you:</p>
        <ul>
          {user?.role === 'admin' && <li><Link to="/maintenance">Maintenance</Link></li>}
          <li><Link to="/reports">Reports</Link> — Book availability search</li>
          <li><Link to="/transactions">Transactions</Link> — Issue / Return / Fine payment</li>
        </ul>
      </div>
    </div>
  );
}

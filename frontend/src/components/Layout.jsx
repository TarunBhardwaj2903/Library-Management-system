import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav('/login');
  }

  return (
    <>
      <nav className="nav">
        <Link to="/dashboard"><strong>LMS</strong></Link>
        {user?.role === 'admin' && <Link to="/maintenance">Maintenance</Link>}
        <Link to="/reports">Reports</Link>
        <Link to="/transactions">Transactions</Link>
        <span className="spacer" />
        <span className="user">{user?.name} ({user?.role})</span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}

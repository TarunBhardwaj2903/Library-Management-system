import { Link, Outlet, useLocation } from 'react-router-dom';

const TABS = [
  { to: 'users', label: 'User Management' },
  { to: 'memberships/add', label: 'Add Membership' },
  { to: 'memberships/update', label: 'Update Membership' },
  { to: 'books/add', label: 'Add Book' },
  { to: 'books/update', label: 'Update Book' },
];

export default function MaintenanceHome() {
  const { pathname } = useLocation();
  return (
    <div>
      <h1>Maintenance</h1>
      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              background: pathname.endsWith(t.to) ? '#e0ecff' : '#fff',
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

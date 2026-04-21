import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import FormError from '../components/FormError.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!form.username.trim() || !form.password) {
      setErr('Username and password are required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.username.trim(), form.password);
      nav(user.role === 'admin' ? '/dashboard' : '/reports');
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 380, marginTop: 80 }}>
      <div className="card">
        <h1>Library Login</h1>
        <form onSubmit={handleSubmit} noValidate>
          <FormError message={err} />
          <label>
            <span className="lbl">Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
          </label>
          <label>
            <span className="lbl">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ fontSize: 12, marginTop: 14, color: '#555' }}>
          Demo: <code>admin/admin123</code> or <code>john/user123</code>
        </p>
      </div>
    </div>
  );
}

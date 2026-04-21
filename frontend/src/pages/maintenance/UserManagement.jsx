import { useState } from 'react';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

const emptyForm = { username: '', password: '', name: '', email: '', phone: '', role: 'user' };

export default function UserManagement() {
  const [mode, setMode] = useState('new');
  const [lookup, setLookup] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [existingId, setExistingId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  function reset() {
    setForm(emptyForm);
    setExistingId(null);
    setErrors([]);
    setMsg('');
    setOk('');
  }

  async function handleLookup() {
    setMsg('');
    setOk('');
    try {
      const { data } = await client.get(`/users/by-username/${encodeURIComponent(lookup.trim())}`);
      setForm({
        username: data.user.username,
        password: '',
        name: data.user.name,
        email: data.user.email || '',
        phone: data.user.phone || '',
        role: data.user.role,
      });
      setExistingId(data.user._id);
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    setOk('');
    if (!form.name.trim()) {
      setErrors([{ field: 'name', msg: 'Name is required' }]);
      return;
    }
    try {
      if (mode === 'new') {
        if (!form.username.trim() || !form.password) {
          setErrors([
            ...(form.username.trim() ? [] : [{ field: 'username', msg: 'Username is required' }]),
            ...(form.password ? [] : [{ field: 'password', msg: 'Password is required' }]),
          ]);
          return;
        }
        await client.post('/users', form);
        setOk('User created');
        reset();
      } else {
        if (!existingId) return setMsg('Look up a user first');
        await client.put(`/users/${existingId}`, form);
        setOk('User updated');
      }
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  return (
    <div className="card">
      <h2>User Management</h2>

      <div className="radio-group">
        <label>
          <input type="radio" name="mode" checked={mode === 'new'} onChange={() => { setMode('new'); reset(); }} />
          New User
        </label>
        <label>
          <input type="radio" name="mode" checked={mode === 'existing'} onChange={() => { setMode('existing'); reset(); }} />
          Existing User
        </label>
      </div>

      {mode === 'existing' && (
        <div className="row" style={{ marginBottom: 10 }}>
          <label>
            <span className="lbl">Username to edit</span>
            <input value={lookup} onChange={(e) => setLookup(e.target.value)} />
          </label>
          <div style={{ alignSelf: 'end' }}>
            <button type="button" className="secondary" onClick={handleLookup} disabled={!lookup.trim()}>
              Lookup
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormError message={msg} />
        {ok && <div className="success-box">{ok}</div>}

        <label>
          <span className="lbl">Name *</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormError errors={errors} field="name" />
        </label>

        {mode === 'new' && (
          <>
            <div className="row">
              <label>
                <span className="lbl">Username *</span>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                <FormError errors={errors} field="username" />
              </label>
              <label>
                <span className="lbl">Password *</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <FormError errors={errors} field="password" />
              </label>
            </div>
          </>
        )}

        <div className="row">
          <label>
            <span className="lbl">Email</span>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            <span className="lbl">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>

        <label>
          <span className="lbl">Role</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button className="primary" type="submit">
          {mode === 'new' ? 'Create User' : 'Update User'}
        </button>
      </form>
    </div>
  );
}

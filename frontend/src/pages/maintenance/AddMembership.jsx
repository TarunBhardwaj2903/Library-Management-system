import { useEffect, useState } from 'react';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

export default function AddMembership() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', duration: '6m' });
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    client.get('/users').then(({ data }) => setUsers(data.users)).catch((e) => setMsg(e.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    setOk('');

    const errs = [];
    if (!form.userId) errs.push({ field: 'userId', msg: 'User is required' });
    if (!form.duration) errs.push({ field: 'duration', msg: 'Duration is required' });
    if (errs.length) return setErrors(errs);

    try {
      const { data } = await client.post('/memberships', form);
      setOk(`Membership created: ${data.membership.membershipNo}`);
      setForm({ userId: '', duration: '6m' });
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Add Membership</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={msg} />
        {ok && <div className="success-box">{ok}</div>}

        <label>
          <span className="lbl">User *</span>
          <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            <option value="">— select user —</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
          <FormError errors={errors} field="userId" />
        </label>

        <div className="lbl">Duration *</div>
        <div className="radio-group">
          {['6m', '1y', '2y'].map((d) => (
            <label key={d}>
              <input
                type="radio"
                name="dur"
                checked={form.duration === d}
                onChange={() => setForm({ ...form, duration: d })}
              />
              {d === '6m' ? '6 Months (default)' : d === '1y' ? '1 Year' : '2 Years'}
            </label>
          ))}
        </div>
        <FormError errors={errors} field="duration" />

        <button className="primary" type="submit">Create Membership</button>
      </form>
    </div>
  );
}

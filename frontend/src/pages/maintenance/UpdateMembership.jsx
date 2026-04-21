import { useState } from 'react';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

export default function UpdateMembership() {
  const [no, setNo] = useState('');
  const [membership, setMembership] = useState(null);
  const [action, setAction] = useState('extend');
  const [duration, setDuration] = useState('6m');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  async function handleLookup(e) {
    e.preventDefault();
    setMsg('');
    setOk('');
    setMembership(null);
    if (!no.trim()) return setMsg('Membership number is required');
    try {
      const { data } = await client.get(`/memberships/${no.trim()}`);
      setMembership(data.membership);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setOk('');
    if (!membership) return setMsg('Lookup a membership first');
    try {
      if (action === 'extend') {
        const { data } = await client.put(`/memberships/${membership.membershipNo}/extend`, { duration });
        setMembership(data.membership);
        setOk(`Membership extended until ${new Date(data.membership.endDate).toLocaleDateString()}`);
      } else {
        const { data } = await client.put(`/memberships/${membership.membershipNo}/cancel`);
        setMembership(data.membership);
        setOk('Membership cancelled');
      }
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Update Membership</h2>

      <form onSubmit={handleLookup} noValidate style={{ marginBottom: 12 }}>
        <FormError message={msg} />
        <div className="row">
          <label>
            <span className="lbl">Membership No *</span>
            <input value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. M0001" />
          </label>
          <div style={{ alignSelf: 'end' }}>
            <button className="secondary" type="submit">Lookup</button>
          </div>
        </div>
      </form>

      {membership && (
        <form onSubmit={handleSubmit} noValidate>
          {ok && <div className="success-box">{ok}</div>}
          <div className="row">
            <label>
              <span className="lbl">Name</span>
              <input value={membership.userId?.name || ''} readOnly />
            </label>
            <label>
              <span className="lbl">Username</span>
              <input value={membership.userId?.username || ''} readOnly />
            </label>
          </div>
          <div className="row">
            <label>
              <span className="lbl">Start Date</span>
              <input value={new Date(membership.startDate).toLocaleDateString()} readOnly />
            </label>
            <label>
              <span className="lbl">End Date</span>
              <input value={new Date(membership.endDate).toLocaleDateString()} readOnly />
            </label>
            <label>
              <span className="lbl">Status</span>
              <input value={membership.status} readOnly />
            </label>
          </div>

          <div className="lbl">Action</div>
          <div className="radio-group">
            <label>
              <input type="radio" name="act" checked={action === 'extend'} onChange={() => setAction('extend')} />
              Extend (default)
            </label>
            <label>
              <input type="radio" name="act" checked={action === 'cancel'} onChange={() => setAction('cancel')} />
              Cancel
            </label>
          </div>

          {action === 'extend' && (
            <>
              <div className="lbl">Extend by</div>
              <div className="radio-group">
                {['6m', '1y', '2y'].map((d) => (
                  <label key={d}>
                    <input type="radio" name="dur" checked={duration === d} onChange={() => setDuration(d)} />
                    {d === '6m' ? '6 Months (default)' : d === '1y' ? '1 Year' : '2 Years'}
                  </label>
                ))}
              </div>
            </>
          )}

          <button className="primary" type="submit">Confirm</button>
        </form>
      )}
    </div>
  );
}

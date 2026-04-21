import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

export default function FinePayment() {
  const { id } = useParams();
  const nav = useNavigate();
  const [txn, setTxn] = useState(null);
  const [finePaid, setFinePaid] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    client.get(`/transactions/${id}`).then(({ data }) => setTxn(data.transaction)).catch((e) => setMsg(e.message));
  }, [id]);

  if (!txn) return <div className="card"><FormError message={msg || 'Loading…'} /></div>;

  const fineRequired = txn.fine > 0;
  const book = txn.bookId;
  const member = txn.membershipId;
  const user = member?.userId;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    setOk('');
    if (fineRequired && !finePaid) {
      return setErrors([{ field: 'finePaid', msg: 'Please mark the fine as paid to complete' }]);
    }
    try {
      await client.post(`/transactions/${id}/fine`, { finePaid, remarks });
      setOk('Transaction completed');
      setTimeout(() => nav('/transactions'), 800);
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Fine Payment</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={msg} />
        {ok && <div className="success-box">{ok}</div>}

        <div className="row">
          <label>
            <span className="lbl">Book</span>
            <input value={book?.title || ''} readOnly />
          </label>
          <label>
            <span className="lbl">Author</span>
            <input value={book?.author || ''} readOnly />
          </label>
          <label>
            <span className="lbl">Serial No</span>
            <input value={book?.serialNo || ''} readOnly />
          </label>
        </div>

        <div className="row">
          <label>
            <span className="lbl">Member</span>
            <input value={user ? `${user.name} (${member.membershipNo})` : ''} readOnly />
          </label>
          <label>
            <span className="lbl">Issue Date</span>
            <input value={new Date(txn.issueDate).toLocaleDateString()} readOnly />
          </label>
          <label>
            <span className="lbl">Expected Return</span>
            <input value={new Date(txn.returnDate).toLocaleDateString()} readOnly />
          </label>
        </div>

        <div className="row">
          <label>
            <span className="lbl">Actual Return</span>
            <input
              type="date"
              value={txn.actualReturnDate ? txn.actualReturnDate.slice(0, 10) : ''}
              readOnly
            />
          </label>
          <label>
            <span className="lbl">Fine</span>
            <input value={`₹ ${txn.fine}`} readOnly />
          </label>
        </div>

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={finePaid}
              onChange={(e) => setFinePaid(e.target.checked)}
              disabled={!fineRequired}
            />
            Fine Paid {fineRequired ? '(required)' : '(not applicable)'}
          </label>
        </div>
        <FormError errors={errors} field="finePaid" />

        <label>
          <span className="lbl">Remarks</span>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </label>

        <button className="primary" type="submit">Complete</button>
      </form>
    </div>
  );
}

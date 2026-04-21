import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

const toDate = (d) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export default function IssueBook() {
  const today = useMemo(() => toDate(new Date()), []);
  const maxReturnDefault = useMemo(() => toDate(addDays(new Date(), 15)), []);

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    bookId: '',
    membershipNo: '',
    issueDate: today,
    returnDate: maxReturnDefault,
    remarks: '',
  });
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    client.get('/books').then(({ data }) => setBooks(data.books)).catch((e) => setMsg(e.message));
  }, []);

  const selectedBook = books.find((b) => b._id === form.bookId);

  function setIssueDate(v) {
    const newReturn = toDate(addDays(new Date(v), 15));
    setForm((f) => ({ ...f, issueDate: v, returnDate: newReturn }));
  }

  function validate() {
    const errs = [];
    if (!form.bookId) errs.push({ field: 'bookId', msg: 'Book is required' });
    if (!form.membershipNo.trim()) errs.push({ field: 'membershipNo', msg: 'Membership no is required' });
    if (form.issueDate < today) errs.push({ field: 'issueDate', msg: 'Issue date cannot be earlier than today' });
    const maxReturn = toDate(addDays(new Date(form.issueDate), 15));
    if (form.returnDate > maxReturn) errs.push({ field: 'returnDate', msg: 'Return date cannot exceed 15 days from issue date' });
    if (form.returnDate < form.issueDate) errs.push({ field: 'returnDate', msg: 'Return date must be on/after issue date' });
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    setOk('');
    const errs = validate();
    if (errs.length) return setErrors(errs);
    try {
      const { data } = await client.post('/transactions/issue', form);
      setOk(`Issued successfully. Return by ${new Date(data.transaction.returnDate).toLocaleDateString()}.`);
      setForm({ bookId: '', membershipNo: '', issueDate: today, returnDate: maxReturnDefault, remarks: '' });
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Book Issue</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={msg} />
        {ok && <div className="success-box">{ok}</div>}

        <label>
          <span className="lbl">Book / Movie *</span>
          <select value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
            <option value="">— select —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id} disabled={b.copiesAvailable < 1}>
                [{b.serialNo}] {b.title}  {b.copiesAvailable < 1 ? '(unavailable)' : ''}
              </option>
            ))}
          </select>
          <FormError errors={errors} field="bookId" />
        </label>

        <label>
          <span className="lbl">Author</span>
          <input value={selectedBook?.author || ''} readOnly />
        </label>

        <label>
          <span className="lbl">Membership No *</span>
          <input
            value={form.membershipNo}
            onChange={(e) => setForm({ ...form, membershipNo: e.target.value })}
            placeholder="e.g. M0001"
          />
          <FormError errors={errors} field="membershipNo" />
        </label>

        <div className="row">
          <label>
            <span className="lbl">Issue Date *</span>
            <input
              type="date"
              min={today}
              value={form.issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <FormError errors={errors} field="issueDate" />
          </label>
          <label>
            <span className="lbl">Return Date *</span>
            <input
              type="date"
              min={form.issueDate}
              max={toDate(addDays(new Date(form.issueDate), 15))}
              value={form.returnDate}
              onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
            />
            <FormError errors={errors} field="returnDate" />
          </label>
        </div>

        <label>
          <span className="lbl">Remarks</span>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
        </label>

        <button className="primary" type="submit">Issue Book</button>
      </form>
    </div>
  );
}

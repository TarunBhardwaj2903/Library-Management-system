import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

const toDate = (d) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function ReturnBook() {
  const nav = useNavigate();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    bookId: '',
    serialNo: '',
    membershipNo: '',
    actualReturnDate: toDate(new Date()),
  });
  const [issue, setIssue] = useState(null);
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    client.get('/books').then(({ data }) => setBooks(data.books)).catch((e) => setMsg(e.message));
  }, []);

  const selectedBook = books.find((b) => b._id === form.bookId);
  function setBook(id) {
    const b = books.find((x) => x._id === id);
    setForm((f) => ({ ...f, bookId: id, serialNo: b?.serialNo || '' }));
    setIssue(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    const errs = [];
    if (!form.bookId && !form.serialNo.trim()) errs.push({ field: 'bookId', msg: 'Book is required' });
    if (!form.serialNo.trim()) errs.push({ field: 'serialNo', msg: 'Serial number is required' });
    if (!form.membershipNo.trim()) errs.push({ field: 'membershipNo', msg: 'Membership no is required' });
    if (errs.length) return setErrors(errs);
    try {
      const { data } = await client.post('/transactions/return', form);
      nav(`/transactions/fine/${data.transaction._id}`);
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Return Book</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={msg} />

        <label>
          <span className="lbl">Book / Movie *</span>
          <select value={form.bookId} onChange={(e) => setBook(e.target.value)}>
            <option value="">— select —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>[{b.serialNo}] {b.title}</option>
            ))}
          </select>
          <FormError errors={errors} field="bookId" />
        </label>

        <div className="row">
          <label>
            <span className="lbl">Serial No *</span>
            <input value={form.serialNo} onChange={(e) => setForm({ ...form, serialNo: e.target.value })} />
            <FormError errors={errors} field="serialNo" />
          </label>
          <label>
            <span className="lbl">Author</span>
            <input value={selectedBook?.author || ''} readOnly />
          </label>
        </div>

        <label>
          <span className="lbl">Membership No *</span>
          <input
            value={form.membershipNo}
            onChange={(e) => setForm({ ...form, membershipNo: e.target.value })}
            placeholder="e.g. M0001"
          />
          <FormError errors={errors} field="membershipNo" />
        </label>

        <label>
          <span className="lbl">Return Date</span>
          <input
            type="date"
            value={form.actualReturnDate}
            onChange={(e) => setForm({ ...form, actualReturnDate: e.target.value })}
          />
        </label>

        <button className="primary" type="submit">Confirm Return</button>
      </form>
    </div>
  );
}

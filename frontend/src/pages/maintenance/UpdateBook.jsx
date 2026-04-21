import { useEffect, useState } from 'react';
import client from '../../api/client';
import BookForm from './BookForm.jsx';
import FormError from '../../components/FormError.jsx';

export default function UpdateBook() {
  const [books, setBooks] = useState([]);
  const [id, setId] = useState('');
  const [initial, setInitial] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    client.get('/books').then(({ data }) => setBooks(data.books)).catch((e) => setMsg(e.message));
  }, []);

  function handlePick(bookId) {
    setId(bookId);
    setInitial(null);
    if (!bookId) return;
    const b = books.find((x) => x._id === bookId);
    if (b) {
      setInitial({
        serialNo: b.serialNo,
        title: b.title,
        author: b.author,
        type: b.type,
        category: b.category,
        publisher: b.publisher,
        copiesTotal: b.copiesTotal,
      });
    }
  }

  return (
    <div className="card">
      <h2>Update Book / Movie</h2>
      <FormError message={msg} />
      <label>
        <span className="lbl">Select item</span>
        <select value={id} onChange={(e) => handlePick(e.target.value)}>
          <option value="">— select —</option>
          {books.map((b) => (
            <option key={b._id} value={b._id}>
              [{b.serialNo}] {b.title} — {b.author}
            </option>
          ))}
        </select>
      </label>

      {initial && (
        <BookForm
          key={id}
          initial={initial}
          onSubmit={(form) => client.put(`/books/${id}`, form)}
          submitLabel="Update"
          successMsg="Item updated"
        />
      )}
    </div>
  );
}

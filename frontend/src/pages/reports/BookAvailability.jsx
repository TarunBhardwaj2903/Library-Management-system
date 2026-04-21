import { useState } from 'react';
import client from '../../api/client';
import FormError from '../../components/FormError.jsx';

export default function BookAvailability() {
  const [q, setQ] = useState({ title: '', author: '', type: '', category: '', serialNo: '' });
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState('');
  const [msg, setMsg] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setMsg('');
    setResults([]);
    const hasAny = Object.values(q).some((v) => v && v.trim());
    if (!hasAny) {
      setMsg('Please fill at least one search field');
      return;
    }
    try {
      const { data } = await client.get('/reports/books', { params: q });
      setResults(data.books);
      setSearched(true);
    } catch (e) {
      if (e.errors?.[0]) setMsg(e.errors[0].msg);
      else setMsg(e.message);
    }
  }

  return (
    <div>
      <h1>Book Availability</h1>
      <div className="card">
        <form onSubmit={handleSearch} noValidate>
          <FormError message={msg} />
          <div className="row">
            <label>
              <span className="lbl">Title</span>
              <input value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} />
            </label>
            <label>
              <span className="lbl">Author</span>
              <input value={q.author} onChange={(e) => setQ({ ...q, author: e.target.value })} />
            </label>
          </div>
          <div className="row">
            <label>
              <span className="lbl">Category</span>
              <input value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value })} />
            </label>
            <label>
              <span className="lbl">Serial No</span>
              <input value={q.serialNo} onChange={(e) => setQ({ ...q, serialNo: e.target.value })} />
            </label>
            <label>
              <span className="lbl">Type</span>
              <select value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })}>
                <option value="">Any</option>
                <option value="Book">Book</option>
                <option value="Movie">Movie</option>
              </select>
            </label>
          </div>
          <button className="primary" type="submit">Search</button>
        </form>
      </div>

      {searched && (
        <div className="card">
          <h2>Results ({results.length})</h2>
          {results.length === 0 ? (
            <p>No items match your search.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Serial</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Available / Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <input
                        type="radio"
                        name="pick"
                        checked={selected === b._id}
                        onChange={() => setSelected(b._id)}
                      />
                    </td>
                    <td>{b.serialNo}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.type}</td>
                    <td>{b.category}</td>
                    <td>{b.copiesAvailable} / {b.copiesTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selected && (
            <p style={{ marginTop: 10, color: '#444' }}>
              Selected: <b>{results.find((r) => r._id === selected)?.title}</b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

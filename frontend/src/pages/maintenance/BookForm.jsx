import { useState } from 'react';
import FormError from '../../components/FormError.jsx';

const empty = {
  serialNo: '',
  title: '',
  author: '',
  type: 'Book',
  category: '',
  publisher: '',
  copiesTotal: 1,
};

function validate(form) {
  const errs = [];
  if (!form.serialNo.trim()) errs.push({ field: 'serialNo', msg: 'Serial no is required' });
  if (!form.title.trim()) errs.push({ field: 'title', msg: 'Title is required' });
  if (!form.author.trim()) errs.push({ field: 'author', msg: 'Author is required' });
  if (!form.category.trim()) errs.push({ field: 'category', msg: 'Category is required' });
  if (!form.publisher.trim()) errs.push({ field: 'publisher', msg: 'Publisher is required' });
  if (!form.copiesTotal || Number(form.copiesTotal) < 1)
    errs.push({ field: 'copiesTotal', msg: 'Copies must be at least 1' });
  return errs;
}

export default function BookForm({ initial, onSubmit, submitLabel, successMsg }) {
  const [form, setForm] = useState(initial || empty);
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    setOk('');
    const errs = validate(form);
    if (errs.length) return setErrors(errs);
    try {
      await onSubmit(form);
      setOk(successMsg || 'Saved');
      if (!initial) setForm(empty);
    } catch (e) {
      if (e.errors) setErrors(e.errors);
      else setMsg(e.message);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormError message={msg} />
      {ok && <div className="success-box">{ok}</div>}

      <div className="lbl">Type *</div>
      <div className="radio-group">
        {['Book', 'Movie'].map((t) => (
          <label key={t}>
            <input type="radio" name="type" checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />
            {t}
          </label>
        ))}
      </div>

      <div className="row">
        <label>
          <span className="lbl">Serial No *</span>
          <input value={form.serialNo} onChange={set('serialNo')} />
          <FormError errors={errors} field="serialNo" />
        </label>
        <label>
          <span className="lbl">Title *</span>
          <input value={form.title} onChange={set('title')} />
          <FormError errors={errors} field="title" />
        </label>
      </div>

      <div className="row">
        <label>
          <span className="lbl">Author *</span>
          <input value={form.author} onChange={set('author')} />
          <FormError errors={errors} field="author" />
        </label>
        <label>
          <span className="lbl">Category *</span>
          <input value={form.category} onChange={set('category')} />
          <FormError errors={errors} field="category" />
        </label>
      </div>

      <div className="row">
        <label>
          <span className="lbl">Publisher *</span>
          <input value={form.publisher} onChange={set('publisher')} />
          <FormError errors={errors} field="publisher" />
        </label>
        <label>
          <span className="lbl">Copies Total *</span>
          <input type="number" min="1" value={form.copiesTotal} onChange={set('copiesTotal')} />
          <FormError errors={errors} field="copiesTotal" />
        </label>
      </div>

      <button className="primary" type="submit">{submitLabel}</button>
    </form>
  );
}

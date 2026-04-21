import client from '../../api/client';
import BookForm from './BookForm.jsx';

export default function AddBook() {
  return (
    <div className="card">
      <h2>Add Book / Movie</h2>
      <BookForm
        onSubmit={(form) => client.post('/books', form)}
        submitLabel="Add"
        successMsg="Item added"
      />
    </div>
  );
}

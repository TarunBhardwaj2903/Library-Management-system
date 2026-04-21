export default function FormError({ errors, field, message }) {
  if (message) return <div className="error-box">{message}</div>;
  if (!errors || !field) return null;
  const hit = errors.find((e) => e.field === field);
  return hit ? <div className="error">{hit.msg}</div> : null;
}

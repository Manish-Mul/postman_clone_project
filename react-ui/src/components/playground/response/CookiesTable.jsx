export default function CookiesTable({ cookies }) {
  if (!cookies || cookies.length === 0) {
    return (
      <div style={{ padding: 12, color: '#888', fontStyle: 'italic' }}>
        No cookies returned or browser blocked access to them.
      </div>
    );
  }

  return (
    <table className={style.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
          <th>Path</th>
          <th>Domain</th>
          <th>Secure</th>
          <th>HttpOnly</th>
        </tr>
      </thead>
      <tbody>
        {cookies.map((c, i) => (
          <tr key={i}>
            <td>{c.name}</td>
            <td className={style.mono}>{c.value}</td>
            <td>{c.path || '-'}</td>
            <td>{c.domain || '-'}</td>
            <td>{c.secure ? '✔' : '-'}</td>
            <td>{c.httponly ? '✔' : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

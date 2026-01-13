import { useState } from 'react';

export default function LocalVariablesPanel({ localVars, setLocalVars }) {
  const updateVar = (i, field, value) => {
    const copy = [...localVars];
    copy[i][field] = value;
    setLocalVars(copy);
  };

  const addVar = () =>
    setLocalVars([...localVars, { key: '', value: '', isSecret: false }]);

  const removeVar = (i) =>
    setLocalVars(localVars.filter((_, idx) => idx !== i));

  return (
    <div style={{ padding: '8px', borderTop: '1px solid #ddd', marginTop: 10 }}>
      <strong style={{ fontSize: 13 }}>Local Variables (request only)</strong>

      {localVars.map((v, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}
        >
          <input
            placeholder="key"
            value={v.key}
            onChange={(e) => updateVar(i, 'key', e.target.value)}
            style={{ width: 120 }}
          />

          <input
            type={v.isSecret ? 'password' : 'text'}
            value={v.value}
            onChange={(e) => updateVar(i, 'value', e.target.value)}
            style={{ width: 160 }}
          />

          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={v.isSecret || false}
              onChange={(e) => updateVar(i, 'isSecret', e.target.checked)}
            />{' '}
            Secret
          </label>

          <button onClick={() => removeVar(i)}>×</button>
        </div>
      ))}

      <button onClick={addVar} style={{ marginTop: 6 }}>
        + Add variable
      </button>
    </div>
  );
}

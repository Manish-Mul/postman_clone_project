import { useContext, useState } from 'react';
import { GlobalVariablesContext } from '../../contexts/GlobalVariables';

const GlobalVariablesTab = () => {
  const { globals, upsertGlobal, deleteGlobal } = useContext(GlobalVariablesContext);

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  return (
    <div style={{ padding: '1rem' }}>
      <h4>Global Variables</h4>

      {globals.length === 0 && (
        <p style={{ fontSize: '13px', color: '#777' }}>
          No global variables yet.
        </p>
      )}

      {globals.map((v, i) => (
        <div
          key={`${v.key}-${v.isSecret}`}
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 6,
            alignItems: 'center'
          }}
        >
          <strong>{v.key}</strong>
          <span>=</span>
          <span>{v.isSecret ? '••••••' : v.value}</span>

          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={v.isSecret || false}
              onChange={e =>
                upsertGlobal({
                  key: v.key,
                  value: v.value,
                  is_secret: e.target.checked
                })
              }
            />{' '}
            Secret
          </label>

          <button
            onClick={() => deleteGlobal(v.key)}
            style={{ marginLeft: 'auto' }}
          >
            Delete
          </button>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Key"
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <label style={{ fontSize: 12, marginRight: 8 }}>
          <input
            type="checkbox"
            checked={isSecret}
            onChange={e => setIsSecret(e.target.checked)}
          />{' '}
          Secret
        </label>

        <button
          onClick={() => {
            if (!key.trim()) return;

            upsertGlobal({
              key,
              value,
              is_secret: isSecret
            });

            setKey('');
            setValue('');
            setIsSecret(false);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default GlobalVariablesTab;

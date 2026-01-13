import { useState } from 'react';

const LOCAL_KEY = 'postmanClone:data:v1';

const BackupControls = () => {
  const [open, setOpen] = useState(false);

  const downloadSnapshot = () => { /* same as before */ };
  const uploadSnapshot = (file) => { /* same as before */ };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadSnapshot(file);
    e.target.value = '';
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          padding: '6px 10px',
          borderRadius: 4,
          border: '1px solid var(--border-color)',
          background: 'var(--panel-bg)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
        }}
      >
        <i className="feather-download-cloud" />
        Backup
        <i className="feather-chevron-down" style={{ fontSize: 12 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 20,
            minWidth: 160,
            fontSize: 13,
          }}
        >
          <button
            type="button"
            onClick={() => {
              downloadSnapshot();
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Export backup
          </button>

          <label
            style={{
              width: '100%',
              padding: '8px 12px',
              display: 'block',
              cursor: 'pointer',
            }}
          >
            Import backup
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default BackupControls;

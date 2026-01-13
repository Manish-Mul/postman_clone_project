import { useContext, useState } from 'react';
import { Context } from '../../contexts/Store';
import { CollectionsContext } from '../../contexts/Collections';
import { WorkspacesContext } from '../../contexts/Workspaces';
import styles from './CollectionImportModal.module.css';

const CollectionImportModal = () => {
  const { dispatch } = useContext(Context);
  const { refetchCollections } = useContext(CollectionsContext);
  const { currentWorkspaceId, workspaces } = useContext(WorkspacesContext);
  const [error, setError] = useState(null);

  const close = () => dispatch({ type: 'CLOSE_COLLECTION_IMPORT_MODAL' });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      console.log('Modal currentWorkspaceId:', currentWorkspaceId);
      console.log('Available workspaces:', workspaces);

      if (!currentWorkspaceId) {
        setError('No workspace selected. Please create or select a workspace first.');
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to import collections');
        return;
      }

      const res = await fetch('http://localhost:3000/collections/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: Number(currentWorkspaceId),
          collections: json.collections,
          version: json.version,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Import failed body:', errText);
        throw new Error(`Import failed: ${errText}`);
      }

      await refetchCollections();
      close();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Invalid file or import failed');
    }
  };

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Import Collections JSON</h3>
        
        {!currentWorkspaceId && (
          <div style={{ 
            padding: '10px', 
            background: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '10px',
            color: '#856404'
          }}>
            ⚠️ No workspace selected. Please create or select a workspace before importing.
          </div>
        )}
        
        <input 
          type="file" 
          accept="application/json" 
          onChange={handleFileChange}
          disabled={!currentWorkspaceId}
        />
        
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        
        <button onClick={close} style={{ marginTop: '10px' }}>Close</button>
      </div>
    </div>
  );
};

export default CollectionImportModal;
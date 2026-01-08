import { useContext, useState } from 'react';
import { CollectionsContext } from '../../contexts/Collections';
import { Context } from '../../contexts/Store';
import styles from './SaveModal.module.css';

const SaveToCollectionModal = ({ closeModal }) => {
  const { collections, createCollection, saveRequest, refetchCollections } = useContext(CollectionsContext);
  const { state } = useContext(Context);

  // Get collections for current workspace
  const currentCollections = collections[state.currentWorkspaceId] || [];

  const [selectedCollection, setSelectedCollection] = useState('');
  const [requestName, setRequestName] = useState(state.formData?.url || '');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  const handleSave = async () => {
  if (creatingNew) {
    // Create new collection and save request
    if (!newCollectionName.trim()) {
      alert('Please enter a collection name');
      return;
    }

    try {
      const newCollection = await createCollection(
        state.currentWorkspaceId,
        newCollectionName.trim()
      );

      if (newCollection) {
        const requestData = {
          name: requestName.trim() || 'Untitled Request',
          method: state.formData?.method || 'GET',
          url: state.formData?.url || '',
          folder_id: null
        };

        await saveRequest(newCollection.collection_id, requestData);
        await refetchCollections();  
        alert('Collection created and request saved!');
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create collection or save request');
    }
  } else {
    // Save to existing collection
    if (!selectedCollection) {
      alert('Please select a collection');
      return;
    }

    try {
      const requestData = {
        name: requestName.trim() || 'Untitled Request',
        method: state.formData?.method || 'GET',
        url: state.formData?.url || '',
        folder_id: null
      };

      await saveRequest(selectedCollection, requestData);
      await refetchCollections();  
      alert('Request saved to collection!');
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save request');
    }
  }
};


  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Save Request to Collection</h3>
          <button className={styles.closeBtn} onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* Request Name */}
          <div className={styles.formGroup}>
            <label>Request Name</label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Enter request name"
            />
          </div>

          {/* Collection Selection Toggle */}
          <div className={styles.formGroup}>
            <label>
              <input
                type="radio"
                checked={!creatingNew}
                onChange={() => setCreatingNew(false)}
                disabled={currentCollections.length === 0}
              />
              <span style={{ marginLeft: 8 }}>
                Save to existing collection
              </span>
            </label>
            <label>
              <input
                type="radio"
                checked={creatingNew}
                onChange={() => setCreatingNew(true)}
              />
              <span style={{ marginLeft: 8 }}>Create new collection</span>
            </label>
          </div>

          {/* Existing Collection Dropdown */}
          {!creatingNew && (
            <div className={styles.formGroup}>
              <label>Select Collection</label>
              {currentCollections.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  No collections found. Create one first.
                </p>
              ) : (
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value="">-- Select a collection --</option>
                  {currentCollections.map((col) => (
                    <option key={col.collection_id} value={col.collection_id}>
                      {col.collection_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* New Collection Name Input */}
          {creatingNew && (
            <div className={styles.formGroup}>
              <label>New Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeModal}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveToCollectionModal;

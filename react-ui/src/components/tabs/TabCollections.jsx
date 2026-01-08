import { useContext, useState, useMemo } from 'react';
import styles from './tab.module.css';
import image from '../../images/no-collection.png';
import { CollectionsContext } from '../../contexts/Collections';
import { Context } from '../../contexts/Store';
import FolderTree from '../../contexts/FolderTree';  // Assuming you put FolderTree in a separate file

const TabCollections = () => {
  const { collections, createCollection, updateCollection, deleteCollection, deleteRequest, folders, createFolder, saveRequest } = useContext(CollectionsContext);
  const { state, dispatch: playgroundDispatch  } = useContext(Context);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');


  // Get collections for current workspace only
  const currentCollections = useMemo(() => {
    return collections[state.currentWorkspaceId] || [];
  }, [collections, state.currentWorkspaceId]);

  const allRequests = currentCollections.flatMap(c => c.requests || []);

  // Search requests based on name or URL
  const filteredRequests = allRequests.filter(r =>
    r.request_name.toLowerCase().includes(search.toLowerCase()) ||
    r.url.toLowerCase().includes(search.toLowerCase())
  );

  // Handle adding a collection
  const handleAddCollection = async () => {
    if (newName.trim()) {
      await createCollection(state.currentWorkspaceId, newName);
      setNewName('');
      setCreating(false);
    }
  };

  // Handle renaming a collection
  const handleRenameCollection = async (coll) => {
    const name = prompt('Rename collection', coll.collection_name);
    if (name && name !== coll.collection_name) {
      await updateCollection(state.currentWorkspaceId, coll.collection_id, name);
    }
  };

  // Handle deleting a collection
  const handleDeleteCollection = async (coll) => {
    if (window.confirm('Delete this collection?')) {
      await deleteCollection(state.currentWorkspaceId, coll.collection_id);
    }
  };

  // Handle saving a request into a folder
  const handleSaveRequestToFolder = async (request, folder) => {
    await saveRequest(folder.collection_id, {
      ...request,
      folder_id: folder.folder_id,
    });
  };

  if (!currentCollections.length) {
    return (
      <div className={styles.empty_tab}>
        <img src={image} alt="" />
        <h4>You don't have any collections.</h4>
        <p>Collections let you group related requests, making them easier to access and run.</p>
        {creating ? (
          <div style={{ marginTop: 12 }}>
            <input
              value={newName}
              placeholder="Collection name"
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCollection()}
              style={{ padding: 6, borderRadius: 4, border: '1px solid var(--border-color)', width: 150 }}
              autoFocus
            />
            <button
              style={{
                marginLeft: 8,
                padding: '6px 14px',
                background: 'var(--theme-color)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={handleAddCollection}
            >
              Add
            </button>
            <button
              style={{ marginLeft: 4, color: 'var(--theme-color)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <span onClick={() => setCreating(true)} style={{ cursor: 'pointer', marginTop: 12, display: 'inline-block' }}>
            Create Collection
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', color: 'var(--text-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, flex: 1 }}>Collections</h4>
        {creating ? (
          <>
            <input
              value={newName}
              placeholder="Collection name"
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCollection()}
              style={{ padding: 6, borderRadius: 4, border: '1px solid var(--border-color)', width: 150, marginRight: 8 }}
              autoFocus
            />
            <button onClick={handleAddCollection} style={{
              padding: '6px 14px',
              background: 'var(--theme-color)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}>Add</button>
            <button
              style={{ color: 'var(--theme-color)', background: 'none', border: 'none', marginLeft: 4, cursor: 'pointer' }}
              onClick={() => { setCreating(false); setNewName(''); }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setCreating(true)} style={{
            padding: '6px 12px',
            background: 'none',
            border: '1px solid var(--border-color)',
            color: 'var(--theme-color)',
            cursor: 'pointer',
            borderRadius: 4
          }}>
            + New
          </button>
        )}
      </div>

      {/* Search bar */}
      <input
        placeholder="Search requests..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: 12, width: '100%' }}
      />

      {/* Display filtered requests */}
      {search && filteredRequests.map(r => (
        <div
          key={r.request_id}
          style={{ cursor: 'pointer', padding: '4px 0', color: 'var(--theme-color)' }}
          onClick={() => playgroundDispatch({
            type: 'SET_FORM_DATA',
            payload: {
              method: r.method,
              url: r.url,
              params: r.params || '',
              payload: r.body ? JSON.parse(r.body) : null
            }
          })}
        >
          {r.method} {r.request_name}
        </div>
      ))}

      {/* Render collections */}
      {currentCollections.map(coll => (
        <div key={coll.collection_id} style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 5, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 13px', borderBottom: '1px solid var(--border-color)' }}>
            <span>{coll.collection_name}</span>
            <span>
              <button onClick={() => handleRenameCollection(coll)} title="Rename" style={{ marginRight: 8, background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDeleteCollection(coll)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer' }}>🗑️</button>
            </span>
          </div>

          <div style={{ padding: '6px 18px' }}>
            {/* Show folders */}
            <FolderTree
              folders={folders[coll.collection_id] || []}
              requests={coll.requests || []}
              parentId={null}
              onSelectRequest={req =>
                playgroundDispatch({
                  type: 'SET_FORM_DATA',
                  payload: {
                    method: req.method,
                    url: req.url,
                    params: req.params || '',
                    payload: req.body ? JSON.parse(req.body) : null
                  }
                })
              }
            />

            {/* Create new folder */}
            <button onClick={() => {
              const name = prompt('Folder name');
              if (name) createFolder(coll.collection_id, name);
            }}>+ Folder</button>

            {/* Display requests */}
            {(!coll.requests || coll.requests.length === 0) && (
              <div style={{ color: 'var(--input-placeholder)', fontSize: 13, margin: '8px 0' }}>No saved requests</div>
            )}

            {coll.requests && coll.requests.map(req => (
              <div key={req.request_id} style={{ padding: '5px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{ cursor: 'pointer', flex: 1, color: 'var(--theme-color)' }}
                  title={req.url}
                  onClick={() => playgroundDispatch({
                    type: 'SET_FORM_DATA',
                    payload: { method: req.method, url: req.url, params: req.params || '', payload: req.body ? JSON.parse(req.body) : null }
                  })}
                >
                  <span style={{ fontWeight: 'bold', marginRight: 8, color: req.method === 'GET' ? '#61affe' : req.method === 'POST' ? '#49cc90' : req.method === 'PUT' ? '#fca130' : req.method === 'DELETE' ? '#f93e3e' : 'var(--theme-color)' }}>
                    {req.method}
                  </span>
                  {req.request_name}
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this request?')) {
                      try {
                        await deleteRequest(req.request_id);
                      } catch (error) {
                        alert('Failed to delete request');
                      }
                    }
                  }}
                  title="Delete request"
                  style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer' }}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabCollections;

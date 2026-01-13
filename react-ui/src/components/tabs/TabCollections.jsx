import { useContext, useState, useMemo } from 'react';
import styles from './tab.module.css';
import image from '../../images/no-collection.png';
import { CollectionsContext } from '../../contexts/Collections';
import { Context } from '../../contexts/Store';
import FolderTree from '../../contexts/FolderTree';

const TabCollections = () => {
  const { collections, createCollection, updateCollection, deleteCollection, deleteRequest, folders, createFolder, saveRequest } = useContext(CollectionsContext);
  const { state, dispatch: playgroundDispatch } = useContext(Context);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');

  // Get collections for current workspace only
  const currentCollections = useMemo(() => {
    return collections[state.currentWorkspaceId] || [];
  }, [collections, state.currentWorkspaceId]);

  const allRequests = currentCollections.flatMap(c => c.requests || []);

  const collectionMap = useMemo(
    () => Object.fromEntries(currentCollections.map(c => [c.collection_id, c])),
    [currentCollections]
  );

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

  // Handle selecting a request
  const handleSelectRequest = (req) => {
    let safeBody = '';
    if (req.body) {
      try {
        safeBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
      } catch {
        safeBody = String(req.body);
      }
    }

    playgroundDispatch({
      type: 'MERGE_FORM_DATA',
      payload: {
        method: req.method,
        url: req.url,
        params: req.params || '',
        payload: safeBody,
        bodyType: safeBody ? 'raw' : '',
        rawBodyType: 'json',
      },
    });

    playgroundDispatch({ type: 'TRIGGER_SEND_FROM_HISTORY', payload: true });
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
        style={{ 
          padding: '6px 12px', 
          borderRadius: '4px', 
          border: '1px solid var(--border-color)', 
          marginBottom: 12, 
          width: '100%',
          boxSizing: 'border-box'
        }}
      />

      {/* Display filtered requests - styled like FolderTree */}
      {search && (
        <div style={{ 
          marginBottom: 16, 
          background: 'var(--panel-bg)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 5,
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '8px 12px', 
            borderBottom: '1px solid var(--border-color)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-color)'
          }}>
            Search Results ({filteredRequests.length})
          </div>
          <div style={{ padding: '6px 12px', maxHeight: '300px', overflowY: 'auto' }}>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(r => {
                const coll = collectionMap[r.collection_id];
                return (
                  <div key={r.request_id}>
                    {/* Request item - matching FolderTree styling */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderRadius: '4px',
                        marginBottom: '2px',
                        transition: 'background-color 0.15s',
                        position: 'relative',
                      }}
                      onClick={() => handleSelectRequest(r)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontWeight: '600',
                            fontSize: '11px',
                            color:
                              r.method === 'GET'
                                ? '#61affe'
                                : r.method === 'POST'
                                ? '#49cc90'
                                : r.method === 'PUT'
                                ? '#fca130'
                                : r.method === 'DELETE'
                                ? '#f93e3e'
                                : '#999',
                            minWidth: '40px',
                          }}
                        >
                          {r.method}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: '#333',
                              display: 'block',
                            }}
                          >
                            {r.request_name}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#999',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block',
                            }}
                          >
                            {coll?.collection_name || 'Unknown Collection'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ 
                padding: '20px 12px', 
                textAlign: 'center',
                color: 'var(--input-placeholder)',
                fontSize: '13px'
              }}>
                No requests found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render collections */}
      {currentCollections.map(coll => (
        <div key={coll.collection_id} style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 5, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 13px', borderBottom: '1px solid var(--border-color)' }}>
            <span>{coll.collection_name}</span>
            <span>
              <button onClick={() => handleRenameCollection(coll)} title="Rename" style={{ marginRight: 8, background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDeleteCollection(coll)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer' }}>🗑️</button>
            </span>
          </div>

          <div style={{ padding: '6px 12px 6px 12px' }}>
            {/* Show folders */}
            <FolderTree
              folders={folders[coll.collection_id] || []}
              requests={coll.requests || []}
              parentId={null}
              depth={0}
              collectionId={coll.collection_id}
              onSelectRequest={handleSelectRequest}
              onDeleteRequest={async (req) => {
                await deleteRequest(
                  req.request_id,
                  coll.collection_id,
                  state.currentWorkspaceId
                );
              }}
            />

            {/* Create new folder */}
            <button
              onClick={() => {
                const name = prompt('Folder name');
                if (name) createFolder(coll.collection_id, name);
              }}
              style={{ 
                marginTop: 6,
                padding: '6px 12px',
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--theme-color)',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: '12px'
              }}
            >
              + Folder
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabCollections;
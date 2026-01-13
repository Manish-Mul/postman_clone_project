import { useContext, useState } from 'react';
import { CollectionsContext } from '../contexts/Collections';

const FolderTree = ({
  folders,
  requests,
  parentId = null,
  depth = 0,
  onSelectRequest,
  onDeleteRequest,
  collectionId,
}) => {
  const { updateFolder, deleteFolder, createFolder } = useContext(CollectionsContext);

  const safeFolders = Array.isArray(folders) ? folders : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const childFolders = safeFolders.filter(
    (f) => f.parent_folder_id === parentId && f.folder_id !== parentId && f.folder_id != null
  );
  const childRequests = safeRequests.filter((r) => r.folder_id === parentId);

  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  if (!childFolders.length && !childRequests.length) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Requests at this level */}
      {childRequests.map((req) => (
        <div
          key={req.request_id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: `${depth * 20 + 8}px`,
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
          onClick={() => onSelectRequest?.(req)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Indent guide line */}
          {depth > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${depth * 20 - 8}px`,
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: '#e0e0e0',
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontWeight: '600',
                fontSize: '11px',
                color:
                  req.method === 'GET'
                    ? '#61affe'
                    : req.method === 'POST'
                    ? '#49cc90'
                    : req.method === 'PUT'
                    ? '#fca130'
                    : req.method === 'DELETE'
                    ? '#f93e3e'
                    : '#999',
                minWidth: '40px',
              }}
            >
              {req.method}
            </span>
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#333',
              }}
            >
              {req.request_name}
            </span>
          </div>

          <button
            style={{
              border: 'none',
              background: 'transparent',
              color: '#ff5f56',
              cursor: 'pointer',
              padding: '4px 6px',
              fontSize: '14px',
              opacity: 0.6,
              transition: 'opacity 0.15s',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this request?')) {
                onDeleteRequest?.(req);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
            }}
            title="Delete request"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Child folders */}
      {childFolders.map((folder) => {
        const isExpanded = expandedFolders[folder.folder_id] ?? true;
        
        return (
          <div key={folder.folder_id} style={{ marginBottom: '2px' }}>
            {/* Folder header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: `${depth * 20 + 8}px`,
                paddingRight: '8px',
                paddingTop: '6px',
                paddingBottom: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                borderRadius: '4px',
                transition: 'background-color 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Indent guide line */}
              {depth > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${depth * 20 - 8}px`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: '#e0e0e0',
                  }}
                />
              )}

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}
                onClick={() => toggleFolder(folder.folder_id)}
              >
                <span style={{ fontSize: '12px', color: '#999', minWidth: '14px' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: '16px' }}>📁</span>
                <span
                  style={{
                    fontWeight: '500',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {folder.folder_name}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt('Rename folder', folder.folder_name);
                    if (name) updateFolder(folder.folder_id, name);
                  }}
                  title="Rename"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                    opacity: 0.6,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt('Subfolder name');
                    if (name) createFolder(collectionId, name, folder.folder_id);
                  }}
                  title="Add subfolder"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    padding: '4px 6px',
                    color: '#666',
                    opacity: 0.6,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  +
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this folder and all its contents?')) {
                      deleteFolder(folder.folder_id);
                    }
                  }}
                  title="Delete"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                    color: '#ff5f56',
                    opacity: 0.6,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Folder contents (recursive) */}
            {isExpanded && (
              <FolderTree
                folders={safeFolders}
                requests={safeRequests}
                parentId={folder.folder_id}
                depth={depth + 1}
                onSelectRequest={onSelectRequest}
                onDeleteRequest={onDeleteRequest}
                collectionId={collectionId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FolderTree;
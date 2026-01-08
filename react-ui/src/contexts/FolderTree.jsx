import { useContext } from 'react';
import { CollectionsContext } from '../contexts/Collections';

const FolderTree = ({ folders, requests, parentId = null, onSelectRequest }) => {
  const { updateFolder, deleteFolder, createFolder } = useContext(CollectionsContext);

  const childFolders = folders.filter(f => f.parent_folder_id === parentId);
  const childRequests = requests.filter(
    r => r.folder_id === parentId  // null for root, or folder_id for nested
  );

  return (
    <>
      {childFolders.map(folder => (
        <div
          key={folder.folder_id}
          style={{ marginLeft: parentId ? 14 : 0, paddingTop: 4 }}
        >
          <span style={{ cursor: 'pointer' }}>📁 {folder.folder_name}</span>

          <button
            onClick={() => {
              const name = prompt('Rename folder', folder.folder_name);
              if (name) updateFolder(folder.folder_id, name);
            }}
            style={{ marginLeft: 6 }}
          >
            ✏️
          </button>

          <button
            onClick={() => {
              if (window.confirm('Delete this folder?'))
                deleteFolder(folder.folder_id);
            }}
            style={{ marginLeft: 4 }}
          >
            🗑️
          </button>

          <button
            onClick={() => {
              const name = prompt('Subfolder name');
              if (name) createFolder(folder.collection_id, name, folder.folder_id);
            }}
            style={{ marginLeft: 4 }}
          >
            ➕
          </button>


          {/* Requests directly in this folder */}
          {childRequests.map(req => (
            <div
              key={req.request_id}
              style={{ marginLeft: 16, cursor: 'pointer', fontSize: 13 }}
              onClick={() => onSelectRequest?.(req)}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  marginRight: 6,
                  color:
                    req.method === 'GET'
                      ? '#61affe'
                      : req.method === 'POST'
                        ? '#49cc90'
                        : req.method === 'PUT'
                          ? '#fca130'
                          : req.method === 'DELETE'
                            ? '#f93e3e'
                            : 'var(--theme-color)',
                }}
              >
                {req.method}
              </span>
              {req.request_name}
            </div>
          ))}

          {/* Recursive children */}
          <FolderTree
            folders={folders}
            requests={requests}
            parentId={folder.folder_id}
            onSelectRequest={onSelectRequest}
          />
        </div>
      ))}
    </>
  );
};

export default FolderTree;
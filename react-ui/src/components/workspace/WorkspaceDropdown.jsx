import { useContext, useState } from 'react';
import { WorkspacesContext } from '../../contexts/Workspaces';
import styles from './workspace.module.css';

const WorkspaceDropdown = ({ isOpen, onClose }) => {
  const { workspaces, currentWorkspaceId, createWorkspace, updateWorkspace, deleteWorkspace, switchWorkspace } = useContext(WorkspacesContext);
  
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Add editing state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const currentWorkspace = workspaces.find(ws => ws.workspace_id === currentWorkspaceId);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowCreateInput(false);
    } catch (err) {
      alert('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchWorkspace = (workspaceId) => {
    switchWorkspace(workspaceId);
    onClose();
  };

  // Handle rename
  const handleRename = async (workspaceId) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateWorkspace(workspaceId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      alert('Failed to rename workspace');
    }
  };

  // Start editing
  const startEditing = (workspace) => {
    setEditingId(workspace.workspace_id);
    setEditingName(workspace.workspace_name);
  };

  // Handle delete
  const handleDelete = async (workspaceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this workspace?');
    if (confirmDelete) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (err) {
        alert('Failed to delete workspace');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose}></div>
      
      {/* Dropdown */}
      <div className={styles.dropdown}>
        <div className={styles.header}>
          <h3>Workspaces</h3>
        </div>

        <div className={styles.workspace_list}>
          {workspaces.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              No workspaces yet. Create one to get started!
            </div>
          ) : (
            workspaces.map(ws => (
              <div
                key={ws.workspace_id}
                className={`${styles.workspace_item} ${ws.workspace_id === currentWorkspaceId ? styles.active : ''}`}
              >
                {editingId === ws.workspace_id ? (
                  // Editing mode
                  <div className={styles.edit_mode}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(ws.workspace_id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => handleRename(ws.workspace_id)}
                      autoFocus
                    />
                  </div>
                ) : (
                  // Normal mode
                  <div 
                    className={styles.workspace_info}
                    onClick={() => handleSwitchWorkspace(ws.workspace_id)}
                  >
                    <span className={styles.workspace_name}>{ws.workspace_name}</span>
                    {ws.workspace_id === currentWorkspaceId && (
                      <span className={styles.current_badge}>Current</span>
                    )}
                    <button 
                      className={styles.edit_button}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent workspace switching 
                        startEditing(ws);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.delete_button}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent workspace switching
                        handleDelete(ws.workspace_id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {showCreateInput ? (
          <div className={styles.create_input}>
            <input
              type="text"
              placeholder="Workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              autoFocus
              disabled={isCreating}
            />
            <button 
              onClick={handleCreateWorkspace}
              disabled={isCreating || !newWorkspaceName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button 
              onClick={() => setShowCreateInput(false)}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className={styles.create_button}
            onClick={() => setShowCreateInput(true)}
          >
            + Create New Workspace
          </button>
        )}
      </div>
    </>
  );
};

export default WorkspaceDropdown;

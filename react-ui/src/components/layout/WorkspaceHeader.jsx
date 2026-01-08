import React, { useContext, useState, useRef, useEffect } from 'react';
import { WorkspacesContext } from '../../contexts/Workspaces';

const WorkspaceHeader = () => {
  const { workspaces, currentWorkspaceId, updateWorkspace } = useContext(WorkspacesContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  
  const currentWorkspace = workspaces.find(ws => ws.workspace_id === currentWorkspaceId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (currentWorkspace) {
      setEditValue(currentWorkspace.workspace_name);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editValue.trim() || !currentWorkspace) {
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkspace(currentWorkspace.workspace_id, editValue.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename workspace:', err);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 20px',
      borderBottom: '1px solid #e0e0e0',
      background: '#fff',
      height: '48px', 
      flexShrink: 0 
    }}>
      <span style={{ fontSize: '18px' }}>👤</span>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          style={{
            fontSize: '14px',
            fontWeight: '500',
            padding: '4px 8px',
            border: '2px solid #667eea',
            borderRadius: '4px',
            outline: 'none',
            minWidth: '180px'
          }}
        />
      ) : (
        <span 
          onClick={handleStartEdit}
          title="Click to rename workspace"
          style={{
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          {currentWorkspace?.workspace_name || 'My Workspace'}
        </span>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        <button style={{
          padding: '5px 12px',
          border: 'none',
          borderRadius: '4px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500'
        }}>New</button>
        <button style={{
          padding: '5px 12px',
          border: 'none',
          borderRadius: '4px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500'
        }}>Import</button>
        <button style={{
          padding: '5px 12px',
          border: 'none',
          borderRadius: '4px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500'
        }}>Overview</button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;

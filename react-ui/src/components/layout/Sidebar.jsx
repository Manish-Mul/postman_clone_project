import { useContext, useState, useRef, useEffect } from 'react';
import styles from './layout.module.css';
import TabAPIs from '../tabs/TabAPIs';
import TabCollections from '../tabs/TabCollections';
import TabEnv from '../tabs/TabEnv';
import TabHistory from '../tabs/TabHistory';
import TabMonitors from '../tabs/TabMonitors';
import TabServers from '../tabs/TabServers';
import { Context } from '../../contexts/Store';
import { WorkspacesContext } from '../../contexts/Workspaces';
import GlobalVariablesTab from '../tabs/GlobalVariablesTab';

const Sidebar = () => {
  const { state, dispatch } = useContext(Context);
  const { workspaces, currentWorkspaceId, updateWorkspace, loading } = useContext(WorkspacesContext);

  console.log('Sidebar currentWorkspaceId (WorkspacesContext):', currentWorkspaceId);
  console.log('Sidebar workspaces:', workspaces);
  console.log('Sidebar loading:', loading);

  const [selectedTab, setSelectedTab] = useState(state.sideDrawerTab);

  // Workspace editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const inputRef = useRef(null);

  // Get current workspace from WorkspacesContext
  const currentWorkspace = workspaces.find(
    ws => ws.workspace_id === currentWorkspaceId
  );

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const setCurrentTab = (e) => {
    setSelectedTab(e);
    dispatch({ type: 'SET_SIDEDRAWER', payload: true });
    dispatch({ type: 'SET_SIDEDRAWER_TAB', payload: e });
  };

  // Start editing workspace name
  const handleStartEdit = () => {
    setWorkspaceName(currentWorkspace?.workspace_name || '');
    setIsEditingName(true);
  };

  // Save renamed workspace
  const handleRename = async () => {
    if (workspaceName.trim() && workspaceName !== currentWorkspace?.workspace_name) {
      try {
        await updateWorkspace(currentWorkspace.workspace_id, workspaceName.trim());
        setIsEditingName(false);
      } catch (err) {
        console.error('Failed to rename workspace:', err);
        setIsEditingName(false);
      }
    } else {
      setIsEditingName(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingName(false);
    setWorkspaceName('');
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:3000/collections/export?workspace_id=${currentWorkspaceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to export collections');

      const data = await res.json();
      console.log('export data', data);

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collections-${currentWorkspaceId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  // Show loading state only when loading AND no workspaces yet
  if (loading && workspaces.length === 0) {
    return (
      <div className={styles.sidebar}>
        {state.sideDrawerOpened && (
          <div className={styles.sidebar_header}>
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading workspaces...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show error if no workspaces after loading
  if (!loading && workspaces.length === 0) {
    return (
      <div className={styles.sidebar}>
        {state.sideDrawerOpened && (
          <div className={styles.sidebar_header}>
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#ff6b6b',
              background: '#fff3f3',
              borderRadius: '4px',
              margin: '10px'
            }}>
              <p>No workspaces found</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                There might be an issue loading your workspaces.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      {state.sideDrawerOpened && (
        <div className={styles.sidebar_header}>
          <div className={styles.sidebar_title}>
            <i className="feather-user"></i>
            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRename();
                  }
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                style={{
                  border: '1px solid var(--border-color)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '150px',
                }}
              />
            ) : (
              <span
                onClick={handleStartEdit}
                style={{ cursor: 'pointer' }}
                title="Click to rename workspace"
              >
                {currentWorkspace?.workspace_name || 'My Workspace'}
              </span>
            )}
          </div>
          <div className={styles.sidebar_actions}>
            <button onClick={handleExport} style={{ marginLeft: 8 }}>
              Export JSON
            </button>
            <button type="button" onClick={() => dispatch({ type: "OPEN_CURL_MODAL" })}>
              Import cURL
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_COLLECTION_IMPORT_MODAL" })}
            >
              Import Collections
            </button>
          </div>
        </div>
      )}
      <div className={styles.sidebar_tabs}>
        <div
          className={
            !state.sideDrawerOpened
              ? styles.sidebar_tab_buttons_collapsed
              : styles.sidebar_tab_buttons
          }
        >
          <ul>
            <li
              onClick={(e) => setCurrentTab('collections')}
              className={
                selectedTab === 'collections'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="Collections"
            >
              <i className="feather-folder"></i>
              <span>Collections</span>
            </li>
            <li
              onClick={(e) => setCurrentTab('api')}
              className={
                selectedTab === 'api'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="APIs"
            >
              <i className="feather-command"></i>
              <span>APIs</span>
            </li>
            <li
              onClick={(e) => setCurrentTab('env')}
              className={
                selectedTab === 'env'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="Environments"
            >
              <i className="feather-box"></i>
              <span>Environments</span>
            </li>
            <li
              onClick={(e) => setCurrentTab('servers')}
              className={
                selectedTab === 'servers'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="Mock Servers"
            >
              <i className="feather-server"></i>
              <span>Mock Servers</span>
            </li>
            <li
              onClick={(e) => setCurrentTab('monitors')}
              className={
                selectedTab === 'monitors'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="Monitors"
            >
              <i className="feather-activity"></i>
              <span>Monitors</span>
            </li>
            <li
              onClick={(e) => setCurrentTab('history')}
              className={
                selectedTab === 'history'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="History"
            >
              <i className="feather-clock"></i>
              <span>History</span>
            </li>
            <li
              onClick={() => setCurrentTab('globals')}
              className={
                selectedTab === 'globals'
                  ? state.sideDrawerOpened
                    ? styles.sidebar_tab_button_active
                    : ''
                  : ''
              }
              title="Global Variables"
            >
              <i className="feather-globe"></i>
              <span>Globals</span>
            </li>

          </ul>
        </div>
        {state.sideDrawerOpened && (
          <div className={styles.sidebar_tab_panels}>
            {(() => {
              switch (selectedTab) {
                case 'api':
                  return <TabAPIs />;
                case 'env':
                  return <TabEnv />;
                case 'servers':
                  return <TabServers />;
                case 'monitors':
                  return <TabMonitors />;
                case 'history':
                  return <TabHistory />
                case 'globals':
                  return <GlobalVariablesTab />;
                default:
                  return <TabCollections />;
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
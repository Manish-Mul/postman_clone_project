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

const Sidebar = () => {
  const { state, dispatch } = useContext(Context);
  const { workspaces, currentWorkspaceId, updateWorkspace } = useContext(WorkspacesContext); 
  
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
            <button type="button">New</button>
            <button type="button" onClick={() => dispatch({ type: "OPEN_CURL_MODAL" })}>
  Import
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
                  return <TabHistory />;
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

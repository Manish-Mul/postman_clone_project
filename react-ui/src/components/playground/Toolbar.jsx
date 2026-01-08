import { useContext, useMemo } from 'react';
import { Context } from '../../contexts/Store';
import { EnvironmentsContext } from '../../contexts/Environments';
import styles from './playground.module.css';

const Toolbar = () => {
  const { state, dispatch } = useContext(Context);
  const { environments } = useContext(EnvironmentsContext);

  const currentEnvironments = useMemo(() => {
    return environments[state.currentWorkspaceId] || [];
  }, [environments, state.currentWorkspaceId]);

  const resetForm = (e) => {
    e.stopPropagation();
    dispatch({ type: 'RESET_FORM' });
  };

  const toggleOverView = (show) => {
    dispatch({ type: 'SET_OVERVIEW', payload: show ? 'shown' : 'hidden' });
  };

  const closeOverView = (e) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_OVERVIEW' });
  };

  const handleEnvironmentChange = (e) => {
    const envId = e.target.value || null;
    dispatch({ type: 'SET_ACTIVE_ENVIRONMENT', payload: envId });
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.tabs_wrapper}>

        {/* Request Tabs */}
        <div className={styles.tabs_row}>
          {state.tabs.map(tab => (
            <div
              key={tab.id}
              className={
                tab.id === state.currentTabId
                  ? styles.tab_active
                  : styles.tab
              }
              onClick={() => dispatch({ type: "SET_CURRENT_TAB", id: tab.id })}
            >
              <span>{tab.title || 'Untitled Request'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "CLOSE_TAB", id: tab.id });
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Overview Tab */}
        <div className={styles.all_tabs}>
          {state.overviewTab !== '' && (
            <div
              onClick={() => toggleOverView(true)}
              className={
                state.overviewTab === 'shown' ? styles.tab_active : styles.tab
              }
            >
              <span>Overview</span>
              <button type="button" onClick={(e) => closeOverView(e)}>
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Tab Actions */}
        <div className={styles.tab_actions}>
          <div
            className={styles.tab_sm}
            onClick={() => dispatch({ type: "NEW_TAB" })}
            title="New Request"
          >
            <i className="feather-plus"></i>
          </div>

          <div className={styles.tab_sm}>
            <i className="feather-more-horizontal"></i>
          </div>
        </div>

      </div>

      {/* Environment Selector */}
      <div className={styles.env_menu}>
        <select
          value={state.activeEnvironmentId || ''}
          onChange={handleEnvironmentChange}
        >
          <option value="">No Environment</option>
          {currentEnvironments.map(env => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Toolbar;

import { useContext } from 'react';
import { Context } from '../../contexts/Store';
import styles from './requestTabs.module.css';

const RequestTabs = () => {
  const { state, dispatch } = useContext(Context);
  const { tabs, currentTabId } = state;

  return (
    <div className={styles.tabs_bar}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={tab.id === currentTabId ? styles.active_tab : styles.tab}
          onClick={() => dispatch({ type: 'SET_CURRENT_TAB', id: tab.id })}
        >
          <span>{tab.title}</span>
          {tabs.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation();
                dispatch({ type: 'CLOSE_TAB', id: tab.id });
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        className={styles.new_tab}
        onClick={() => dispatch({ type: 'NEW_TAB' })}
      >
        ＋
      </button>
    </div>
  );
};

export default RequestTabs;

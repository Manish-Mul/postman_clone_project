import { useContext } from 'react';
import styles from './tab.module.css';
import image from '../../images/no-history.png';
import { HistoryContext } from '../../contexts/History';
import { Context } from '../../contexts/Store';

function doDatewiseGroup(dataArr) {
  const grouped = {};
  dataArr.forEach((el) => {
    if (el && el.created_at) {
      const date = new Date(el.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(el);
    }
  });

  return Object.entries(grouped)
    .map(([date, requests]) => ({
      date,
      requests: requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }))
    .reverse();
}

const UrlList = ({ items, onClickRequest, onDeleteRequest }) => {
  const listItems = doDatewiseGroup(items);

  return (
    <div className={styles.history_list}>
      {listItems.map((group, i) => (
        <div className={styles.history_group} key={`req-group-${i}`}>
          <details open>
            <summary>{group.date}</summary>
            <ul>
              {group.requests.map((req, j) => (
                <li
                  key={`req-${req.history_id}-${j}`}
                  className={styles.history_item}
                  title={req.url}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      onClick={() => onClickRequest(req)}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <span className={`${styles.method} ${req.method}`}>
                        {req.method === 'DELETE' ? 'DEL' : req.method}
                      </span>
                      <span className={styles.url}>{req.url}</span>
                    </div>

                    {/* Delete button */}
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--theme-color)',
                        cursor: 'pointer',
                        marginLeft: '10px',
                      }}
                      title="Delete Request"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(req);
                      }}
                    >
                      <i className="feather-trash-2"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );
};

const TabHistory = () => {
  const { apis, deleteHistoryItem, clearHistory } = useContext(HistoryContext);
  const { state, dispatch: storeDispatch } = useContext(Context);

  // Get history for current workspace only
  const currentHistory = apis[state.currentWorkspaceId] || [];

  const handleHistoryClick = (req) => {
    const headers = req.headers ? JSON.parse(req.headers) : {};
    const body = req.body ? JSON.parse(req.body) : '';

    const paramsArray = Array.isArray(req.params) ? req.params : [];

    const formData = {
      method: req.method || 'GET',
      url: req.url || '',
      payload: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
      params: paramsArray,
      headers,
      bodyType: '',
      rawBodyType: 'json',
      formDataRows: [],
      urlEncodedRows: [],
    };

    storeDispatch({ type: 'SET_FORM_DATA', payload: formData });

    storeDispatch({
      type: 'OPEN_HISTORY_IN_NEW_TAB',
      payload: {
        id: req.history_id,
        title: `${req.method} ${req.url}`,
        ...formData,
      },
    });
  };

  const handleDeleteRequest = (req) => {
    // Now calls the database delete function
    deleteHistoryItem(state.currentWorkspaceId, req.history_id);
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      // Now calls the database clear function
      clearHistory(state.currentWorkspaceId);
    }
  };

  return currentHistory.length === 0 ? (
    <div className={styles.empty_tab}>
      <img src={image} alt="No history" />
      <h4>You haven't sent any requests.</h4>
      <p>Any request you send in this workspace will appear here.</p>
    </div>
  ) : (
    <>
      <UrlList
        items={currentHistory}
        onClickRequest={handleHistoryClick}
        onDeleteRequest={handleDeleteRequest}
      />
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          style={{
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: '4px',
            background: 'var(--light-bg)',
            cursor: 'pointer',
            color: 'var(--text-color)',
          }}
          onClick={clearAllHistory}
        >
          Clear All History
        </button>
      </div>
    </>
  );
};

export default TabHistory;

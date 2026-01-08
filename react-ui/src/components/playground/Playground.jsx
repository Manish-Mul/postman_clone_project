import { useContext, useState, useEffect } from 'react';
import { Context } from '../../contexts/Store';
import RightPanel from './RightPanel';
import Toolbar from './Toolbar';
import URLBox from './URLBox';
import PayloadForm from './PayloadForm';
import ResponseViewer from './ResponseViewer';
import Overview from './Overview';
import styles from './playground.module.css';
import SaveToCollectionModal from '../modals/SaveToCollectionModal';

const Playground = () => {
  const { state, dispatch } = useContext(Context);

  useEffect(() => {
    const tab = state.tabs.find(t => t.id === state.currentTabId);
    if (tab) {
      dispatch({
        type: 'MERGE_FORM_DATA',
        payload: {
          method: tab.method || '',
          url: tab.url || '',
          // keep params as existing array; don't overwrite with string
          payload: tab.payload || '',
        },
      });
    }
  }, [state.currentTabId, state.tabs, dispatch]);

  const [showSaveModal, setShowSaveModal] = useState(false);

  // Safety check for formData
  const formData = state?.formData || { method: '', url: '', params: '', payload: null };

  return (
    <main className={styles.wrapper}>
      <Toolbar />

      {state?.overviewTab === 'shown' ? (
        <Overview />
      ) : (
        <div
          className={
            state?.infoPanelOpened ? styles.main : styles.main_collapsed
          }
        >
          <div className={styles.container}>

            {/* HEADER AREA */}
            <div className={styles.panelheader}>
              <div className={styles.title_area}>
                <h2>{formData.url || 'Untitled Request'}</h2>
              </div>

              {/* RIGHT SIDE OPTIONS */}
              <div className={styles.options_area} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Save to Collection button */}
                <button
                  className={styles.save_button}
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#1273de',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 500,
                    fontSize: 15,
                    padding: '7px 18px',
                    cursor: 'pointer'
                  }}
                >
                  <svg
                    style={{ marginRight: 7 }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-save"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save to Collection
                </button>

                <div className={styles.view_options}>
                  <div>
                    <button>
                      <i className="feather-edit-2"></i>
                    </button>
                    <button disabled>
                      <i className="feather-message-square"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* URL and main content */}
            <URLBox />

            <div
              className={
                state?.splitView === 'V'
                  ? styles.panel_vertical
                  : styles.panel_horizontal
              }
            >
              <PayloadForm />
              <ResponseViewer />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className={
              state?.infoPanelOpened
                ? styles.panel_opened
                : styles.panel_collapsed
            }
          >
            <RightPanel />
          </div>
        </div>
      )}

      {/* Save to Collection Modal */}
      {showSaveModal && (
        <SaveToCollectionModal closeModal={() => setShowSaveModal(false)} />
      )}
    </main>
  );
};

export default Playground;

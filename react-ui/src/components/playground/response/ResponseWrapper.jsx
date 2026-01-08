import { useContext, useState } from 'react';
import LineLoader from './LineLoader';
import HeadersTable from './HeadersTable';
import { Context } from '../../../contexts/Store';
import ResponseBody from './ResponseBody';
import style from './response.module.css';
import CookiesTable from './CookiesTable';

const ResponseWrapper = () => {
  const { state, dispatch } = useContext(Context);
  const response = state.apiResponses?.[state.currentTabId] || null;
  const [respView, setRespView] = useState('body');
  const [viewAs, setViewAs] = useState('pretty');
  const [viewMode, setViewMode] = useState('json');
  const [wordWrap, setWordWrap] = useState(false);

  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  function niceBytes(x) {
    let l = 0,
      n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }

  function getResponseSize(response) {
    if (!response?.data || !response?.headers) return '0 bytes';
    return niceBytes(
      JSON.stringify(response.data).length + JSON.stringify(response.headers).length
    );
  }

  const cancelRequest = () => {
    if (state.cancelHandler) state.cancelHandler();
    dispatch({ type: "CANCEL_FORM_SUBMIT" });
    if (abortRef.current) abortRef.current.abort();
    if (state.abortController) state.abortController.abort();
  };

  function saveAPIResponse() {
    const data =
      typeof response?.data === 'object'
        ? JSON.stringify(response.data, null, 2)
        : String(response?.data || '');
    const file = new Blob([data], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'response.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }, 0);
  }

  async function copyAPIResponse() {
    if (navigator.clipboard && response?.data !== undefined) {
      await navigator.clipboard.writeText(
        JSON.stringify(response.data, null, 2)
      );
    }
  }

  // Function to display safe JSON/string for both response and errors
  const formatErrorOutput = (err) => {
    if (!err) return 'No error';
    if (typeof err === 'string') return err;
    try {
      return JSON.stringify(err, null, 2);
    } catch {
      return String(err);
    }
  };

  const parseCookies = (headers) => {
    if (!headers) return [];

    const raw = headers['set-cookie'] || headers['Set-Cookie'];
    if (!raw) return [];

    const cookies = Array.isArray(raw) ? raw : [raw];

    return cookies.map((c) => {
      const parts = c.split(';').map(p => p.trim());
      const [name, value] = parts[0].split('=');

      const attrs = {};
      parts.slice(1).forEach(p => {
        const [k, v] = p.split('=');
        attrs[k.toLowerCase()] = v || true;
      });

      return { name, value, ...attrs };
    });
  };

  const getStatusClass = (status) => {
    if (!status) return style.status_neutral;
    if (status >= 200 && status < 300) return style.status_success;  // 2xx
    if (status >= 300 && status < 400) return style.status_info;     // 3xx
    if (status >= 400 && status < 500) return style.status_warning;  // 4xx
    if (status >= 500 && status < 600) return style.status_error;    // 5xx
    return style.status_neutral;
  };

  return (
    <>
      {state.formSubmitted && (
        <>
          <LineLoader />
          <div className={style.overlay}>
            <div>
              <p>Sending request...</p>
              <button type="button" onClick={cancelRequest}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {response && Object.keys(response).length ? (
        <div
          className={
            state.splitView === 'V' ? style.wrapper_full : style.wrapper
          }
        >
          <div className={style.top}>
            <div className={style.header}>
              <ul className={style.payload_types}>
                <li
                  onClick={() => setRespView('body')}
                  className={
                    respView === 'body'
                      ? style.payload_tab_active
                      : style.payload_tab
                  }
                >
                  Body
                </li>
                <li
                  onClick={() => setRespView('cookies')}
                  className={
                    respView === 'cookies'
                      ? style.payload_tab_active
                      : style.payload_tab
                  }
                >
                  Cookies
                </li>

                <li
                  onClick={() => setRespView('headers')}
                  className={
                    respView === 'headers'
                      ? style.payload_tab_active
                      : style.payload_tab
                  }
                >
                  Headers{' '}
                  {response.headers && (
                    <span>
                      (
                      {Object.entries(response.headers).length})
                    </span>
                  )}
                </li>
                <li className={style.payload_tab_disabled}>Test results</li>
              </ul>

              <div className={style.resp_meta}>
                <i className="feather-globe"></i>
                <div>
                  Status{' '}
                  <span className={getStatusClass(response.status)}>
                    {response.status}{' '}
                    <em>{response.statusText}</em>
                  </span>
                </div>

                <div>
                  Time: <span>{response.customData?.time || 0}ms</span>
                </div>
                <div>
                  Size: <span>{getResponseSize(response)}</span>
                </div>
              </div>

              <div className={style.saveBtn}>
                <button type="button" onClick={saveAPIResponse}>
                  Save Response
                </button>
              </div>
            </div>

            {respView === 'body' && (
              <div className={style.more}>
                <div className={style.tabs}>
                  <div className={style.tab_group}>
                    <div
                      onClick={() => setViewAs('pretty')}
                      className={
                        viewAs === 'pretty' ? style.tab_selected : ''
                      }
                    >
                      Pretty
                    </div>
                    <div
                      onClick={() => setViewAs('raw')}
                      className={viewAs === 'raw' ? style.tab_selected : ''}
                    >
                      Raw
                    </div>
                    <div
                      onClick={() => setViewAs('preview')}
                      className={viewAs === 'preview' ? style.tab_selected : ''}
                    >
                      Preview
                    </div>
                  </div>

                  {viewAs === 'pretty' && (
                    <div className={style.tab_group}>
                      <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                      >
                        <option value="json">JSON</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className={style.resp_action}>
                  <button type="button" onClick={copyAPIResponse}>
                    <i className="feather-copy"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={style.scroll}>
            {(() => {
              switch (respView) {
                case 'body':
                  return (
                    <ResponseBody
                      data={response.data}
                      wrap={wordWrap}
                      viewAs={viewAs}
                      viewMode={viewMode}
                    />
                  );
                case 'cookies':
                  return (
                    <CookiesTable
                      cookies={parseCookies(response.headers)}
                    />
                  );
                case 'headers':
                  return (
                    <HeadersTable
                      headers={Object.entries(response.headers || {})}
                    />
                  );
                default:
                  return;
              }
            })()}
          </div>
        </div>
      ) : (
        <div className={style.apiError}>
          {state.apiError
            ? typeof state.apiError === 'object'
              ? JSON.stringify(state.apiError, null, 2)
              : state.apiError
            : ''}
        </div>

      )}
    </>
  );
};

export default ResponseWrapper;

import { useContext } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';
import { startOAuth } from '../../utils/startOAuth';

const AUTH_OPTIONS = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'apikey', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'custom', label: 'Custom Auth Headers' }
];

const AuthHeaders = () => {
  const { state, dispatch } = useContext(Context);

  const auth = state.auth || { type: 'none' };

  const setAuth = (patch) => {
    dispatch({ type: 'SET_AUTH', payload: patch });
  };

  // Check if there's a conflicting Authorization header
  const hasAuthHeader = state.requestHeaders?.some(
    h => h.key.toLowerCase() === 'authorization'
  );

  const clearAuthHeaders = () => {
    const filteredHeaders = (state.requestHeaders || []).filter(
      h => h.key.toLowerCase() !== 'authorization'
    );
    dispatch({ type: 'SET_REQUEST_HEADERS', payload: filteredHeaders });
  };

  return (
    <div
      className={
        state.responsePanelMinimized || state.splitView === 'V'
          ? styles.payload_wrapper_full
          : styles.payload_wrapper
      }
    >
      <div
        className={
          state.splitView === 'V'
            ? styles.auth_two_col_vert
            : styles.auth_two_col
        }
      >
        <div
          className={
            state.splitView === 'V'
              ? styles.auth_left_col_vert
              : styles.auth_left_col
          }
        >
          <div>
            <span>Auth Type</span>
            <select
              value={auth.type}
              onChange={e => setAuth({ type: e.target.value })}
            >
              {AUTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <p style={{ fontSize: '0.85em', color: '#ccc', marginTop: 18 }}>
            {auth.type === 'none'
              ? 'This request does not use any authorization.'
              : auth.type === 'custom'
              ? 'Add your custom authorization headers in the Headers tab.'
              : 'The authorization header will be automatically generated when you send the request.'}
          </p>
        </div>

        <div
          className={
            auth.type === 'none'
              ? styles.auth_right_col_blank
              : styles.auth_right_col
          }
        >
          {/* Show warning if auth type conflicts with manual headers */}
          {auth.type !== 'none' && auth.type !== 'custom' && hasAuthHeader && (
            <div style={{ 
              padding: '10px', 
              background: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '4px',
              marginBottom: '12px',
              fontSize: '13px',
              color: '#856404'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                ⚠️ Authorization Header Conflict
              </div>
              <div style={{ marginBottom: '8px' }}>
                An Authorization header is set in the Headers tab. It will override this auth configuration.
              </div>
              <button
                type="button"
                onClick={clearAuthHeaders}
                style={{
                  padding: '4px 12px',
                  background: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Clear Authorization Headers
              </button>
            </div>
          )}

          {auth.type === 'bearer' && (
            <textarea
              value={auth.token || ''}
              onChange={e => setAuth({ token: e.target.value })}
              placeholder="Bearer token (e.g., abc123)"
              style={{ minHeight: '80px' }}
            />
          )}

          {auth.type === 'basic' && (
            <>
              <input
                placeholder="Username"
                value={auth.username || ''}
                onChange={e => setAuth({ username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={auth.password || ''}
                onChange={e => setAuth({ password: e.target.value })}
              />
            </>
          )}

          {auth.type === 'apikey' && (
            <>
              <input
                placeholder="Key"
                value={auth.key || ''}
                onChange={e => setAuth({ key: e.target.value })}
              />
              <input
                placeholder="Value"
                value={auth.value || ''}
                onChange={e => setAuth({ value: e.target.value })}
              />
              <select
                value={auth.in || 'header'}
                onChange={e => setAuth({ in: e.target.value })}
              >
                <option value="header">Header</option>
                <option value="query">Query</option>
              </select>
            </>
          )}

          {auth.type === 'oauth2' && (
            <>
              <select
                value={auth.grantType || 'authorization_code'}
                onChange={e => setAuth({ grantType: e.target.value })}
              >
                <option value="authorization_code">Authorization Code</option>
                <option value="client_credentials">Client Credentials</option>
              </select>

              <input placeholder="Client ID" value={auth.clientId || ''} onChange={e => setAuth({ clientId: e.target.value })} />
              <input placeholder="Client Secret" value={auth.clientSecret || ''} onChange={e => setAuth({ clientSecret: e.target.value })} />

              <input placeholder="Auth URL" value={auth.authUrl || ''} onChange={e => setAuth({ authUrl: e.target.value })} />
              <input placeholder="Token URL" value={auth.tokenUrl || ''} onChange={e => setAuth({ tokenUrl: e.target.value })} />

              <input placeholder="Scopes (space separated)" value={auth.scopes || ''} onChange={e => setAuth({ scopes: e.target.value })} />
              <input placeholder="Redirect URI" value={auth.redirectUri || ''} onChange={e => setAuth({ redirectUri: e.target.value })} />

              <button
                type="button"
                onClick={() => startOAuth(auth)}
              >
                Authorize
              </button>
            </>
          )}

          {auth.type === 'custom' && (
            <div style={{ fontSize: 13, color: '#aaa', paddingTop: 8 }}>
              Define your authentication headers manually in the Headers tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthHeaders;
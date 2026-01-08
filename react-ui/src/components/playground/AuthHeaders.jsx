import { useContext, useState, useEffect } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';

const AUTH_OPTIONS = [
  { value: '', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
];

const AuthHeaders = () => {
  const { state, dispatch } = useContext(Context);

  // INIT from localStorage 
  const initialAuthType = localStorage.getItem('authType') || state.auth || '';
  const initialBearer = () => localStorage.getItem('token') || '';
  
  const [authType, setAuthType] = useState(initialAuthType);
  const [bearerToken, setBearerToken] = useState(initialBearer());

  // Sync state.auth with local changes
  useEffect(() => {
    if (state.auth !== authType) {
      setAuthType(state.auth || '');
    }
  }, [state.auth]);

  // Keep token attached everytime
  useEffect(() => {
    if (authType === 'bearer') {
      setBearerToken(localStorage.getItem('token') || '');
    }
  }, [authType]);

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setAuthType(type);
    dispatch({ type: 'SET_AUTH', payload: type });
    localStorage.setItem('authType', type);  
    
    if (type !== 'bearer') {
      // Clear token from localStorage, token state, and headers
      setBearerToken('');
      localStorage.removeItem('token');
      dispatch({ type: 'SET_AUTH_HEADER', payload: '' }); 
    }
  };

  const handleTokenChange = (e) => {
    const value = e.target.value;
    setBearerToken(value);
    localStorage.setItem('token', value); 
    dispatch({ type: 'SET_AUTH_HEADER', payload: `Authorization:Bearer ${value}` });
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
              value={authType}
              onChange={handleTypeChange}
              style={{ marginLeft: 12, minWidth: 140 }}
            >
              {AUTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <p style={{fontSize: '0.85em', color: '#ccc', marginTop: 18}}>
            {authType === ''
              ? 'This request does not use any authorization. '
              : 'The authorization header will be automatically generated when you send the request. '}
            <a
              href="https://learning.postman.com/docs/sending-requests/authorization/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6EC6FF', textDecoration: 'underline', marginLeft: 5 }}
            >
              Learn more about authorization
            </a>
          </p>
        </div>
        <div
          className={
            authType === ''
              ? styles.auth_right_col_blank
              : styles.auth_right_col
          }
        >
          {authType === 'bearer' && (
            <div>
              <span>Token</span>
              <div>
                <textarea
                  value={bearerToken}
                  spellCheck={false}
                  onChange={handleTokenChange}
                  disabled={authType !== 'bearer'}  
                  style={{
                    marginTop: 5,
                    width: '94%',
                    minHeight: '44px',
                    background: '#f4f4f4',
                    color: '#333',
                    borderRadius: 5,
                    border: '1px solid #ccc',
                    padding: '0.35em 0.9em',
                  }}
                  placeholder={authType === 'bearer' ? 'Enter your token here' : ''}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthHeaders;

import api from '../../api';
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Context } from '../../contexts/Store';
import { WorkspacesContext } from '../../contexts/Workspaces';
import { EnvironmentsContext } from '../../contexts/Environments';
import { HistoryContext } from '../../contexts/History';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useVariableScopes } from '../hooks/useVariableScopes';
import { interpolateString } from '../../utils/variables';
import styles from './playground.module.css';
import { HTTP_STATUS_TEXT } from '../../utils/httpStatusText';

//api.defaults.headers.common['Authorization'] = undefined;

// ✅ In api.js - only add user token for your backend
api.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();

  const token = localStorage.getItem('token');

  // Only add user authentication for your own backend endpoints
  const isOwnBackend = request.url?.includes('localhost:3000') ||
    request.url?.includes('your-backend-domain.com');

  if (token && isOwnBackend && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;
  return response;
}

api.interceptors.response.use(
  updateEndTime,
  (error) => {
    if (!error || typeof error !== 'object') {
      return Promise.reject(
        new Error(
          'A network error occurred. This could be a CORS issue or a dropped internet connection.\nOpen developer console to learn more.'
        )
      );
    }

    if (error.response && error.config && error.config.customData) {
      error.response.customData = error.response.customData || {};
      error.response.customData.time =
        new Date().getTime() - error.config.customData.startTime;
    }

    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('token-expired'));
    }

    return Promise.reject(error);
  }
);

const AutoGrowInput = forwardRef(({ value, onChange }, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current.focus() }));

  return (
    <div
      className="auto-grow-input"
      style={{
        display: 'inline-grid',
        alignItems: 'center',
        justifyItems: 'start',
        maxWidth: '500px',
      }}
    >
      <input
        ref={inputRef}
        placeholder="http://example.com"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          gridArea: '1 / 1 / 2 / 2',
          width: '100%',
          padding: 0,
          border: 'none',
          maxWidth: '600px',
        }}
      />
      <span
        style={{
          gridArea: '1 / 1 / 2 / 2',
          visibility: 'hidden',
        }}
      >
        {value}
      </span>
    </div>
  );
});

const parseJsonBody = (body) => {
  if (!body) return undefined;
  const trimmed = body.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return body;
  try {
    return JSON.parse(trimmed);
  } catch {
    return body;
  }
};

const normalizeBody = (body) => {
  if (!body) return undefined;
  const trimmed = body.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
};

const URLBox = ({ localVars }) => {
  const { state, dispatch } = useContext(Context);
  const { environments, activeEnvironmentId } = useContext(EnvironmentsContext);
  const { currentWorkspaceId } = useContext(WorkspacesContext);
  const { addToHistory } = useContext(HistoryContext);

  const abortRef = useRef(null);
  const inputboxRef = useRef();
  const timedOutRef = useRef(false);
  const timeoutRef = useRef(null);
  const REQUEST_TIMEOUT = 3000;

  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('');
  const [headers, setHeaders] = useState({});
  //const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const currentEnvironments = environments[currentWorkspaceId] || [];

  // console.log('URLBox Debug:');
  // console.log('- currentWorkspaceId:', currentWorkspaceId);
  // console.log('- activeEnvironmentId:', activeEnvironmentId, 'type:', typeof activeEnvironmentId);
  // console.log('- currentEnvironments:', currentEnvironments);
  // console.log('- environment IDs:', currentEnvironments.map(e => ({ id: e.id, type: typeof e.id })));

  // Try to find with loose comparison first
  const activeEnvironment = currentEnvironments.find(
    (env) => env.id === activeEnvironmentId
  );

  console.log('Active environment found:', activeEnvironment);

  const variables = activeEnvironment?.variables || [];

  // ✅ Create a key that changes when environment changes
  const scopeKey = `${currentWorkspaceId}-${activeEnvironmentId}`;

  // const [localVars, setLocalVars] = useLocalStorage(
  //   `localVars:${currentWorkspaceId}`,
  //   [{ key: '', value: '' }]
  // );

  const scopesFromHook = useVariableScopes(localVars);

  // ✅ Log when scopes change
  useEffect(() => {
    console.log('🎯 scopesFromHook changed:', scopesFromHook);
  }, [scopesFromHook]);

  // ✅ Update preview when environment, variables, or scopes change
  useEffect(() => {
    const localVarsMap = Object.fromEntries(
      (localVars || []).filter((v) => v.key?.trim()).map((v) => [v.key, v.value])
    );
    const finalScopes = { ...scopesFromHook, localVars: localVarsMap };
    const replaced = interpolateString(url, finalScopes);
    setPreview(replaced);

    console.log('🔄 Preview updated:', replaced);
    console.log('Active environment variables:', activeEnvironment?.variables);
  }, [url, localVars, scopesFromHook, activeEnvironmentId]);

  const getWorkspaceKey = () => `lastRequest_${state.currentWorkspaceId}`;

  const cancelRequest = () => {
    timedOutRef.current = false;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    finishRequest();
    dispatch({ type: 'CANCEL_FORM_SUBMIT' });
  };

  useEffect(() => {
    const localVarsMap = Object.fromEntries(
      (localVars || []).filter((v) => v.key?.trim()).map((v) => [v.key, v.value])
    );
    const finalScopes = { ...scopesFromHook, localVars: localVarsMap };
    const replaced = interpolateString(url, finalScopes);
    setPreview(replaced);
  }, [url, localVars, scopesFromHook]);

  useEffect(() => {
    const workspaceKey = getWorkspaceKey();
    const saved = localStorage.getItem(workspaceKey);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      // Only apply if there is at least a URL or method
      if (parsed.url || parsed.method) {
        dispatch({
          type: 'UPDATE_ACTIVE_TAB',
          payload: {
            method: parsed.method || '',
            url: parsed.url || '',
            // ❌ do NOT overwrite payload here
            // payload: parsed.payload || '',
          },
        });

        // Optionally merge formData instead:
        dispatch({
          type: 'MERGE_FORM_DATA',
          payload: {
            method: parsed.method || '',
            url: parsed.url || '',
            // leave payload untouched
          },
        });
      }
    } catch (error) {
      console.error('Error loading saved request for workspace:', error);
    }
  }, [state.currentWorkspaceId, dispatch]);

  useEffect(() => {
    const workspaceKey = getWorkspaceKey();
    localStorage.setItem(workspaceKey, JSON.stringify({
      url,
      method,
      headers,
      response: state.apiResponse || null,
    }));
  }, [url, method, headers, state.apiResponse, state.currentWorkspaceId]);

  // useEffect(() => {
  //   if (!state.formData) return;

  //   // only hard reset when a NEW_REQUEST was just opened
  //   if (
  //     state.newRequestJustOpened &&
  //     !state.formData.url &&
  //     !state.formData.method &&
  //     !state.formData.payload
  //   ) {
  //     setUrl('');
  //     setMethod('');
  //     // setBody('');
  //     setHeaders({});
  //     setBtnDisabled(true);
  //     return;
  //   }




  //   // normal sync from formData
  //   if (typeof state.formData.url === 'string' &&
  //     state.formData.url !== '' &&
  //     state.formData.url !== url) {
  //     setMethod(state.formData.method);
  //     setUrl(state.formData.url);
  //     setBtnDisabled(!state.formData.url);
  //   }

  //   if (typeof state.formData.method === 'string' &&
  //     state.formData.method !== '' &&
  //     state.formData.method !== method) {
  //     setMethod(state.formData.method);
  //   }

  //   // if (typeof state.formData.payload === 'string' &&
  //   //   state.formData.payload !== body) {
  //   //   setBody(state.formData.payload);
  //   // }

  //   if (
  //     typeof state.formData.headers === 'object' &&
  //     JSON.stringify(state.formData.headers) !== JSON.stringify(headers)
  //   ) {
  //     setHeaders(state.formData.headers);
  //   }
  // }, [state.formData, state.newRequestJustOpened]);

  useEffect(() => {
    const workspaceKey = getWorkspaceKey();
    localStorage.setItem(
      workspaceKey,
      JSON.stringify({
        url,
        method,
        // payload: body,
        headers,
        response: state.apiResponse || null,
      })
    );
  }, [url, method, headers, state.apiResponse, state.currentWorkspaceId]);

  useEffect(() => {
    if (state.curlParsedRequest) {
      const { method, url, headers, body } = state.curlParsedRequest;
      const normalizedMethod = (method || 'GET').toUpperCase().trim();
      const payloadString =
        typeof body === 'string' ? body : JSON.stringify(body || {}, null, 2);

      setMethod(normalizedMethod);
      setUrl(url || '');
      setHeaders(headers || {});
      //setBody(payloadString);
      setBtnDisabled(false);

      dispatch({
        type: 'MERGE_FORM_DATA',
        payload: {
          method: normalizedMethod,
          url: url || '',
          headers: headers || {},
          payload: payloadString,
          bodyType: 'raw',
          rawBodyType: 'json',
        },
      });

      dispatch({ type: 'SET_CURL_PARSED', payload: null });
    }
  }, [state.curlParsedRequest, dispatch]);

  useEffect(() => {
    if (!state.formData?.params) return;
    // try {
    //   const urlObj = new URL(url || '');
    //   urlObj.search = '';
    //   state.formData.params.forEach((p) => {
    //     urlObj.searchParams.append(p.key, p.value);
    //   });
    //   setUrl(urlObj.toString());
    // } catch {}
  }, [state.formData?.params, url]);

  useEffect(() => {
    const activeTab = state.tabs.find(
      t => t.id === state.currentTabId && t.workspaceId === state.currentWorkspaceId
    );
    let processedPayload = activeTab?.payload || '';
    if (processedPayload) {
      processedPayload = interpolateString(processedPayload, finalScopes);
    }
    if (!activeTab) return;

    if (activeTab.url !== url) setUrl(activeTab.url || '');
    if (activeTab.method !== method) setMethod(activeTab.method || '');
  }, [state.currentTabId, state.currentWorkspaceId, state.tabs]);

  const buildTabTitle = (method, url) => {
    if (!url) return 'Untitled Request';
    try {
      const u = new URL(url);
      return `${method || ''} ${u.pathname}`;
    } catch {
      return `${method || ''} ${url}`;
    }
  };

  const finishRequest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    abortRef.current = null;
    timedOutRef.current = false;

    setIsRequesting(false);
  };

  const handleChange = (value) => {
    setBtnDisabled(value.length <= 0);
    if (method === '') {
      setMethod('GET');
      dispatch({ type: 'SET_METHOD', payload: 'GET' });
    }
    setUrl(value);
    const title = buildTabTitle(method || 'GET', value);
    //dispatch({ type: 'SET_PAYLOAD', payload: val });
    //dispatch({ type: 'UPDATE_TAB_FIELD', field: 'payload', value: val });
    dispatch({ type: 'UPDATE_TAB_FIELD', field: 'url', value });
    dispatch({ type: 'UPDATE_TAB_FIELD', field: 'title', value: title });
    dispatch({ type: 'SET_URL', payload: value });
  };

  const applyAuth = (headers, url, auth) => {
    console.log('🧪 applyAuth called with auth:', auth);
    console.log('🧪 incoming headers:', headers);

    const h = { ...headers };
    let u = url;

    // Check if there's already a manual Authorization header
    const hasManualAuth = Object.keys(h).some(
      k => k.toLowerCase() === 'authorization'
    );

    console.log('🧪 hasManualAuth:', hasManualAuth);
    console.log('🧪 auth.type:', auth?.type);

    // Only apply auth if:
    // 1. No manual auth header exists
    // 2. Auth type is not 'none' or 'custom'
    if (!hasManualAuth && auth?.type && auth.type !== 'none' && auth.type !== 'custom') {
      if (auth.type === 'bearer' && auth.token) {
        h['Authorization'] = `Bearer ${auth.token}`;
        console.log('🧪 Applied bearer token:', auth.token);
      }

      if (auth.type === 'oauth2' && auth.accessToken) {
        h['Authorization'] = `Bearer ${auth.accessToken}`;
        console.log('🧪 Applied OAuth2 token');
      }

      if (auth.type === 'basic' && auth.username && auth.password) {
        h['Authorization'] = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
        console.log('🧪 Applied basic auth');
      }
    }

    // API Key can go in header or query
    if (auth?.type === 'apikey' && auth.key && auth.value) {
      if (auth.in === 'query') {
        const sep = u.includes('?') ? '&' : '?';
        u = `${u}${sep}${auth.key}=${encodeURIComponent(auth.value)}`;
        console.log('🧪 Applied API key to query');
      } else {
        h[auth.key] = auth.value;
        console.log('🧪 Applied API key to header');
      }
    }

    console.log('🧪 Final headers:', h);
    return { headers: h, url: u };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('RAW URL BEFORE SEND:', url);
    if (!method || !url) return;

    const localVarsMap = Object.fromEntries(
      (localVars || []).filter(v => v.key?.trim()).map(v => [v.key, v.value])
    );
    const finalScopes = { ...scopesFromHook, localVars: localVarsMap };

    // ----- OAuth handling (unchanged) -----
    if (state.auth?.type === 'oauth2' && state.auth.grantType === 'client_credentials') {
      if (!state.auth.accessToken || Date.now() > state.auth.expiresAt) {
        const res = await api.post(
          state.auth.tokenUrl,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: state.auth.clientId,
            client_secret: state.auth.clientSecret,
            scope: state.auth.scopes || '',
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        dispatch({
          type: 'SET_AUTH',
          payload: {
            accessToken: res.data.access_token,
            expiresAt: Date.now() + res.data.expires_in * 1000,
          },
        });
      }
    }

    async function refreshOAuthToken(auth, dispatch) {
      const res = await api.post(
        auth.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: auth.refreshToken,
          client_id: auth.clientId,
          client_secret: auth.clientSecret,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      dispatch({
        type: 'SET_AUTH',
        payload: {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token || auth.refreshToken,
          expiresAt: Date.now() + res.data.expires_in * 1000,
        },
      });
    }

    if (
      state.auth?.type === 'oauth2' &&
      state.auth.refreshToken &&
      state.auth.expiresAt &&
      Date.now() > state.auth.expiresAt
    ) {
      await refreshOAuthToken(state.auth, dispatch);
    }

    if (isRequesting) {
      cancelRequest();
      return;
    }
    setIsRequesting(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'SET_CANCEL_HANDLER', payload: cancelRequest });

    const replacedUrl = interpolateString(url, finalScopes);
    let processedPayload = state.formData?.payload || '';
    if (processedPayload) {
      processedPayload = interpolateString(processedPayload, finalScopes);
    }

    const buildUrlWithParams = (baseUrl, params) => {
      try {
        const u = new URL(baseUrl);
        u.search = '';
        params.forEach((p) => {
          if (p.key) u.searchParams.append(p.key, p.value);
        });
        return u.toString();
      } catch {
        return baseUrl;
      }
    };

    const fullUrl = state.formData.params?.length
      ? buildUrlWithParams(replacedUrl, state.formData.params)
      : replacedUrl;

    timeoutRef.current = setTimeout(() => {
      if (abortRef.current) {
        timedOutRef.current = true;
        abortRef.current.abort();
        abortRef.current = null;
      }
    }, REQUEST_TIMEOUT);

    if (!state.responseUI) {
      dispatch({ type: 'SET_RESPONSE_UI', payload: true });
    }

    // keep auth on tab, but do NOT override formData here
    dispatch({
      type: 'SET_FORM_SUBMIT',
      payload: { auth: state.auth },
    });

    const { formData } = state;
    const currentBodyType = formData.bodyType;
    const currentRawBodyType = formData.rawBodyType || 'json';
    const rows = formData.formDataRows || [];
    const urlRows = formData.urlEncodedRows || [];

    const uiHeaders = (state.requestHeaders || []).reduce((acc, h) => {
      if (h.key) acc[h.key] = h.value ?? '';
      return acc;
    }, {});

    const interpolatedHeaders = Object.fromEntries(
      Object.entries({
        ...(state.formData?.headers || {}),
        ...headers,
        ...uiHeaders,
      }).map(([k, v]) => [
        k,
        typeof v === 'string' ? interpolateString(v, finalScopes) : v,
      ])
    );

    let finalBody;
    switch (currentBodyType) {
      case '':
      case undefined:
        finalBody = undefined;
        break;
      case 'url-encoded': {
        const obj = {};
        urlRows.forEach(({ key, value }) => {
          if (key) obj[key] = value;
        });
        finalBody = new URLSearchParams(obj);
        if (!interpolatedHeaders['Content-Type']) {
          interpolatedHeaders['Content-Type'] =
            'application/x-www-form-urlencoded';
        }
        break;
      }
      case 'form-data': {
        const fd = new FormData();
        rows.forEach(({ key, value, type }) => {
          if (!key) return;
          if (type === 'file' && value) fd.append(key, value);
          else fd.append(key, value ?? '');
        });
        finalBody = fd;
        break;
      }
      case 'raw': {
        if (currentRawBodyType === 'json') {
          const parsed = parseJsonBody(processedPayload || '');
          if (typeof parsed === 'string') {
            finalBody = parsed;
            if (!interpolatedHeaders['Content-Type']) {
              interpolatedHeaders['Content-Type'] = 'text/plain';
            }
          } else {
            finalBody = parsed;
            if (!interpolatedHeaders['Content-Type']) {
              interpolatedHeaders['Content-Type'] = 'application/json';
            }
          }
        } else {
          finalBody = processedPayload || '';
          if (!interpolatedHeaders['Content-Type']) {
            interpolatedHeaders['Content-Type'] =
              currentRawBodyType === 'xml'
                ? 'application/xml'
                : 'text/plain';
          }
        }
        break;
      }
      default:
        finalBody =
          method !== 'GET' ? normalizeBody(processedPayload) : undefined;
    }

    if (method === 'GET') finalBody = undefined;

    const { headers: finalHeaders, url: authedUrl } = applyAuth(
      interpolatedHeaders,
      fullUrl,
      state.auth
    );

    try {
      const res = await api({
        method,
        url: authedUrl,
        data: finalBody,
        headers: finalHeaders,
        signal: controller.signal,
        maxRedirects: 5,
        skipUserAuth: true,
      });

      dispatch({
        type: 'SET_API_RESPONSE',
        payload: {
          data: res.data,
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          customData: res.customData,
        },
      });

      addToHistory(currentWorkspaceId, {
        method,
        url: fullUrl,
        headers: finalHeaders ? JSON.stringify(finalHeaders) : null,
        body: processedPayload || null,
        response_status: res.status || null,
        response_time: res.customData?.time || null,
      });
    } catch (err) {
      console.error('Request error:', err);

      let errorPayload = {
        data: { message: 'Request failed' },
        status: null,
        statusText: 'Error',
        headers: {},
        customData: { time: null },
      };

      if (method === 'OPTIONS') {
        errorPayload = {
          data: {
            message:
              'OPTIONS request sent. Browser blocked reading response due to CORS.',
          },
          status: null,
          statusText: 'Blocked by browser',
          headers: {},
          customData: { time: null },
        };
      } else if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
        const byTimeout = timedOutRef.current === true;
        errorPayload = {
          data: {
            message: byTimeout ? 'Request timed out' : 'Request canceled by user',
          },
          status: null,
          statusText: byTimeout ? 'Timeout' : 'Canceled',
          headers: {},
          customData: { time: null },
        };
      } else if (err.code === 'ECONNABORTED') {
        errorPayload.data = { message: 'Request timed out' };
        errorPayload.statusText = 'Timeout';
      } else if (err.response) {
        const status = err.response.status;
        const statusTextFromServer = err.response.statusText || '';
        const friendlyText =
          HTTP_STATUS_TEXT[status] || statusTextFromServer || 'Error';

        errorPayload.data =
          err.response.data || { message: friendlyText, error: err.message };
        errorPayload.status = status;
        errorPayload.statusText = friendlyText;
        errorPayload.headers = err.response.headers || {};
        errorPayload.customData = err.response.customData || { time: null };
      } else if (err.request) {
        errorPayload.data = {
          message: 'No response received from server',
          error: err.message,
          details:
            'The request was sent but no response was received. This could be due to network issues or CORS restrictions.',
        };
        errorPayload.statusText = 'No Response';
      } else {
        errorPayload.data = {
          message: 'Request setup failed',
          error: err.message,
          stack: err.stack,
        };
        errorPayload.statusText = 'Request Error';
      }

      dispatch({ type: 'SET_API_RESPONSE', payload: errorPayload });
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      abortRef.current = null;
      timedOutRef.current = false;

      // Mark request finished both locally and in global state
      setIsRequesting(false);
      dispatch({ type: 'CANCEL_FORM_SUBMIT' }); // sets formSubmitted: false
    }
  };

  useEffect(() => {
    if (state.triggerSendFromHistory) {
      const fakeEvent = { preventDefault: () => { } };
      handleSubmit(fakeEvent);
      dispatch({ type: 'TRIGGER_SEND_FROM_HISTORY', payload: false });
    }
  }, [state.triggerSendFromHistory]);
  console.log('payload before send:', state.formData.payload);


  return (
    <div className={styles.url_box}>

      {/* Form section */}
      <form onSubmit={handleSubmit}>
        <select
          value={method}
          onChange={(e) => {
            const m = e.target.value;
            setMethod(m);
            dispatch({ type: 'SET_METHOD', payload: m });   // 🔥 add this
            const title = buildTabTitle(m, url);
            dispatch({ type: 'UPDATE_TAB_FIELD', field: 'method', value: m });
            dispatch({ type: 'UPDATE_TAB_FIELD', field: 'title', value: title });
          }}
        >
          <option value="">Select</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>

        <div onClick={() => inputboxRef.current.focus()}>
          <AutoGrowInput value={url} ref={inputboxRef} onChange={handleChange} />
        </div>

        <button
          type="submit"
          disabled={(!url || !method) && !isRequesting}
        >
          {isRequesting ? 'Cancel' : 'Send'}
        </button>
      </form>

      {/* Preview */}
      <div
        style={{
          fontSize: 12,
          color: '#ccc',
          marginTop: 6,
          padding: '5px 10px',
          background: '#fff'
        }}
      >
        <strong style={{ color: '#aaa' }}>Preview:</strong>{' '}
        <span style={{ color: '#4CAF50' }}>
          {preview || url || 'Type URL to see live preview'}
        </span>
      </div>
    </div>
  );
}
export default URLBox;

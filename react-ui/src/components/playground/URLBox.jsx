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
import { HistoryContext } from '../../contexts/History';
import { EnvironmentsContext } from '../../contexts/Environments';
import { replaceVariables } from '../../utils/replaceVariables';
import styles from './playground.module.css';

api.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time = new Date().getTime() - response.config.customData.startTime;
  return response;
}

api.interceptors.response.use(
  updateEndTime,
  (error) => {
    // If Axios did not give an error object, fall back to a generic Error
    if (!error || typeof error !== 'object') {
      return Promise.reject(
        new Error(
          'A network error occurred. This could be a CORS issue or a dropped internet connection.\nOpen developer console to learn more.'
        )
      );
    }

    // Keep Axios error intact so err.code / err.name / err.response are available
    if (error.response && error.config && error.config.customData) {
      // Attach timing info to the *response*, but keep the error object
      error.response.customData =
        error.response.customData || {};
      error.response.customData.time =
        new Date().getTime() - error.config.customData.startTime;
    }

    if (error.response && error.response.status === 401) {
      // optional: check error.response.data.message === 'Token expired'
      window.dispatchEvent(new Event('token-expired'));
    }

    return Promise.reject(error);   // <- IMPORTANT
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

  // Only treat strings starting with { or [ as JSON
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    // Not valid JSON container; return raw string so server sees plain text
    return body;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Invalid JSON → also send as plain text
    return body;
  }
};

const normalizeBody = (body) => {
  if (!body) return undefined;

  const trimmed = body.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

const detectContentType = (body) => {
  if (!body) return null;

  if (body instanceof FormData) return null;
  if (body instanceof URLSearchParams) return "application/x-www-form-urlencoded";
  if (typeof body === "string") return "text/plain";
  if (typeof body === "object") return "application/json";

  return null;
};

const URLBox = () => {
  const { state, dispatch } = useContext(Context);
  const { environments } = useContext(EnvironmentsContext);
  const { addToHistory } = useContext(HistoryContext);
  const abortRef = useRef(null);
  const inputboxRef = useRef();
  const timedOutRef = useRef(false);
  const REQUEST_TIMEOUT = 3000; // 15 seconds
  const timeoutRef = useRef(null);


  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('');
  const [headers, setHeaders] = useState({});
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false); // Track the request status

  const currentEnvironments = environments[state.currentWorkspaceId] || [];
  const activeEnvironment = currentEnvironments.find(
    (env) => String(env.env_id) === String(state.activeEnvironmentId)
  );
  const variables = activeEnvironment?.variables || [];

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
    setIsRequesting(false);
    dispatch({ type: "CANCEL_FORM_SUBMIT" });
  };

  useEffect(() => {
    const replaced = replaceVariables(url, variables);
    setPreview(replaced);
  }, [url, variables]);

  useEffect(() => {
    const workspaceKey = getWorkspaceKey();
    const saved = localStorage.getItem(workspaceKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUrl(parsed.url || '');
        setMethod(parsed.method || '');
        setBody(parsed.payload || '');
        setHeaders(parsed.headers || {});
        dispatch({
          type: "SET_API_RESPONSE",
          payload: parsed.response || null
        });
        setBtnDisabled(parsed.url ? false : true);
      } catch {
        setUrl('');
        setMethod('');
        //setQueryParams('');
        setHeaders({});
        setBody('');
        dispatch({ type: "SET_API_RESPONSE", payload: null });
        setBtnDisabled(true);
      }
    } else {
      setUrl('');
      setMethod('');
      //setQueryParams('');
      setHeaders({});
      setBody('');
      dispatch({ type: "SET_API_RESPONSE", payload: null });
      setBtnDisabled(true);
    }
  }, [state.currentWorkspaceId]);

  useEffect(() => {
    if (!state.formData) return;

    if (typeof state.formData.url === 'string') {
      setUrl(state.formData.url);
      setBtnDisabled(state.formData.url ? false : true);
    }
    if (typeof state.formData.method === 'string') setMethod(state.formData.method);
    if (typeof state.formData.payload === 'string') setBody(state.formData.payload);
    if (typeof state.formData.headers === 'object') setHeaders(state.formData.headers);
  }, [state.formData]);


  useEffect(() => {
    const workspaceKey = getWorkspaceKey();
    localStorage.setItem(
      workspaceKey,
      JSON.stringify({
        url,
        method,
        payload: body,
        headers,
        response: state.apiResponse || null,
      })
    );
  }, [url, method, body, headers, state.apiResponse, state.currentWorkspaceId]);

  useEffect(() => {
    if (state.curlParsedRequest) {
      const { method, url, headers, body } = state.curlParsedRequest;
      const normalizedMethod = (method || 'GET').toUpperCase().trim();
      const payloadString =
        typeof body === 'string' ? body : JSON.stringify(body || {}, null, 2);

      setMethod(normalizedMethod);
      setUrl(url || '');
      setHeaders(headers || {});
      setBody(payloadString);
      setBtnDisabled(false);

      // 🔴 Ensure formData used in handleSubmit matches this request
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

    try {
      const urlObj = new URL(url || '');
      urlObj.search = '';

      state.formData.params.forEach((p) => {
        urlObj.searchParams.append(p.key, p.value);
      });

      setUrl(urlObj.toString());
    } catch { }
  }, [state.formData?.params]);

  const buildTabTitle = (method, url) => {
    if (!url) return "Untitled Request";
    try {
      const u = new URL(url);
      return `${method || ""} ${u.pathname}`;
    } catch {
      return `${method || ""} ${url}`;
    }
  };

  const handleChange = (value) => {
    setBtnDisabled(value.length <= 0);
    if (method === '') setMethod('GET');

    setUrl(value);

    const title = buildTabTitle(method || "GET", value);

    dispatch({ type: "UPDATE_TAB_FIELD", field: "url", value });
    dispatch({ type: "UPDATE_TAB_FIELD", field: "title", value: title });

    // 🔥 This is the missing link
    dispatch({ type: "SET_URL", payload: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!method || !url) return;

    if (isRequesting) {
      cancelRequest();
      return;
    }
    // Start request
    setIsRequesting(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "SET_CANCEL_HANDLER", payload: cancelRequest });

    const replacedUrl = replaceVariables(url, variables);
    const buildUrlWithParams = (baseUrl, params) => {
      try {
        const u = new URL(baseUrl);
        u.search = '';

        params.forEach(p => {
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
        timeoutRef.current = null;   // mark that timeout fired
      }
    }, REQUEST_TIMEOUT);


    if (!state.responseUI) {
      dispatch({ type: 'SET_RESPONSE_UI', payload: true });
    }

    dispatch({
      type: 'SET_FORM_SUBMIT',
      payload: {
        method,
        url: replacedUrl,
        payload: body,
        headers,
      },
    });

    let processedPayload = body;
    if (processedPayload) {
      processedPayload = replaceVariables(processedPayload, variables);
    }
    const { formData } = state;           // <— snapshot once here
    const currentBodyType = formData.bodyType;   // '', 'raw', 'url-encoded', 'form-data'
    const currentRawBodyType = formData.rawBodyType || 'json';
    const rows = formData.formDataRows || [];
    const urlRows = formData.urlEncodedRows || [];
    const token = localStorage.getItem('token');

    // 1) Headers from the headers table (RequestHeadersTable)
    const uiHeaders = (state.requestHeaders || []).reduce((acc, h) => {
      if (h.key) acc[h.key] = h.value ?? '';
      return acc;
    }, {});

    // 2) Merge with any headers coming from formData / URLBox local state
    const requestHeaders = {
      ...(state.formData?.headers || {}),
      ...headers,      // keep this if you still use local headers
      ...uiHeaders,    // table overrides earlier ones
    };

    let finalBody;
    console.log('bodyType', state.formData.bodyType);
    console.log('formDataRows', state.formData.formDataRows);

    console.log('bodyType', currentBodyType);
    console.log('rawBodyType', currentRawBodyType);
    console.log('processedPayload', processedPayload);


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
        if (!requestHeaders['Content-Type']) {
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        break;
      }

      case 'form-data': {
        const fd = new FormData();
        rows.forEach(({ key, value, type }) => {
          if (!key) return;
          if (type === 'file' && value) {
            fd.append(key, value);
          } else {
            fd.append(key, value ?? '');
          }
        });
        finalBody = fd;
        break;
      }

      case 'raw': {
        if (currentRawBodyType === 'json') {
          const parsed = parseJsonBody(processedPayload || '');

          // If parseJsonBody returns the same string, it means it's not valid JSON object/array.
          // You can still send it with Content-Type text/plain so httpbin's json stays null.
          if (typeof parsed === 'string') {
            // treat as plain text
            finalBody = parsed;
            if (!requestHeaders['Content-Type']) {
              requestHeaders['Content-Type'] = 'text/plain';
            }
          } else {
            // valid JSON object/array
            finalBody = parsed;
            if (!requestHeaders['Content-Type']) {
              requestHeaders['Content-Type'] = 'application/json';
            }
          }
        } else {
          // text or xml → always raw string
          finalBody = processedPayload || '';
          if (!requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] =
              currentRawBodyType === 'xml' ? 'application/xml' : 'text/plain';
          }
        }
        break;
      }
      default:
        finalBody = method !== 'GET' ? normalizeBody(processedPayload) : undefined;

    }

    if (method === 'GET') finalBody = undefined;

    if (token && !requestHeaders['Authorization']) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await api({
        method,
        url: fullUrl,
        data: finalBody,
        headers: requestHeaders,
        signal: controller.signal,
        maxRedirects: 5,
      });
      clearTimeout(timeoutRef.current);

      dispatch({
        type: "SET_API_RESPONSE",
        payload: {
          data: res.data,
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          customData: res.customData
        }
      });

      addToHistory(state.currentWorkspaceId, {
        method,
        url: fullUrl,
        headers: requestHeaders ? JSON.stringify(requestHeaders) : null,
        body: processedPayload || null,
        response_status: res.status || null,
        response_time: res.customData?.time || null,
      });
    } catch (err) {
      console.log('AXIOS ERROR', err.name, err.code, err.message);
      if (method === "OPTIONS") {
        dispatch({
          type: "SET_API_RESPONSE",
          payload: {
            data: { message: "OPTIONS request sent. Browser blocked reading response due to CORS." },
            status: null,
            statusText: "Blocked by browser",
            headers: {},
            customData: { time: null }
          }
        });
        return;
      }

      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
        const byTimeout = timedOutRef.current === true;
        dispatch({
          type: "SET_API_RESPONSE",
          payload: {
            data: { message: byTimeout ? "Request timed out" : "Request canceled by user" },
            status: null,
            statusText: byTimeout ? "Timeout" : "Canceled",
            headers: {},
            customData: { time: null },
          },
        });
        dispatch({ type: "CANCEL_FORM_SUBMIT" });
        return;
      }

      let errorPayload = {
        data: { message: "Request Cancelled" },
        status: null,
        statusText: "",
        headers: {},
        customData: { time: null },
      };

      if (err.code === "ECONNABORTED") {
        errorPayload.data = { message: "Request timed out" };
        errorPayload.statusText = "Timeout";
      } else if (err.response) {
        errorPayload.data = err.response.data || { message: "Server error" };
        errorPayload.status = err.response.status;
        errorPayload.statusText = err.response.statusText;
        errorPayload.headers = err.response.headers || {};
      }

      dispatch({ type: "SET_API_RESPONSE", payload: errorPayload });
      dispatch({ type: "CANCEL_FORM_SUBMIT" });
    } finally {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsRequesting(false);
    }


  };

  return (
    <div className={styles.url_box}>
      {/* ENVIRONMENT PREVIEW */}
      {activeEnvironment && activeEnvironment.variables && (
        <div style={{ margin: '10px 0', padding: '8px', background: '#f5f7fa', borderRadius: 4 }}>
          <div style={{ marginBottom: 4, fontWeight: 600, color: '#666' }}>Active Environment Variables</div>
          <table style={{ fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingRight: 16 }}>Key</th>
                <th style={{ textAlign: 'left' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {activeEnvironment.variables.map((v, idx) => (
                <tr key={v.key + idx}>
                  <td style={{ paddingRight: 16, color: '#006070' }}>{v.key}</td>
                  <td>{v.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUEST FORM */}
      <form onSubmit={handleSubmit}>
        <select
          value={method}
          onChange={(e) => {
            const m = e.target.value;
            setMethod(m);
            const title = buildTabTitle(m, url);
            dispatch({ type: "UPDATE_TAB_FIELD", field: "method", value: m });
            dispatch({ type: "UPDATE_TAB_FIELD", field: "title", value: title });
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
          <AutoGrowInput
            value={url}
            ref={inputboxRef}
            onChange={handleChange}
          />
        </div>

        {/* Send/Cancel button */}
        <button type="submit" disabled={btnDisabled && !isRequesting}>
          {isRequesting ? "Cancel" : "Send"}
        </button>

      </form>

      {/* LIVE PREVIEW */}
      <div
        style={{
          fontSize: 12,
          color: '#ccc',
          marginTop: 6,
          padding: '5px 10px',
          background: '#fff',
        }}
      >
        <strong style={{ color: '#aaa' }}>Preview:</strong>{' '}
        <span style={{ color: '#4CAF50' }}>
          {preview || url || 'Type URL to see live preview'}
        </span>
      </div>
    </div>
  );
};

export default URLBox;

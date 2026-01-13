const StoreReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_CURL_MODAL":
      return { ...state, showCurlModal: true };

    case "CLOSE_CURL_MODAL":
      return { ...state, showCurlModal: false };

    case "SET_CURL_PARSED":
      return { ...state, curlParsedRequest: action.payload };

    case 'OPEN_COLLECTION_IMPORT_MODAL':
      return { ...state, showCollectionImportModal: true };

    case 'CLOSE_COLLECTION_IMPORT_MODAL':
      return { ...state, showCollectionImportModal: false };

    case 'SET_OVERVIEW':
      return {
        ...state,
        overviewTab: action.payload,
      };
    case 'CLOSE_OVERVIEW':
      return {
        ...state,
        overviewTab: '',
      };
    case 'SET_SIDEDRAWER':
      return {
        ...state,
        sideDrawerOpened: action.payload,
      };
    case 'SET_SIDEDRAWER_TAB':
      return {
        ...state,
        sideDrawerTab: action.payload,
      };
    case 'SET_INFOPANEL':
      return {
        ...state,
        infoPanelOpened: action.payload,
      };
    case 'SET_SPLIT_VIEW':
      return {
        ...state,
        splitView: action.payload,
      };
    case 'SET_RESPONSE_PANEL':
      return {
        ...state,
        responsePanelMinimized: action.payload,
      };
    case 'SET_URL':
      return {
        ...state,
        formData: {
          ...state.formData,
          url: action.payload,
        },
      };
    case 'SET_QPARAMS':
      return {
        ...state,
        formData: {
          ...state.formData,
          params: action.payload,
        },
      };
    case 'SET_AUTH':
      return {
        ...state,
        auth: {
          ...(state.auth || { type: 'none' }),
          ...action.payload,
        },
      };
    case 'SET_AUTH_LOCATION':
      return {
        ...state,
        authLocation: action.payload,
      };
    case 'SET_AUTH_HEADER':
      return {
        ...state,
        authHeader: action.payload,
      };
    case 'SET_REQUEST_HEADERS':
      return {
        ...state,
        requestHeaders: action.payload,
      };
    case 'SET_INTERPOLATED_HEADERS_PREVIEW':
      return {
        ...state,
        interpolatedHeadersPreview: action.payload,
      };
    case 'SET_PAYLOAD':
      return {
        ...state,
        formData: {
          ...state.formData,
          payload: action.payload,
        },
      };
    case 'SET_FORM_SUBMIT':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === state.currentTabId
            ? { ...tab, auth: action.payload.auth }
            : tab
        ),
        formSubmitted: true,
      };

    case 'CANCEL_FORM_SUBMIT':
      return {
        ...state,
        formSubmitted: false,
      };
    case 'SET_METHOD':
      return {
        ...state,
        formData: {
          ...state.formData,
          method: action.payload,
        },
      };

    case 'SET_RAW_BODY_TYPE':
      return {
        ...state,
        formData: {
          ...state.formData,
          rawBodyType: action.payload,   // 'json' | 'text' | 'xml'
        },
      };
    case 'SET_RESPONSE_UI':
      return {
        ...state,
        responseUI: action.payload,
      };
    case 'SET_API_RESPONSE':
      return {
        ...state,
        apiResponse: action.payload,  // legacy
        apiResponses: {
          ...state.apiResponses,
          [state.currentTabId]: action.payload,
        },
        apiError: null,
        formSubmitted: state.formSubmitted,
      };

    case 'SET_API_ERROR':
      return {
        ...state,
        apiResponses: {
          ...state.apiResponses,
          [state.currentTabId]: null,
        },
        apiError: action.payload,
        formSubmitted: false,
      };

    case 'RESET_FORM':
      return {
        ...state,
        formData: {
          url: "",
          method: "",
          params: [],
          payload: '',
          bodyType: "",
          urlEncodedRows: [],
          formDataRows: [],
          headers: {}
        },
        auth: '',
        authHeader: '',
        authLocation: 'header',
        requestHeaders: [],
        formSubmitted: false,
        responseUI: false,
        apiResponse: null,
      };
    // 1) generic formData merge
    case 'MERGE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };

    // 2) form-data rows from FormDataPayload
    case 'SET_FORMDATA_ROWS':
      return {
        ...state,
        formData: {
          ...state.formData,
          formDataRows: action.payload || [],  // [{ key, value, type }]
        },
      };
    case 'SET_FORM_PAYLOAD':
      return {
        ...state,
        formData: {
          ...state.formData,
          payload: action.payload
        }
      };
    case 'SET_BODY_TYPE':
      return {
        ...state,
        formData: {
          ...state.formData,
          bodyType: action.payload,   // '', 'raw', 'url-encoded', 'form-data'
        },
      };

    case 'SET_FORM_URLENCODED':
      return {
        ...state,
        formData: {
          ...state.formData,
          urlEncodedRows: action.payload || [],   // [{ key, value }]
        },
      };
    case 'TRIGGER_SEND_FROM_HISTORY':
      return {
        ...state,
        triggerSendFromHistory: action.payload,
      };
      // in initial state
      const initialState = {
        // ...
        formData: { /* ... */ },
        newRequestJustOpened: false,
      };

    // in NEW_REQUEST
    case 'NEW_REQUEST': {
      return {
        ...state,
        newRequestJustOpened: true,
        formData: {
          url: '',
          method: '',
          params: [],
          payload: '',
          bodyType: '',
          formDataRows: [],
          urlEncodedRows: [],
          headers: {},
        },
        // ...tabs clearing etc
      };
    }

    // whenever you type or send, clear the flag
    case 'SET_URL':
    case 'SET_METHOD':
    case 'MERGE_FORM_DATA':
      return {
        ...state,
        newRequestJustOpened: false,
        formData: {
          ...state.formData,
          ...(action.type === 'SET_URL' && { url: action.payload }),
          ...(action.type === 'SET_METHOD' && { method: action.payload }),
          ...(action.type === 'MERGE_FORM_DATA' && action.payload),
        },
      };
    // case 'DELETE_REQUEST': {
    //   const { workspaceId, collectionId, requestId } = action;

    //   return {
    //     ...state,
    //     [workspaceId]: (state[workspaceId] || []).map(col =>
    //       col.collection_id !== collectionId
    //         ? col
    //         : {
    //           ...col,
    //           requests: (col.requests || []).filter(
    //             r => r.request_id !== requestId
    //           ),
    //         }
    //     ),
    //   };
    // }
    case 'OPEN_HISTORY_IN_NEW_TAB': {
  const newId = 'tab-' + Date.now();
  return {
    ...state,
    tabs: [
      ...state.tabs,
      {
        id: newId,
        workspaceId: state.currentWorkspaceId,   // ✅ add this
        title: action.payload.url || 'History Request',
        method: action.payload.method || '',
        url: action.payload.url || '',
        params: action.payload.params || '',
        payload: action.payload.body || '',
      },
    ],
    currentTabId: newId,
  };
}

    case "UPDATE_ACTIVE_TAB":
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === state.currentTabId
            ? { ...tab, ...action.payload }
            : tab
        )
      };
    // TAB ACTIONS:
    case 'NEW_TAB': {
      const newId = 'tab-' + Date.now();
      return {
        ...state,
        tabs: [
          ...state.tabs,
          {
            id: newId,
            workspaceId: state.currentWorkspaceId,   // ✅ add this
            title: 'Untitled Request',
            method: 'GET',
            url: '',
            params: '',
            payload: '',
          },
        ],
        currentTabId: newId,
        apiResponses: {
          ...state.apiResponses,
          [newId]: null,
        },
        apiResponse: null,
        responseUI: false,
        formSubmitted: false,
        formData: {
          url: '',
          method: '',
          params: [],
          payload: '',
          bodyType: '',
          urlEncodedRows: [],
          formDataRows: [],
          headers: {},
        },
      };
    }

    case 'CLOSE_TAB': {
      const idx = state.tabs.findIndex(tab => tab.id === action.id);
      const newTabs = state.tabs.filter(tab => tab.id !== action.id);
      let newCurrentTabId = state.currentTabId;

      if (newTabs.length === 0) {
        const blankId = 'tab-' + Date.now();
        newTabs.push({
          id: blankId,
          title: 'Untitled Request',
          method: '',
          url: '',
          params: '',
          payload: null,
        });
        newCurrentTabId = blankId;
      } else if (action.id === state.currentTabId) {
        newCurrentTabId = newTabs[Math.max(idx - 1, 0)].id;
      }

      const newApiResponses = { ...(state.apiResponses || {}) };
      delete newApiResponses[action.id];

      return {
        ...state,
        tabs: newTabs,
        currentTabId: newCurrentTabId,
        apiResponses: newApiResponses,
      };
    }

    case 'SET_CURRENT_TAB': {
      const tab = state.tabs.find(
        t => t.id === action.id && t.workspaceId === state.currentWorkspaceId
      );
      return {
        ...state,
        currentTabId: action.id,
        formData: tab
          ? {
            ...state.formData,
            url: tab.url || '',
            method: tab.method || '',
            payload: tab.payload || '',
          }
          : state.formData,
        auth: tab?.auth || { type: 'none' },
      };
    }

    case 'CLOSE_TAB': {
      const idx = state.tabs.findIndex(tab => tab.id === action.id);
      const newTabs = state.tabs.filter(tab => tab.id !== action.id);
      let newCurrentTabId = state.currentTabId;
      if (newTabs.length === 0) {
        const blankId = 'tab-' + Date.now();
        newTabs.push({
          id: blankId,
          title: 'Untitled Request',
          method: '',
          url: '',
          params: '',
          payload: null,
        });
        newCurrentTabId = blankId;
      } else if (action.id === state.currentTabId) {
        newCurrentTabId = newTabs[Math.max(idx - 1, 0)].id;
      }
      return {
        ...state,
        tabs: newTabs,
        currentTabId: newCurrentTabId,
      };
    }
    case "UPDATE_TAB_FIELD":
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === state.currentTabId
            ? { ...tab, [action.field]: action.value }
            : tab
        )
      };
    case "REGISTER_ABORT":
      return { ...state, abortController: action.payload };

    case "SET_CANCEL_HANDLER":
      return { ...state, cancelHandler: action.payload };

    case 'SET_CURRENT_WORKSPACE_ID': {
      const wsTabs = state.tabs.filter(t => t.workspaceId === action.payload);
      const newCurrentTabId = wsTabs.length > 0 ? wsTabs[0].id : null;  // 👈 use first tab’s id
      return {
        ...state,
        currentWorkspaceId: action.payload,
        currentTabId: newCurrentTabId,
        apiResponse: null,
        responseUI: false,
        formSubmitted: false,
      };
    }

    default:
      return state;
  }
};

export default StoreReducer;

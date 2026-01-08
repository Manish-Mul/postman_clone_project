const StoreReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_CURL_MODAL":
      return { ...state, showCurlModal: true };

    case "CLOSE_CURL_MODAL":
      return { ...state, showCurlModal: false };

    case "SET_CURL_PARSED":
      return { ...state, curlParsedRequest: action.payload };

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
        auth: action.payload,
        authHeader: '',
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
        formData: {
          ...state.formData,
          ...action.payload, // method, url, params, payload, headers
          // bodyType, formDataRows, urlEncodedRows stay untouched
        },
        formSubmitted: true,
      };

    case 'CANCEL_FORM_SUBMIT':
      return {
        ...state,
        formData: {
          method: '',
          url: '',
          params: '',
          payload: null,
        },
        formSubmitted: false,
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
        formSubmitted: false,
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
    case "NEW_REQUEST":
      return {
        ...state,
        formData: {
          url: "",
          method: "",
          params: [],
          payload: '',
          bodyType: "",
          formDataRows: Array.isArray(action.payload) ? action.payload : [],
          urlEncodedRows: Array.isArray(action.payload) ? action.payload : [],
          headers: {}
        },
        apiResponse: null,
        responseUI: false,
        formSubmitted: false
      };
    case "OPEN_HISTORY_IN_NEW_TAB": {
      const newId = "tab-" + Date.now();
      return {
        ...state,
        tabs: [
          ...state.tabs,
          {
            id: newId,
            title: action.payload.url || "History Request",
            method: action.payload.method || "",
            url: action.payload.url || "",
            params: action.payload.params || "",
            payload: action.payload.body || "",
          }
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
            title: 'Untitled Request',
            method: '',
            url: '',
            params: '',
            payload: null,
          },
        ],
        currentTabId: newId,
        apiResponses: {
          ...state.apiResponses,
          [newId]: null,
        },
        apiResponse: null,      // optional legacy clear
        responseUI: false,      // so ResponseViewer shows blank placeholder
        formSubmitted: false,
        // optional: clear shared formData to blank when new tab is active
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
      const tab = state.tabs.find(t => t.id === action.id);
      return {
        ...state,
        currentTabId: action.id,
        formData: tab
          ? {
            ...state.formData,
            url: tab.url || '',
            method: tab.method || '',
            payload: tab.payload || '',
            // leave bodyType, rows, headers as-is or reset if you prefer
          }
          : state.formData,
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

    case 'CREATE_WORKSPACE': {
      const newId = 'workspace-' + Date.now();
      return {
        ...state,
        workspaces: [
          ...state.workspaces,
          {
            id: newId,
            name: action.payload.name || 'New Workspace',
            createdAt: Date.now(),
          }
        ],
        currentWorkspaceId: newId, // Switch to new workspace
      };
    }

    case 'SWITCH_WORKSPACE':
      return {
        ...state,
        currentWorkspaceId: action.payload,
      };

    case 'RENAME_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(ws =>
          ws.id === action.payload.id
            ? { ...ws, name: action.payload.name }
            : ws
        ),
      };

    case 'DELETE_WORKSPACE': {
      const filtered = state.workspaces.filter(ws => ws.id !== action.payload);
      let newCurrent = state.currentWorkspaceId;

      // If deleting current workspace, switch to first available
      if (state.currentWorkspaceId === action.payload && filtered.length > 0) {
        newCurrent = filtered[0].id;
      }

      // Keep at least one workspace
      if (filtered.length === 0) {
        const defaultWs = {
          id: 'workspace-' + Date.now(),
          name: 'My Workspace',
          createdAt: Date.now(),
        };
        return {
          ...state,
          workspaces: [defaultWs],
          currentWorkspaceId: defaultWs.id,
        };
      }

      return {
        ...state,
        workspaces: filtered,
        currentWorkspaceId: newCurrent,
      };
    }

    case 'SET_ACTIVE_ENVIRONMENT':
      return {
        ...state,
        activeEnvironmentId: action.payload,
      };

    case 'SET_FOLDERS':
      return {
        ...state,
        folders: action.payload
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...(state.folders || []), action.payload]
      };

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(f => f.folder_id !== action.folderId)
      };

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map(f =>
          f.folder_id === action.folderId ? { ...f, ...action.payload } : f
        )
      };

    default:
      return state;
  }
};

export default StoreReducer;

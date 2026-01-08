import { createContext, useEffect, useReducer, useContext } from 'react';
import { WorkspacesContext } from './Workspaces';
import StoreReducer from './StoreReducer';

const initialState = {
  overviewTab: 'hidden',
  sideDrawerOpened: false,
  sideDrawerTab: 'history',
  infoPanelOpened: false,
  splitView: 'H',  // This key is already defined
  responsePanelMinimized: false,  // Same here, remove the duplicate
  activeEnvironmentId: null,  // No need to define this again
  showCurlModal: false,
  curlParsedRequest: null,
  bodyType: '',
  rawBodyType: 'json',
  
  formData: {
    method: '',
    url: '',
    params: [],
    payload: null,
    headers: [],
    bodyType: '',           // ← add this
    urlEncodedRows: [],
    formDataRows: [],
    rawBodyType: 'json', 
  },
  auth: '',
  authHeader: '',
  authLocation: 'header',
  requestHeaders: [],  // Defined earlier as well, remove the duplicate
  formSubmitted: false,
  responseUI: false,
  apiResponse: null,
  apiError: null,

  qParams: [],
  tabs: [
    {
      id: "tab-1",
      title: "Untitled Request",
      method: "",
      url: "",
      params: "",
      payload: "",
    }
  ],
  currentTabId: "tab-1",
};

const localState = JSON.parse(sessionStorage.getItem('_post_man'));
const mergedState = { ...initialState, ...(localState || {}) };

export const Context = createContext(initialState);

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(StoreReducer, mergedState);
  
  // Get currentWorkspaceId from WorkspacesContext
  const workspacesContext = useContext(WorkspacesContext);

  useEffect(() => {
    sessionStorage.setItem('_post_man', JSON.stringify(state));
  }, [state]);

  // Provide currentWorkspaceId from WorkspacesContext (no workspaces array)
  const enhancedState = {
    ...state,
    currentWorkspaceId: workspacesContext?.currentWorkspaceId || null
  };

  return (
    <Context.Provider value={{ state: enhancedState, dispatch }}>
      {children}
    </Context.Provider>
  );
};

export default Store;

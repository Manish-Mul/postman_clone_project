import { createContext, useReducer, useEffect, useContext } from 'react';
import { AuthContext } from './Auth';

const initialState = {
  workspaces: [],
  currentWorkspaceId: null,
  currentWorkspace: null,
  loading: true, // Start with loading: true
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WORKSPACES': {
      const saved = localStorage.getItem('currentWorkspaceId');
      const fromStorage = saved ? Number(saved) : null;
      const fallback = action.payload[0]?.workspace_id || null;

      const finalWorkspaceId = fromStorage ?? state.currentWorkspaceId ?? fallback;

      // Save to localStorage if we're setting a new one
      if (finalWorkspaceId) {
        localStorage.setItem('currentWorkspaceId', String(finalWorkspaceId));
      }

      return {
        ...state,
        workspaces: action.payload,
        currentWorkspaceId: finalWorkspaceId,
      };
    }

    case 'ADD_WORKSPACE':
      localStorage.setItem('currentWorkspaceId', String(action.payload.workspace_id));
      return {
        ...state,
        workspaces: [action.payload, ...state.workspaces],
        currentWorkspaceId: action.payload.workspace_id
      };

    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(ws =>
          ws.workspace_id === action.payload.workspace_id
            ? { ...ws, workspace_name: action.payload.workspace_name }
            : ws
        )
      };

    case 'DELETE_WORKSPACE':
      const remainingWorkspaces = state.workspaces.filter(
        ws => ws.workspace_id !== action.payload
      );
      const newCurrentId = state.currentWorkspaceId === action.payload
        ? remainingWorkspaces[0]?.workspace_id || null
        : state.currentWorkspaceId;

      if (newCurrentId) {
        localStorage.setItem('currentWorkspaceId', String(newCurrentId));
      } else {
        localStorage.removeItem('currentWorkspaceId');
      }

      return {
        ...state,
        workspaces: remainingWorkspaces,
        currentWorkspaceId: newCurrentId
      };

    case 'SWITCH_WORKSPACE':
      localStorage.setItem('currentWorkspaceId', String(action.payload));
      return {
        ...state,
        currentWorkspaceId: action.payload
      };

    case 'SET_WORKSPACE_BY_ID':
      return {
        ...state,
        currentWorkspace: action.payload
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

export const WorkspacesContext = createContext();

const WorkspacesProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    // Initialize currentWorkspaceId from localStorage
    currentWorkspaceId: (() => {
      const saved = localStorage.getItem('currentWorkspaceId');
      return saved ? Number(saved) : null;
    })()
  });

  // Fetch workspaces on mount
  useEffect(() => {
    if (token && user) {
      fetchWorkspaces();
    }
  }, [token, user]);

  // Debug log
  useEffect(() => {
    console.log('WorkspacesContext state:', {
      currentWorkspaceId: state.currentWorkspaceId,
      workspacesCount: state.workspaces.length,
      loading: state.loading
    });
  }, [state.currentWorkspaceId, state.workspaces, state.loading]);

  const fetchWorkspaces = async () => {
    if (!token) {
      console.log('No token available for fetching workspaces');
      return;
    }

    console.log('Starting fetchWorkspaces...');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('http://localhost:3000/workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched workspaces from DB - RAW DATA:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Length:', data?.length);

      dispatch({ type: 'SET_WORKSPACES', payload: data });
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getWorkspaceById = async (workspaceId) => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(`http://localhost:3000/workspaces/${workspaceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspace by ID');
      }

      const data = await response.json();

      dispatch({ type: 'SET_WORKSPACE_BY_ID', payload: data });
    } catch (err) {
      console.error('Error fetching workspace by ID:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createWorkspace = async (workspaceName) => {
    if (!token || !user) return;

    try {
      const response = await fetch('http://localhost:3000/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workspace_name: workspaceName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const result = await response.json();

      dispatch({
        type: 'ADD_WORKSPACE',
        payload: result
      });

      return result;
    } catch (err) {
      console.error('Error creating workspace:', err);
      throw err;
    }
  };

  const updateWorkspace = async (workspaceId, workspaceName) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/workspaces/${workspaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workspace_name: workspaceName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: {
          workspace_id: workspaceId,
          workspace_name: workspaceName
        }
      });
    } catch (err) {
      console.error('Error updating workspace:', err);
      throw err;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      dispatch({
        type: 'DELETE_WORKSPACE',
        payload: workspaceId
      });
    } catch (err) {
      console.error('Error deleting workspace:', err);
      throw err;
    }
  };

  const switchWorkspace = (workspaceId) => {
    dispatch({ type: 'SWITCH_WORKSPACE', payload: workspaceId });
  };

  return (
    <WorkspacesContext.Provider value={{
      workspaces: state.workspaces,
      currentWorkspaceId: state.currentWorkspaceId,
      currentWorkspace: state.currentWorkspace,
      loading: state.loading,
      error: state.error,
      dispatch,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      switchWorkspace,
      fetchWorkspaces,
      getWorkspaceById
    }}>
      {children}
    </WorkspacesContext.Provider>
  );
};

export default WorkspacesProvider;
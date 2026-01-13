import { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { AuthContext } from './Auth';
import { WorkspacesContext } from './Workspaces';

const initialState = {};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ENVIRONMENTS':
      const groupedEnvs = action.payload.reduce((acc, env) => {
        const workspaceId = env.workspace_id;
        if (!acc[workspaceId]) {
          acc[workspaceId] = [];
        }
        acc[workspaceId].push({
          id: env.env_id,
          name: env.env_name,
          variables: Array.isArray(env.variables)
            ? env.variables.map(v => ({
              key: v.key,
              value: v.value,
              isSecret: !!v.isSecret
            }))
            : (() => {
              try {
                return JSON.parse(env.variables || '[]').map(v => ({
                  key: v.key,
                  value: v.value,
                  isSecret: !!v.isSecret
                }));
              } catch {
                return [];
              }
            })()
        });
        return acc;
      }, {});
      return groupedEnvs;

    case 'ADD_ENVIRONMENT':
      return {
        ...state,
        [action.workspaceId]: [
          ...(state[action.workspaceId] || []),
          action.payload,
        ],
      };

    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).map(env =>
          env.id === action.id
            ? {
              id: env.id, // Keep the ID
              name: action.payload.name,
              variables: action.payload.variables
            }
            : env
        ),
      };

    case 'DELETE_ENVIRONMENT':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).filter(
          env => env.id !== action.id
        ),
      };

    default:
      return state;
  }
}

export const EnvironmentsContext = createContext();

const EnvironmentsProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const { currentWorkspaceId } = useContext(WorkspacesContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize activeEnvironmentId from localStorage
  const [activeEnvironmentId, setActiveEnvironmentIdState] = useState(() => {
    if (!currentWorkspaceId) return null;
    const stored = localStorage.getItem(`activeEnv_${currentWorkspaceId}`);
    const id = stored ? Number(stored) : null;
    console.log('🔧 Initial activeEnvironmentId from localStorage:', id, 'for workspace:', currentWorkspaceId);
    return id;
  });

  // Update activeEnvironmentId when workspace changes
  useEffect(() => {
    if (!currentWorkspaceId) {
      setActiveEnvironmentIdState(null);
      return;
    }

    const stored = localStorage.getItem(`activeEnv_${currentWorkspaceId}`);
    const storedId = stored ? Number(stored) : null;

    console.log('🔄 Workspace changed to:', currentWorkspaceId);
    console.log('📦 Stored environment ID:', storedId);

    // Only update if stored ID exists and environments are loaded
    const currentEnvs = state[currentWorkspaceId] || [];
    const envExists = currentEnvs.find(env => env.id === storedId);

    if (storedId && envExists) {
      console.log('✅ Restoring environment:', storedId);
      setActiveEnvironmentIdState(storedId);
    } else if (storedId && currentEnvs.length === 0) {
      // Environments not loaded yet, wait
      console.log('⏳ Waiting for environments to load...');
      setActiveEnvironmentIdState(storedId);
    } else {
      console.log('⚠️ No stored environment for workspace:', currentWorkspaceId);
      setActiveEnvironmentIdState(null);
    }
  }, [currentWorkspaceId, state]);

  // Wrapper to save to localStorage
  const setActiveEnvironmentId = (envId) => {
    console.log('🎯 Setting active environment:', envId, 'for workspace:', currentWorkspaceId);
    setActiveEnvironmentIdState(envId);

    if (currentWorkspaceId) {
      if (envId) {
        localStorage.setItem(`activeEnv_${currentWorkspaceId}`, String(envId));
        console.log('💾 Saved to localStorage: activeEnv_' + currentWorkspaceId + ' = ' + envId);
      } else {
        localStorage.removeItem(`activeEnv_${currentWorkspaceId}`);
        console.log('🗑️ Removed from localStorage: activeEnv_' + currentWorkspaceId);
      }
    }
  };

  // Fetch environments once user is authenticated
  useEffect(() => {
    if (token && user) {
      console.log('Token available, fetching environments...');
      fetchEnvironments();
    }
  }, [token, user]);

  // Fetch all environments
  const fetchEnvironments = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3000/environments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch environments');
      const data = await response.json();
      console.log('📥 Fetched environments from DB:', data);
      dispatch({ type: 'SET_ENVIRONMENTS', payload: data });
    } catch (err) {
      console.error('Error fetching environments:', err);
    }
  };

  // Create environment
  const createEnvironment = async (workspaceId, envName, variables) => {
    if (!token || !user) return;
    try {
      const response = await fetch('http://localhost:3000/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          env_name: envName,
          workspace_id: workspaceId,
          variables: variables,
        }),
      });

      if (!response.ok) throw new Error('Failed to create environment');

      const result = await response.json();
      const newEnv = {
        id: result.env_id,
        name: result.env_name,
        variables: result.variables || [],
      };

      dispatch({
        type: 'ADD_ENVIRONMENT',
        workspaceId,
        payload: newEnv,
      });

      console.log('✅ Environment created:', newEnv.name);
      return result;
    } catch (err) {
      console.error('Error creating environment:', err);
      throw err;
    }
  };

  // Update environment
  // Update the updateEnvironment function to trigger a re-render
  const updateEnvironment = async (workspaceId, envId, envName, variables) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3000/environments/${envId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          env_name: envName,
          variables: variables,
        }),
      });

      if (!response.ok) throw new Error('Failed to update environment');
      const result = await response.json();

      // Update the state with new values
      dispatch({
        type: 'UPDATE_ENVIRONMENT',
        workspaceId,
        id: envId,
        payload: {
          id: envId, // ✅ Include id
          name: envName,
          variables // ✅ This will trigger re-render in components using this env
        },
      });

      console.log('✅ Environment updated:', envName, 'with variables:', variables);

      return result;
    } catch (err) {
      console.error('Error updating environment:', err);
      throw err;
    }
  };

  // Delete environment
  const deleteEnvironment = async (workspaceId, envId) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3000/environments/${envId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete environment');

      // If deleting active environment, clear selection
      if (activeEnvironmentId === envId) {
        setActiveEnvironmentId(null);
      }

      dispatch({
        type: 'DELETE_ENVIRONMENT',
        workspaceId,
        id: envId,
      });
    } catch (err) {
      console.error('Error deleting environment:', err);
      throw err;
    }
  };

  console.log('🌍 EnvironmentsContext render - activeEnvironmentId:', activeEnvironmentId);

  return (
    <EnvironmentsContext.Provider
      value={{
        environments: state,
        activeEnvironmentId,
        setActiveEnvironmentId,
        dispatch,
        createEnvironment,
        updateEnvironment,
        deleteEnvironment,
        fetchEnvironments,
      }}
    >
      {children}
    </EnvironmentsContext.Provider>
  );
};

export default EnvironmentsProvider;
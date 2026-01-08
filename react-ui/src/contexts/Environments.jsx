import { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { AuthContext } from './Auth';

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
            ? env.variables
            : (() => {
                // handle parsed JSON if backend sends as string
                try {
                  return JSON.parse(env.variables || '[]');
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
          env.id === action.id ? { ...env, ...action.payload } : env
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

// Create Context
export const EnvironmentsContext = createContext();

const EnvironmentsProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  // manage currently active environment
  const [activeEnvironmentId, setActiveEnvironmentId] = useState(null);

  // Fetch environments once user is authenticated
  useEffect(() => {
    if (token && user) {
      console.log('Token available, fetching environments...');
      fetchEnvironments();
    } else {
      console.log('Waiting for authentication...');
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
      dispatch({
        type: 'ADD_ENVIRONMENT',
        workspaceId,
        payload: {
          id: result.env_id,
          name: result.env_name,
          variables: result.variables || [],
        },
      });
      return result;
    } catch (err) {
      console.error('Error creating environment:', err);
      throw err;
    }
  };

  // Update environment
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

      dispatch({
        type: 'UPDATE_ENVIRONMENT',
        workspaceId,
        id: envId,
        payload: { name: envName, variables },
      });

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

  // Expose all in context
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

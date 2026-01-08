import { createContext, useReducer, useEffect, useContext } from 'react';
import { AuthContext } from './Auth';

const initialState = {};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_HISTORY':
      // Group history by workspace_id
      const groupedHistory = action.payload.reduce((acc, item) => {
        const workspaceId = item.workspace_id;
        if (!acc[workspaceId]) {
          acc[workspaceId] = [];
        }
        acc[workspaceId].push(item);
        return acc;
      }, {});
      return groupedHistory;

    case 'ADD_ENTRY':
      return {
        ...state,
        [action.workspaceId]: [
          action.payload,
          ...(state[action.workspaceId] || []),
        ],
      };

    case 'DELETE_ENTRY':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).filter(
          (item) => item.history_id !== action.payload
        ),
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        [action.workspaceId]: [],
      };

    default:
      return state;
  }
}

export const HistoryContext = createContext();

const History = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch history from database on mount
  useEffect(() => {
    if (token && user) {
      console.log('Token available, fetching History...');
      fetchHistory();
    } else{
      console.log('Waiting for authentication...');
    }
  }, [token, user]);

  const fetchHistory = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      dispatch({ type: 'SET_HISTORY', payload: data });
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Add to history (save to database)
  const addToHistory = async (workspaceId, historyData) => {
    if (!token || !user) return;

    try {
      const response = await fetch('http://localhost:3000/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          ...historyData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to history');
      }

      const result = await response.json();
      
      // Update local state
      dispatch({
        type: 'ADD_ENTRY',
        workspaceId,
        payload: {
          history_id: result.history_id,
          ...historyData,
          workspace_id: workspaceId,
          created_at: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  // Delete single history item
  const deleteHistoryItem = async (workspaceId, historyId) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }

      dispatch({
        type: 'DELETE_ENTRY',
        workspaceId,
        payload: historyId
      });
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  // Clear all history for workspace
  const clearHistory = async (workspaceId) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/history/workspace/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      dispatch({ type: 'CLEAR_HISTORY', workspaceId });
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  return (
    <HistoryContext.Provider value={{ 
      apis: state, 
      dispatch,
      addToHistory,
      deleteHistoryItem,
      clearHistory,
      fetchHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export default History;

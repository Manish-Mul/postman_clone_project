import { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { AuthContext } from './Auth';

const initialState = {
  folders: {}
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_COLLECTIONS':
      return {
        ...state,
        [action.workspaceId]: action.payload,
      };
    case 'ADD_COLLECTION':
      return {
        ...state,
        [action.workspaceId]: [
          ...(state[action.workspaceId] || []),
          action.payload,
        ],
      };
    case 'ADD_REQUEST':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).map(col =>
          col.collection_id === action.collectionId
            ? { ...col, requests: [...(col.requests || []), action.payload] }
            : col
        ),
      };
    case 'DELETE_COLLECTION':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).filter(
          col => col.collection_id !== action.collectionId
        ),
      };
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        [action.workspaceId]: (state[action.workspaceId] || []).map(col =>
          col.collection_id === action.collectionId ? { ...col, ...action.payload } : col
        ),
      };
    case 'SET_FOLDERS':
      return {
        ...state,
        folders: {
          ...state.folders,
          [action.collectionId]: action.payload
        }
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: {
          ...state.folders,
          [action.collectionId]: [
            ...(state.folders[action.collectionId] || []),
            action.payload
          ]
        }
      };
    default:
      return state;
  }
}

export const CollectionsContext = createContext();

const CollectionsProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/collections', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch collections');

      const data = await response.json();

      const grouped = data.reduce((acc, c) => {
        if (!acc[c.workspace_id]) acc[c.workspace_id] = [];
        acc[c.workspace_id].push(c);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([workspaceId, cols]) => {
        dispatch({ type: 'SET_COLLECTIONS', workspaceId, payload: cols });
      });

      setError(null);
    } catch (err) {
      console.error('Fetch collections error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (!token) return;

    const res = await fetch('http://localhost:3000/folders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const grouped = data.reduce((acc, f) => {
      if (!acc[f.collection_id]) acc[f.collection_id] = [];
      acc[f.collection_id].push(f);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([collectionId, folders]) => {
      dispatch({ type: 'SET_FOLDERS', collectionId, payload: folders });
    });
  };

  useEffect(() => {
    if (token) {
      fetchCollections();
      fetchFolders();
    }
  }, [token]);

  // Create collection in database
  const createCollection = async (workspaceId, collectionName, description = '') => {
    if (!token || !user) {
      console.error('No token or user found');
      console.log('Token:', token);
      console.log('User:', user);
      return;
    }

    const requestData = {
      collection_name: collectionName,
      workspace_id: workspaceId,
      created_by: user.user_id
    };

    console.log('Request data being sent:', requestData);

    try {
      const response = await fetch('http://localhost:3000/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('Response Status:', response.status);
      console.log('Response Body:', responseText);

      if (!response.ok) {
        console.error('Backend error response:', responseText);
        throw new Error('Failed to create collection');
      }

      const result = JSON.parse(responseText);
      console.log('Parsed result:', result);

      const newCollection = {
        collection_id: result.id,
        collection_name: result.collection_name,
        workspace_id: workspaceId,
        created_by: user.user_id,
        requests: []
      };

      dispatch({
        type: 'ADD_COLLECTION',
        workspaceId,
        payload: newCollection
      });

      setError(null);
      return newCollection;
    } catch (err) {
      console.error('Error creating collection:', err);
      setError(err.message);
    }
  };

  // Update collection in database
  const updateCollection = async (workspaceId, collectionId, collectionName) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          collection_name: collectionName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update collection');
      }

      console.log('Updated collection');

      dispatch({
        type: 'UPDATE_COLLECTION',
        workspaceId,
        collectionId,
        payload: { collection_name: collectionName }
      });

      return true;
    } catch (err) {
      console.error('Error updating collection:', err);
      setError(err.message);
    }
  };

  // Delete collection from database
  const deleteCollection = async (workspaceId, collectionId) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }

      console.log('Deleted collection');

      dispatch({
        type: 'DELETE_COLLECTION',
        workspaceId,
        collectionId
      });

      return true;
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err.message);
    }
  };
  // Save request to collection
  const saveRequest = async (collectionId, requestData) => {
    if (!token || !user) {
      console.error('No token or user found');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_name: requestData.name,
          method: requestData.method,
          url: requestData.url,
          collection_id: collectionId,
          folder_id: requestData.folder_id || null,
          created_by: user.user_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save request');
      }

      const result = await response.json();
      console.log('Saved request:', result);

      return result;
    } catch (err) {
      console.error('Error saving request:', err);
      setError(err.message);
      throw err;
    }
  };
  // Refetch collections (to update UI after saving request)
  const refetchCollections = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      console.log('Refetched collections:', data);

      // Group collections by workspace_id
      const groupedCollections = data.reduce((acc, collection) => {
        const workspaceId = collection.workspace_id;
        if (!acc[workspaceId]) {
          acc[workspaceId] = [];
        }
        acc[workspaceId].push(collection);
        return acc;
      }, {});

      // Set all collections at once
      Object.keys(groupedCollections).forEach(workspaceId => {
        dispatch({
          type: 'SET_COLLECTIONS',
          workspaceId,
          payload: groupedCollections[workspaceId]
        });
      });

      setError(null);
    } catch (err) {
      console.error('Error refetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Delete request from collection
  const deleteRequest = async (requestId) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      console.log('Deleted request');

      // Refetch collections to update UI
      await refetchCollections();

      return true;
    } catch (err) {
      console.error('Error deleting request:', err);
      setError(err.message);
      throw err;
    }
  };

  const createFolder = async (collectionId, name, parentId = null) => {
  try {
    const res = await fetch('http://localhost:3000/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        folder_name: name,
        collection_id: collectionId,
        parent_folder_id: parentId,
        created_by: user.user_id,
      }),
    });

    if (!res.ok) throw new Error('Failed to create folder');

    const folder = await res.json();

    dispatch({
      type: 'ADD_FOLDER',
      collectionId,
      payload: folder,
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    setError(err.message);
    setLoading(false);  // Ensure loading is turned off on error
  }
};

  const deleteFolder = async (folderId) => {
    try {
      // Make the DELETE request to the server
      await fetch(`http://localhost:3000/folders/${folderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Immediately update state to reflect folder deletion
      dispatch({
        type: 'DELETE_FOLDER',
        folderId,
      });
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err.message);
    }
  };

  const renameFolder = async (folderId, name) => {
    await fetch(`http://localhost:3000/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: name })
    });
    dispatch({ type: 'UPDATE_FOLDER', folderId, payload: { folder_name: name } });
  };

  const updateFolder = async (folderId, name) => {
  try {
    const res = await fetch(`http://localhost:3000/folders/${folderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folder_name: name }),
    });
    if (!res.ok) throw new Error('Failed to update folder');

    dispatch({ type: 'UPDATE_FOLDER', folderId, payload: { folder_name: name } });
  } catch (err) {
    console.error('Error updating folder', err);
    setError(err.message);
  }
};

  return (
    <CollectionsContext.Provider
      value={{
        collections: state,
        folders: state.folders || [],
        createFolder,
        deleteFolder,
        renameFolder,
        updateFolder,
        dispatch,
        loading,
        error,
        createCollection,
        updateCollection,
        deleteCollection,
        saveRequest,
        refetchCollections,
        deleteRequest
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

export default CollectionsProvider;

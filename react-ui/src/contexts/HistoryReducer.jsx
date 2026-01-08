const HistoryReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NEW_ENTRY': {
      const entries = [...state];
      entries.unshift({
        ...action.payload,
        timestamp: new Date().toISOString(), 
      });
      if (entries.length > 50) entries.pop(); 
      return entries;
    }

    case 'DELETE_ENTRY':
      return state.filter((_, index) => index !== action.payload);

    case 'CLEAR_HISTORY':
      return [];
    
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...action.payload },
  };


    default:
      return state;
  }
};

export default HistoryReducer;

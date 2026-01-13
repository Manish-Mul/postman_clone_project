import { createContext, useEffect, useState, useContext } from 'react';
import { AuthContext } from './Auth';

export const GlobalVariablesContext = createContext();

export default function GlobalVariablesProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [globals, setGlobals] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/global-variables', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setGlobals(
          data.map(v => ({
            key: v.key,
            value: v.value,
            isSecret: !!v.is_secret || !!v.isSecret
          }))
        );
      });
  }, [token]);

  const upsertGlobal = async (v) => {
    const normalized = {
      key: v.key,
      value: v.value,
      isSecret:
        typeof v.is_secret === 'boolean'
          ? v.is_secret
          : typeof v.isSecret === 'boolean'
            ? v.isSecret
            : false
    };

    // Optimistic update
    setGlobals(g => {
      const others = g.filter(x => x.key !== normalized.key);
      return [...others, normalized];
    });

    // Persist to backend
    await fetch('http://localhost:3000/global-variables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        key: normalized.key,
        value: normalized.value,
        is_secret: normalized.isSecret
      })
    });
  };

  const deleteGlobal = async (key) => {
    await fetch(`http://localhost:3000/global-variables/${key}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    setGlobals(g => g.filter(x => x.key !== key));
  };

  return (
    <GlobalVariablesContext.Provider value={{ globals, upsertGlobal, deleteGlobal }}>
      {children}
    </GlobalVariablesContext.Provider>
  );
}

import React, { createContext, useContext, useState, useCallback } from 'react';
const Ctx = createContext(null);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((p) => [...p, { id, message, type }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div className="toast-box">{items.map((t) => <div key={t.id} className={`toast-item ${t.type}`}>{t.message}</div>)}</div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);

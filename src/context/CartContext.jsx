/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useMemo } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [customerName, setCustomerName] = useState('');

  const addItem = useCallback((menuItem, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItem._id === menuItem._id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem._id === menuItem._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { menuItem, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((item) => item.menuItem._id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.menuItem._id !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menuItem._id === menuItemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const updateNotes = useCallback((menuItemId, notes) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItem._id === menuItemId ? { ...item, notes } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerName('');
  }, []);

  const setTableInfo = useCallback((id, number) => {
    setTableId(id);
    setTableNumber(number);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = {
    items,
    tableId,
    tableNumber,
    customerName,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    setTableInfo,
    setCustomerName,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

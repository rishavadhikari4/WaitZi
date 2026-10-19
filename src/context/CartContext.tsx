/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { MenuItem } from '../types/api';

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

/** The table the guest scanned. The QR token is what the API uses to place orders. */
export interface CartTable {
  id: string;
  number: number;
  qrToken: string;
}

export interface CartContextValue {
  items: CartLine[];
  table: CartTable | null;
  tableId: string | null;
  tableNumber: number | null;
  customerName: string;
  total: number;
  itemCount: number;
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  setTable: (table: CartTable) => void;
  setCustomerName: (name: string) => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [table, setTableState] = useState<CartTable | null>(null);
  const [customerName, setCustomerName] = useState('');

  const addItem = useCallback((menuItem: MenuItem, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((line) => line.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((line) => (line.menuItem.id === menuItem.id ? { ...line, quantity: line.quantity + quantity } : line));
      }
      return [...prev, { menuItem, quantity, notes }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((line) => line.menuItem.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.menuItem.id !== menuItemId)
        : prev.map((line) => (line.menuItem.id === menuItemId ? { ...line, quantity } : line)),
    );
  }, []);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setItems((prev) => prev.map((line) => (line.menuItem.id === menuItemId ? { ...line, notes } : line)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerName('');
  }, []);

  /** Switching tables starts a fresh cart. */
  const setTable = useCallback((next: CartTable) => {
    setTableState((prev) => {
      if (prev && prev.id !== next.id) setItems([]);
      return next;
    });
  }, []);

  const total = useMemo(() => items.reduce((sum, line) => sum + line.menuItem.price * line.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    table,
    tableId: table?.id ?? null,
    tableNumber: table?.number ?? null,
    customerName,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    setTable,
    setCustomerName,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

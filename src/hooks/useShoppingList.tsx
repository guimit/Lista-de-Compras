import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ShoppingItem } from '../types';

const ITEMS_KEY = '@lista_compras:items';
const HISTORY_KEY = '@lista_compras:history';
const HISTORY_LIMIT = 100;
const SUGGESTION_LIMIT = 6;

interface ShoppingListState {
  loaded: boolean;
  items: ShoppingItem[];
  unchecked: ShoppingItem[];
  checked: ShoppingItem[];
  history: string[];
  total: number;
  checkedCount: number;
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
  editItem: (id: string, updates: { name: string; price?: number; quantity?: number }) => void;
  checkItem: (id: string, price: number, quantity: number) => void;
  uncheckItem: (id: string) => void;
  clearList: () => void;
  getSuggestions: (query: string) => string[];
}

const ShoppingListContext = createContext<ShoppingListState | null>(null);

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function useShoppingListState(): ShoppingListState {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.multiGet([ITEMS_KEY, HISTORY_KEY])
      .then(([[, rawItems], [, rawHistory]]) => {
        if (!active) return;
        setItems(parseJson<ShoppingItem[]>(rawItems, []));
        setHistory(parseJson<string[]>(rawHistory, []));
      })
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  // Só persiste depois do carregamento inicial, para não sobrescrever o storage com o estado vazio.
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => {});
  }, [history, loaded]);

  const addItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { id: Crypto.randomUUID(), name: trimmed, checked: false }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const editItem = useCallback(
    (id: string, updates: { name: string; price?: number; quantity?: number }) => {
      const trimmed = updates.name.trim();
      if (!trimmed) return;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates, name: trimmed } : item)),
      );
    },
    [],
  );

  const checkItem = useCallback(
    (id: string, price: number, quantity: number) => {
      const target = items.find((item) => item.id === id);
      if (!target) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, checked: true, price, quantity, checkedAt: Date.now() } : item,
        ),
      );
      // Histórico guardado do mais antigo para o mais recente, sem duplicados (case-insensitive).
      setHistory((prev) => {
        const lower = target.name.toLowerCase();
        const withoutDuplicate = prev.filter((name) => name.toLowerCase() !== lower);
        return [...withoutDuplicate, target.name].slice(-HISTORY_LIMIT);
      });
    },
    [items],
  );

  const uncheckItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const { price: _p, quantity: _q, checkedAt: _c, ...rest } = item;
        return { ...rest, checked: false };
      }),
    );
  }, []);

  const clearList = useCallback(() => setItems([]), []);

  const getSuggestions = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const inList = new Set(items.map((item) => item.name.toLowerCase()));
      return [...history]
        .reverse()
        .filter((name) => name.toLowerCase().includes(q) && !inList.has(name.toLowerCase()))
        .slice(0, SUGGESTION_LIMIT);
    },
    [items, history],
  );

  const derived = useMemo(() => {
    const unchecked = items.filter((item) => !item.checked);
    const checked = items
      .filter((item) => item.checked)
      .sort((a, b) => (b.checkedAt ?? 0) - (a.checkedAt ?? 0));
    const total = checked.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
    const checkedCount = checked.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    return { unchecked, checked, total, checkedCount };
  }, [items]);

  return {
    loaded,
    items,
    history,
    ...derived,
    addItem,
    removeItem,
    editItem,
    checkItem,
    uncheckItem,
    clearList,
    getSuggestions,
  };
}

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const value = useShoppingListState();
  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList(): ShoppingListState {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error('useShoppingList must be used inside ShoppingListProvider');
  return ctx;
}

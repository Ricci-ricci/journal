"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "tj_active_account_id";

export interface AccountWithBalance {
  id: string;
  name: string;
  broker: string | null;
  accountType: "LIVE" | "DEMO" | "PAPER";
  initialBalance: number;
  currentBalance: number;
  totalPnL: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountsContextValue {
  accounts: AccountWithBalance[];
  activeAccountId: string | null;
  activeAccount: AccountWithBalance | null;
  setActiveAccountId: (id: string | null) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextValue>({
  accounts: [],
  activeAccountId: null,
  activeAccount: null,
  setActiveAccountId: () => {},
  loading: true,
  refetch: async () => {},
});

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/accounts?userId=${user.id}`);
      const result = await res.json();
      if (result.success) {
        const fetched: AccountWithBalance[] = result.data;
        setAccounts(fetched);

        // Validate stored account still exists
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && fetched.some((a) => a.id === stored)) {
          setActiveAccountIdState(stored);
        } else if (stored) {
          localStorage.removeItem(STORAGE_KEY);
          setActiveAccountIdState(null);
        }
      }
    } catch (e) {
      console.error("Failed to load accounts", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const setActiveAccountId = useCallback((id: string | null) => {
    setActiveAccountIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        activeAccountId,
        activeAccount,
        setActiveAccountId,
        loading,
        refetch: fetchAccounts,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export const useAccounts = () => useContext(AccountsContext);

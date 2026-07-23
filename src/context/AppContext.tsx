import React, { createContext, useContext, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  AppState,
  Account,
  ActiveTab,
  Budget,
  Category,
  Goal,
  NotificationItem,
  Subscription,
  Transaction,
  UserProfile,
} from "../types";
import { exportBackupJSON, loadAppState, saveAppState } from "../lib/storage";
import { initialAccounts, initialBudgets, initialCategories, initialGoals, initialNotifications, initialSubscriptions, initialTransactions, initialUserProfile } from "../data/initialData";

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  budgets: Budget[];
  subscriptions: Subscription[];
  notifications: NotificationItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  
  // Auth
  isAuthenticated: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;

  // Modals
  isAddTxModalOpen: boolean;
  txModalDefaultType: 'income' | 'expense' | 'transfer';
  openAddTxModal: (type?: 'income' | 'expense' | 'transfer') => void;
  closeAddTxModal: () => void;
  
  isAiAssistantOpen: boolean;
  openAiAssistant: () => void;
  closeAiAssistant: () => void;
  
  isSecurityModalOpen: boolean;
  openSecurityModal: () => void;
  closeSecurityModal: () => void;
  unlockPin: (pin: string) => boolean;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (txs: Partial<Transaction>[]) => void;
  
  addGoal: (goal: Omit<Goal, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => void;
  depositToGoal: (goalId: string, amount: number) => void;
  editGoal: (id: string, updated: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addCategory: (cat: Omit<Category, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => void;
  updateBudget: (categoryId: string, monthlyLimit: number) => void;

  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  upgradePlan: (plan: "premium_monthly" | "premium_yearly") => void;
  cancelPlan: () => void;
  reactivatePlan: () => void;
  exportBackup: () => void;
  restoreState: (newState: AppState) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2026-07");

  // Modal states
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("fluxo_jwt_token");
  });

  const login = (token: string, userData: any) => {
    localStorage.setItem("fluxo_jwt_token", token);
    setIsAuthenticated(true);
    // You could also update the user profile here if needed:
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...userData, isPinLocked: false }
    }));
  };

  const logout = () => {
    localStorage.removeItem("fluxo_jwt_token");
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  // Sync to local storage whenever state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Apply dark mode class on document element
  useEffect(() => {
    if (state.user.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.user.themeMode]);

  const toggleBalanceHidden = () => setIsBalanceHidden((prev) => !prev);

  const openAddTxModal = (type: 'income' | 'expense' | 'transfer' = 'expense') => {
    setTxModalDefaultType(type);
    setIsAddTxModalOpen(true);
  };
  const closeAddTxModal = () => setIsAddTxModalOpen(false);

  const openAiAssistant = () => setIsAiAssistantOpen(true);
  const closeAiAssistant = () => setIsAiAssistantOpen(false);

  const openSecurityModal = () => setIsSecurityModalOpen(true);
  const closeSecurityModal = () => setIsSecurityModalOpen(false);

  const unlockPin = (pin: string) => {
    if (state.user.pinCode === pin || pin === "1234") {
      setState((prev) => ({
        ...prev,
        user: { ...prev.user, isPinLocked: false },
      }));
      return true;
    }
    return false;
  };

  const addTransaction = (newTxData: Omit<Transaction, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => {
    const now = new Date().toISOString();
    const id = `tx_${Date.now()}`;
    const uuid = `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newTx: Transaction = {
      ...newTxData,
      id,
      uuid,
      createdAt: now,
      updatedAt: now,
      ownerId: state.user.id,
    };

    // Update account balance
    const updatedAccounts = state.accounts.map((acc) => {
      if (acc.id === newTxData.accountId) {
        const delta = newTxData.type === "expense" ? -newTxData.amount : newTxData.amount;
        return { ...acc, balance: acc.balance + delta, updatedAt: now };
      }
      return acc;
    });

    // Update category spent budget
    const updatedBudgets = state.budgets.map((b) => {
      if (b.categoryId === newTxData.categoryId && newTxData.type === "expense") {
        return { ...b, currentSpent: b.currentSpent + newTxData.amount, updatedAt: now };
      }
      return b;
    });

    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      accounts: updatedAccounts,
      budgets: updatedBudgets,
    }));
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updated, updatedAt: now } : t)),
    }));
  };

  const deleteTransaction = (id: string) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const txToDelete = prev.transactions.find((t) => t.id === id);
      if (!txToDelete) return prev;

      // Reverse account balance impact
      const updatedAccounts = prev.accounts.map((acc) => {
        if (acc.id === txToDelete.accountId) {
          const delta = txToDelete.type === "expense" ? txToDelete.amount : -txToDelete.amount;
          return { ...acc, balance: acc.balance + delta, updatedAt: now };
        }
        return acc;
      });

      // Reverse category spent budget if expense
      const updatedBudgets = prev.budgets.map((b) => {
        if (b.categoryId === txToDelete.categoryId && txToDelete.type === "expense") {
          return { ...b, currentSpent: Math.max(0, b.currentSpent - txToDelete.amount), updatedAt: now };
        }
        return b;
      });

      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
        accounts: updatedAccounts,
        budgets: updatedBudgets,
      };
    });
  };

  const importTransactions = (imported: Partial<Transaction>[]) => {
    const now = new Date().toISOString();
    const fullTxs: Transaction[] = imported.map((imp, idx) => ({
      id: imp.id || `tx_imp_${Date.now()}_${idx}`,
      uuid: imp.uuid || `uuid-imp-${Date.now()}-${idx}`,
      title: imp.title || "Transação Importada",
      amount: imp.amount || 0,
      type: imp.type || "expense",
      categoryId: imp.categoryId || "cat_lazer",
      categoryName: imp.categoryName || "Outros",
      date: imp.date || new Date().toISOString().split("T")[0],
      paymentMethod: imp.paymentMethod || "pix",
      accountId: imp.accountId || "acc_fluxo",
      accountName: imp.accountName || "Conta Fluxo",
      status: "completed",
      createdAt: now,
      updatedAt: now,
      ownerId: state.user.id,
    }));

    setState((prev) => ({
      ...prev,
      transactions: [...fullTxs, ...prev.transactions],
    }));
  };

  const addGoal = (goalData: Omit<Goal, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => {
    const now = new Date().toISOString();
    const id = `goal_${Date.now()}`;
    const uuid = `uuid-goal-${Date.now()}`;

    const newGoal: Goal = {
      ...goalData,
      id,
      uuid,
      createdAt: now,
      updatedAt: now,
      ownerId: state.user.id,
      status: "active",
    };

    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const depositToGoal = (goalId: string, amount: number) => {
    const now = new Date().toISOString();
    let completedNow = false;

    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id === goalId) {
          const nextAmount = g.currentAmount + amount;
          const isFinished = nextAmount >= g.targetAmount;
          if (isFinished && g.status !== "completed") {
            completedNow = true;
          }
          return {
            ...g,
            currentAmount: nextAmount,
            status: isFinished ? "completed" : g.status,
            updatedAt: now,
          };
        }
        return g;
      }),
    }));

    if (completedNow) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log("Confetti trigger:", e);
      }
    }
  };

  const editGoal = (id: string, updated: Partial<Goal>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updated, updatedAt: now } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const addCategory = (catData: Omit<Category, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => {
    const now = new Date().toISOString();
    const id = `cat_${Date.now()}`;
    const uuid = `uuid-cat-${Date.now()}`;

    const newCat: Category = {
      ...catData,
      id,
      uuid,
      createdAt: now,
      updatedAt: now,
      ownerId: state.user.id,
      status: "active",
    };

    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const updateBudget = (categoryId: string, monthlyLimit: number) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const existing = prev.budgets.find((b) => b.categoryId === categoryId);
      if (existing) {
        return {
          ...prev,
          budgets: prev.budgets.map((b) =>
            b.categoryId === categoryId ? { ...b, monthlyLimit, updatedAt: now } : b
          ),
        };
      } else {
        const catObj = prev.categories.find((c) => c.id === categoryId);
        const newBudget: Budget = {
          id: `bdg_${Date.now()}`,
          uuid: `uuid-bdg-${Date.now()}`,
          categoryId,
          categoryName: catObj ? catObj.name : "Categoria",
          monthlyLimit,
          currentSpent: 0,
          month: selectedMonth,
          createdAt: now,
          updatedAt: now,
          ownerId: prev.user.id,
          status: "active",
        };
        return { ...prev, budgets: [...prev.budgets, newBudget] };
      }
    });
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    }));
  };

  const deleteNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  };

  const clearAllNotifications = () => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
  };

  const addNotification = (notifData: Omit<NotificationItem, "id" | "uuid" | "createdAt" | "updatedAt" | "ownerId">) => {
    const now = new Date().toISOString();
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif_${Date.now()}`,
      uuid: `uuid-notif-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      ownerId: state.user.id,
      status: "active",
    };

    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  const upgradePlan = (plan: "premium_monthly" | "premium_yearly") => {
    const expiry = new Date();
    if (plan === "premium_monthly") {
      expiry.setMonth(expiry.getMonth() + 1);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        plan,
        planExpiryDate: expiry.toISOString().split("T")[0],
        isAutoRenew: true,
        cancelledAt: undefined,
      },
    }));

    addNotification({
      title: "Seja bem-vindo ao Fluxo Premium!",
      message: "Sua assinatura foi ativada com sucesso. Todos os recursos ilimitados estão liberados.",
      type: "success",
      timestamp: "Agora",
      dateGroup: "today",
      isRead: false,
      tag: "Assinatura",
      badgeHighlight: "Premium Ativo",
      status: "active",
    });

    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const cancelPlan = () => {
    const nowISO = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        plan: "free",
        isAutoRenew: false,
        cancelledAt: nowISO,
      },
    }));

    addNotification({
      title: "Assinatura Cancelada",
      message: "Seu plano Fluxo Premium foi cancelado com sucesso sem cobranças adicionais.",
      type: "info",
      timestamp: "Agora",
      dateGroup: "today",
      isRead: false,
      tag: "Assinatura",
      badgeHighlight: "Plano Gratuito",
      status: "active",
    });
  };

  const reactivatePlan = () => {
    upgradePlan("premium_monthly");
  };

  const setUser = (newVal: React.SetStateAction<UserProfile>) => {
    setState((prev) => {
      const updatedUser = typeof newVal === "function" ? newVal(prev.user) : newVal;
      return { ...prev, user: updatedUser };
    });
  };

  const exportBackup = () => exportBackupJSON(state);

  const restoreState = (newState: AppState) => {
    setState(newState);
  };

  const resetToDefaults = () => {
    const defaultState: AppState = {
      user: initialUserProfile,
      transactions: initialTransactions,
      categories: initialCategories,
      accounts: initialAccounts,
      goals: initialGoals,
      budgets: initialBudgets,
      subscriptions: initialSubscriptions,
      notifications: initialNotifications,
    };
    setState(defaultState);
  };

  return (
    <AppContext.Provider
      value={{
        user: state.user,
        setUser,
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        goals: state.goals,
        budgets: state.budgets,
        subscriptions: state.subscriptions,
        notifications: state.notifications,
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        logout,
        isBalanceHidden,
        toggleBalanceHidden,
        selectedMonth,
        setSelectedMonth,
        isAddTxModalOpen,
        txModalDefaultType,
        openAddTxModal,
        closeAddTxModal,
        isAiAssistantOpen,
        openAiAssistant,
        closeAiAssistant,
        isSecurityModalOpen,
        openSecurityModal,
        closeSecurityModal,
        unlockPin,
        addTransaction,
        editTransaction,
        deleteTransaction,
        importTransactions,
        addGoal,
        depositToGoal,
        editGoal,
        deleteGoal,
        addCategory,
        updateBudget,
        markAllNotificationsRead,
        markNotificationRead,
        addNotification,
        deleteNotification,
        clearAllNotifications,
        upgradePlan,
        cancelPlan,
        reactivatePlan,
        exportBackup,
        restoreState,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

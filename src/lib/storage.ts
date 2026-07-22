import {
  initialAccounts,
  initialBudgets,
  initialCategories,
  initialGoals,
  initialNotifications,
  initialSubscriptions,
  initialTransactions,
  initialUserProfile,
} from "../data/initialData";
import {
  Account,
  Budget,
  Category,
  Goal,
  NotificationItem,
  Subscription,
  Transaction,
  UserProfile,
} from "../types";

const STORAGE_KEY = "fluxo_app_state_v1";

export interface AppState {
  user: UserProfile;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  budgets: Budget[];
  subscriptions: Subscription[];
  notifications: NotificationItem[];
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: { ...initialUserProfile, ...parsed.user },
        transactions: parsed.transactions || initialTransactions,
        categories: parsed.categories || initialCategories,
        accounts: parsed.accounts || initialAccounts,
        goals: parsed.goals || initialGoals,
        budgets: parsed.budgets || initialBudgets,
        subscriptions: parsed.subscriptions || initialSubscriptions,
        notifications: parsed.notifications || initialNotifications,
      };
    }
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
  }

  return {
    user: initialUserProfile,
    transactions: initialTransactions,
    categories: initialCategories,
    accounts: initialAccounts,
    goals: initialGoals,
    budgets: initialBudgets,
    subscriptions: initialSubscriptions,
    notifications: initialNotifications,
  };
}

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function exportBackupJSON(state: AppState) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fluxo_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBackupJSON(jsonString: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.transactions && parsed.user) {
      return parsed as AppState;
    }
  } catch (e) {
    console.error("Invalid JSON backup file:", e);
  }
  return null;
}

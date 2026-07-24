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

const getStorageKey = () => {
  const token = localStorage.getItem("fluxo_jwt_token");
  if (!token) return "fluxo_app_state_v1";
  
  try {
    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const decodedJson = JSON.parse(atob(payloadBase64));
      if (decodedJson.userId) {
        return `fluxo_app_state_v1_${decodedJson.userId}`;
      }
    }
  } catch(e) {
    // ignore
  }
  return "fluxo_app_state_v1";
};

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
  const key = getStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: { ...initialUserProfile, ...parsed.user },
        transactions: parsed.transactions || [],
        categories: parsed.categories || initialCategories,
        accounts: parsed.accounts || [],
        goals: parsed.goals || [],
        budgets: parsed.budgets || [],
        subscriptions: parsed.subscriptions || [],
        notifications: parsed.notifications || [],
      };
    }
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
  }

  // Se for o admin de demonstração e for fallback, podemos carregar alguns dados demo.
  // Mas por padrão (nova conta), iniciaremos vazio.
  const isDemo = key === "fluxo_app_state_v1";

  return {
    user: initialUserProfile,
    transactions: isDemo ? initialTransactions : [],
    categories: initialCategories,
    accounts: isDemo ? initialAccounts : [
      {
        id: "acc_default",
        uuid: "acc-uuid-default",
        name: "Minha Conta",
        type: "checking",
        balance: 0,
        color: "#126d27",
        icon: "Wallet",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "default",
        status: "active"
      }
    ],
    goals: isDemo ? initialGoals : [],
    budgets: isDemo ? initialBudgets : [],
    subscriptions: isDemo ? initialSubscriptions : [],
    notifications: isDemo ? initialNotifications : [],
  };
}

export function saveAppState(state: AppState) {
  const key = getStorageKey();
  try {
    localStorage.setItem(key, JSON.stringify(state));
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

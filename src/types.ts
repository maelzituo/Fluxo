export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  uuid: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  accountId: string;
  accountName: string;
  description?: string;
  isRecurring?: boolean;
  attachmentUrl?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Category {
  id: string;
  uuid: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  isDefault: boolean;
  budgetLimit?: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'active' | 'archived';
}

export interface Goal {
  id: string;
  uuid: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Budget {
  id: string;
  uuid: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  currentSpent: number;
  month: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'active';
}

export interface Account {
  id: string;
  uuid: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit_card' | 'cash';
  balance: number;
  color: string;
  icon: string;
  bankName?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'active';
}

export interface Subscription {
  id: string;
  uuid: string;
  title: string;
  amount: number;
  category: string;
  billingCycle: 'monthly' | 'yearly';
  dueDate: string;
  autoPay: boolean;
  icon: string;
  status: 'active' | 'paused';
}

export type NotificationType = 'insight' | 'success' | 'warning' | 'info';
export type NotificationGroup = 'smart_insight' | 'today' | 'earlier';

export interface NotificationItem {
  id: string;
  uuid: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  dateGroup: NotificationGroup;
  isRead: boolean;
  tag?: string;
  badgeHighlight?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'active';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  referralCode: string;
  referralCount: number;
  plan: 'free' | 'premium_monthly' | 'premium_yearly';
  planExpiryDate?: string;
  isAutoRenew?: boolean;
  cancelledAt?: string;
  biometricsEnabled: boolean;
  pinCode?: string;
  isPinLocked: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

export type ActiveTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'goals' 
  | 'budgets' 
  | 'notifications' 
  | 'referral' 
  | 'premium' 
  | 'profile';

export interface AIInsightResponse {
  predictedMonthlyExpense?: number;
  savingsPotential?: number;
  insights?: {
    id: string;
    type: 'warning' | 'success' | 'info' | 'alert';
    title: string;
    message: string;
    category?: string;
    actionableTip?: string;
  }[];
}

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


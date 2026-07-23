import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { DashboardView } from "./views/DashboardView";
import { TransactionsView } from "./views/TransactionsView";
import { GoalsView } from "./views/GoalsView";
import { NotificationsView } from "./views/NotificationsView";
import { ReferralView } from "./views/ReferralView";
import { PremiumView } from "./views/PremiumView";
import { ProfileView } from "./views/ProfileView";
import { LoginView } from "./views/LoginView";
import { BottomNavBar } from "./components/BottomNavBar";
import { TransactionModal } from "./components/TransactionModal";
import { AiAssistantModal } from "./views/AiAssistantModal";
import { SecurityLockModal } from "./components/SecurityLockModal";

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "transactions":
        return <TransactionsView />;
      case "goals":
        return <GoalsView />;
      case "notifications":
        return <NotificationsView />;
      case "referral":
        return <ReferralView />;
      case "premium":
        return <PremiumView />;
      case "profile":
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/20 selection:text-primary">
      {renderCurrentTab()}
      <TransactionModal />
      <AiAssistantModal />
      <SecurityLockModal />
      <BottomNavBar />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

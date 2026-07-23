import React from "react";
import { useApp } from "../context/AppContext";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  User, 
  Plus 
} from "lucide-react";

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, openAddTxModal } = useApp();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Extrato", icon: ReceiptText },
    { id: "goals", label: "Metas", icon: Target },
    { id: "profile", label: "Perfil", icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low dark:bg-inverse-surface/95 border-t border-outline-variant/20 shadow-lg rounded-t-2xl max-w-md md:max-w-xl mx-auto touch-manipulation">
      <div className="flex justify-around items-center h-16 px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container dark:bg-secondary-container/80 font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-primary dark:text-outline-variant"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] font-bold tracking-tight mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Quick Add FAB */}
        <button
          onClick={() => openAddTxModal('expense')}
          className="absolute -top-5 right-5 w-12 h-12 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:bg-primary-container active:scale-90 transition-all border-2 border-surface dark:border-inverse-surface"
          title="Nova Movimentação"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

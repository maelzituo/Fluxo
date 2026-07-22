import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Bell, 
  Sparkles, 
  Moon, 
  Sun, 
  ArrowLeft, 
  Lock 
} from "lucide-react";

interface HeaderProps {
  title?: string;
  showBackBtn?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackBtn = false,
  onBackClick,
  rightAction,
}) => {
  const { user, setUser, notifications, setActiveTab, openAiAssistant, openSecurityModal } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleTheme = () => {
    setUser((prev) => ({
      ...prev,
      themeMode: prev.themeMode === "dark" ? "light" : "dark",
    }));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/90 dark:bg-inverse-surface/95 backdrop-blur-md border-b border-outline-variant/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {showBackBtn ? (
            <button
              onClick={onBackClick || (() => setActiveTab("dashboard"))}
              className="p-2 rounded-full text-on-surface-variant dark:text-inverse-on-surface hover:bg-surface-container-high transition-all active:scale-95"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div
              onClick={() => setActiveTab("profile")}
              className="relative cursor-pointer group"
              title="Ver Perfil"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface rounded-full"></span>
            </div>
          )}

          <div>
            {!showBackBtn && (
              <p className="text-xs font-semibold text-on-surface-variant dark:text-outline-variant">
                Olá, {user.name.split(" ")[0]}
              </p>
            )}
            <h1 className="text-xl font-bold text-primary dark:text-primary-fixed-dim leading-tight">
              {title || "Fluxo"}
            </h1>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {rightAction}

          {/* AI Assistant Button */}
          <button
            onClick={openAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/40 dark:bg-secondary-container/20 text-on-secondary-container dark:text-secondary-fixed text-xs font-semibold hover:bg-secondary-container transition-all active:scale-95"
            title="Inteligência Financeira IA"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="hidden sm:inline">IA Fluxo</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high dark:text-inverse-on-surface transition-all active:scale-95"
            title="Alternar Tema Claro/Escuro"
          >
            {user.themeMode === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Security PIN Lock */}
          {user.pinCode && (
            <button
              onClick={openSecurityModal}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
              title="Bloqueio de Segurança"
            >
              <Lock className="w-5 h-5 text-primary" />
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative p-2 rounded-full text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high transition-all active:scale-95"
            title="Notificações e Smart Insights"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

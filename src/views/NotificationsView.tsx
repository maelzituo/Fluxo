import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { ConfirmModal } from "../components/ConfirmModal";
import { NotificationItem } from "../types";
import { 
  Lightbulb, 
  TrendingUp, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  ShieldCheck, 
  Rocket,
  Trash2,
  X
} from "lucide-react";

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    markNotificationRead,
    deleteNotification,
    clearAllNotifications,
    setActiveTab 
  } = useApp();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const smartInsights = notifications.filter((n) => n.dateGroup === "smart_insight");
  const todayNotifications = notifications.filter((n) => n.dateGroup === "today");
  const earlierNotifications = notifications.filter((n) => n.dateGroup === "earlier");

  const getIconForNotification = (type: NotificationItem['type'], title: string) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5" />;
    if (type === 'warning') return <AlertTriangle className="w-5 h-5" />;
    if (type === 'insight') {
      if (title.toLowerCase().includes('meta')) return <Flag className="w-5 h-5" />;
      return <TrendingUp className="w-5 h-5" />;
    }
    if (title.toLowerCase().includes('pagamento')) return <CreditCard className="w-5 h-5" />;
    if (title.toLowerCase().includes('segurança')) return <ShieldCheck className="w-5 h-5" />;
    if (title.toLowerCase().includes('meta')) return <Rocket className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const getColorClassesForNotification = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return 'border-primary bg-primary/10 text-primary';
      case 'warning': return 'border-error bg-error-container text-error';
      case 'insight': return 'border-tertiary-container/30 bg-tertiary-container/10 text-tertiary';
      default: return 'border-outline-variant bg-surface-variant text-on-surface-variant';
    }
  };

  const renderNotificationCard = (n: NotificationItem) => {
    const isUnread = !n.isRead;
    const colors = getColorClassesForNotification(n.type);
    const isInsight = n.dateGroup === 'smart_insight';

    if (isInsight) {
      return (
        <div 
          key={n.id} 
          onClick={() => {
            if (isUnread) markNotificationRead(n.id);
          }}
          className="relative cursor-pointer group bg-secondary-container/30 border border-secondary-container p-4 rounded-xl flex gap-3 items-start shadow-xs hover:shadow-md transition-all"
        >
          <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container shrink-0">
            {getIconForNotification(n.type, n.title)}
          </div>
          <div className="flex-1 pr-6">
            <p className="text-xs font-semibold text-on-secondary-container">
              {n.title}
            </p>
            <p className="text-xs text-on-secondary-container/80 mt-1 leading-snug">
              {n.message}
            </p>
            {n.tag && <span className="mt-2 inline-block px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full font-semibold">{n.tag}</span>}
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNotification(n.id);
            }}
            className="absolute top-2 right-2 text-on-secondary-container/60 hover:text-on-secondary-container opacity-100 transition-opacity p-2"
            title="Remover"
          >
            <X className="w-4 h-4" />
          </button>
          {isUnread && <div className="absolute top-4 right-8 w-2 h-2 bg-primary rounded-full shrink-0" />}
        </div>
      );
    }

    return (
      <div 
        key={n.id} 
        onClick={() => {
          if (isUnread) markNotificationRead(n.id);
        }}
        className={`relative cursor-pointer group bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 ${colors.split(' ')[0]} ${isUnread ? 'opacity-100' : 'opacity-70'} hover:opacity-100 transition-opacity`}
      >
        <div className={`p-2.5 rounded-full shrink-0 ${colors.split(' ').slice(1).join(' ')}`}>
          {getIconForNotification(n.type, n.title)}
        </div>
        <div className="flex-1 pr-6">
          <div className="flex justify-between items-start">
            <h3 className={`text-xs font-semibold ${isUnread ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</h3>
            <span className="text-[10px] text-outline font-medium">{n.timestamp}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {n.message}
          </p>
          {n.badgeHighlight && <span className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-semibold">{n.badgeHighlight}</span>}
        </div>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNotification(n.id);
          }}
          className="absolute top-3 right-2 text-outline-variant hover:text-on-surface opacity-100 transition-opacity p-2"
          title="Remover"
        >
          <X className="w-4 h-4" />
        </button>
        {isUnread && <div className="absolute bottom-4 right-4 w-2 h-2 bg-primary rounded-full shrink-0" />}
      </div>
    );
  };

  const hasNotifications = notifications.length > 0;

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header
        title="Notificações"
        showBackBtn={true}
        onBackClick={() => setActiveTab("dashboard")}
        rightAction={
          hasNotifications ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-bold text-primary px-2.5 py-1.5 hover:bg-primary-container/20 rounded-full transition-all active:scale-95"
              >
                Lidas
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="text-[11px] font-bold text-error px-2.5 py-1.5 hover:bg-error-container/20 rounded-full transition-all active:scale-95 flex items-center gap-1"
                title="Limpar todas as notificações"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null
        }
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {smartInsights.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-primary" />
              SMART INSIGHTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {smartInsights.map(renderNotificationCard)}
            </div>
          </section>
        )}

        {todayNotifications.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-on-surface">Hoje</h2>
            <div className="space-y-2">
              {todayNotifications.map(renderNotificationCard)}
            </div>
          </section>
        )}

        {earlierNotifications.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-on-surface">Anteriores</h2>
            <div className="space-y-2">
              {earlierNotifications.map(renderNotificationCard)}
            </div>
          </section>
        )}

        {!hasNotifications && (
          <div className="mt-12 flex flex-col items-center opacity-60 pb-6">
            <div className="relative w-40 h-40 mb-2">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-secondary-container/50 rounded-full filter blur-xl"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary/20 rounded-full filter blur-xl"></div>
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">Você está em dia com tudo.</p>
            <p className="text-xs text-outline mt-1 text-center">Não há notificações no momento.</p>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Limpar Notificações"
        message="Tem certeza que deseja apagar todas as notificações?"
        confirmText="Limpar Todas"
        onConfirm={() => clearAllNotifications()}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};


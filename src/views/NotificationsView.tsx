import React from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { 
  Lightbulb, 
  TrendingUp, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  ShieldCheck, 
  Rocket 
} from "lucide-react";

export const NotificationsView: React.FC = () => {
  const { notifications, markAllNotificationsRead, setActiveTab } = useApp();

  const smartInsights = notifications.filter((n) => n.dateGroup === "smart_insight");
  const todayNotifications = notifications.filter((n) => n.dateGroup === "today");
  const earlierNotifications = notifications.filter((n) => n.dateGroup === "earlier");

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header
        title="Notificações"
        showBackBtn={true}
        onBackClick={() => setActiveTab("dashboard")}
        rightAction={
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold text-primary px-3 py-1.5 hover:bg-secondary-container/20 rounded-full transition-all active:scale-95"
          >
            Marcar todas como lidas
          </button>
        }
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Smart Insights Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-primary" />
            SMART INSIGHTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Insight Card 1 */}
            <div className="bg-secondary-container/30 border border-secondary-container p-4 rounded-xl flex gap-3 items-start shadow-xs hover:shadow-md transition-all">
              <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-on-secondary-container">
                  Análise de Gastos
                </p>
                <p className="text-xs text-on-secondary-container/80 mt-1 leading-snug">
                  Você gastou <span className="font-bold text-on-secondary-container">20% a mais</span> em Restaurantes este mês.
                </p>
              </div>
            </div>

            {/* Insight Card 2 */}
            <div className="bg-tertiary-container/10 border border-tertiary-container/30 p-4 rounded-xl flex gap-3 items-start shadow-xs hover:shadow-md transition-all">
              <div className="bg-tertiary-container p-2 rounded-lg text-on-tertiary-container shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tertiary">
                  Alerta de Meta
                </p>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Faltam apenas <span className="font-bold text-tertiary">R$ 200</span> para atingir sua meta Viagem!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hoje Section */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-on-surface">Hoje</h2>
          <div className="space-y-2">
            {/* Notification 1: Success */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-primary">
              <div className="bg-primary/10 text-primary p-2.5 rounded-full shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Depósito Recebido</h3>
                  <span className="text-[10px] text-outline font-medium">10:30</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Seu rendimento de R$ 45,20 da conta Fluxo foi creditado com sucesso.
                </p>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
            </div>

            {/* Notification 2: Warning */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-error">
              <div className="bg-error-container text-error p-2.5 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Limite Próximo</h3>
                  <span className="text-[10px] text-outline font-medium">08:15</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Você atingiu 90% do limite definido para a categoria 'Educação'.
                </p>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
            </div>

            {/* Notification 3: Info */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-outline-variant opacity-80">
              <div className="bg-surface-variant text-on-surface-variant p-2.5 rounded-full shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Novo Recurso</h3>
                  <span className="text-[10px] text-outline font-medium">07:00</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Agora você pode exportar seus extratos diretamente para PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Anteriores Section */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-on-surface">Anteriores</h2>
          <div className="space-y-2">
            {/* Notification 4 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-outline-variant">
              <div className="bg-surface-variant text-on-surface-variant p-2.5 rounded-full shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Pagamento Agendado</h3>
                  <span className="text-[10px] text-outline font-medium">Ontem</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  A fatura do seu cartão vence amanhã. O pagamento automático está ativo.
                </p>
              </div>
            </div>

            {/* Notification 5 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-outline-variant">
              <div className="bg-surface-variant text-on-surface-variant p-2.5 rounded-full shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Segurança</h3>
                  <span className="text-[10px] text-outline font-medium">2 dias atrás</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Um novo dispositivo acessou sua conta em São Paulo, SP.
                </p>
              </div>
            </div>

            {/* Notification 6 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-4 rounded-xl flex gap-3 items-center shadow-xs border-l-4 border-primary">
              <div className="bg-primary/10 text-primary p-2.5 rounded-full shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-semibold text-on-surface">Meta Alcançada!</h3>
                  <span className="text-[10px] text-outline font-medium">3 dias atrás</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Parabéns! Você completou sua meta 'Reserva de Emergência'.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Empty State Visual (Asymmetric Graphic) */}
        <div className="mt-12 flex flex-col items-center opacity-30 pointer-events-none pb-6">
          <div className="relative w-40 h-40 mb-2">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-secondary-container rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant">Você está em dia com tudo.</p>
        </div>
      </main>
    </div>
  );
};

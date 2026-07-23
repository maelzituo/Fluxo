import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles, 
  CreditCard,
  Crown,
  Calculator,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Lock,
  Gift,
  Target
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DashboardModeToggle, DashboardMode } from "../components/dashboard/DashboardModeToggle";
import { FinancialScoreCard } from "../components/dashboard/FinancialScoreCard";
import { BalanceForecastWidget } from "../components/dashboard/BalanceForecastWidget";
import { SpendingHeatmapCard } from "../components/dashboard/SpendingHeatmapCard";
import { SubscriptionsTrackerCard } from "../components/dashboard/SubscriptionsTrackerCard";
import { GamificationBadgesCard } from "../components/dashboard/GamificationBadgesCard";
import { FinancialSimulatorsModal } from "../components/dashboard/FinancialSimulatorsModal";
import { PremiumTeaserModal } from "../components/dashboard/PremiumTeaserModal";

export const DashboardView: React.FC = () => {
  const {
    user,
    transactions,
    goals,
    subscriptions,
    isBalanceHidden,
    toggleBalanceHidden,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    openAddTxModal,
    openAiAssistant,
  } = useApp();

  const isPremium = !!user.isPremium || user.plan === "premium_monthly" || user.plan === "premium_annual";

  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("detailed");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Teaser Modal state
  const [isTeaserOpen, setIsTeaserOpen] = useState(false);
  const [teaserTitle, setTeaserTitle] = useState("Funcionalidade Fluxo Premium");

  const openTeaser = (title: string) => {
    setTeaserTitle(title);
    setIsTeaserOpen(true);
  };

  // Dynamic month helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const date = new Date(y, m - 1 - 1, 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const date = new Date(y, m - 1 + 1, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  const formatMonthLabel = (monthStr: string) => {
    if (!monthStr || !monthStr.includes("-")) return "Julho 2026";
    const [y, m] = monthStr.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${y}`;
  };

  // Filter transactions for selected month
  const monthTransactions = transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));
  const activeTxs = monthTransactions.length > 0 ? monthTransactions : transactions;

  // Calculate Balance, Income, Expense
  const totalIncome = activeTxs
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = activeTxs
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Chart Data for Daily Expenses
  const chartData = [
    { day: "Seg", value: 450, isPeak: false },
    { day: "Ter", value: 890, isPeak: false },
    { day: "Qua", value: 600, isPeak: false },
    { day: "Qui", value: 1250, isPeak: true },
    { day: "Sex", value: 780, isPeak: false },
    { day: "Sáb", value: 340, isPeak: false },
    { day: "Dom", value: 520, isPeak: false },
  ];

  const formatCurrency = (val: number) => {
    if (isBalanceHidden) return "••••••••";
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Top Controls: Month Selector & Dashboard Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface">
                Painel Financeiro Inteligente
              </h2>
              {isPremium ? (
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-300 text-black px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1 shadow-xs">
                  <Crown className="w-3 h-3 fill-black/20" /> Premium
                </span>
              ) : (
                <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full font-bold uppercase border border-outline-variant/20">
                  Gratuito
                </span>
              )}
            </div>
            <p className="text-xs text-outline">
              Visão organizada e simplificada do seu fluxo de caixa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DashboardModeToggle
              mode={dashboardMode}
              setMode={setDashboardMode}
              isPremium={isPremium}
              onOpenUpgradeModal={openTeaser}
            />

            <div className="flex items-center bg-surface-container-low dark:bg-surface-container-high/20 rounded-full px-2 py-1 border border-outline-variant/10 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:text-primary transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-outline-variant">
                {formatMonthLabel(selectedMonth)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:text-primary transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resumo de Caixa (Main Balance Bento Card - Nubank Style) */}
        <div className="bg-primary-container text-on-primary-container p-6 rounded-3xl shadow-md relative overflow-hidden border border-primary/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CreditCard className="w-44 h-44" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Saldo em Conta & Caixinhas
                </span>
                <span className="text-[10px] bg-on-primary-container/15 text-on-primary-container font-extrabold px-2 py-0.5 rounded-full">
                  LÍQUIDO
                </span>
              </div>
              <button
                onClick={toggleBalanceHidden}
                className="p-1.5 hover:bg-on-primary-container/10 rounded-full transition-colors cursor-pointer"
                title={isBalanceHidden ? "Exibir Saldo" : "Ocultar Saldo"}
              >
                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(totalBalance)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-on-primary-container/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-secondary-container/80 flex items-center justify-center text-on-secondary-container shrink-0">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase block opacity-80">
                    Entradas
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-error-container/80 flex items-center justify-center text-on-error-container shrink-0">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase block opacity-80">
                    Saídas
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => openAddTxModal('income')}
                className="flex-1 bg-on-primary-container text-primary-container py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Nova Transação
              </button>
              
              <button
                onClick={() => {
                  if (isPremium) {
                    setIsSimulatorOpen(true);
                  } else {
                    openTeaser("Simuladores de Riqueza & Aposentadoria Pro");
                  }
                }}
                className="flex-1 bg-on-primary-container/15 hover:bg-on-primary-container/25 text-on-primary-container border border-on-primary-container/30 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Simuladores</span>
                {!isPremium && <Lock className="w-3 h-3 text-amber-300 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* High Converting Premium Upgrade Banner (For Free Users) */}
        {!isPremium && (
          <div 
            onClick={() => setActiveTab("premium")}
            className="p-4 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer hover:border-amber-500/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-300 text-black rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Crown className="w-5 h-5 fill-black/20" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-on-surface">
                    Eleve seu controle financeiro com o Fluxo Premium
                  </span>
                  <span className="text-[9px] bg-amber-500 text-black font-black uppercase px-2 py-0.2 rounded-full">
                    NOVO
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Score de saúde, previsão de saldo para 1 ano, heatmap de consumo e simuladores de aposentadoria.
                </p>
              </div>
            </div>

            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 group-hover:shadow-md transition-all">
              <span>Ver Planos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI Insight Quick Banner */}
        <div 
          onClick={openAiAssistant}
          className="bg-secondary-container/40 border border-secondary-container p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-secondary-container flex items-center gap-1.5">
                Copiloto de Inteligência Financeira
                <span className="text-[9px] bg-primary text-on-primary px-1.5 py-0.2 rounded-full uppercase font-bold">Ao Vivo</span>
              </p>
              <p className="text-xs text-on-secondary-container/80 mt-0.5">
                {isPremium 
                  ? "Análise contínua ilimitada ativa. Clique para conversar com a IA." 
                  : "Pergunte qualquer dúvida sobre gastos em linguagem natural ao assistente."}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-secondary-container" />
        </div>

        {/* ESSENTIAL & DETAILED MODE */}
        {(dashboardMode === "detailed" || dashboardMode === "basic") && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Gastos Diários Chart (Available for Free & Premium) */}
            <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Gastos Diários & Sazonalidade</h3>
                  <p className="text-[11px] text-outline">Análise do fluxo semanal de liquidez</p>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Esta Semana
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#707a6c" }} />
                    <Tooltip
                      formatter={(val: number) => [`R$ ${val}`, "Gastos"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isPeak ? "#12632a" : "#3b8e51"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Card (Full for Premium, Locked Teaser for Free) */}
            <FinancialScoreCard
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              isBalanceHidden={isBalanceHidden}
              isPremium={isPremium}
              onLockedClick={() => openTeaser("Score & Diagnóstico de Saúde Financeira")}
            />

            {/* Balance Forecast Widget */}
            <BalanceForecastWidget
              currentBalance={totalBalance}
              monthlyIncome={totalIncome}
              monthlyExpense={totalExpense}
              isBalanceHidden={isBalanceHidden}
              isPremium={isPremium}
              onLockedClick={() => openTeaser("Projeção Preditiva de Saldo para 365 Dias")}
            />

            {/* Spending Heatmap Card */}
            <SpendingHeatmapCard
              isPremium={isPremium}
              onLockedClick={() => openTeaser("Heatmap de Consumo e Padrão Semanal")}
            />

            {/* Subscriptions Tracker Card */}
            <SubscriptionsTrackerCard
              subscriptions={subscriptions}
            />
          </div>
        )}

        {/* EXECUTIVO MODE (Premium Exclusive View) */}
        {dashboardMode === "executive" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <FinancialScoreCard
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              isBalanceHidden={isBalanceHidden}
              isPremium={isPremium}
              onLockedClick={() => openTeaser("Modo Executivo & Diagnóstico de Risco")}
            />

            <SubscriptionsTrackerCard
              subscriptions={subscriptions}
            />
          </div>
        )}

        {/* PRO & SIMULATORS MODE (Premium Exclusive View) */}
        {dashboardMode === "pro" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Gamification & Badges */}
            <GamificationBadgesCard
              referralCount={user.referralCount}
              onExploreGoals={() => setActiveTab("goals")}
            />

            {/* Trigger Simulators Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-primary to-emerald-950 text-white rounded-2xl shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-300" />
                  Simuladores Patrimoniais Avançados
                </h3>
                <p className="text-xs text-emerald-100">
                  Calcule juros compostos, meta de independência financeira e comparador de cenários.
                </p>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                Abrir Simuladores Pro
              </button>
            </div>

            {/* Score & Health */}
            <FinancialScoreCard
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              isBalanceHidden={isBalanceHidden}
              isPremium={true}
            />

            {/* Forecast */}
            <BalanceForecastWidget
              currentBalance={totalBalance}
              monthlyIncome={totalIncome}
              monthlyExpense={totalExpense}
              isBalanceHidden={isBalanceHidden}
              isPremium={true}
            />
          </div>
        )}

        {/* Minhas Metas / Caixinhas Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface">Minhas Metas & Caixinhas</h3>
            <button
              onClick={() => setActiveTab("goals")}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div
                  key={g.id}
                  onClick={() => setActiveTab("goals")}
                  className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-4 rounded-2xl shadow-xs border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-2">
                      <span className="p-1.5 bg-primary-container/20 rounded-lg text-primary">
                        🎯
                      </span>
                      {g.title}
                    </span>
                    <span className="text-xs font-bold text-primary">{pct}%</span>
                  </div>

                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-outline">
                    R$ {g.currentAmount.toLocaleString("pt-BR")} de R${" "}
                    {g.targetAmount.toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface">Últimas Movimentações do Extrato</h3>
            <button
              onClick={() => setActiveTab("transactions")}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Ver Extrato Completo
            </button>
          </div>

          <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10 overflow-hidden shadow-xs">
            {transactions.slice(0, 5).map((tx) => {
              const isExpense = tx.type === "expense";
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
                  onClick={() => setActiveTab("transactions")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isExpense
                          ? "bg-error-container/40 text-error"
                          : "bg-secondary-container/40 text-secondary"
                      }`}
                    >
                      {isExpense ? (
                        <ShoppingBag className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{tx.title}</p>
                      <p className="text-[11px] text-outline">
                        {tx.categoryName} • {tx.accountName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold block ${
                        isExpense ? "text-error" : "text-secondary"
                      }`}
                    >
                      {isExpense ? "- " : "+ "}
                      {formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] text-outline">{tx.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Simulators Modal */}
        <FinancialSimulatorsModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />

        {/* Premium Upgrade Teaser Modal */}
        <PremiumTeaserModal
          isOpen={isTeaserOpen}
          onClose={() => setIsTeaserOpen(false)}
          featureTitle={teaserTitle}
          onGoToPremium={() => setActiveTab("premium")}
          onGoToReferral={() => setActiveTab("referral")}
        />

      </main>
    </div>
  );
};

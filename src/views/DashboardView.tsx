import React from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  Send, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  ShoppingBag, 
  Utensils, 
  Home as HomeIcon, 
  Briefcase, 
  Plus, 
  Sparkles, 
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Zap,
  ShieldCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export const DashboardView: React.FC = () => {
  const {
    user,
    transactions,
    goals,
    isBalanceHidden,
    toggleBalanceHidden,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    openAddTxModal,
    openAiAssistant,
  } = useApp();

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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface">
            Organização Mensal
          </h2>
          <div className="flex items-center bg-surface-container-low dark:bg-surface-container-high/20 rounded-full px-2 py-1 border border-outline-variant/10 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:text-primary transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant dark:text-outline-variant">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:text-primary transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resumo de Caixa (Main Balance Bento Card) */}
        <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-md relative overflow-hidden">
          {/* Subtle watermark background icon */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CreditCard className="w-40 h-40" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Balanço Total
              </span>
              <button
                onClick={toggleBalanceHidden}
                className="p-1.5 hover:bg-on-primary-container/10 rounded-full transition-colors"
                title={isBalanceHidden ? "Exibir Saldo" : "Ocultar Saldo"}
              >
                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(totalBalance)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-on-primary-container/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-container/80 flex items-center justify-center text-on-secondary-container">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase block opacity-80">
                    Receitas
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-error-container/80 flex items-center justify-center text-on-error-container">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase block opacity-80">
                    Despesas
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => openAddTxModal('income')}
                className="flex-1 bg-on-primary-container text-primary-container py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar
              </button>
              <button
                onClick={() => openAddTxModal('transfer')}
                className="flex-1 border border-on-primary-container/40 text-on-primary-container py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-on-primary-container/10 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                Transferir
              </button>
            </div>
          </div>
        </div>

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
              <p className="text-xs font-bold text-on-secondary-container">
                Diagnóstico de IA do Fluxo
              </p>
              <p className="text-xs text-on-secondary-container/80 mt-0.5">
                Economia potencial estimada de R$ 380 este mês. Toque para ver detalhes.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-secondary-container" />
        </div>

        {/* Destaque Premium Callout */}
        <div 
          onClick={() => setActiveTab("premium")}
          className="bg-gradient-to-r from-emerald-900 via-primary-container to-emerald-950 text-white p-4 rounded-2xl border border-primary/30 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-yellow-300 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {user.plan !== "free" ? "Fluxo Premium Ativo" : "Desbloqueie o Fluxo Premium"}
                </span>
                <span className="text-[9px] bg-yellow-400 text-black font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                  {user.plan !== "free" ? "VIP" : "PRO"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 mt-0.5">
                {user.plan !== "free"
                  ? "Acesso ilimitado a IA, relatórios PDF/Excel e leitor de comprovantes."
                  : "IA ilimitada, exportação PDF/Excel e sem anúncios. Pagamento seguro via Pix ou Cartão."}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </div>

        {/* Gastos Diários Chart */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Gastos Diários</h3>
              <p className="text-[11px] text-outline">Análise semanal por dia</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Esta Semana
            </span>
          </div>

          <div className="h-40 w-full">
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
                      fill={entry.isPeak ? "#0d631b" : "#88d982"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Minhas Metas Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface">Minhas Metas</h3>
            <button
              onClick={() => setActiveTab("goals")}
              className="text-xs font-semibold text-primary hover:underline"
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
            <h3 className="text-sm font-bold text-on-surface">Últimas Movimentações</h3>
            <button
              onClick={() => setActiveTab("transactions")}
              className="text-xs font-semibold text-primary hover:underline"
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
      </main>
    </div>
  );
};

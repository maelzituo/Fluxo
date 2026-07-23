import React, { useState } from "react";
import { TrendingUp, Calendar, AlertTriangle, ArrowRight, ShieldCheck, Lock, Crown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isBalanceHidden: boolean;
  isPremium?: boolean;
  onLockedClick?: () => void;
}

export const BalanceForecastWidget: React.FC<Props> = ({
  currentBalance,
  monthlyIncome,
  monthlyExpense,
  isBalanceHidden,
  isPremium = true,
  onLockedClick,
}) => {
  const [horizonDays, setHorizonDays] = useState<7 | 30 | 90 | 365>(7);

  const handleHorizonChange = (days: 7 | 30 | 90 | 365) => {
    if (!isPremium && days > 7) {
      if (onLockedClick) onLockedClick();
      return;
    }
    setHorizonDays(days);
  };

  // Calculate net monthly cash flow
  const netMonthly = monthlyIncome - monthlyExpense;
  const netDaily = netMonthly / 30;

  // Generate data points for projection
  const generateData = () => {
    const points = [];
    const numSteps = 6;
    const stepDays = horizonDays / numSteps;

    for (let i = 0; i <= numSteps; i++) {
      const daysAhead = Math.round(i * stepDays);
      const projected = Math.max(0, currentBalance + netDaily * daysAhead);

      let label = `${daysAhead}d`;
      if (horizonDays === 365) label = `Mês ${Math.round(daysAhead / 30)}`;

      points.push({
        day: label,
        saldo: Math.round(projected),
      });
    }
    return points;
  };

  const data = generateData();
  const projectedFinal = data[data.length - 1].saldo;

  const formatCurrency = (val: number) => {
    if (isBalanceHidden) return "••••••••";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-outline-variant/20 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Previsão Preditiva de Saldo</h3>
            <p className="text-[11px] text-outline">Projeção algorítmica de caixa futuro</p>
          </div>
        </div>

        {/* Horizon selector buttons */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/15 self-start sm:self-auto">
          {([7, 30, 90, 365] as const).map((days) => {
            const isLockedForFree = !isPremium && days > 7;
            return (
              <button
                key={days}
                onClick={() => handleHorizonChange(days)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  horizonDays === days
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <span>{days === 365 ? "1 Ano" : `${days}d`}</span>
                {isLockedForFree && <Lock className="w-2.5 h-2.5 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="space-y-1 p-3 bg-surface-container-low dark:bg-surface-container-high/15 rounded-xl border border-outline-variant/10">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Saldo Projetado em {horizonDays === 365 ? "12 Meses" : `${horizonDays} Dias`}
          </span>
          <p className="text-2xl font-black text-primary tracking-tight">
            {formatCurrency(projectedFinal)}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {netMonthly >= 0 ? "+ Mapeamento Seguro" : "Alerta de Deficit"}
          </span>
        </div>

        {/* Projection Area Chart */}
        <div className="sm:col-span-2 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12632a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#12632a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#707a6c" }} />
              <YAxis hide />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), "Saldo Projetado"]}
                contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Area type="monotone" dataKey="saldo" stroke="#12632a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaldo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!isPremium && (
        <div 
          onClick={onLockedClick}
          className="p-3 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-amber-500/60 transition-all"
        >
          <div className="flex items-center gap-2 text-on-surface font-semibold">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px]">
              Quer visualizar a previsão de caixa para 30, 90 e 365 dias?
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 underline shrink-0">
            Desbloquear 1 Ano
          </span>
        </div>
      )}
    </div>
  );
};

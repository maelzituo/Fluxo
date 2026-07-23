import React from "react";
import { ShieldCheck, TrendingUp, AlertCircle, ArrowUpRight, Award, CheckCircle2, Lock, Crown, Sparkles } from "lucide-react";

interface Props {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  isBalanceHidden: boolean;
  isPremium?: boolean;
  onLockedClick?: () => void;
}

export const FinancialScoreCard: React.FC<Props> = ({
  totalIncome,
  totalExpense,
  totalBalance,
  isBalanceHidden,
  isPremium = true,
  onLockedClick,
}) => {
  // Dynamic Score logic based on financial metrics
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) : 0;
  
  let baseScore = 650;
  if (savingsRate >= 30) baseScore += 180;
  else if (savingsRate >= 15) baseScore += 100;
  else if (savingsRate > 0) baseScore += 40;

  if (totalBalance > 10000) baseScore += 120;
  else if (totalBalance > 3000) baseScore += 70;

  const score = Math.min(980, Math.max(420, baseScore));

  const getScoreTier = (val: number) => {
    if (val >= 850) return { label: "Nível Diamante (Excelente)", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
    if (val >= 720) return { label: "Nível Ouro (Muito Bom)", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
    if (val >= 600) return { label: "Nível Prata (Saudável)", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
    return { label: "Atenção Requerida", color: "text-red-500 bg-red-500/10 border-red-500/30" };
  };

  const tier = getScoreTier(score);

  if (!isPremium) {
    return (
      <div 
        onClick={onLockedClick}
        className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-amber-500/20 relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                Score & Diagnóstico de Saúde
                <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              </h3>
              <p className="text-[11px] text-outline">Análise preditiva de risco e liquidez</p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
            Desbloquear <Crown className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Blurred Teaser Body */}
        <div className="relative pt-4 filter blur-xs opacity-60 select-none pointer-events-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col items-center justify-center p-3 bg-surface-container-low rounded-xl">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-xl">
                830
              </div>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="h-2 bg-surface-container rounded-full w-full"></div>
              <div className="h-2 bg-surface-container rounded-full w-3/4"></div>
              <div className="h-2 bg-surface-container rounded-full w-5/6"></div>
            </div>
          </div>
        </div>

        {/* Locked Overlay Badge */}
        <div className="absolute inset-0 bg-surface-container-lowest/60 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-extrabold text-on-surface">
              Disponível no Fluxo Premium — Clique para calcular seu Score
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-outline-variant/20 space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-container/30 text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Score & Diagnóstico de Saúde</h3>
            <p className="text-[11px] text-outline">Análise preditiva de risco e liquidez</p>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Score Gauge Circle */}
        <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low dark:bg-surface-container-high/20 rounded-xl border border-outline-variant/10 text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container-high dark:text-surface-container"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary transition-all duration-1000 ease-out"
                strokeDasharray={`${(score / 1000) * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-on-surface tracking-tight">
                {isBalanceHidden ? "•••" : score}
              </span>
              <span className="text-[9px] font-bold text-outline">/ 1000</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-on-surface mt-2 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-primary" />
            Top 8% dos usuários
          </span>
        </div>

        {/* Breakdown Factors */}
        <div className="sm:col-span-2 space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-on-surface-variant">Taxa de Poupança Líquida</span>
              <span className="text-primary font-bold">{savingsRate}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, savingsRate)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-on-surface-variant">Aderência aos Tetos de Orçamento</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">92%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: "92%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-on-surface-variant">Cobertura de Reserva de Emergência</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">6,4 Meses</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: "80%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Diagnostic Alert */}
      <div className="p-3.5 bg-secondary-container/30 border border-secondary-container/50 rounded-xl flex items-start gap-3 text-xs">
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-on-surface">
            Recomendação do Motor IA:
          </p>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            Seu orçamento atual tem folga financeira. Investir R$ 350 adicionais em Tesouro IPCA+ neste mês pode acelerar sua aposentadoria em até 1,4 anos.
          </p>
        </div>
      </div>
    </div>
  );
};

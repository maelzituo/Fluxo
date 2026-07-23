import React from "react";
import { Award, Zap, Trophy, Target, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  referralCount?: number;
  onExploreGoals: () => void;
}

export const GamificationBadgesCard: React.FC<Props> = ({
  referralCount = 15,
  onExploreGoals,
}) => {
  const level = 7;
  const currentXp = 3450;
  const targetXp = 5000;
  const xpPct = Math.min(100, Math.round((currentXp / targetXp) * 100));

  const badges = [
    { id: 1, title: "Zero Dívidas", icon: "🛡️", desc: "Nenhum atraso em 90 dias", unlocked: true },
    { id: 2, title: "Poupadore Pro", icon: "💰", desc: "Aporte > 20% da renda", unlocked: true },
    { id: 3, title: "Mestre das Metas", icon: "🎯", desc: "3 metas concluídas", unlocked: true },
    { id: 4, title: "Investidor Incial", icon: "📈", desc: "Primeira aplicação feita", unlocked: true },
    { id: 5, title: "Magnata Fluxo", icon: "👑", desc: "Reserva de 12 meses", unlocked: false },
  ];

  return (
    <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-outline-variant/20 space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Jornada & Gamificação Financeira</h3>
            <p className="text-[11px] text-outline">Evolução do seu nível de inteligência financeira</p>
          </div>
        </div>

        <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 fill-current" /> Nível {level} Pro
        </span>
      </div>

      {/* Level XP Progress */}
      <div className="space-y-1.5 p-3.5 bg-surface-container-low dark:bg-surface-container-high/15 rounded-xl border border-outline-variant/10">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-on-surface flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Progresso para o Nível {level + 1}
          </span>
          <span className="text-primary font-extrabold">{currentXp} / {targetXp} XP</span>
        </div>

        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden p-0.5 border border-outline-variant/10">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-xs"
            style={{ width: `${xpPct}%` }}
          />
        </div>

        <p className="text-[10px] text-outline pt-0.5">
          Faltam apenas {targetXp - currentXp} XP para desbloquear a Badge "Guardião Patrimonial".
        </p>
      </div>

      {/* Badges Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
          Badges & Conquistas Desbloqueadas
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                b.unlocked
                  ? "bg-surface-container-low border-emerald-500/30 text-on-surface"
                  : "bg-surface-container/30 border-dashed border-outline-variant/30 text-outline opacity-60"
              }`}
            >
              <span className="text-xl mb-1">{b.icon}</span>
              <span className="text-[10px] font-bold leading-tight">{b.title}</span>
              <span className="text-[8px] text-outline mt-0.5 line-clamp-1">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

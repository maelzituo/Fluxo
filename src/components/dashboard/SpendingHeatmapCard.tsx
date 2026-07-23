import React from "react";
import { Flame, Lock, Crown } from "lucide-react";

interface Props {
  isPremium?: boolean;
  onLockedClick?: () => void;
}

export const SpendingHeatmapCard: React.FC<Props> = ({
  isPremium = true,
  onLockedClick,
}) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  
  const heatmapData = [
    { day: "Seg", values: [1, 2, 1, 0] },
    { day: "Ter", values: [0, 1, 3, 1] },
    { day: "Qua", values: [1, 1, 2, 0] },
    { day: "Qui", values: [2, 3, 3, 2] },
    { day: "Sex", values: [1, 2, 3, 3] },
    { day: "Sáb", values: [0, 1, 2, 3] },
    { day: "Dom", values: [0, 0, 1, 2] },
  ];

  const periodLabels = ["Manhã", "Tarde", "Noite", "Madrugada"];

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 3:
        return "bg-emerald-600 dark:bg-emerald-500 text-white font-bold";
      case 2:
        return "bg-emerald-400 dark:bg-emerald-600/80 text-black dark:text-white font-semibold";
      case 1:
        return "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-950 dark:text-emerald-200";
      default:
        return "bg-surface-container-low dark:bg-surface-container-high/20 text-outline-variant";
    }
  };

  if (!isPremium) {
    return (
      <div 
        onClick={onLockedClick}
        className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl shadow-xs border border-amber-500/20 relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                Heatmap de Consumo
                <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              </h3>
              <p className="text-[11px] text-outline">Mapa de calor e hábitos por hora e dia</p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
            Desbloquear <Crown className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="relative pt-4 filter blur-xs opacity-50 select-none pointer-events-none">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-6 bg-emerald-500/40 rounded-lg"></div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-surface-container-lowest/60 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-extrabold text-on-surface">
              Análise Semanal de Picos de Consumo — Fluxo Premium
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
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Heatmap de Consumo</h3>
            <p className="text-[11px] text-outline">Mapa de calor de frequência de gastos por dia/horário</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase">
          Pico: Quinta & Sexta
        </span>
      </div>

      <div className="space-y-2 overflow-x-auto">
        <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold text-outline uppercase pb-1">
          <div className="text-left">Dia</div>
          {periodLabels.map((p) => (
            <div key={p}>{p}</div>
          ))}
        </div>

        {heatmapData.map((row) => (
          <div key={row.day} className="grid grid-cols-5 gap-1.5 items-center">
            <span className="text-xs font-bold text-on-surface">{row.day}</span>
            {row.values.map((val, idx) => (
              <div
                key={idx}
                className={`h-7 rounded-lg flex items-center justify-center text-[10px] transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(
                  val
                )}`}
                title={`Padrão de gastos: ${val === 3 ? "Elevado" : val === 2 ? "Moderado" : val === 1 ? "Leve" : "Sem registros"}`}
              >
                {val > 0 ? (val === 3 ? "🔥" : "•") : ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 text-[10px] text-outline border-t border-outline-variant/10">
        <span>Intensidade de consumo:</span>
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-surface-container-low" /> Baixa</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-200" /> Média</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Alta</span>
        </div>
      </div>
    </div>
  );
};

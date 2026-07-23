import React from "react";
import { LayoutGrid, SlidersHorizontal, Eye, Lock, Sparkles } from "lucide-react";

export type DashboardMode = "basic" | "executive" | "detailed" | "pro";

interface Props {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  isPremium: boolean;
  onOpenUpgradeModal: (featureName: string) => void;
}

export const DashboardModeToggle: React.FC<Props> = ({
  mode,
  setMode,
  isPremium,
  onOpenUpgradeModal,
}) => {
  const handleModeClick = (targetMode: DashboardMode, featureTitle: string) => {
    if (!isPremium && targetMode !== "basic" && targetMode !== "detailed") {
      onOpenUpgradeModal(featureTitle);
      return;
    }
    setMode(targetMode);
  };

  return (
    <div className="flex items-center gap-1 bg-surface-container-low dark:bg-inverse-surface/60 p-1.5 rounded-2xl border border-outline-variant/20 shadow-xs">
      {/* Essential Mode (Free & Premium) */}
      <button
        onClick={() => setMode("detailed")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          mode === "detailed"
            ? "bg-primary text-on-primary shadow-xs"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
        }`}
        title="Visão Geral Fluida"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Essencial</span>
      </button>

      {/* Executive Mode (Premium) */}
      <button
        onClick={() => handleModeClick("executive", "Modo Executivo com Diagnóstico de Risco")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
          mode === "executive"
            ? "bg-primary text-on-primary shadow-xs"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
        }`}
        title="Modo Executivo Limpo & Diagnóstico"
      >
        <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Executivo</span>
        {!isPremium && (
          <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 p-0.5 rounded-md">
            <Lock className="w-2.5 h-2.5" />
          </span>
        )}
      </button>

      {/* Pro & Simulators Mode (Premium) */}
      <button
        onClick={() => handleModeClick("pro", "Simuladores de Riqueza & Score Pro")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
          mode === "pro"
            ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-xs"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
        }`}
        title="Simuladores de Riqueza, Heatmap & Score Pro"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
        <span>Pro & Simuladores</span>
        {!isPremium && (
          <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase flex items-center gap-0.5 shadow-2xs">
            <Lock className="w-2.5 h-2.5 stroke-[3]" /> PRO
          </span>
        )}
      </button>
    </div>
  );
};

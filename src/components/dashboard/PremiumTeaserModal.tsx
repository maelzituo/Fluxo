import React from "react";
import { X, Crown, Sparkles, ShieldCheck, Zap, TrendingUp, Calculator, Flame, Lock, ArrowRight, Gift } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  onGoToPremium: () => void;
  onGoToReferral: () => void;
}

export const PremiumTeaserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  featureTitle = "Funcionalidade Premium Exclusiva",
  onGoToPremium,
  onGoToReferral,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest dark:bg-surface-container-low max-w-lg w-full rounded-3xl p-6 shadow-2xl relative border border-amber-500/30 overflow-hidden text-on-surface">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-5">
          {/* Header Crown */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-300 text-black rounded-2xl shadow-md">
              <Crown className="w-6 h-6 fill-black/20" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                EXCLUSIVO FLUXO PREMIUM
              </span>
              <h2 className="text-base font-bold text-on-surface mt-1">
                {featureTitle}
              </h2>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Esta funcionalidade utiliza nosso motor de inteligência artificial avançada e simuladores de alta precisão patrimonial.
          </p>

          {/* Feature Highlights Grid */}
          <div className="p-4 bg-surface-container-low dark:bg-surface-container-high/20 rounded-2xl border border-outline-variant/15 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-on-surface block">Score & Diagnóstico Preditivo</span>
                <span className="text-[11px] text-outline">Análise completa de risco, liquidez e teto de gastos.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-on-surface block">Projeção de Saldo a 365 Dias</span>
                <span className="text-[11px] text-outline">Previsão algorítmica de fluxo de caixa futuro e alertas anti-deficit.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-on-surface block">Heatmap de Consumo & Detecção de Assinaturas</span>
                <span className="text-[11px] text-outline">Mapa térmico semanal dos seus hábitos e monitor de cobranças recorrentes.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calculator className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-on-surface block">Simuladores Pro & Independência Financeira</span>
                <span className="text-[11px] text-outline">Cálculos avançados de juros compostos, metas e aposentadoria antecipada.</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onGoToPremium();
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-emerald-600 to-emerald-700 hover:from-amber-400 hover:to-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Assinar Fluxo Premium (R$ 12,90/mês)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onGoToReferral();
              }}
              className="w-full bg-surface-container-high hover:bg-surface-container text-on-surface font-bold text-xs py-3 rounded-2xl border border-outline-variant/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4 text-primary" />
              <span>Ganhar 30 Dias Grátis com Código de Indicação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

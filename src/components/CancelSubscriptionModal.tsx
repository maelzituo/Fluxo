import React, { useState } from "react";
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  HeartHandshake,
  Calendar,
  Sparkles
} from "lucide-react";
import { UserProfile } from "../types";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onConfirmCancel: () => void;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState("redução_gastos");
  const [isSuccessCanceled, setIsSuccessCanceled] = useState(false);

  if (!isOpen) return null;

  const planName = user.plan === "premium_yearly" ? "Plano Anual Fluxo Premium" : "Plano Mensal Fluxo Premium";
  const expiryDate = user.planExpiryDate || "2027-07-22";

  const handleProcessCancel = () => {
    setIsSuccessCanceled(true);
    setTimeout(() => {
      onConfirmCancel();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface dark:bg-inverse-surface/90 text-on-surface w-full max-w-md rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Cancelar Assinatura</h2>
              <p className="text-[11px] text-outline">Livre de multas e burocracia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5 text-outline" />
          </button>
        </div>

        {isSuccessCanceled ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Assinatura Cancelada</h3>
            <p className="text-xs text-outline leading-relaxed max-w-xs mx-auto">
              O cancelamento da cobrança recorrente foi concluído. Você poderá continuar utilizando os recursos do Premium até <strong className="text-on-surface">{expiryDate}</strong> sem nenhuma nova cobrança.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Plan Info Card */}
            <div className="p-4 bg-surface-container-low dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">{planName}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-outline">
                <Calendar className="w-3.5 h-3.5" />
                <span>Acesso mantido até: <strong className="text-on-surface font-semibold">{expiryDate}</strong></span>
              </div>
            </div>

            {/* Benefit loss warning */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-on-surface">Ao cancelar a renovação automática:</p>
              <ul className="text-xs text-outline space-y-1.5 list-disc pl-4">
                <li>Sua conta não sofrerá nenhuma nova cobrança futura.</li>
                <li>Os recursos avançados de IA e relatórios serão mantidos até {expiryDate}.</li>
                <li>Você pode reativar seu plano a qualquer momento em 1 clique.</li>
              </ul>
            </div>

            {/* Optional Reason Survey */}
            <div>
              <label className="block text-[11px] font-bold text-outline uppercase mb-1.5">
                Qual o motivo principal do cancelamento? (Opcional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="redução_gastos">Preciso reduzir meus gastos mensais</option>
                <option value="pouco_uso">Não estou utilizando com tanta frequência</option>
                <option value="duvida">Tenho dúvidas sobre como usar os recursos</option>
                <option value="outro">Outro motivo</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleProcessCancel}
                className="w-full py-3 bg-error/10 hover:bg-error/20 text-error font-bold text-xs rounded-full border border-error/20 transition-all"
              >
                Confirmar Cancelamento Agora
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-surface-container-high text-on-surface font-bold text-xs rounded-full hover:bg-surface-variant transition-all"
              >
                Manter minha Assinatura Ativa
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

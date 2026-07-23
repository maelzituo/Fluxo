import React, { useState } from "react";
import { CreditCard, Calendar, Repeat, ShieldAlert, ArrowRight, CheckCircle2, Plus, Edit2, Trash2, PauseCircle, PlayCircle, Tv, Music, Dumbbell, Zap, Film, Sparkles, Globe } from "lucide-react";
import { Subscription } from "../../types";
import { useApp } from "../../context/AppContext";
import { SubscriptionModal } from "../SubscriptionModal";

interface Props {
  subscriptions: Subscription[];
  onManageSubscriptions?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Tv,
  Music,
  Dumbbell,
  Zap,
  Film,
  Sparkles,
  CreditCard,
  Globe,
};

export const SubscriptionsTrackerCard: React.FC<Props> = ({
  subscriptions,
}) => {
  const { addSubscription, editSubscription, deleteSubscription, toggleSubscriptionStatus } = useApp();

  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const pausedSubs = subscriptions.filter((s) => s.status === "paused");

  const filteredList =
    filter === "active"
      ? activeSubs
      : filter === "paused"
      ? pausedSubs
      : subscriptions;

  const totalMonthlyActive = activeSubs.reduce((acc, s) => acc + s.amount, 0);
  const totalAnnualActive = totalMonthlyActive * 12;

  const handleOpenNew = () => {
    setSelectedSub(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 sm:p-6 rounded-3xl shadow-xs border border-outline-variant/20 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">Assinaturas & Recorrências</h3>
            <p className="text-xs text-outline">Gerencie, edite e acompanhe seus pagamentos fixos</p>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Assinatura</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 dark:text-purple-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-purple-700 dark:text-purple-300 block tracking-wider">
            Comprometimento Anual Estimado
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            R$ {totalAnnualActive.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ano
          </span>
        </div>
        <div className="sm:text-right">
          <span className="inline-block text-xs font-bold bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-xs">
            {activeSubs.length} Ativas • R$ {totalMonthlyActive.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === "all" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-outline hover:text-on-surface"
            }`}
          >
            Todas ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === "active" ? "bg-surface-container-lowest text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-outline hover:text-on-surface"
            }`}
          >
            Ativas ({activeSubs.length})
          </button>
          <button
            onClick={() => setFilter("paused")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === "paused" ? "bg-surface-container-lowest text-amber-600 dark:text-amber-400 shadow-xs" : "text-outline hover:text-on-surface"
            }`}
          >
            Pausadas ({pausedSubs.length})
          </button>
        </div>
      </div>

      {/* Subscription List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-outline text-xs bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
            Nenhuma assinatura encontrada nesta categoria.
          </div>
        ) : (
          filteredList.map((sub) => {
            const IconComp = ICON_MAP[sub.icon] || Repeat;
            const isActive = sub.status === "active";

            return (
              <div
                key={sub.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive
                    ? "bg-surface-container-low dark:bg-surface-container-high/20 border-outline-variant/20 hover:border-purple-500/30"
                    : "bg-surface-container-low/40 dark:bg-surface-container-high/5 border-dashed border-outline-variant/20 opacity-75"
                }`}
              >
                {/* Info Block */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isActive ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-surface-container text-outline"
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-on-surface">{sub.title}</h4>
                      <span className="text-[10px] bg-surface-container-high/60 px-2.5 py-0.5 rounded-full text-outline font-semibold border border-outline-variant/10">
                        {sub.category}
                      </span>
                    </div>
                    <p className="text-xs text-outline flex flex-wrap items-center gap-1.5">
                      <span>Vence dia <strong>{sub.dueDate}</strong></span>
                      <span>•</span>
                      <span>{sub.autoPay ? "Débito Automático" : "Manual"}</span>
                      <span>•</span>
                      <span className="capitalize">{sub.billingCycle === "yearly" ? "Anual" : "Mensal"}</span>
                    </p>
                  </div>
                </div>

                {/* Price & Actions Block */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-outline-variant/10 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-on-surface block">
                      R$ {sub.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[10px] font-medium text-outline ml-0.5">/{sub.billingCycle === "yearly" ? "ano" : "mês"}</span>
                    </span>
                    <span className={`text-xs font-bold inline-flex items-center gap-1 mt-0.5 ${
                      isActive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3.5 h-3.5" /> Pausada
                        </>
                      )}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 bg-surface-container/60 p-1 rounded-xl border border-outline-variant/15">
                    <button
                      onClick={() => toggleSubscriptionStatus(sub.id)}
                      className="p-2 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-all cursor-pointer"
                      title={isActive ? "Pausar Assinatura" : "Reativar Assinatura"}
                    >
                      {isActive ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-2 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-all cursor-pointer"
                      title="Editar Assinatura"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir a assinatura "${sub.title}"?`)) {
                          deleteSubscription(sub.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-error-container/40 text-outline hover:text-error transition-all cursor-pointer"
                      title="Excluir Assinatura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriptionToEdit={selectedSub}
        onSave={addSubscription}
        onUpdate={editSubscription}
        onDelete={deleteSubscription}
      />
    </div>
  );
};

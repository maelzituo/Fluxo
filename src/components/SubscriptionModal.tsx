import React, { useState, useEffect } from "react";
import { X, Repeat, DollarSign, Calendar, Tag, ShieldCheck, Check, Tv, Music, Dumbbell, Zap, Film, Sparkles, CreditCard, Globe, Trash2 } from "lucide-react";
import { Subscription } from "../types";
import { ConfirmModal } from "./ConfirmModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
  onSave: (sub: Omit<Subscription, "id" | "uuid">) => void;
  onUpdate?: (id: string, updated: Partial<Subscription>) => void;
  onDelete?: (id: string) => void;
}

const ICON_OPTIONS = [
  { id: "Tv", label: "Streaming", icon: Tv },
  { id: "Music", label: "Música", icon: Music },
  { id: "Dumbbell", label: "Academia", icon: Dumbbell },
  { id: "Zap", label: "Utilidades", icon: Zap },
  { id: "Film", label: "Cinema", icon: Film },
  { id: "Sparkles", label: "Software/IA", icon: Sparkles },
  { id: "CreditCard", label: "Financeiro", icon: CreditCard },
  { id: "Globe", label: "Internet/Cloud", icon: Globe },
];

export const SubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subscriptionToEdit,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Serviços");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [dueDate, setDueDate] = useState("10");
  const [autoPay, setAutoPay] = useState(true);
  const [icon, setIcon] = useState("Tv");
  const [status, setStatus] = useState<"active" | "paused">("active");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (subscriptionToEdit) {
      setTitle(subscriptionToEdit.title);
      setAmount(subscriptionToEdit.amount.toString().replace(".", ","));
      setCategory(subscriptionToEdit.category || "Serviços");
      setBillingCycle(subscriptionToEdit.billingCycle || "monthly");
      setDueDate(subscriptionToEdit.dueDate || "10");
      setAutoPay(subscriptionToEdit.autoPay ?? true);
      setIcon(subscriptionToEdit.icon || "Tv");
      setStatus(subscriptionToEdit.status || "active");
    } else {
      setTitle("");
      setAmount("");
      setCategory("Serviços");
      setBillingCycle("monthly");
      setDueDate("10");
      setAutoPay(true);
      setIcon("Tv");
      setStatus("active");
    }
    setIsDeleteConfirmOpen(false);
  }, [subscriptionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(",", "."));
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const payload = {
      title: title.trim(),
      amount: numAmount,
      category,
      billingCycle,
      dueDate: dueDate.padStart(2, "0"),
      autoPay,
      icon,
      status,
    };

    if (subscriptionToEdit && onUpdate) {
      onUpdate(subscriptionToEdit.id, payload);
    } else {
      onSave(payload);
    }

    onClose();
  };

  const handleConfirmDelete = () => {
    if (subscriptionToEdit && onDelete) {
      onDelete(subscriptionToEdit.id);
      setIsDeleteConfirmOpen(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest dark:bg-surface-container-low max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl relative border border-outline-variant/20 text-on-surface space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                {subscriptionToEdit ? "Editar Assinatura" : "Nova Assinatura Recorrente"}
              </h2>
              <p className="text-xs text-outline">
                Acompanhe e controle gastos fixos mensais e anuais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5">
              Nome do Serviço / Assinatura *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Netflix, Spotify, Academia, iCloud, ChatGPT..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-surface-container-high/30 border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 text-on-surface font-medium"
            />
          </div>

          {/* Amount & Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Valor Recorrente (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs text-outline font-bold">R$</span>
                <input
                  type="text"
                  required
                  placeholder="29,90"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-surface-container-high/30 border border-outline-variant/30 rounded-2xl pl-10 pr-4 py-3 text-xs font-extrabold focus:outline-none focus:border-purple-500 text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Ciclo de Cobrança
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as "monthly" | "yearly")}
                className="w-full bg-surface-container-low dark:bg-surface-container-high/30 border border-outline-variant/30 rounded-2xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-purple-500 text-on-surface cursor-pointer"
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-surface-container-high/30 border border-outline-variant/30 rounded-2xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-purple-500 text-on-surface cursor-pointer"
              >
                <option value="Serviços">Serviços</option>
                <option value="Streaming">Streaming & Lazer</option>
                <option value="Saúde">Saúde & Fitness</option>
                <option value="Tecnologia">Tecnologia & IA</option>
                <option value="Utilidades">Utilidades & Moradia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Dia do Vencimento
              </label>
              <select
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-surface-container-high/30 border border-outline-variant/30 rounded-2xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-purple-500 text-on-surface cursor-pointer"
              >
                {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5">
              Ícone Representativo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSel = icon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSel
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                        : "bg-surface-container-low border-outline-variant/20 text-outline hover:text-on-surface"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span className="text-[10px] font-semibold truncate max-w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & AutoPay Toggles */}
          <div className="p-4 bg-surface-container-low rounded-2xl space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-on-surface block">Débito Automático</span>
                <span className="text-[10px] text-outline">Cobrança agendada automaticamente</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoPay(!autoPay)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoPay ? "bg-purple-600" : "bg-outline-variant/40"
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    autoPay ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-outline-variant/10">
              <span className="font-bold text-on-surface">Status da Assinatura</span>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === "active" ? "bg-emerald-600 text-white shadow-2xs" : "text-outline"
                  }`}
                >
                  Ativa
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("paused")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    status === "paused" ? "bg-amber-600 text-white shadow-2xs" : "text-outline"
                  }`}
                >
                  Pausada
                </button>
              </div>
            </div>
          </div>

          {/* Submit & Delete buttons */}
          <div className="flex items-center gap-3 pt-3">
            {subscriptionToEdit && onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-3.5 bg-error-container/40 hover:bg-error-container text-error rounded-2xl transition-all cursor-pointer shrink-0"
                title="Excluir Assinatura"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
            >
              {subscriptionToEdit ? "Salvar Alterações" : "Cadastrar Assinatura"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Excluir Assinatura"
        message={`Tem certeza que deseja excluir a assinatura "${subscriptionToEdit?.title}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

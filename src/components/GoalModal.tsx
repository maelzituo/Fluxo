import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Goal } from "../types";
import { X, Target, Plus, Plane, PiggyBank, Car, Home, Shield, Sparkles } from "lucide-react";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  depositGoal,
}) => {
  const { addGoal, depositToGoal } = useApp();

  // Deposit Mode State
  const [depositAmount, setDepositAmount] = useState("");

  // Create Goal Mode State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [icon, setIcon] = useState("Plane");
  const [category, setCategory] = useState("Investimentos");

  if (!isOpen) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amount = parseFloat(depositAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;

    depositToGoal(depositGoal.id, amount);
    setDepositAmount("");
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(",", "."));
    const current = parseFloat(currentAmount.replace(",", ".") || "0");

    if (!title.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title,
      targetAmount: target,
      currentAmount: current,
      deadline,
      icon,
      category,
      status: current >= target ? "completed" : "active",
    });

    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    onClose();
  };

  const iconOptions = [
    { name: "Plane", label: "Viagem", component: Plane },
    { name: "PiggyBank", label: "Reserva", component: PiggyBank },
    { name: "Car", label: "Carro", component: Car },
    { name: "Home", label: "Imóvel", component: Home },
    { name: "Shield", label: "Segurança", component: Shield },
    { name: "Target", label: "Geral", component: Target },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-surface dark:bg-inverse-surface rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low dark:bg-surface-container-high/10">
          <h2 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {depositGoal ? `Aportar em "${depositGoal.title}"` : "Nova Meta Financeira"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {depositGoal ? (
          /* Deposit Form */
          <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-secondary-container/30 border border-secondary-container rounded-xl text-xs text-on-secondary-container">
              <p className="font-semibold">Progresso Atual:</p>
              <p>
                R$ {depositGoal.currentAmount.toLocaleString("pt-BR")} de R${" "}
                {depositGoal.targetAmount.toLocaleString("pt-BR")} (
                {Math.round((depositGoal.currentAmount / depositGoal.targetAmount) * 100)}%)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Valor do Aporte (R$) *
              </label>
              <input
                type="text"
                placeholder="ex: 500,00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 text-xl font-bold bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold rounded-full text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-on-primary font-semibold rounded-full text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Confirmar Aporte
              </button>
            </div>
          </form>
        ) : (
          /* Create Goal Form */
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Título da Meta *
              </label>
              <input
                type="text"
                placeholder="ex: Comprar Casa, Trocar de Carro..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1">
                  Valor Objetivo (R$) *
                </label>
                <input
                  type="text"
                  placeholder="20000,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1">
                  Valor Atual (R$)
                </label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Data Limite Alvo
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-2">
                Ícone do Objetivo
              </label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map((opt) => {
                  const IconComp = opt.component;
                  const isSelected = icon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setIcon(opt.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold rounded-full text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-on-primary font-semibold rounded-full text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all"
              >
                Criar Meta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

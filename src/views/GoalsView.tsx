import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { GoalModal } from "../components/GoalModal";
import { Goal } from "../types";
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Plane, 
  PiggyBank, 
  Car, 
  Home as HomeIcon, 
  Shield, 
  Trash2, 
  Sparkles 
} from "lucide-react";

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal } = useApp();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case "Plane":
        return Plane;
      case "PiggyBank":
        return PiggyBank;
      case "Car":
        return Car;
      case "Home":
        return HomeIcon;
      case "Shield":
        return Shield;
      default:
        return Target;
    }
  };

  const handleOpenDeposit = (goal: Goal) => {
    setSelectedGoalForDeposit(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenNewGoal = () => {
    setSelectedGoalForDeposit(null);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header title="Metas Financeiras" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Top Header Card */}
        <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Planejamento Futuro
            </span>
            <h2 className="text-xl font-bold mt-1">Conquiste Seus Sonhos</h2>
            <p className="text-xs opacity-90 mt-1 max-w-xs">
              Defina metas financeiras claras e acompanhe seu progresso de economia com o Fluxo.
            </p>
          </div>

          <button
            onClick={handleOpenNewGoal}
            className="bg-on-primary-container text-primary-container p-3 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
            title="Nova Meta"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((g) => {
            const IconComp = getGoalIcon(g.icon);
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isFinished = g.status === "completed" || pct >= 100;

            return (
              <div
                key={g.id}
                className="bg-surface-container-lowest dark:bg-inverse-surface/40 p-5 rounded-2xl border border-outline-variant/20 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isFinished
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-primary-container/20 text-primary"
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                        {g.title}
                        {isFinished && (
                          <span className="flex items-center gap-1 text-[10px] bg-secondary-container text-on-secondary-container font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Concluída!
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-outline">
                        Alvo: {g.deadline ? `até ${g.deadline}` : "Sem data final"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-primary block">
                        {pct}%
                      </span>
                      <span className="text-[10px] text-outline">
                        Faltam R$ {remaining.toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1.5 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir Meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFinished ? "bg-secondary-container" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-outline font-medium">
                    <span>Acumulado: R$ {g.currentAmount.toLocaleString("pt-BR")}</span>
                    <span>Meta: R$ {g.targetAmount.toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                {/* Action Deposit Button */}
                {!isFinished && (
                  <button
                    onClick={() => handleOpenDeposit(g)}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Fazer Aporte na Meta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        depositGoal={selectedGoalForDeposit}
      />
    </div>
  );
};

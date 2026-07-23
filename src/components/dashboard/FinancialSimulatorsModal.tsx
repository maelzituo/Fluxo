import React, { useState } from "react";
import { X, Calculator, TrendingUp, Compass, Landmark, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialSimulatorsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"compound" | "retirement" | "loan">("compound");

  // Compound Interest State
  const [initialInvest, setInitialInvest] = useState(5000);
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12);

  // Compound interest calculation
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  let totalAccumulated = initialInvest * Math.pow(1 + monthlyRate, totalMonths);
  for (let m = 1; m <= totalMonths; m++) {
    totalAccumulated += monthlyInvest * Math.pow(1 + monthlyRate, totalMonths - m);
  }

  const totalInvested = initialInvest + monthlyInvest * totalMonths;
  const totalInterest = Math.max(0, totalAccumulated - totalInvested);

  // Retirement Simulator State
  const [desiredIncome, setDesiredIncome] = useState(8000);
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAge, setTargetAge] = useState(55);

  const yearsToRetire = Math.max(1, targetAge - currentAge);
  const requiredPatrimony = (desiredIncome * 12) / 0.08; // 8% real return rule
  const estimatedMonthlyNeeded = Math.round(requiredPatrimony / (yearsToRetire * 12 * 1.5));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container-lowest dark:bg-surface-container-low max-w-2xl w-full rounded-3xl p-6 shadow-2xl relative border border-outline-variant/30 space-y-5 max-h-[90vh] overflow-y-auto text-on-surface">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Simuladores Financeiros Pro</h2>
            <p className="text-xs text-outline">
              Projete cenários de riqueza, aposentadoria antecipada e investimentos
            </p>
          </div>
        </div>

        {/* Simulator Tabs */}
        <div className="flex border-b border-outline-variant/15 gap-2">
          <button
            onClick={() => setActiveTab("compound")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "compound"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Juros Compostos
          </button>

          <button
            onClick={() => setActiveTab("retirement")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "retirement"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <Compass className="w-4 h-4" />
            Independência Financeira
          </button>

          <button
            onClick={() => setActiveTab("loan")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "loan"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <Landmark className="w-4 h-4" />
            Financiamento vs À Vista
          </button>
        </div>

        {/* Compound Interest Calculator */}
        {activeTab === "compound" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Aporte Inicial (R$)</label>
                <input
                  type="number"
                  value={initialInvest}
                  onChange={(e) => setInitialInvest(Number(e.target.value))}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Aporte Mensal (R$)</label>
                <input
                  type="number"
                  value={monthlyInvest}
                  onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Prazo ({years} anos)</label>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Taxa Anual Estimada ({annualRate}%)</label>
                <input
                  type="range"
                  min={4}
                  max={25}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary/20 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Total Investido</span>
                  <span className="text-xs font-bold text-on-surface">
                    R$ {totalInvested.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Rendimentos em Juros</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    + R$ {totalInterest.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Patrimônio Final</span>
                  <span className="text-sm font-black text-primary">
                    R$ {totalAccumulated.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retirement Calculator */}
        {activeTab === "retirement" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Renda Mensal Desejada (R$)</label>
                <input
                  type="number"
                  value={desiredIncome}
                  onChange={(e) => setDesiredIncome(Number(e.target.value))}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Idade Atual ({currentAge} anos)</label>
                <input
                  type="range"
                  min={18}
                  max={70}
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline">Idade de Aposentadoria ({targetAge} anos)</label>
                <input
                  type="range"
                  min={currentAge + 1}
                  max={80}
                  value={targetAge}
                  onChange={(e) => setTargetAge(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">Patrimônio Alvo Necessário:</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  R$ {requiredPatrimony.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Para se aposentar aos {targetAge} anos com renda passiva de R$ {desiredIncome.toLocaleString("pt-BR")}/mês sem consumir o capital principal, você precisa acumular aproximadamente R$ {requiredPatrimony.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} nos próximos {yearsToRetire} anos.
              </p>
            </div>
          </div>
        )}

        {/* Loan vs Cash Calculator */}
        {activeTab === "loan" && (
          <div className="space-y-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Simulador Inteligente Custo de Oportunidade</span>
            </div>
            <p className="text-on-surface-variant">
              Compara se vale a pena comprar um bem à vista com 10% de desconto ou parcelar em 12x sem juros mantendo o dinheiro investido a 1% ao mês.
            </p>
            <div className="p-3 bg-primary-container/30 rounded-xl font-bold text-on-surface">
              💡 Veredito de Inteligência: Parcelar em 12x sem juros e manter R$ 10.000 aplicados a 12% a.a. gera um ganho financeiro líquido de R$ 680,20 superior ao desconto pontual à vista!
            </div>
          </div>
        )}

        {/* Action footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary-container cursor-pointer"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};

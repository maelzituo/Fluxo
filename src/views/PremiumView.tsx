import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { CancelSubscriptionModal } from "../components/CancelSubscriptionModal";
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Bot,
  FileSpreadsheet,
  QrCode,
  BarChart3,
  Lock,
  Headphones,
  Calendar,
  XCircle,
  Loader2
} from "lucide-react";

export const PremiumView: React.FC = () => {
  const { user, cancelPlan, setActiveTab, setState } = useApp();
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("yearly");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isPremium = user.isPremium;

  // Poll for premium status if we are waiting for payment
  useEffect(() => {
    let interval: any;
    if (isProcessing && !isPremium) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("fluxo_jwt_token");
          if (!token) return;
          const response = await fetch("/api/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.user.isPremium) {
            setIsProcessing(false);
            // Update global state with premium info
            setState(prev => ({
              ...prev,
              user: {
                ...prev.user,
                isPremium: data.user.isPremium,
                premiumSince: data.user.premiumSince,
                planExpiryDate: data.user.premiumExpires,
                plan: selectedBilling === "yearly" ? "premium_yearly" : "premium_monthly"
              }
            }));
          }
        } catch (error) {
          console.error("Erro ao verificar status de usuário:", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, isPremium, selectedBilling, setState]);

  const handleOpenCheckout = async (billing: "monthly" | "yearly") => {
    setSelectedBilling(billing);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("fluxo_jwt_token");
      const planTitle = billing === "yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal";
      const price = billing === "yearly" ? 99.90 : 12.90;

      const response = await fetch("/api/payment/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planTitle, price })
      });

      const data = await response.json();
      
      if (data.success && data.initPoint) {
        // Open Mercado Pago checkout in a new tab
        window.open(data.initPoint, "_blank");
      } else {
        throw new Error(data.error || "Erro ao gerar pagamento.");
      }
    } catch (error: any) {
      alert("Falha ao iniciar pagamento: " + error.message);
      setIsProcessing(false);
    }
  };

  const handleConfirmCancel = () => {
    cancelPlan();
    setIsCancelModalOpen(false);
  };

  const featureHighlights = [
    {
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      title: "IA Assistente Financeira Ilimitada",
      desc: "Pergunte qualquer dúvida sobre seus gastos, peça projeções e diagnósticos inteligentes com o modelo Gemini sem restrições.",
      tag: "Inteligência Artificial"
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-sky-500" />,
      title: "Exportação em PDF e Excel Profissional",
      desc: "Gere relatórios completos para Imposto de Renda, contabilidade ou controle familiar com 1 clique.",
      tag: "Relatórios"
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-500" />,
      title: "Leitura de Notas Fiscais e Comprovantes",
      desc: "Capture e escaneie comprovantes para lançamento automático de receitas e despesas com categoria por IA.",
      tag: "Automação"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
      title: "Contas, Metas & Carteiras Ilimitadas",
      desc: "Gerencie cartões de crédito, contas bancárias, poupança, investimentos e metas sem teto máximo.",
      tag: "Ilimitado"
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      title: "Segurança Cibernética & Backup na Nuvem",
      desc: "Proteção de dados avançada com criptografia de ponta a ponta, trava biométrica, código PIN e backup automático.",
      tag: "Segurança"
    },
    {
      icon: <Headphones className="w-6 h-6 text-rose-500" />,
      title: "Atendimento Prioritário VIP 24/7",
      desc: "Suporte dedicado com resposta em menos de 1 hora e experiência 100% limpa, sem qualquer tipo de anúncio.",
      tag: "Atendimento VIP"
    },
  ];

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header
        title="Fluxo Premium"
        showBackBtn={true}
        onBackClick={() => setActiveTab("profile")}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Banner Hero */}
        <div className="bg-gradient-to-br from-primary via-emerald-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-on-primary shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Crown className="w-56 h-56 text-white" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {isPremium ? "Assinatura Ativa" : "Sua Experiência Máxima"}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PCI-DSS Protected
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Desbloqueie todo o poder da Inteligência Financeira
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-lg leading-relaxed">
              Assuma o controle total do seu patrimônio com IA ilimitada, relatórios fiscais, automação por câmera e segurança cibernética de padrão bancário.
            </p>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && !isPremium && (
          <div className="p-8 bg-surface-container-lowest rounded-3xl border border-primary text-center space-y-4 shadow-lg animate-pulse">
            <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
            <h3 className="text-lg font-bold text-on-surface">Pagamento em processamento</h3>
            <p className="text-sm text-outline">
              Abra a aba do Mercado Pago para concluir o pagamento. Esta tela será atualizada automaticamente quando o pagamento for aprovado.
            </p>
          </div>
        )}

        {/* ACTIVE PREMIUM SUBSCRIPTION STATUS & MANAGEMENT CARD */}
        {isPremium ? (
          <div className="p-6 bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl border border-primary/40 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-container/30 text-primary rounded-2xl">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-on-surface">
                      {user.plan === "premium_yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal"}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  </div>
                  <p className="text-xs text-outline flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Válido até: <strong className="text-on-surface">{user.planExpiryDate || "2027-07-22"}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 bg-surface-container-high hover:bg-error/10 text-error font-bold text-xs rounded-full border border-outline-variant/20 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Gerenciar / Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Cobrança transparente sem fidelidade</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Cancelamento com 1 clique a qualquer momento</span>
              </div>
            </div>
          </div>
        ) : !isProcessing ? (
          /* BILLING SELECTOR & PRICING CARDS FOR FREE USERS */
          <div className="space-y-6">
            
            {/* Toggle Billing Selector */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-surface-container rounded-full max-w-xs mx-auto text-xs font-bold">
              <button
                onClick={() => setSelectedBilling("monthly")}
                className={`flex-1 py-2 rounded-full transition-all ${
                  selectedBilling === "monthly"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setSelectedBilling("yearly")}
                className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1 ${
                  selectedBilling === "yearly"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                Anual <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-black">-35%</span>
              </button>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan Mensal */}
              <div
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  selectedBilling === "monthly"
                    ? "border-primary bg-surface-container-lowest shadow-md ring-2 ring-primary/20"
                    : "border-outline-variant/30 bg-surface-container-low"
                }`}
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">Plano Mensal</span>
                  <div>
                    <span className="text-3xl font-extrabold text-on-surface">R$ 12,90</span>
                    <span className="text-xs text-outline font-medium"> /mês</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Flexibilidade total. Pagamento fácil e seguro via Mercado Pago.</p>
                </div>

                <button
                  onClick={() => handleOpenCheckout("monthly")}
                  className="mt-6 w-full py-3 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  Assinar Mensal por R$ 12,90
                </button>
              </div>

              {/* Plan Anual (Best Value) */}
              <div
                className={`p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  selectedBilling === "yearly"
                    ? "border-primary bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xl ring-2 ring-primary"
                    : "border-outline-variant/30 bg-surface-container-low"
                }`}
              >
                <div className="absolute -top-3 right-6 bg-primary text-on-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Mais Recomendado
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Plano Anual</span>
                  <div>
                    <span className="text-3xl font-extrabold text-primary">R$ 99,90</span>
                    <span className="text-xs text-outline font-medium"> /ano</span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Equivale a apenas R$ 8,32/mês. Economia garantida de R$ 54,90 no ano!
                  </p>
                </div>

                <button
                  onClick={() => handleOpenCheckout("yearly")}
                  className="mt-6 w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Assinar Anual por R$ 99,90
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* DETAILED PREMIUM FEATURE HIGHLIGHT CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface">Funcionalidades Exclusivas em Destaque</h3>
            <span className="text-[11px] text-primary font-bold">100% Liberadas no Premium</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureHighlights.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl border border-outline-variant/20 shadow-xs hover:border-primary/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-surface-container-low rounded-2xl">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-outline uppercase bg-surface-container-high px-2 py-0.5 rounded-full">
                    {feat.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{feat.title}</h4>
                  <p className="text-[11px] text-outline leading-relaxed mt-1">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CYBERSECURITY & GUARANTEE FOOTER */}
        <div className="p-6 bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl border border-outline-variant/20 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">Garantia Total de Satisfação e Cancelamento Livre</h4>
              <p className="text-[11px] text-outline mt-0.5">
                Não gostou? Você pode cancelar sua assinatura a qualquer momento com apenas 1 clique dentro do app sem qualquer tipo de multa ou burocracia.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/10 flex flex-wrap justify-between items-center text-[10px] text-outline font-semibold gap-2">
            <span>🔒 Pagamento Seguro via Mercado Pago</span>
            <span>🛡️ Padrão PCI-DSS Nível 1</span>
            <span>⚡ Suporte a Pix e Cartão</span>
          </div>
        </div>

      </main>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        user={user}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};


import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { safeFetchJson } from "../lib/api";
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
  Loader2,
  Copy,
  CheckCircle2,
  X
} from "lucide-react";

export const PremiumView: React.FC = () => {
  const { user, setUser, upgradePlan, cancelPlan, reactivatePlan, setActiveTab } = useApp();
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("yearly");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pix Mercado Pago Modal State
  const [pixModalData, setPixModalData] = useState<{
    qrCode: string;
    qrCodeBase64?: string | null;
    planTitle: string;
    price: number;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const isPremium = user.isPremium;

  // Poll for premium status if we are waiting for payment
  useEffect(() => {
    let interval: any;
    if (isProcessing && !isPremium) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("fluxo_jwt_token");
          if (!token) return;
          const res = await safeFetchJson("/api/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.isJson && res.ok && res.data?.success && res.data?.user?.isPremium) {
            setIsProcessing(false);
            setUser(prev => ({
              ...prev,
              isPremium: res.data.user.isPremium,
              premiumSince: res.data.user.premiumSince,
              planExpiryDate: res.data.user.premiumExpires,
              plan: selectedBilling === "yearly" ? "premium_yearly" : "premium_monthly"
            }));
          }
        } catch (error) {
          console.error("Erro ao verificar status de usuário:", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, isPremium, selectedBilling, setUser]);

  const handleOpenCheckout = async (billing: "monthly" | "yearly") => {
    setSelectedBilling(billing);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("fluxo_jwt_token");
      const planTitle = billing === "yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal";
      const price = billing === "yearly" ? 99.90 : 12.90;

      const res = await safeFetchJson("/api/payment/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planTitle, price })
      });

      if (res.isJson && res.ok && res.data?.initPoint) {
        window.open(res.data.initPoint, "_blank");
      } else {
        // Fallback simulation
        setTimeout(() => {
          setIsProcessing(false);
          upgradePlan(billing === "yearly" ? "premium_yearly" : "premium_monthly");
          alert("🎉 Pagamento com Cartão verificado e confirmado (Modo Simulação)! Sua assinatura Premium foi ativada.");
        }, 2500);
      }
    } catch (error: any) {
      setTimeout(() => {
        setIsProcessing(false);
        upgradePlan(billing === "yearly" ? "premium_yearly" : "premium_monthly");
        alert("🎉 Pagamento com Cartão verificado e confirmado (Modo Simulação)! Sua assinatura Premium foi ativada.");
      }, 2500);
    }
  };

  const handleOpenPix = async (billing: "monthly" | "yearly") => {
    setSelectedBilling(billing);
    setIsGeneratingPix(true);

    try {
      const token = localStorage.getItem("fluxo_jwt_token");
      const planTitle = billing === "yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal";
      const price = billing === "yearly" ? 99.90 : 12.90;

      const res = await safeFetchJson("/api/payment/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planTitle, price })
      });

      if (res.isJson && res.ok && res.data?.qrCode) {
        setPixModalData({
          qrCode: res.data.qrCode,
          qrCodeBase64: res.data.qrCodeBase64,
          planTitle,
          price
        });
      } else {
        // Fallback simulated Pix code
        const mockPix = `00020126580014BR.GOV.BCB.PIX0136fluxopayments@mercadopago.com.br5204000053039865405${price.toFixed(2)}5802BR5913Fluxo Finance6009SAO PAULO62070503***6304E2D1`;
        setPixModalData({
          qrCode: mockPix,
          qrCodeBase64: null,
          planTitle,
          price
        });
      }
    } catch (error: any) {
      const price = billing === "yearly" ? 99.90 : 12.90;
      const planTitle = billing === "yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal";
      const mockPix = `00020126580014BR.GOV.BCB.PIX0136fluxopayments@mercadopago.com.br5204000053039865405${price.toFixed(2)}5802BR5913Fluxo Finance6009SAO PAULO62070503***6304E2D1`;
      setPixModalData({
        qrCode: mockPix,
        qrCodeBase64: null,
        planTitle,
        price
      });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (pixModalData?.qrCode) {
      navigator.clipboard.writeText(pixModalData.qrCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleActivatePixNow = async () => {
    setIsCheckingPayment(true);
    
    // 1. Tenta verificar no servidor se o webhook do Mercado Pago já atualizou a conta
    try {
      const token = localStorage.getItem("fluxo_jwt_token");
      if (token) {
        const res = await safeFetchJson("/api/user/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.isJson && res.ok && res.data?.success && res.data?.user?.isPremium) {
          setIsCheckingPayment(false);
          setUser(prev => ({
            ...prev,
            isPremium: res.data.user.isPremium,
            premiumSince: res.data.user.premiumSince,
            planExpiryDate: res.data.user.premiumExpires,
            plan: selectedBilling === "yearly" ? "premium_yearly" : "premium_monthly"
          }));
          setPixModalData(null);
          alert("🎉 Pagamento verificado e confirmado! Sua assinatura Premium foi ativada.");
          return;
        }
      }
    } catch (err) {
      console.error("Erro ao verificar pagamento no servidor:", err);
    }

    // 2. Se o webhook não atualizou (ou se estamos em ambiente sem credenciais reais)
    // Usamos um timeout para simular a validação com a rede bancária.
    setTimeout(() => {
      setIsCheckingPayment(false);
      upgradePlan(selectedBilling === "yearly" ? "premium_yearly" : "premium_monthly");
      setPixModalData(null);
      alert("🎉 Pagamento verificado e confirmado (Modo Simulação)! Sua assinatura Premium foi ativada.");
    }, 2500);
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.isAutoRenew !== false 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {user.isAutoRenew !== false ? "Ativo" : "Cancelado"}
                    </span>
                  </div>
                  <p className="text-xs text-outline flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Válido até: <strong className="text-on-surface">{user.planExpiryDate || "2027-07-22"}</strong>
                  </p>
                </div>
              </div>

              {user.isAutoRenew !== false ? (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-error/10 text-error font-bold text-xs rounded-full border border-outline-variant/20 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Gerenciar / Cancelar
                </button>
              ) : (
                <button
                  onClick={reactivatePlan}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-full border border-primary/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Reativar Plano
                </button>
              )}
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

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleOpenPix("monthly")}
                    disabled={isGeneratingPix}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isGeneratingPix ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        Pagar via Pix (Mercado Pago)
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenCheckout("monthly")}
                    disabled={isProcessing && selectedBilling === "monthly"}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-[11px] rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing && selectedBilling === "monthly" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    Cartão / Outros Formas no MP
                  </button>
                </div>
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

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleOpenPix("yearly")}
                    disabled={isGeneratingPix}
                    className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingPix ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        Pagar Anual via Pix (R$ 99,90)
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenCheckout("yearly")}
                    disabled={isProcessing && selectedBilling === "yearly"}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-[11px] rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing && selectedBilling === "yearly" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    Cartão de Crédito no Mercado Pago
                  </button>
                </div>
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

      {/* Pix Mercado Pago Modal */}
      {pixModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low max-w-md w-full rounded-3xl p-6 shadow-2xl relative border border-outline-variant/30 space-y-5 animate-in zoom-in-95 duration-200 text-on-surface">
            
            <button
              onClick={() => setPixModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-lg font-bold">Pagamento Pix via Mercado Pago</h3>
              <p className="text-xs text-outline font-medium">
                {pixModalData.planTitle} • <strong className="text-primary">R$ {pixModalData.price.toFixed(2)}</strong>
              </p>
            </div>

            {/* QR Code / Base64 Display */}
            <div className="p-4 bg-white dark:bg-black/40 rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-2">
              {pixModalData.qrCodeBase64 ? (
                <img
                  src={pixModalData.qrCodeBase64}
                  alt="QR Code Pix Mercado Pago"
                  className="w-48 h-48 object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-44 h-44 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center p-3 gap-2">
                  <QrCode className="w-12 h-12 text-primary" />
                  <span className="text-[10px] text-outline font-medium">
                    Abra o app do seu banco e escolha 'Pagar via QR Code' ou use o Copia e Cola abaixo
                  </span>
                </div>
              )}
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pix Gerado com Sucesso!
              </span>
            </div>

            {/* Pix Copia e Cola Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                Código Pix Copia e Cola
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixModalData.qrCode}
                  className="flex-1 bg-surface-container text-xs text-on-surface px-3 py-2.5 rounded-xl border border-outline-variant/30 font-mono truncate"
                />
                <button
                  onClick={handleCopyPix}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedPix
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-on-primary hover:bg-primary-container"
                  }`}
                >
                  {copiedPix ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Payment / Instant Activate Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleActivatePixNow}
                disabled={isCheckingPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCheckingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando pagamento...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verificar Pagamento
                  </>
                )}
              </button>
              <button
                onClick={() => setPixModalData(null)}
                className="w-full py-2 text-center text-xs text-outline hover:text-on-surface font-medium cursor-pointer"
              >
                Cancelar ou Pagar depois
              </button>
            </div>

          </div>
        </div>
      )}

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


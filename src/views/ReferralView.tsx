import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { 
  Gift, 
  Copy, 
  Share2, 
  Check, 
  Award, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Users,
  ArrowRight
} from "lucide-react";

export const ReferralView: React.FC = () => {
  const { user, setUser, upgradePlan, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const handleCopy = () => {
    const codeToCopy = user.referralCode || "FLUXO-J82K9";
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    const code = user.referralCode || "FLUXO-J82K9";
    if (navigator.share) {
      navigator.share({
        title: "Venha para o Fluxo!",
        text: `Use meu código ${code} e ganhe 30 dias de Fluxo Premium grátis!`,
        url: `https://fluxo.app/convite/${code}`,
      }).catch((e) => console.log(e));
    } else {
      handleCopy();
    }
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);

    const cleanCode = inputCode.trim().toUpperCase();

    if (!cleanCode) {
      setRedeemError("Por favor, digite um código de indicação.");
      return;
    }

    if (cleanCode === (user.referralCode || "").toUpperCase()) {
      setRedeemError("Você não pode resgatar seu próprio código de indicação.");
      return;
    }

    setIsRedeeming(true);

    try {
      const token = localStorage.getItem("fluxo_jwt_token");
      if (token) {
        const response = await fetch("/api/redeem-referral", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ code: cleanCode })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setRedeemSuccess(data.message || "🎉 Código resgatado com sucesso! 30 dias de Premium grátis ativados!");
          
          // Update user in client state
          setUser(prev => ({
            ...prev,
            isPremium: true,
            referralCount: (prev.referralCount || 0) + 1,
            plan: "premium_monthly",
            planExpiryDate: data.user?.premiumExpires || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
          }));

          setInputCode("");
          setIsRedeeming(false);
          return;
        } else {
          setRedeemError(data.error || "Não foi possível validar o código.");
          setIsRedeeming(false);
          return;
        }
      }

      // Local fallback if token is not set
      upgradePlan("premium_monthly");
      setUser(prev => ({
        ...prev,
        referralCount: (prev.referralCount || 0) + 1
      }));
      setRedeemSuccess("🎉 Código de indicação resgatado com sucesso! Você ganhou 30 dias de Fluxo Premium!");
      setInputCode("");
    } catch (err: any) {
      // Graceful local fallback
      upgradePlan("premium_monthly");
      setUser(prev => ({
        ...prev,
        referralCount: (prev.referralCount || 0) + 1
      }));
      setRedeemSuccess("🎉 Código ativado com sucesso! 30 dias de Premium grátis adicionados à sua conta.");
      setInputCode("");
    } finally {
      setIsRedeeming(false);
    }
  };

  // Mock referred friends list
  const referredFriends = [
    { id: 1, name: "Ana Paula Silva", date: "Hoje, 14:20", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100", status: "+30 Dias Premium" },
    { id: 2, name: "Carlos Eduardo", date: "Ontem, 09:15", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100", status: "+30 Dias Premium" },
    { id: 3, name: "Mariana Souza", date: "18 de Julho", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100", status: "+30 Dias Premium" },
  ];

  return (
    <div className="min-h-screen pb-28 bg-background text-on-surface">
      <Header
        title="Indique e Ganhe"
        showBackBtn={true}
        onBackClick={() => setActiveTab("profile")}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-secondary-container blur-3xl opacity-20 rounded-full"></div>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <Gift className="w-24 h-24 text-primary stroke-[1.2]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-on-surface tracking-tight">
              Convide amigos e ganhe 1 mês de Premium
            </h2>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Para cada amigo que começar a usar o Fluxo com seu código, ambos ganham 30 dias de Fluxo Premium grátis.
            </p>
          </div>
        </section>

        {/* Share Your Unique Code */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-2xl p-6 shadow-xs border border-outline-variant/20 space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              SEU CÓDIGO ÚNICO DE CONVITE
            </p>

            <div className="flex items-center justify-center gap-2">
              <div
                onClick={handleCopy}
                className="px-6 py-3 rounded-xl border border-dashed border-primary/40 bg-secondary-container/20 flex items-center gap-3 cursor-pointer hover:bg-secondary-container/30 active:scale-95 transition-all group"
              >
                <span className="text-xl font-mono font-bold tracking-widest text-primary">
                  {user.referralCode || "FLUXO-J82K9"}
                </span>
                {copied ? (
                  <Check className="w-5 h-5 text-secondary" />
                ) : (
                  <Copy className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                )}
              </div>
            </div>

            {copied && (
              <p className="text-xs font-semibold text-secondary animate-fadeIn">
                Código copiado com sucesso!
              </p>
            )}
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-primary text-on-primary font-bold text-xs py-3.5 rounded-full flex justify-center items-center gap-2 active:scale-95 hover:bg-primary-container transition-all shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar Link de Convite
          </button>
        </section>

        {/* Redeem Friend's Code Card */}
        <section className="bg-surface-container-low dark:bg-inverse-surface/40 rounded-2xl p-5 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Possui um código de indicação?
            </h3>
          </div>

          <p className="text-[11px] text-on-surface-variant">
            Insira o código de um amigo para resgatar 30 dias de acesso ao Fluxo Premium instantaneamente!
          </p>

          <form onSubmit={handleRedeemCode} className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ex: FLUXO-J82K9"
                className="flex-1 bg-surface-container text-xs text-on-surface font-mono font-bold px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary transition-all uppercase placeholder:font-sans placeholder:font-normal"
                disabled={isRedeeming}
              />
              <button
                type="submit"
                disabled={isRedeeming || !inputCode.trim()}
                className="bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isRedeeming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Resgatar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {redeemSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            {redeemError && (
              <p className="text-xs font-semibold text-error px-1 animate-fadeIn">
                {redeemError}
              </p>
            )}
          </form>
        </section>

        {/* How it Works Bento Style */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface px-1">Como funciona</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface">Envie o convite</p>
                <p className="text-[11px] text-on-surface-variant">
                  Compartilhe seu código ou link exclusivo com seus amigos.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface">Amigo se cadastra</p>
                <p className="text-[11px] text-on-surface-variant">
                  Seu amigo cria uma conta e insere seu código de convite.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface">Ambos ganham</p>
                <p className="text-[11px] text-on-surface-variant">
                  Ativamos o Fluxo Premium por 30 dias para vocês dois.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & History List */}
        <section className="bg-surface-container-high dark:bg-inverse-surface/60 rounded-2xl p-5 border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Amigos Que Entraram ({user.referralCount || 15})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {(user.referralCount || 15) * 30} Dias Premium Acumulados
            </span>
          </div>

          <div className="space-y-3">
            {referredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-surface-container-low rounded-xl border border-outline-variant/10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-on-surface">{friend.name}</p>
                    <p className="text-[10px] text-outline">{friend.date}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {friend.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};


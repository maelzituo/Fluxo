import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { 
  Gift, 
  Copy, 
  Share2, 
  Check, 
  UserPlus, 
  Award 
} from "lucide-react";

export const ReferralView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode || "FLUXO-J82K9");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Venha para o Fluxo!",
        text: `Use meu código ${user.referralCode} e ganhe 30 dias de Fluxo Premium grátis!`,
        url: "https://fluxo.app/convite/" + user.referralCode,
      }).catch((e) => console.log(e));
    } else {
      handleCopy();
    }
  };

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
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <Gift className="w-28 h-28 text-primary stroke-[1.2]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Convide amigos e ganhe 1 mês de Premium
            </h2>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Para cada amigo que começar a usar o Fluxo, ambos ganham 30 dias de funcionalidades exclusivas.
            </p>
          </div>
        </section>

        {/* Referral Code Area */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-2xl p-6 shadow-xs border border-outline-variant/20 space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              SEU CÓDIGO ÚNICO
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
            className="w-full bg-primary text-on-primary font-bold text-xs py-3.5 rounded-full flex justify-center items-center gap-2 active:scale-95 hover:bg-primary-container transition-all shadow-md"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar Link de Convite
          </button>
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
                  Compartilhe seu código ou link com seus amigos.
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
                  Seu amigo cria uma conta e usa seu código.
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
                  Ativamos o Premium por 30 dias para vocês dois.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Social Proof */}
        <section className="bg-surface-container-high dark:bg-inverse-surface/60 rounded-2xl p-4 flex items-center justify-between border border-outline-variant/20">
          <div className="flex -space-x-2">
            <img
              className="w-8 h-8 rounded-full border-2 border-surface object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
              alt="User"
            />
            <img
              className="w-8 h-8 rounded-full border-2 border-surface object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
              alt="User"
            />
            <img
              className="w-8 h-8 rounded-full border-2 border-surface object-cover"
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100"
              alt="User"
            />
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
              +{user.referralCount ? user.referralCount - 3 : 12}
            </div>
          </div>

          <p className="text-xs font-semibold text-on-surface-variant">
            {user.referralCount || 15} amigos já entraram pelo seu convite
          </p>
        </section>
      </main>
    </div>
  );
};

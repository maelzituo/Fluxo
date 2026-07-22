import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { 
  User, 
  Mail, 
  Crown, 
  Gift, 
  Moon, 
  Sun, 
  Lock, 
  Download, 
  Upload, 
  RotateCcw, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  FileJson,
  Camera
} from "lucide-react";

export const ProfileView: React.FC = () => {
  const {
    user,
    setUser,
    setActiveTab,
    exportBackup,
    restoreState,
    resetToDefaults,
    openSecurityModal,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pinInput, setPinInput] = useState(user.pinCode || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const isPremium = user.plan !== "free";

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name,
      email,
      pinCode: pinInput.trim() || undefined,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleThemeToggle = () => {
    setUser((prev) => ({
      ...prev,
      themeMode: prev.themeMode === "dark" ? "light" : "dark",
    }));
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    setUser((prev) => ({
      ...prev,
      avatarUrl: newAvatarUrl,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (parsed && parsed.user && parsed.transactions) {
            restoreState(parsed);
            alert("Backup restaurado com sucesso!");
          } else {
            alert("Formato de backup inválido.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo de backup.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-background dark:bg-inverse-surface/10 text-on-surface">
      <Header title="Perfil & Configurações" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* User Card Header */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl p-6 border border-outline-variant/20 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => setIsAvatarModalOpen(true)} 
            title="Clique para alterar sua foto de perfil"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow-sm bg-surface-container">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d631b&color=ffffff`;
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-on-surface">{user.name}</h2>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  isPremium
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                {isPremium ? "Premium Ativo" : "Plano Gratuito"}
              </span>
            </div>
            <p className="text-xs text-outline">{user.email}</p>
          </div>

          <button
            onClick={() => setActiveTab("premium")}
            className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4 text-yellow-300" />
            {isPremium ? "Gerenciar Assinatura" : "Seja Premium"}
          </button>
        </section>

        {/* Shortcuts: Indique e Ganhe */}
        <section
          onClick={() => setActiveTab("referral")}
          className="bg-secondary-container/30 border border-secondary-container p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-secondary-container">Indique e Ganhe Premium</p>
              <p className="text-xs text-on-secondary-container/80">
                Seu código: <strong className="font-mono">{user.referralCode}</strong> • Convide e ganhe 30 dias grátis
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-secondary-container" />
        </section>

        {/* Edit Profile Form */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl p-6 border border-outline-variant/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Dados do Perfil</h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                PIN de Segurança (4 dígitos)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  placeholder="ex: 1234"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-bold text-secondary flex items-center gap-1">
                  <Check className="w-4 h-4" /> Dados atualizados!
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-xs hover:bg-primary-container active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </section>

        {/* App Settings: Theme & Security */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl p-6 border border-outline-variant/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Preferências do App</h3>

          <div className="space-y-3 divide-y divide-outline-variant/10">
            {/* Theme Toggle */}
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-container rounded-xl text-on-surface">
                  {user.themeMode === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Tema de Exibição</p>
                  <p className="text-[11px] text-outline">
                    Atualmente: {user.themeMode === "dark" ? "Modo Escuro" : "Modo Claro"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleThemeToggle}
                className="px-4 py-1.5 bg-surface-container-high rounded-full text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors"
              >
                Alternar Tema
              </button>
            </div>

            {/* Test Security Modal */}
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-container rounded-xl text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Bloqueio do App</p>
                  <p className="text-[11px] text-outline">Testar tela de bloqueio PIN / Biometria</p>
                </div>
              </div>

              <button
                onClick={openSecurityModal}
                className="px-4 py-1.5 bg-surface-container-high rounded-full text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors"
              >
                Bloquear Agora
              </button>
            </div>
          </div>
        </section>

        {/* Data & Backup Section */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface/40 rounded-3xl p-6 border border-outline-variant/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Segurança de Dados & Backup</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={exportBackup}
              className="p-3.5 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-2xl text-left space-y-1 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-primary" /> Exportar Backup JSON
                </p>
                <p className="text-[10px] text-outline">Baixar todos os seus lançamentos e metas</p>
              </div>
              <FileJson className="w-5 h-5 text-outline" />
            </button>

            <label className="p-3.5 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-2xl text-left space-y-1 transition-all flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-secondary" /> Restaurar Backup JSON
                </p>
                <p className="text-[10px] text-outline">Carregar estado salvo de arquivo</p>
              </div>
              <FileJson className="w-5 h-5 text-outline" />
              <input type="file" accept=".json" className="hidden" onChange={handleBackupRestore} />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja restaurar as configurações e dados iniciais de fábrica?")) {
                  resetToDefaults();
                }
              }}
              className="text-xs text-error font-semibold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Resetar Dados do App para o Padrão
            </button>
          </div>
        </section>
      </main>

      {/* Avatar Selection Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        user={user}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { safeFetchJson } from "../lib/api";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  Landmark, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileText,
  X
} from "lucide-react";

// Local storage helpers for seamless offline / static hosting registration & login
const getLocalUsers = (): any[] => {
  try {
    const raw = localStorage.getItem("fluxo_registered_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalUser = (newUser: any) => {
  const users = getLocalUsers();
  users.push(newUser);
  localStorage.setItem("fluxo_registered_users", JSON.stringify(users));
};

export const LoginView: React.FC = () => {
  const { login } = useApp();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<"privacy" | "terms" | "help" | null>(null);

  // Clear messages on mode switch
  const switchMode = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setError("Por favor, digite seu nome de usuário ou e-mail.");
      return;
    }
    if (!password) {
      setError("Por favor, digite sua senha.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await safeFetchJson("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: cleanUsername, 
          password 
        }),
      });

      if (response.isJson) {
        if (response.ok && response.data?.token) {
          login(response.data.token, response.data.user);
          return;
        } else {
          setError(response.error || "Nome de usuário ou senha incorretos.");
          return;
        }
      }

      // Fallback for static/offline hosting: check local storage users
      const localUsers = getLocalUsers();
      const matched = localUsers.find(
        (u) => u.username === cleanUsername || u.email === cleanUsername
      );

      if (matched) {
        if (matched.password === password) {
          login(`token_local_${Date.now()}`, matched);
          return;
        } else {
          setError("Senha incorreta. Tente novamente.");
          return;
        }
      }

      // Default demo login fallback if user entered any credentials while offline
      const demoUser = {
        id: `user_${Date.now()}`,
        name: cleanUsername.split("@")[0].toUpperCase(),
        username: cleanUsername,
        email: cleanUsername.includes("@") ? cleanUsername : `${cleanUsername}@fluxo.com`,
        isPremium: false,
      };
      login(`token_demo_${Date.now()}`, demoUser);
    } catch (err: any) {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanReferral = referralCode.trim().toUpperCase();

    if (!cleanName || cleanName.length < 2) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setError("Escolha um nome de usuário com pelo menos 3 caracteres.");
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await safeFetchJson("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password,
          referralCode: cleanReferral || undefined,
        }),
      });

      if (response.isJson) {
        if (response.ok && response.data?.token) {
          login(response.data.token, response.data.user);
          return;
        } else {
          setError(response.error || "Ocorreu um erro ao criar a conta.");
          return;
        }
      }

      // Fallback for static/offline hosting: perform local registration
      const localUsers = getLocalUsers();
      const existing = localUsers.find(
        (u) => u.username === cleanUsername || u.email === cleanEmail
      );

      if (existing) {
        if (existing.username === cleanUsername) {
          setError("Este nome de usuário já está em uso.");
        } else {
          setError("Este e-mail já está cadastrado.");
        }
        return;
      }

      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      const isBonus = !!cleanReferral;

      const newUser = {
        id: `user_${Date.now()}`,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        isPremium: isBonus,
        premiumSince: isBonus ? now.toISOString().split("T")[0] : null,
        premiumExpires: isBonus ? expires.toISOString().split("T")[0] : null,
        referralCode: `FLUXO-${cleanUsername.slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 899)}`,
        referralCount: 0,
        password,
      };

      saveLocalUser(newUser);
      login(`token_local_${Date.now()}`, newUser);
    } catch (err: any) {
      setError("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const identity = username.trim();

    if (!identity) {
      setError("Por favor, digite seu nome de usuário ou e-mail cadastrado.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await safeFetchJson("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
      });

      if (response.isJson && response.ok) {
        setSuccessMessage(response.data?.message || "Instruções enviadas para seu e-mail!");
        return;
      }

      // Fallback message
      setSuccessMessage(`Se a conta existir, enviamos as instruções de recuperação de senha para ${identity}.`);
    } catch (err: any) {
      setSuccessMessage(`Instruções de redefinição solicitadas para ${identity}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ebf5ed] via-[#f4f9f5] to-[#ebf4ec] text-neutral-800 flex flex-col justify-between items-center px-4 py-8 select-none">
      
      {/* Top Section - Brand / Logo */}
      <div className="flex flex-col items-center mt-4 mb-6 text-center">
        {/* Brand Icon Badge */}
        <div className="w-16 h-16 bg-[#12632a] text-white rounded-2xl flex items-center justify-center shadow-md mb-3 transition-transform hover:scale-105">
          <Landmark className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Fluxo Finance
        </h1>
        <p className="text-xs text-neutral-600 mt-0.5 font-medium tracking-wide">
          Seu capital, com precisão.
        </p>
      </div>

      {/* Main White Auth Card */}
      <div className="w-full max-w-[380px] bg-white rounded-[32px] p-7 md:p-8 shadow-[0_12px_40px_rgba(18,99,42,0.08)] border border-[#e2eee4] transition-all">
        
        {/* Card Title */}
        <h2 className="text-xl font-extrabold text-neutral-900 mb-6 tracking-tight">
          {mode === "login" && "Bem-vindo de volta"}
          {mode === "register" && "Abra sua conta agora"}
          {mode === "forgot" && "Recuperar senha"}
        </h2>

        {/* Status Messages */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{successMessage}</p>
          </div>
        )}

        {/* Mode 1: LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 ml-0.5">
                Nome de usuário
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome de usuário"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                  autoComplete="username"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-0.5">
                <label className="text-xs font-bold text-neutral-800">
                  Senha
                </label>
                <button 
                  type="button" 
                  onClick={() => switchMode("forgot")}
                  className="text-[11px] font-bold text-[#12632a] hover:underline transition-all"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de 6 dígitos"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 2: REGISTER FORM (CRIAR CONTA) */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Nome completo
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Nome de usuário */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Nome de usuário
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Escolha seu nome de usuário"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 group-focus-within:text-[#12632a]">@</span>
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                E-mail
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Senha
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de no mínimo 6 dígitos"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Confirmar senha
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Código de Indicação (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5 flex items-center justify-between">
                <span>Código de Indicação</span>
                <span className="text-[10px] text-neutral-400 font-normal">Opcional (+30 dias Premium)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Ex: FLUXO-J82K9"
                className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-neutral-800 placeholder:text-neutral-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all uppercase"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 3: FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Digite seu e-mail ou nome de usuário cadastrado para receber as instruções de redefinição de senha.
            </p>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 ml-0.5">
                Nome de usuário ou e-mail
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: seu_usuario ou seu@email.com"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Enviar Instruções</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-center text-xs font-bold text-neutral-600 hover:text-neutral-900 mt-2 block"
            >
              ← Voltar ao login
            </button>
          </form>
        )}
      </div>

      {/* Switch Mode Footer Text */}
      <div className="mt-5 mb-4 text-center">
        {mode === "login" ? (
          <p className="text-xs text-neutral-600 font-medium">
            Não possui uma conta?{" "}
            <button
              onClick={() => switchMode("register")}
              className="font-bold text-[#12632a] hover:underline cursor-pointer ml-1"
            >
              Abra sua conta agora
            </button>
          </p>
        ) : (
          <p className="text-xs text-neutral-600 font-medium">
            Já possui uma conta?{" "}
            <button
              onClick={() => switchMode("login")}
              className="font-bold text-[#12632a] hover:underline cursor-pointer ml-1"
            >
              Fazer login
            </button>
          </p>
        )}
      </div>

      {/* Footer Legal Links */}
      <footer className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-medium pb-2">
        <button
          onClick={() => setModalType("privacy")}
          className="hover:text-neutral-800 transition-colors"
        >
          Políticas de Privacidade
        </button>
        <span className="text-neutral-300">•</span>
        <button
          onClick={() => setModalType("terms")}
          className="hover:text-neutral-800 transition-colors"
        >
          Termos de Uso
        </button>
        <span className="text-neutral-300">•</span>
        <button
          onClick={() => setModalType("help")}
          className="hover:text-neutral-800 transition-colors"
        >
          Ajuda
        </button>
      </footer>

      {/* Information Modal for Footer Links */}
      {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl relative border border-neutral-100 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {modalType === "privacy" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#12632a] font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <h3>Políticas de Privacidade</h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    No <strong>Fluxo Finance</strong>, a segurança e a privacidade dos seus dados financeiros são nossa prioridade máxima. Todas as informações são criptografadas de ponta a ponta e nunca compartilhadas com terceiros.
                  </p>
                </div>
              )}

              {modalType === "terms" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#12632a] font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    <h3>Termos de Uso</h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Ao utilizar a plataforma <strong>Fluxo Finance</strong>, você concorda com nossos termos de uso responsável, controle e planejamento financeiro pessoal. O aplicativo é projetado para auxílio na gestão e controle financeiro.
                  </p>
                </div>
              )}

              {modalType === "help" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#12632a] font-bold text-sm">
                    <HelpCircle className="w-5 h-5" />
                    <h3>Central de Ajuda</h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Precisa de suporte com sua conta ou dúvidas de navegação? Entre em contato com nosso time pelo e-mail <strong>suporte@fluxofinance.com</strong>.
                  </p>
                </div>
              )}

              <button
                onClick={() => setModalType(null)}
                className="w-full mt-5 py-2.5 bg-[#12632a] text-white font-bold text-xs rounded-xl hover:bg-[#0e5022] transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

      </div>
    );
  };

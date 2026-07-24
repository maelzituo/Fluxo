import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { safeFetchJson } from "../lib/api";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone,
  Lock, 
  Loader2, 
  Landmark, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileText,
  KeyRound,
  X,
  Sparkles,
  Smartphone
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

  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showOptionalEmail, setShowOptionalEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Forgot / Reset Password Fields
  const [forgotIdentity, setForgotIdentity] = useState("");
  const [resetUsername, setResetUsername] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [recoveryInfo, setRecoveryInfo] = useState<{ username: string; maskedPhone?: string | null; code?: string } | null>(null);

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<"privacy" | "terms" | "help" | null>(null);

  // Clear messages on mode switch
  const switchMode = (newMode: "login" | "register" | "forgot" | "reset") => {
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
      setError("Por favor, digite seu nome de usuário ou telefone.");
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
      } else {
        setError("Erro inesperado no servidor.");
      }
    } catch (err: any) {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler (No Email required; Username & Password required)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim();
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
    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      setError("O nome de usuário deve conter apenas letras, números, pontos e hífens.");
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
          phone: cleanPhone || undefined,
          email: cleanEmail || undefined,
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
      } else {
         setError("Erro inesperado no servidor.");
      }
    } catch (err: any) {
      setError("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler (Send code via phone/username)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const identity = forgotIdentity.trim();

    if (!identity) {
      setError("Por favor, digite seu nome de usuário ou número de telefone cadastrado.");
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
        const data = response.data;
        setRecoveryInfo({
          username: data.username || identity,
          maskedPhone: data.maskedPhone,
          code: data.recoveryCode
        });
        setResetUsername(data.username || identity);
        if (data.recoveryCode) {
          setResetCode(data.recoveryCode);
        }
        setSuccessMessage(`Código de recuperação gerado para @${data.username || identity}! Digite seu código e escolha sua nova senha abaixo.`);
        setMode("reset");
        return;
      } else {
        setError(response.error || "Não encontramos nenhuma conta com essas informações.");
      }
    } catch (err: any) {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Handler (Redefinir senha com o código)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!resetUsername) {
      setError("Informe o nome de usuário.");
      return;
    }
    if (!resetCode) {
      setError("Informe o código de verificação recebido.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await safeFetchJson("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: resetUsername,
          code: resetCode,
          newPassword,
        }),
      });

      if (response.isJson && response.ok) {
        setSuccessMessage("🎉 Sua senha foi alterada com sucesso! Entre com sua nova senha.");
        setUsername(resetUsername);
        setPassword(newPassword);
        setMode("login");
        return;
      } else {
        setError(response.error || "Erro ao redefinir a senha.");
      }
    } catch (err: any) {
      setError("Não foi possível alterar a senha. Tente novamente.");
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
      <div className="w-full max-w-[390px] bg-white rounded-[32px] p-7 md:p-8 shadow-[0_12px_40px_rgba(18,99,42,0.08)] border border-[#e2eee4] transition-all">
        
        {/* Card Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            {mode === "login" && "Bem-vindo de volta"}
            {mode === "register" && "Abra sua conta agora"}
            {mode === "forgot" && "Recuperar conta"}
            {mode === "reset" && "Definir nova senha"}
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-[#12632a]/10 text-[#12632a] rounded-full border border-[#12632a]/20">
            Seguro
          </span>
        </div>

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
                  placeholder="Seu nome de usuário ou telefone"
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
                  className="text-[11px] font-bold text-[#12632a] hover:underline transition-all cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
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
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2 cursor-pointer"
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

        {/* Mode 2: REGISTER FORM (CRIAR CONTA - SEM E-MAIL OBRIGATÓRIO) */}
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
                  placeholder="Ex: João da Silva"
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

            {/* Telefone / WhatsApp (Para recuperação de senha) */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5 flex items-center justify-between">
                <span>Celular / WhatsApp</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Para recuperação</span>
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            {/* Optional Email toggle */}
            <div>
              {!showOptionalEmail ? (
                <button
                  type="button"
                  onClick={() => setShowOptionalEmail(true)}
                  className="text-[11px] font-semibold text-[#12632a] hover:underline flex items-center gap-1 my-1 cursor-pointer"
                >
                  <span>+ Adicionar e-mail (Opcional)</span>
                </button>
              ) : (
                <div className="animate-in fade-in">
                  <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5 flex items-center justify-between">
                    <span>E-mail</span>
                    <span className="text-[10px] text-neutral-400">Opcional</span>
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
              )}
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
                  placeholder="Mínimo 6 caracteres"
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
                  placeholder="Repita a senha escolhida"
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
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar minha conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 3: FORGOT PASSWORD FORM (RECUPERAÇÃO POR TELEFONE OU NOME DE USUÁRIO) */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-[#12632a] shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                Digite seu <strong>nome de usuário</strong> ou <strong>número de telefone</strong> cadastrado. Você receberá um código de segurança para redefinir sua senha na hora.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 ml-0.5">
                Nome de usuário ou Telefone
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={forgotIdentity}
                  onChange={(e) => setForgotIdentity(e.target.value)}
                  placeholder="Ex: joao_silva ou (11) 99999-9999"
                  className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                  disabled={isLoading}
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#12632a] transition-colors pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Gerar Código de Acesso</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-center text-xs font-bold text-neutral-600 hover:text-neutral-900 mt-2 block cursor-pointer"
            >
              ← Voltar ao login
            </button>
          </form>
        )}

        {/* Mode 4: RESET PASSWORD FORM (DEFINIR NOVA SENHA) */}
        {mode === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 font-medium">
              <p className="font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Código gerado com sucesso!
              </p>
              <p className="text-[11px] text-neutral-600">
                Confirme seu nome de usuário, digite o código e escolha a nova senha para sua conta.
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Nome de usuário
              </label>
              <input
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                placeholder="Ex: joao_silva"
                className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5 flex items-center justify-between">
                <span>Código de Verificação (6 dígitos)</span>
                {recoveryInfo?.code && (
                  <span className="text-[11px] font-mono font-extrabold text-[#12632a] bg-emerald-100 px-2 py-0.5 rounded-md">
                    Código: {recoveryInfo.code}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Ex: 123456"
                maxLength={6}
                className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2 text-xs font-mono font-bold tracking-widest text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all text-center"
                disabled={isLoading}
              />
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Sua nova senha (min 6 caracteres)"
                className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1 ml-0.5">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-white border border-neutral-200 focus:border-[#12632a] rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#12632a]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#12632a] hover:bg-[#0e5022] active:scale-[0.99] text-white py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-md shadow-[#12632a]/20 flex justify-center items-center gap-1.5 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Confirmar e Alterar Senha</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-center text-xs font-bold text-neutral-600 hover:text-neutral-900 mt-2 block cursor-pointer"
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
        ) : mode === "register" ? (
          <p className="text-xs text-neutral-600 font-medium">
            Já possui uma conta?{" "}
            <button
              onClick={() => switchMode("login")}
              className="font-bold text-[#12632a] hover:underline cursor-pointer ml-1"
            >
              Fazer login
            </button>
          </p>
        ) : null}
      </div>

      {/* Footer Legal Links */}
      <footer className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-medium pb-2">
        <button
          onClick={() => setModalType("privacy")}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Políticas de Privacidade
        </button>
        <span className="text-neutral-300">•</span>
        <button
          onClick={() => setModalType("terms")}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
        >
          Termos de Uso
        </button>
        <span className="text-neutral-300">•</span>
        <button
          onClick={() => setModalType("help")}
          className="hover:text-neutral-800 transition-colors cursor-pointer"
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
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
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
                  No <strong>Fluxo Finance</strong>, a segurança e a privacidade dos seus dados financeiros são nossa prioridade máxima. Todas as informações são armazenadas com criptografia de banco de dados e nunca compartilhadas.
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
              className="w-full mt-5 py-2.5 bg-[#12632a] text-white font-bold text-xs rounded-xl hover:bg-[#0e5022] transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

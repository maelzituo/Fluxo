import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SocialAuthModal } from "../components/SocialAuthModal";
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

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<"privacy" | "terms" | "help" | null>(null);
  const [socialProviderModal, setSocialProviderModal] = useState<"google" | "apple" | null>(null);

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

    if (!username.trim()) {
      setError("Por favor, digite seu nome de usuário ou e-mail.");
      return;
    }
    if (!password) {
      setError("Por favor, digite sua senha de 6 dígitos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao tentar fazer login.");
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError("Escolha um nome de usuário com pelo menos 3 caracteres.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao criar a conta.");
      }

      // Automatically log in the user after creation!
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setError("Por favor, digite seu nome de usuário ou e-mail cadastrado.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar a recuperação.");
      }

      setSuccessMessage(data.message || "Instruções enviadas para seu e-mail!");
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth Handler
  const handleSocialAuth = (provider: "google" | "apple") => {
    setError(null);
    setSocialProviderModal(provider);
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

        {/* Social Auth Divider & Buttons */}
        {mode !== "forgot" && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap absolute">
                OU CONTINUE COM
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Google Login */}
              <button
                type="button"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8faf8] hover:bg-[#edf4ee] active:scale-[0.98] border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Apple Login */}
              <button
                type="button"
                onClick={() => handleSocialAuth("apple")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f8faf8] hover:bg-[#edf4ee] active:scale-[0.98] border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 transition-all"
              >
                <svg className="w-4 h-4 fill-current text-neutral-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.63-7.14-7.24-11.64-13.83-8.8-12.87-15.35-27.17-19.64-42.92-4.29-15.75-6.44-30.32-6.44-43.72 0-16.1 3.86-29.62 11.58-40.56 7.72-10.94 17.51-16.51 29.38-16.71 4.57 0 9.77 1.18 15.6 3.55 5.83 2.37 9.87 3.56 12.13 3.56 2.03 0 6.22-1.25 12.58-3.75 6.36-2.5 11.45-3.62 15.27-3.36 12.52.88 22.45 5.43 29.8 13.65-11.07 6.69-16.48 15.93-16.23 27.72.26 10.15 4.3 18.59 12.13 25.32 7.83 6.73 17.06 10.45 27.69 11.16-2.5 7.42-5.74 15.01-9.72 22.78zM119.22 31.84c0-7.23 2.65-14.18 7.95-20.85 5.3-6.67 11.89-10.63 19.78-11.89.26 1.05.39 1.97.39 2.76 0 7.1-2.73 14.14-8.18 21.11-5.45 6.97-12.03 10.93-19.74 11.88-.06-.86-.2-1.87-.2-3.01z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Switch Mode Footer Text */}
      <div className="mt-6 mb-4 text-center">
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

      {/* Social Auth Modal (Google & Apple) */}
      <SocialAuthModal
        provider={socialProviderModal}
        onClose={() => setSocialProviderModal(null)}
        onSuccess={(token, user) => {
          setSocialProviderModal(null);
          login(token, user);
        }}
      />

    </div>
  );
};

import React, { useState } from "react";
import { X, Loader2, ShieldCheck, ExternalLink } from "lucide-react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

interface SocialAuthModalProps {
  provider: "google" | "apple" | null;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  provider,
  onClose,
  onSuccess,
}) => {
  if (!provider) return null;

  const isGoogle = provider === "google";
  const [email, setEmail] = useState(
    isGoogle ? "ismaelduarteorrico@gmail.com" : "ismael.orrico@icloud.com"
  );
  const [name, setName] = useState(
    isGoogle ? "Ismael Duarte" : "Ismael Duarte Orrico"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePopupGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch("/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro na verificação do token do Google.");
        }
        onSuccess(data.token, data.user);
      } catch (err: any) {
        setError(err.message || "Falha na autenticação via Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Não foi possível autenticar. Certifique-se de autorizar a origem no Google Cloud Console.");
    },
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na verificação do token do Google.");
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Falha na autenticação via Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, digite um e-mail válido.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro na autenticação social.`);
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Falha ao conectar.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-6 md:p-7 shadow-2xl relative border border-neutral-100 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          {isGoogle ? (
            <div className="w-14 h-14 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center mb-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
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
            </div>
          ) : (
            <div className="w-14 h-14 bg-black text-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.63-7.14-7.24-11.64-13.83-8.8-12.87-15.35-27.17-19.64-42.92-4.29-15.75-6.44-30.32-6.44-43.72 0-16.1 3.86-29.62 11.58-40.56 7.72-10.94 17.51-16.51 29.38-16.71 4.57 0 9.77 1.18 15.6 3.55 5.83 2.37 9.87 3.56 12.13 3.56 2.03 0 6.22-1.25 12.58-3.75 6.36-2.5 11.45-3.62 15.27-3.36 12.52.88 22.45 5.43 29.8 13.65-11.07 6.69-16.48 15.93-16.23 27.72.26 10.15 4.3 18.59 12.13 25.32 7.83 6.73 17.06 10.45 27.69 11.16-2.5 7.42-5.74 15.01-9.72 22.78zM119.22 31.84c0-7.23 2.65-14.18 7.95-20.85 5.3-6.67 11.89-10.63 19.78-11.89.26 1.05.39 1.97.39 2.76 0 7.1-2.73 14.14-8.18 21.11-5.45 6.97-12.03 10.93-19.74 11.88-.06-.86-.2-1.87-.2-3.01z" />
              </svg>
            </div>
          )}

          <h3 className="text-base font-extrabold text-neutral-900">
            {isGoogle ? "Fazer login com o Google" : "Iniciar sessão com Apple ID"}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Conectar com Fluxo Finance
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {isGoogle && (
          <div className="flex flex-col items-center justify-center mb-4 space-y-2.5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Janela do Google não respondeu. Tente a opção em pop-up abaixo ou verifique o Google Console.")}
              useOneTap={false}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
            
            <button
              type="button"
              onClick={() => handlePopupGoogleLogin()}
              disabled={isLoading}
              className="w-full max-w-[240px] py-2 px-4 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Abrir Pop-up de Login Google</span>
            </button>

            <p className="text-[10px] text-neutral-400 mt-1">ou valide com o seu e-mail abaixo:</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {isGoogle ? "E-mail da Conta Google" : "E-mail do Apple ID"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#12632a] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-800 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome"
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#12632a] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-800 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isGoogle
                  ? "bg-[#1a73e8] hover:bg-[#1557b0] shadow-blue-500/20"
                  : "bg-black hover:bg-neutral-800 shadow-black/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar como {name.split(" ")[0] || provider}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-neutral-400 mt-4 leading-normal">
          Ao continuar, o Fluxo Finance receberá a confirmação de autenticação via {isGoogle ? "Google OAuth 2.0" : "Apple"}.
        </p>
      </div>
    </div>
  );
};


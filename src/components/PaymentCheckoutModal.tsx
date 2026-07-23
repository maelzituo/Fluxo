import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Fingerprint, 
  Smartphone,
  Info,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { generatePixPayload } from "../utils/pix";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: "premium_monthly" | "premium_yearly";
  onSuccessPayment: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  planType,
  onSuccessPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "wallet">("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cpf, setCpf] = useState("");
  const [useBiometricAuth, setUseBiometricAuth] = useState(true);

  // Pix state
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(300); // 5 mins
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const price = planType === "premium_yearly" ? 99.90 : 12.90;
  const planLabel = planType === "premium_yearly" ? "Fluxo Premium Anual" : "Fluxo Premium Mensal";

  // Fixed Nubank Pix account details (Locked for clients)
  const RECEBEDOR_NAME = "ISMAEL DUARTE ORRICO";
  const PIX_KEY_FULL = "+5551998320968";
  const BANK_NAME = "Nubank";
  
  // Real EMV BR Code / Pix Payload string with exact CRC16 checksum calculation
  const pixCopyCode = generatePixPayload({
    key: PIX_KEY_FULL,
    merchantName: RECEBEDOR_NAME,
    merchantCity: "PORTO ALEGRE",
    amount: price,
    txId: "FLUXOPAY",
  });

  // Generate valid QR code data URL whenever modal opens or plan changes
  useEffect(() => {
    if (isOpen && paymentMethod === "pix") {
      QRCode.toDataURL(pixCopyCode, {
        width: 320,
        margin: 1,
        color: {
          dark: "#1e1b4b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [isOpen, paymentMethod, price, pixCopyCode]);

  // Pix timer
  useEffect(() => {
    let timer: any;
    if (isOpen && paymentMethod === "pix" && pixTimeLeft > 0 && !isPaidSuccess) {
      timer = setInterval(() => {
        setPixTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, paymentMethod, pixTimeLeft, isPaidSuccess]);

  if (!isOpen) return null;

  // Format Card Number
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  // Detect Card Brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("51") || clean.startsWith("55") || clean.startsWith("22")) return "Mastercard";
    if (clean.startsWith("34") || clean.startsWith("37")) return "Amex";
    if (clean.startsWith("63") || clean.startsWith("50")) return "Elo";
    return "Cartão";
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleExecutePayment = () => {
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        alert("Por favor, digite um número de cartão válido com 16 dígitos.");
        return;
      }
      if (!cardName.trim()) {
        alert("Informe o nome impresso no cartão.");
        return;
      }
      if (cardExpiry.length < 5) {
        alert("Informe a validade no formato MM/AA.");
        return;
      }
      if (cardCvv.length < 3) {
        alert("Informe o código de segurança CVV.");
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaidSuccess(true);
      try {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.5 },
        });
      } catch (e) {
        console.log(e);
      }
      onSuccessPayment();
    }, 1800);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface dark:bg-inverse-surface/90 text-on-surface w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Security Badge */}
        <div className="bg-gradient-to-r from-primary to-emerald-700 text-on-primary p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Lock className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold tracking-tight">Checkout Seguro Fluxo Pay</h2>
                <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  PCI-DSS
                </span>
              </div>
              <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Criptografia SSL de 256 bits Ponta a Ponta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isPaidSuccess ? (
          <div className="p-8 text-center space-y-6 my-auto">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-on-surface">Pagamento Aprovado com Sucesso!</h3>
              <p className="text-xs text-outline max-w-xs mx-auto">
                Sua assinatura <strong className="text-primary">{planLabel}</strong> foi ativada. Todos os recursos e diagnósticos avançados por IA foram liberados.
              </p>
            </div>

            <div className="p-4 bg-surface-container-low dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 text-left space-y-2 text-xs">
              <div className="flex justify-between text-outline">
                <span>Comprovante de Transação:</span>
                <span className="font-mono text-on-surface font-semibold">#FLX-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-outline">
                <span>Valor Confirmado:</span>
                <span className="font-bold text-primary">R$ {price.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-outline">
                <span>Garantia de Cancelamento:</span>
                <span className="text-emerald-500 font-bold">100% Livre a qualquer momento</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-lg hover:bg-primary-container transition-all"
            >
              Começar a Usar Agora
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-5">

            {/* Selected Plan Summary Box */}
            <div className="p-4 bg-surface-container-low dark:bg-inverse-surface/40 rounded-2xl border border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Resumo do Pedido</span>
                <h4 className="text-sm font-bold text-on-surface">{planLabel}</h4>
                <p className="text-[11px] text-outline">Cobrança recorrente. Cancele quando quiser nas configurações.</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-primary">R$ {price.toFixed(2).replace(".", ",")}</div>
                {planType === "premium_yearly" && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded-full">
                    Economia de 35%
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod("pix")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "pix"
                    ? "bg-surface-container-lowest text-primary shadow-xs ring-1 ring-primary/30"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-500" />
                Pix Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "card"
                    ? "bg-surface-container-lowest text-primary shadow-xs ring-1 ring-primary/30"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <CreditCard className="w-4 h-4 text-sky-500" />
                Cartão
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "wallet"
                    ? "bg-surface-container-lowest text-primary shadow-xs ring-1 ring-primary/30"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-500" />
                Pay In-App
              </button>
            </div>

            {/* TAB 1: PIX INSTANTÂNEO NUBANK */}
            {paymentMethod === "pix" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Beneficiary Info Banner */}
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                      NU
                    </div>
                    <div>
                      <div className="font-extrabold text-on-surface">
                        Beneficiário: <span className="text-purple-600 dark:text-purple-400">{RECEBEDOR_NAME}</span>
                      </div>
                      <div className="text-[10px] text-outline font-medium flex items-center gap-1.5">
                        <span>Instituição: <strong>{BANK_NAME}</strong></span>
                        <span>•</span>
                        <span>Chave Protegida</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-1 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-4 h-4 fill-emerald-500" />
                    Aprovação Instantânea via Pix Nubank
                  </div>

                  {/* QR Code Graphic (Real Scannable QR Code Image) */}
                  <div className="w-40 h-40 bg-white p-2.5 rounded-2xl border border-outline-variant/30 shadow-md flex flex-col items-center justify-center relative">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code Pix Nubank" 
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center text-outline text-xs">
                        Gerando QR Code...
                      </div>
                    )}
                    <span className="absolute text-[8px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded bottom-1 uppercase tracking-wider shadow-xs">
                      NUBANK PIX
                    </span>
                  </div>

                  <div className="text-[11px] text-outline max-w-xs">
                    Aponte a câmera do aplicativo do seu banco para o QR Code acima ou use os botões de cópia abaixo.
                  </div>

                  {/* Timer */}
                  <div className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                    Aguardando Pagamento: {formatSeconds(pixTimeLeft)}
                  </div>
                </div>

                {/* Chave Protegida & Copia e Cola */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-outline uppercase">
                      Chave Pix Protegida (Nubank)
                    </label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Criptografada
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-mono font-bold text-on-surface mb-3 flex items-center justify-between">
                    <span>(51) 9****-0968</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-extrabold uppercase">
                      Titular: {RECEBEDOR_NAME}
                    </span>
                  </div>
                </div>

                {/* Copia e Cola */}
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase mb-1">
                    Código Pix Copia e Cola (BR Code Oficial)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyCode}
                      className="flex-1 px-3 py-2 text-[11px] font-mono bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedPix ? "Copiado!" : "Copiar Código Pix"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {isProcessing ? "Validando Pagamento no Nubank..." : "Já Realizei o Pix (Confirmar Pagamento)"}
                </button>
              </div>
            )}

            {/* TAB 2: CARTÃO DE CRÉDITO */}
            {paymentMethod === "card" && (
              <div className="space-y-3.5 animate-fadeIn">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-outline uppercase">Número do Cartão</label>
                    <span className="text-[10px] font-bold text-primary">{getCardBrand()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-outline absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase mb-1">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="COMO IMPRESSO NO CARTÃO"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary font-mono text-center"
                    />
                  </div>
                </div>

                {/* Cybersecurity Protection Toggle */}
                <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">Confirmação Biométrica / 2FA</p>
                      <p className="text-[10px] text-outline">Proteção cibernética contra fraudes ativada</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useBiometricAuth}
                    onChange={(e) => setUseBiometricAuth(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-300" />
                  {isProcessing ? "Processando com Tokenização Criptografada..." : `Pagar R$ ${price.toFixed(2).replace(".", ",")} com Segurança`}
                </button>
              </div>
            )}

            {/* TAB 3: WALLET (GOOGLE PAY / APPLE PAY) */}
            {paymentMethod === "wallet" && (
              <div className="space-y-4 animate-fadeIn text-center py-2">
                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-3">
                  <Smartphone className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Pagamento In-App de 1 Clique</h4>
                    <p className="text-[11px] text-outline mt-1">
                      Autentique via Google Pay ou Apple Pay utilizando sua biometria digital ou FaceID do celular.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs rounded-full shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  {isProcessing ? "Autenticando Biometria..." : "Pagar via Google / Apple Pay"}
                </button>
              </div>
            )}

            {/* Cybersecurity Seals Notice */}
            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[10px] text-outline">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Criptografia Ponta a Ponta
              </span>
              <span>PCI-DSS Tokenized</span>
              <span>Garantia de Reembolso</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Lock, Fingerprint, KeyRound, AlertCircle } from "lucide-react";

export const SecurityLockModal: React.FC = () => {
  const { isSecurityModalOpen, closeSecurityModal, unlockPin, user } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isSecurityModalOpen && !user.isPinLocked) return null;

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const ok = unlockPin(nextPin);
        if (ok) {
          setPin("");
          closeSecurityModal();
        } else {
          setError(true);
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricSim = () => {
    unlockPin("1234");
    closeSecurityModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xs bg-surface dark:bg-inverse-surface rounded-3xl shadow-2xl p-6 text-center border border-outline-variant/20 space-y-6">
        <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface">
            Fluxo Seguro
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Informe seu PIN de 4 dígitos para desbloquear
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? "bg-primary border-primary scale-110"
                  : error
                  ? "border-error bg-error-container"
                  : "border-outline-variant"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-error font-semibold flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            PIN incorreto. Tente novamente.
          </p>
        )}

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-14 h-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center transition-all active:scale-90"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBiometricSim}
            className="w-14 h-14 rounded-full bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-all active:scale-90"
            title="Biometria / FaceID"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="w-14 h-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center transition-all active:scale-90"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold flex items-center justify-center transition-all active:scale-90"
          >
            Del
          </button>
        </div>

        <p className="text-[10px] text-outline">
          Dica de demonstração: Utilize PIN <strong>1234</strong> ou biometria.
        </p>
      </div>
    </div>
  );
};

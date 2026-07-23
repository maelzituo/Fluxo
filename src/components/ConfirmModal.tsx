import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-xs rounded-3xl p-6 shadow-xl border border-outline-variant/30 text-center animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-surface text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              isDanger
                ? "bg-error text-on-error hover:bg-error/90"
                : "bg-primary text-on-primary hover:bg-primary/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

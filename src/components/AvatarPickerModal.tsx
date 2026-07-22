import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  User as UserIcon,
  Camera
} from "lucide-react";
import { UserProfile } from "../types";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  {
    name: "Executivo 1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Executivo 2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Empresária",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Jovem Profissional",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Minimalista",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Moderno",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Casual",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Criativo",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300",
  },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [selectedUrl, setSelectedUrl] = useState(user.avatarUrl);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process uploaded image file & compress to base64 DataURL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande. Escolha uma imagem de até 15MB.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 400; // max dimension for profile avatar
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setSelectedUrl(compressedDataUrl);
        }
        setIsProcessing(false);
      };

      img.onerror = () => {
        alert("Não foi possível carregar esta imagem.");
        setIsProcessing(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      alert("Erro ao ler arquivo.");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("data:")) {
      alert("Informe uma URL válida iniciando com http:// ou https://");
      return;
    }
    setSelectedUrl(trimmed);
  };

  const handleUseInitials = () => {
    const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d631b&color=ffffff&bold=true&size=256`;
    setSelectedUrl(initialsUrl);
  };

  const handleConfirm = () => {
    onSaveAvatar(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface dark:bg-inverse-surface/90 text-on-surface w-full max-w-lg rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-container/30 text-primary rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Alterar Foto de Perfil</h2>
              <p className="text-xs text-outline">Escolha uma foto da galeria, URL ou catálogo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5 text-outline" />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="bg-surface-container-low dark:bg-inverse-surface/40 p-6 flex flex-col items-center justify-center border-b border-outline-variant/10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary shadow-md bg-surface-container">
              <img
                src={selectedUrl}
                alt="Pré-visualização"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d631b&color=ffffff`;
                }}
              />
            </div>
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-bold">
                Carregando...
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-outline mt-2">
            {selectedUrl.startsWith("data:") ? "Foto Carregada do Dispositivo" : "Pré-visualização da Foto"}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-outline-variant/10 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "upload"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "presets"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Sugestões
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === "url"
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Link URL
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant/40 hover:border-primary hover:bg-surface-container-low"
                }`}
              >
                <div className="w-12 h-12 bg-primary-container/30 text-primary rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Clique para escolher uma imagem ou arraste até aqui
                  </p>
                  <p className="text-[11px] text-outline mt-0.5">
                    Suporta PNG, JPG, JPEG ou WebP (compressão automática)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleUseInitials}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <UserIcon className="w-3.5 h-3.5" /> Usar avatar com minhas iniciais
                </button>
              </div>
            </div>
          )}

          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs text-outline font-medium">
                Selecione um perfil estilizado da nossa galeria:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((item, idx) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedUrl(item.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-transparent hover:border-outline-variant"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1.5">
                  Cole o endereço web (URL) da imagem
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-secondary-container text-on-secondary-container font-bold text-xs rounded-xl hover:bg-secondary-container/80 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-outline">
                Certifique-se que o link seja direto para uma imagem e acessível publicamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest dark:bg-inverse-surface/80 flex items-center justify-between">
          <button
            onClick={() => {
              handleUseInitials();
            }}
            className="text-xs text-error font-semibold flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" /> Resetar Foto
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-outline hover:text-on-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Salvar Foto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

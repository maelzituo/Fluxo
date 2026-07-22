import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TransactionType, PaymentMethod } from "../types";
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight, 
  Paperclip, 
  Check, 
  AlertCircle 
} from "lucide-react";

export const TransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    closeAddTxModal,
    txModalDefaultType,
    categories,
    accounts,
    addTransaction,
  } = useApp();

  const [type, setType] = useState<TransactionType>(txModalDefaultType || "expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "cat_lazer");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "acc_fluxo");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAddTxModalOpen) return null;

  const handleAiCategorize = async () => {
    if (!title.trim()) {
      setErrorMsg("Digite um título antes de usar a inteligência artificial.");
      return;
    }
    setErrorMsg("");
    setAiLoading(true);
    setAiTip("");

    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount) || 0,
          description,
        }),
      });

      const data = await res.json();
      if (data.category) {
        const foundCat = categories.find((c) =>
          c.name.toLowerCase().includes(data.category.toLowerCase())
        );
        if (foundCat) {
          setCategoryId(foundCat.id);
        }
        setAiTip(`IA: Categorizado como "${data.category}" (${data.reasoning})`);
      }
    } catch (err) {
      console.error(err);
      setAiTip("IA: Não foi possível categorizar automaticamente.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));

    if (!title.trim()) {
      setErrorMsg("Por favor, preencha o título da transação.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Por favor, informe um valor maior que zero.");
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const accObj = accounts.find((a) => a.id === accountId);

    addTransaction({
      title,
      amount: parsedAmount,
      type,
      categoryId,
      categoryName: catObj ? `${type === 'income' ? 'Receitas' : 'Despesas'} • ${catObj.name}` : "Outros",
      categoryColor: catObj?.color,
      date,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      paymentMethod,
      accountId,
      accountName: accObj ? accObj.name : "Conta Fluxo",
      description,
      isRecurring,
      attachmentUrl: attachmentName ? "recibo_anexado.pdf" : undefined,
      status: "completed",
    });

    // Reset and close
    setTitle("");
    setAmount("");
    setDescription("");
    setErrorMsg("");
    setAiTip("");
    closeAddTxModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface dark:bg-inverse-surface rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low dark:bg-surface-container-high/10">
          <h2 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface">
            Nova Movimentação
          </h2>
          <button
            onClick={closeAddTxModal}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-error-container text-on-error-container rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === "expense"
                  ? "bg-error text-on-error shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === "income"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === "transfer"
                  ? "bg-tertiary text-on-tertiary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transferência
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-outline mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-outline">
                R$
              </span>
              <input
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Title Field with AI Categorize */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase text-outline">
                Título / Descrição Curta *
              </label>
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary animate-bounce" />
                {aiLoading ? "Analisando..." : "Sugerir Categoria por IA"}
              </button>
            </div>
            <input
              type="text"
              placeholder="ex: Mercado, Aluguel, Consultoria..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              required
            />
            {aiTip && (
              <p className="mt-1 text-xs text-primary font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {aiTip}
              </p>
            )}
          </div>

          {/* Category & Account Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Conta / Carteira
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (R$ {a.balance.toLocaleString('pt-BR')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Método de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_transfer">Transferência / Boleto</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-outline mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Additional Notes / Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase text-outline mb-1">
              Observações / Detalhes
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes adicionais ou código do comprovante..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container-lowest dark:bg-surface-container-high/20 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          {/* Options: Attachment & Recurring */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface-variant">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              Lançamento Recorrente
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary hover:underline">
              <Paperclip className="w-4 h-4" />
              <span>{attachmentName ? "Anexo Adicionado" : "Anexar Comprovante"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachmentName(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={closeAddTxModal}
              className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold rounded-full text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-on-primary font-semibold rounded-full text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

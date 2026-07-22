import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Mic, 
  TrendingUp, 
  PiggyBank, 
  Lightbulb, 
  PieChart 
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

export const AiAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    closeAiAssistant,
    transactions,
    goals,
    budgets,
    user,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: `Olá, ${user.name.split(" ")[0]}! Sou o assistente de Inteligência Financeira do Fluxo. Como posso te ajudar a otimizar seu dinheiro hoje?`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAiAssistantOpen) {
      scrollToBottom();
    }
  }, [messages, isAiAssistantOpen]);

  if (!isAiAssistantOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          financialContext: {
            userPlan: user.plan,
            totalTransactionsCount: transactions.length,
            recentTransactions: transactions.slice(0, 8),
            activeGoals: goals,
            activeBudgets: budgets,
          },
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.reply || "Analisei seus lançamentos e recomendo manter a atenção nos gastos fixos este mês.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `ai_err_${Date.now()}`,
        sender: "ai",
        text: "Desculpe, ocorreu uma instabilidade ao conectar à inteligência artificial. Tente novamente em alguns instantes.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputText("Como posso economizar R$ 300 nas próximas semanas?");
    }, 2000);
  };

  const quickPrompts = [
    { label: "💡 Como economizar R$ 500 este mês?", query: "Como economizar R$ 500 no próximo mês baseado nos meus gastos?" },
    { label: "📊 Análise de saúde financeira", query: "Faça uma análise geral da minha saúde financeira atual." },
    { label: "🔮 Previsão de gastos futuros", query: "Qual a previsão do meu saldo no fim do mês?" },
    { label: "🏷️ Otimizar assinaturas e fixos", query: "Quais são os principais gastos recorrentes que posso cortar?" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg h-[85vh] bg-surface dark:bg-inverse-surface rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-primary-container text-on-primary-container flex items-center justify-between border-b border-on-primary-container/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-on-primary-container/10 flex items-center justify-center text-on-primary-container">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">IA Fluxo • Capital Intelligence</h2>
              <p className="text-[10px] opacity-80">Assistente pessoal de finanças</p>
            </div>
          </div>

          <button
            onClick={closeAiAssistant}
            className="p-1.5 rounded-full hover:bg-on-primary-container/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 bg-surface-container-low border-b border-outline-variant/10 flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp.query)}
              className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 rounded-full text-[11px] font-semibold text-on-surface-variant whitespace-nowrap transition-all shrink-0 active:scale-95"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAi ? "items-start" : "items-end justify-end"}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    isAi
                      ? "bg-surface-container-lowest text-on-surface border border-outline-variant/20 shadow-xs rounded-tl-none"
                      : "bg-primary text-on-primary rounded-br-none font-medium shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-right opacity-60 ${
                      isAi ? "text-outline" : "text-on-primary"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-outline italic">
              <Bot className="w-4 h-4 text-primary animate-bounce" />
              <span>O Fluxo IA está analisando seus dados...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-surface-container-low border-t border-outline-variant/10 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-full transition-all ${
              isRecording
                ? "bg-error text-on-error animate-pulse"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
            }`}
            title="Ditar Mensagem por Voz"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Pergunte qualquer coisa sobre suas finanças..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-surface-container-lowest border border-outline-variant/30 rounded-full focus:outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

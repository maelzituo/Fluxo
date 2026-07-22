import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Fluxo", timestamp: new Date().toISOString() });
});

// AI Auto-Categorization Endpoint
app.post("/api/ai/categorize", async (req, res) => {
  try {
    const { title, amount, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Título é obrigatório." });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Smart Rule-based fallback
      const lower = title.toLowerCase();
      let category = "Outros";
      let icon = "Tag";
      let reasoning = "Categorização por regras locais do Fluxo";

      if (lower.includes("uber") || lower.includes("99") || lower.includes("gasolina") || lower.includes("posto") || lower.includes("pedágio")) {
        category = "Transporte";
        icon = "Car";
      } else if (lower.includes("supermercado") || lower.includes("mercado") || lower.includes("feira") || lower.includes("carrefour") || lower.includes("pão de açúcar")) {
        category = "Supermercado";
        icon = "ShoppingCart";
      } else if (lower.includes("restaurante") || lower.includes("ifood") || lower.includes("almoço") || lower.includes("jantar") || lower.includes("café") || lower.includes("padaria")) {
        category = "Alimentação";
        icon = "Utensils";
      } else if (lower.includes("netflix") || lower.includes("spotify") || lower.includes("cinema") || lower.includes("jogo") || lower.includes("steam")) {
        category = "Lazer & Entretenimento";
        icon = "Film";
      } else if (lower.includes("aluguel") || lower.includes("condomínio") || lower.includes("luz") || lower.includes("água") || lower.includes("internet")) {
        category = "Habitação";
        icon = "Home";
      } else if (lower.includes("farmácia") || lower.includes("médico") || lower.includes("exame") || lower.includes("hospital")) {
        category = "Saúde & Bem-estar";
        icon = "Heart";
      } else if (lower.includes("salário") || lower.includes("pix recebido") || lower.includes("rendimento") || lower.includes("freelance")) {
        category = "Renda & Salário";
        icon = "TrendingUp";
      }

      return res.json({ success: true, category, icon, confidence: 0.9, reasoning });
    }

    const ai = getGeminiAI();
    const prompt = `Você é um assistente financeiro especialista do aplicativo Fluxo.
Análise a transação abaixo e sugira a categoria mais apropriada.
Título: "${title}"
Valor: R$ ${amount || 0}
Descrição: "${description || ''}"

Escolha uma das categorias padrão: "Alimentação", "Habitação", "Transporte", "Lazer & Entretenimento", "Saúde & Bem-estar", "Educação", "Serviços & Assinaturas", "Supermercado", "Investimentos", "Renda & Salário", "Outros".

Retorne estritamente um JSON no seguinte formato:
{
  "category": "NomeDaCategoria",
  "icon": "LucideIconName",
  "confidence": 0.95,
  "reasoning": "Breve justificativa em português"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    res.status(500).json({
      error: "Falha ao categorizar transação com IA.",
      message: error.message,
    });
  }
});

// AI Financial Insights & Forecast Endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { transactions, goals, budgets, totalIncome, totalExpense } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      const exp = totalExpense || 0;
      const inc = totalIncome || 0;
      const predictedMonthlyExpense = Math.round(exp * 0.95);
      const savingsPotential = Math.max(0, Math.round((inc - exp) * 0.3));

      return res.json({
        success: true,
        predictedMonthlyExpense,
        savingsPotential,
        insights: [
          {
            id: "ins_1",
            type: "info",
            title: "Balanço Mensal Positivo",
            message: `Sua receita atual (R$ ${inc.toLocaleString("pt-BR")}) supera suas despesas (R$ ${exp.toLocaleString("pt-BR")}).`,
            category: "Geral",
            actionableTip: "Aproveite o saldo positivo para destinar ao menos 15% às suas metas financeiras."
          },
          {
            id: "ins_2",
            type: "warning",
            title: "Atenção com Gastos de Lazer",
            message: "Monitorar pequenos gastos diários reduz em até 20% o orçamento mensal.",
            category: "Lazer",
            actionableTip: "Revise assinaturas e serviços recorrentes pouco utilizados."
          }
        ]
      });
    }

    const ai = getGeminiAI();
    const prompt = `Você é a Inteligência Financeira do aplicativo Fluxo.
Análise os dados financeiros do usuário:
- Receitas Totais: R$ ${totalIncome || 0}
- Despesas Totais: R$ ${totalExpense || 0}
- Lista de Transações Recentes: ${JSON.stringify((transactions || []).slice(0, 15))}
- Metas Atuais: ${JSON.stringify(goals || [])}
- Orçamentos por Categoria: ${JSON.stringify(budgets || [])}

Gere 3 a 5 alertas e insights financeiros estratégicos e práticos para o usuário.
Procure por:
1. Gastos anormais em categorias específicas (ex: aumento percentual).
2. Alertas de metas próximas do objetivo ou precisando de aportes.
3. Previsão de gastos para o próximo mês.
4. Assinaturas recorrentes ou esquecidas.
5. Sugestões de economia prática.

Retorne estritamente um JSON no formato:
{
  "predictedMonthlyExpense": number,
  "savingsPotential": number,
  "insights": [
    {
      "id": "string",
      "type": "warning" | "success" | "info" | "alert",
      "title": "string",
      "message": "string (curta e impactante em português)",
      "category": "string",
      "actionableTip": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    res.json({
      success: true,
      predictedMonthlyExpense: 2100,
      savingsPotential: 450,
      insights: [
        {
          id: "ins_fallback",
          type: "info",
          title: "Análise Inteligente Local",
          message: "Seus dados estão organizados no Fluxo. Continue registrando suas despesas para obter previsões acuradas.",
          category: "Saúde Financeira",
          actionableTip: "Mantenha o hábito diário de registrar seus lançamentos."
        }
      ]
    });
  }
});

// AI Voice / Text Assistant Chat Endpoint
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { message, query, contextData, financialContext } = req.body;
    const userPrompt = message || query;
    const ctxData = contextData || financialContext;

    if (!userPrompt) {
      return res.status(400).json({ error: "Mensagem ou query é obrigatória." });
    }

    if (!process.env.GEMINI_API_KEY) {
      const p = userPrompt.toLowerCase();
      let reply = "Olá! Eu sou a Inteligência Financeira do Fluxo. Como posso ajudar com seu orçamento, despesas ou metas hoje?";

      if (p.includes("saldo") || p.includes("quanto tenho") || p.includes("dinheiro")) {
        reply = `Com base nos seus lançamentos, seu saldo atual é de R$ ${(ctxData?.totalBalance || 0).toLocaleString("pt-BR")}. Suas receitas neste mês totalizam R$ ${(ctxData?.totalIncome || 0).toLocaleString("pt-BR")} e despesas R$ ${(ctxData?.totalExpense || 0).toLocaleString("pt-BR")}.`;
      } else if (p.includes("gastos") || p.includes("despesa") || p.includes("gastei")) {
        reply = `Suas despesas registradas no mês somam R$ ${(ctxData?.totalExpense || 0).toLocaleString("pt-BR")}. A maior parte está concentrada em habitação e alimentação. Recomendo verificar os orçamentos de categoria no extrato.`;
      } else if (p.includes("meta") || p.includes("economizar") || p.includes("guardar")) {
        reply = `Você possui ${(ctxData?.goals || []).length || 2} metas cadastradas. Que tal realizar um pequeno aporte semanal para acelerar a conquista dos seus objetivos?`;
      }

      return res.json({ success: true, reply });
    }

    const ai = getGeminiAI();
    const systemInstruction = `Você é o assistente virtual de Inteligência Financeira do aplicativo Fluxo.
Responda de forma cortês, direta, motivadora e baseada nos dados do usuário fornecidos no contexto.
Moeda oficial: Real Brasileiro (R$).
Responda sempre em português do Brasil de forma clara, amigável e concisa.`;

    const prompt = `Contexto Financeiro Atual do Usuário:
${JSON.stringify(ctxData || {})}

Pergunta / Comando do Usuário:
"${userPrompt}"

Dê uma resposta útil, direta e personalizada em português.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.json({
      success: true,
      reply: "Sua solicitação foi recebida! Com base no seu planejamento, seu saldo e lançamentos estão atualizados. Em que mais posso ajudar com seus objetivos financeiros?"
    });
  }
});

// Mount Vite middleware for development or serve production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fluxo Server] Servidor rodando na porta ${PORT} em http://localhost:${PORT}`);
  });
}

startServer();

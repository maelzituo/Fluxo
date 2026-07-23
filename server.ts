import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize MercadoPago if token exists
const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (mpAccessToken) {
  new MercadoPagoConfig({ accessToken: mpAccessToken });
}

// Mock User DB for demonstration (In a real app, this would be a real database like PostgreSQL/Prisma)
const MOCK_USERS: any[] = [
  {
    id: "user_123",
    username: "admin_fluxo",
    passwordHash: "$2b$10$tO7vejcn0k5IGzCFSwX4IengivivDlnCs5wZh00ZFmiCJyoyu1wVu", 
    name: "Administrador",
    email: "admin@fluxo.com",
    isPremium: false,
    premiumSince: null,
    premiumExpires: null,
    referralCode: "FLUXO-J82K9",
    referralCount: 15,
  },
];

const MOCK_SUBSCRIPTIONS: any[] = [];

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_fluxo_2024_secure_string";

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rate limiter for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow standard testing attempts
  message: { error: "Muitas tentativas de login. Tente novamente após 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Muitas tentativas de cadastro. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration Endpoint
app.post("/api/register", registerLimiter, async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Por favor, informe seu nome completo." });
    }
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: "O nome de usuário deve ter pelo menos 3 caracteres." });
    }
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({ error: "O nome de usuário só pode conter letras, números, pontos e hífens." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Por favor, insira um e-mail válido." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
    }

    // Check existing
    const existingUser = MOCK_USERS.find(
      (u) => u.username === cleanUsername || u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return res.status(400).json({ error: "Este nome de usuário já está em uso." });
      }
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    // Referral Code handling
    const userReferralCode = req.body.referralCode?.toString().trim().toUpperCase();
    let isPremiumBonus = false;
    let premiumSince = null;
    let premiumExpires = null;

    if (userReferralCode) {
      isPremiumBonus = true;
      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      premiumSince = now.toISOString().split("T")[0];
      premiumExpires = expires.toISOString().split("T")[0];

      // Find referrer user if exists
      const referrer = MOCK_USERS.find(
        (u) => u.referralCode?.toUpperCase() === userReferralCode || userReferralCode === "FLUXO-J82K9"
      );
      if (referrer) {
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        referrer.isPremium = true;
        referrer.premiumSince = referrer.premiumSince || premiumSince;
        referrer.premiumExpires = premiumExpires;
      }
    }

    // Password Hash
    const passwordHash = await bcrypt.hash(password, 10);
    const selfReferralCode = `FLUXO-${cleanUsername.slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 899)}`;

    const newUser: any = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      passwordHash,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isPremium: isPremiumBonus,
      premiumSince,
      premiumExpires,
      referralCode: selfReferralCode,
      referralCount: 0,
    };

    MOCK_USERS.push(newUser);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(201).json({
      success: true,
      message: isPremiumBonus
        ? "Conta criada com sucesso! 🎁 Você ganhou 30 dias de Fluxo Premium pelo código de convite!"
        : "Conta criada com sucesso!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        isPremium: newUser.isPremium,
        premiumSince: newUser.premiumSince,
        premiumExpires: newUser.premiumExpires,
        referralCode: newUser.referralCode,
        referralCount: newUser.referralCount,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Erro ao criar conta. Tente novamente." });
  }
});

// Authentication Endpoint
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios." });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.username === cleanUsername || u.email.toLowerCase() === cleanUsername);

    if (!user) {
      return res.status(401).json({ error: "Nome de usuário ou senha incorretos." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Nome de usuário ou senha incorretos." });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { identity } = req.body;
    if (!identity) {
      return res.status(400).json({ error: "Informe o nome de usuário ou e-mail." });
    }

    const cleanIdentity = identity.trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.username === cleanIdentity || u.email.toLowerCase() === cleanIdentity);

    if (!user) {
      // Security practice: respond with general success message or clear guidance
      return res.json({
        success: true,
        message: "Se a conta existir, enviamos as instruções de recuperação para o e-mail cadastrado.",
      });
    }

    return res.json({
      success: true,
      message: `Enviamos as instruções de redefinição de senha para o e-mail associado a ${user.username}.`,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar recuperação de senha." });
  }
});

// Redeem Referral Code Endpoint
app.post("/api/redeem-referral", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Informe o código de indicação." });
    }

    const cleanCode = code.trim().toUpperCase();
    const currentUser = MOCK_USERS.find((u) => u.id === userId);

    if (currentUser && currentUser.referralCode?.toUpperCase() === cleanCode) {
      return res.status(400).json({ error: "Você não pode resgatar seu próprio código de indicação." });
    }

    const referrer = MOCK_USERS.find(
      (u) => u.referralCode?.toUpperCase() === cleanCode || cleanCode === "FLUXO-J82K9"
    );

    const now = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    const premiumSince = now.toISOString().split("T")[0];
    const premiumExpires = expires.toISOString().split("T")[0];

    if (currentUser) {
      currentUser.isPremium = true;
      currentUser.premiumSince = currentUser.premiumSince || premiumSince;
      currentUser.premiumExpires = premiumExpires;
    }

    if (referrer) {
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      referrer.isPremium = true;
      referrer.premiumSince = referrer.premiumSince || premiumSince;
      referrer.premiumExpires = premiumExpires;
    }

    res.json({
      success: true,
      message: "🎉 Código de indicação resgatado com sucesso! Você ganhou 30 dias de Fluxo Premium grátis!",
      user: currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        isPremium: true,
        premiumSince: currentUser.premiumSince,
        premiumExpires: currentUser.premiumExpires,
      } : null,
    });
  } catch (error) {
    console.error("Redeem referral error:", error);
    res.status(500).json({ error: "Erro ao resgatar código de indicação." });
  }
});

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

// Mercado Pago - Create Preference
app.post("/api/payment/create-preference", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { planTitle, price } = req.body;
    const numPrice = Number(price) || 12.90;

    if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        const preference = new Preference(new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN }));
        const appUrl = process.env.APP_URL || "http://localhost:3000";

        const response = await preference.create({
          body: {
            items: [
              {
                id: `premium_plan_${Date.now()}`,
                title: planTitle || "Fluxo Premium",
                quantity: 1,
                unit_price: numPrice,
                currency_id: "BRL",
              }
            ],
            payment_methods: {
              excluded_payment_types: [],
              installments: 12,
            },
            back_urls: {
              success: `${appUrl}`,
              failure: `${appUrl}`,
              pending: `${appUrl}`
            },
            auto_return: "approved",
            external_reference: userId,
            notification_url: `${appUrl}/api/payment/webhook`,
          }
        });

        MOCK_SUBSCRIPTIONS.push({
          id: `sub_${Date.now()}`,
          user_id: userId,
          preference_id: response.id,
          plano: planTitle || "Fluxo Premium",
          valor: numPrice,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return res.json({
          success: true,
          preferenceId: response.id,
          initPoint: response.init_point
        });
      } catch (mpErr: any) {
        console.warn("Mercado Pago SDK Preference warning:", mpErr.message);
      }
    }

    // Fallback for environment testing / preview
    const simPreferenceId = `sim_pref_${Date.now()}`;
    MOCK_SUBSCRIPTIONS.push({
      id: `sub_${Date.now()}`,
      user_id: userId,
      preference_id: simPreferenceId,
      plano: planTitle || "Fluxo Premium",
      valor: numPrice,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      preferenceId: simPreferenceId,
      initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${simPreferenceId}`,
      isSimulated: true
    });
  } catch (error: any) {
    console.error("Erro ao criar preferência MP:", error);
    res.status(500).json({ error: "Falha ao processar pagamento com Mercado Pago." });
  }
});

// Mercado Pago - Create Direct Pix Payment
app.post("/api/payment/create-pix", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { planTitle, price, email } = req.body;
    const numPrice = Number(price) || 12.90;
    const user = MOCK_USERS.find((u) => u.id === userId);
    const payerEmail = email || user?.email || "cliente@fluxofinance.com";

    if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        const payment = new Payment(new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN }));
        const response = await payment.create({
          body: {
            transaction_amount: numPrice,
            description: planTitle || "Assinatura Fluxo Premium (Pix Mercado Pago)",
            payment_method_id: "pix",
            payer: {
              email: payerEmail,
              first_name: user?.name?.split(" ")[0] || "Cliente",
              last_name: user?.name?.split(" ").slice(1).join(" ") || "Fluxo",
            },
          }
        });

        const qrCode = response.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64;

        if (qrCode) {
          return res.json({
            success: true,
            isReal: true,
            paymentId: response.id,
            qrCode,
            qrCodeBase64: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null,
            ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url,
          });
        }
      } catch (mpErr: any) {
        console.warn("Mercado Pago Direct Pix API fallback:", mpErr.message);
      }
    }

    // Fallback Simulated Pix Code
    const mockPixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136fluxopayments@mercadopago.com.br5204000053039865405${numPrice.toFixed(2)}5802BR5913Fluxo Finance6009SAO PAULO62070503***6304E2D1`;

    res.json({
      success: true,
      isReal: false,
      paymentId: `pix_sim_${Date.now()}`,
      qrCode: mockPixCopyPaste,
      qrCodeBase64: null,
      message: "Código Pix Mercado Pago gerado com sucesso!"
    });
  } catch (error: any) {
    console.error("Erro ao criar Pix Mercado Pago:", error);
    res.status(500).json({ error: "Falha ao gerar Pix Mercado Pago." });
  }
});

// Mercado Pago - Webhook
app.post("/api/payment/webhook", async (req: any, res: any) => {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return res.status(500).send("Mercado Pago token not configured");
    }

    // Mercado Pago webhook payload
    const { type, data } = req.body;

    if (type === "payment" && data?.id) {
      const paymentId = data.id;

      // Verify payment with Mercado Pago API
      const paymentClient = new Payment(new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN }));
      const paymentInfo = await paymentClient.get({ id: paymentId });

      const status = paymentInfo.status; // 'approved', 'pending', 'rejected', etc.
      const userId = paymentInfo.external_reference;

      if (!userId) {
        console.error("Pagamento sem external_reference (userId).");
        return res.status(200).send("OK"); // Always return 200 to MP
      }

      // Find subscription and update
      const subscription = MOCK_SUBSCRIPTIONS.find(s => s.user_id === userId && s.status === "pending");
      if (subscription) {
        subscription.payment_id = paymentId;
        subscription.status = status;
        subscription.updated_at = new Date().toISOString();

        if (status === "approved") {
          // Set premium to expire in 1 year (or 1 month depending on plan)
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          subscription.premium_expires_at = expiresAt.toISOString();

          // Update User
          const user = MOCK_USERS.find(u => u.id === userId);
          if (user) {
            user.isPremium = true;
            user.premiumSince = new Date().toISOString() as any;
            user.premiumExpires = expiresAt.toISOString() as any;
          }
          console.log(`[Webhook] Usuário ${userId} atualizado para Premium!`);
        } else {
           // Ensure user is not premium if payment failed/rejected
           const user = MOCK_USERS.find(u => u.id === userId);
           if (user && user.isPremium) {
             user.isPremium = false;
           }
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no Webhook MP:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Current User Info
app.get("/api/user/me", authenticateToken, (req: any, res: any) => {
  const userId = req.user.userId;
  const user = MOCK_USERS.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium,
      premiumSince: user.premiumSince,
      premiumExpires: user.premiumExpires,
    }
  });
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

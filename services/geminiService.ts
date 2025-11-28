
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AiForecast, ChatWidgetData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTransactionNaturalLanguage = async (text: string): Promise<{
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extraia os detalhes da transação financeira do texto em português: "${text}".
      Identifique se é uma DESPESA (gasto, compra, pagamento) ou RECEITA (salário, venda, recebimento).
      Se a data não for especificada, use a data de hoje (YYYY-MM-DD).
      
      Categorias sugeridas para DESPESA: Alimentação, Transporte, Moradia, Lazer, Saúde, Outros.
      Categorias sugeridas para RECEITA: Salário, Freelance, Investimentos, Presente, Outros.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "O valor numérico" },
            description: { type: Type.STRING, description: "Descrição curta" },
            category: { type: Type.STRING, description: "Categoria da transação" },
            date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
            type: { type: Type.STRING, enum: ["income", "expense"], description: "Tipo da transação" }
          },
          required: ["amount", "description", "category", "date", "type"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Erro ao processar com Gemini:", error);
    return null;
  }
};

export const getFinancialAdvice = async (summary: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Aja como um consultor financeiro sênior. Analise este resumo de atividade recente e dê uma dica curta e motivadora de 2 frases em português: ${summary}`,
        });
        return response.text || "Mantenha o foco nos seus objetivos financeiros!";
    } catch (e) {
        return "Gerenciar bem suas receitas e despesas é a chave para o sucesso.";
    }
}

export const generateFinancialForecast = async (transactions: Transaction[]): Promise<AiForecast | null> => {
  try {
    // Filter only expenses for risk analysis, but consider income context if needed
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const expensesSummary = expenses.map(e => 
      `${e.date}: ${e.description} - R$${e.amount} (${e.category})`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Como um analista financeiro de IA, analise o seguinte histórico de despesas e gere uma previsão para o próximo mês. Identifique riscos de orçamento e sugira economias.
      
      Histórico de Despesas:
      ${expensesSummary}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedTotalNextMonth: { type: Type.NUMBER, description: "Valor total de gastos previsto para o próximo mês" },
            riskLevel: { type: Type.STRING, enum: ["Baixo", "Médio", "Alto"], description: "Nível de risco financeiro geral" },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["warning", "critical", "info"] }
                }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 sugestões práticas para economizar"
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiForecast;
    }
    return null;

  } catch (error) {
    console.error("Erro ao gerar previsão financeira:", error);
    return null;
  }
};

export const sendChatMessage = async (userMessage: string, transactions: Transaction[]): Promise<{ text: string, widget?: ChatWidgetData }> => {
    try {
        // Summarize data to send less tokens and give context of Income vs Expense
        const summary = transactions.map(t => 
            `[${t.date}] ${t.type === 'income' ? '(RECEITA)' : '(DESPESA)'} ${t.description}: R$ ${t.amount} (${t.category})`
        ).join('\n');
        
        const today = new Date().toISOString().split('T')[0];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Você é um assistente financeiro pessoal inteligente do app Cash Hub.
            Hoje é dia: ${today}.
            
            Histórico de Transações do Usuário:
            ${summary}

            Pergunta do usuário: "${userMessage}"

            Instruções:
            1. Analise os dados para responder. Considere tanto receitas quanto despesas.
            2. Seja direto, amigável e use emojis.
            3. Se a resposta envolver um valor numérico importante, um alerta ou uma dica específica, preencha o campo "widget".
            4. Se perguntar "Quanto posso guardar?", calcule (Total Receitas - Total Despesas) e projete.

            Retorne APENAS JSON.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: "A resposta textual para o chat." },
                        widget: {
                            type: Type.OBJECT,
                            description: "Opcional. Um cartão visual para complementar a resposta.",
                            properties: {
                                type: { type: Type.STRING, enum: ["stat", "alert", "saving_tip"] },
                                title: { type: Type.STRING },
                                value: { type: Type.STRING, description: "Ex: R$ 450,00 ou +15%" },
                                description: { type: Type.STRING },
                                color: { type: Type.STRING, enum: ["emerald", "red", "blue", "amber"] }
                            },
                            required: ["type", "title", "description"]
                        }
                    },
                    required: ["text"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return { text: "Desculpe, não consegui analisar seus dados agora." };

    } catch (error) {
        console.error("Chat error:", error);
        return { text: "Ocorreu um erro ao conectar com o assistente." };
    }
}

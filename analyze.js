// api/analyze.js

export default async function handler(req, res) {
  try {
    // Aceita somente POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    // Captura o texto do corpo da requisição
    const { texto } = req.body ?? {};
    if (!texto) {
      return res.status(400).json({ error: "O campo 'texto' é obrigatório." });
    }

    // Chamada ao provedor de IA (Groq, gratuito e rápido)
    const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "user", content: texto }
        ],
        max_tokens: 500
      })
    });

    // Caso a resposta da IA seja um erro
    if (!apiResponse.ok) {
      const erroTexto = await apiResponse.text();
      return res.status(502).json({
        error: "Erro ao chamar a API de IA",
        details: erroTexto
      });
    }

    const data = await apiResponse.json();

    // Extrai a resposta gerada pela IA
    const respostaFinal =
      data?.choices?.[0]?.message?.content ??
      "Não foi possível gerar resposta.";

    // Retorno final da sua API
    return res.status(200).json({
      resposta: respostaFinal
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({
      error: "Erro interno no servidor",
      detalhes: error.message
    });
  }
}


const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { messages } = JSON.parse(event.body);

    const prompt = `
You are Eden, a soft and reflective guide. 
You receive a small group of recent user reflections (messages) and are asked to evaluate how much each of five interpretive pathways is present in them.

Return a JSON object with five numeric values (0.0 to 1.0), showing how strongly each interpretive lens appears:

- "science": patterns, observation, logic
- "emotion": feelings, relationships, vulnerability
- "belief": purpose, spirituality, symbolic meaning
- "practical": application, advice, use
- "stillness": silence, presence, mindfulness

Also return a short "note" (1-2 sentences) summarizing the tone or theme.

Here are the last 6 messages:

${messages.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Respond only with valid JSON:
{
  "science": 0.4,
  "emotion": 0.6,
  "belief": 0.1,
  "practical": 0.0,
  "stillness": 0.3,
  "note": "User reflects emotionally on nature and self-understanding."
}
`;

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const data = await openAIRes.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    console.error("Interpretive analysis failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

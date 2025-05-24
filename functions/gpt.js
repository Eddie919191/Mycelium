
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const { message } = JSON.parse(event.body);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a gentle, reflective guide who responds thoughtfully to user reflections." },
        { role: "user", content: message }
      ]
    })
  });

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || "..." })
  };
};

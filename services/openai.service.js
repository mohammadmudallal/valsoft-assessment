const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAIJSON({ system, user }) {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from OpenAI.");
  }

  return JSON.parse(content);
}

module.exports = {
  callOpenAIJSON,
};
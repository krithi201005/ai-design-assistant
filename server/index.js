/*import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AI Design Assistant"
  }
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: "user", content: `Give Tailwind suggestion for: ${prompt}` }]
    
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("OpenRouter Error:", err.message);
    res.status(500).json({ reply: "Error fetching response from AI." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// index.js (Backend)
*/
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",  // Or your deployed frontend URL
    "X-Title": "AI Design Assistant"
  }
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "user",
          content: `Only return HTML + Tailwind code for the following UI idea inside a markdown block like this: \`\`\`html ... \`\`\`. Do not include any explanation or text.\n\n${prompt}`
        }
      ]
    });

    const code = response.choices[0].message.content.trim();

    // ✅ This wraps the code in markdown block for frontend parsing
    const result = "```html\n" + code + "\n```";

    res.json({ result });

  } catch (err) {
    console.error("OpenRouter Error:", err.message);
    res.status(500).json({ result: "Error fetching response from AI." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

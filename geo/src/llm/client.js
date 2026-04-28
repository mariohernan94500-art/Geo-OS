import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function callLLM(model, task) {
  try {
    if (model === "openrouter") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: task.prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
          }
        }
      );

      return res.data.choices[0].message.content;
    }

    if (model === "groq") {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: task.prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
          }
        }
      );

      return res.data.choices[0].message.content;
    }

    if (model === "deepseek") {
      const res = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [{ role: "user", content: task.prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
          }
        }
      );

      return res.data.choices[0].message.content;
    }

    return null;
  } catch (err) {
    console.log("❌ Error en modelo:", model);
    return null;
  }
}

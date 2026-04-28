import axios from 'axios';

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

export async function runOpenRouter(prompt, systemPrompt = 'You are a helpful assistant.') {
  console.log(`[OpenRouter] Called with prompt: ${truncate(prompt, 100)}`);
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Geo AI System',
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('[OpenRouter] Error:', error.message);
    throw error;
  }
}

export async function runGroq(prompt, systemPrompt = 'You are a helpful assistant.') {
  console.log(`[Groq] Called with prompt: ${truncate(prompt, 100)}`);
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    throw error;
  }
}

export async function runDeepSeek(prompt, systemPrompt = 'You are a helpful assistant.') {
  console.log(`[DeepSeek] Called with prompt: ${truncate(prompt, 100)}`);
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Geo AI System',
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('[DeepSeek] Error:', error.message);
    throw error;
  }
}

export async function runGemini(prompt, systemPrompt = 'You are a helpful assistant.') {
  console.log(`[Gemini] Called with prompt: ${truncate(prompt, 100)}`);
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('[Gemini] Error:', error.message);
    throw error;
  }
}

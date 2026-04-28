/**
 * agent/llm.ts
 * Geo OS — Router Inteligente de Modelos LLM
 */

import { Groq } from 'groq-sdk';
import OpenAI from 'openai';
import { appConfig } from '../config.js';
import { registrarTokens, verificarPresupuestoYAlertar } from '../security/tokenTracker.js';

// ─── 2. Type definitions ──────────────────────────────────────────────────────

export type ProviderName = 'groq' | 'deepseek' | 'gemini' | 'openrouter' | 'zai';
export type TaskType = 'code' | 'math' | 'reasoning' | 'tools' | 'summary' | 'multimodal' | 'voice' | 'chat';

// ─── 3. Clientes inicializados ────────────────────────────────────────────────

const groqClient = new Groq({ apiKey: appConfig.llm.groqKey || '' });

const geminiClient = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: appConfig.llm.geminiKey || '',
});

const deepseekClient = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const zaiClient = new OpenAI({
    baseURL: 'https://api.z.ai/api/coding/paas/v4',
    apiKey: process.env.ZAI_API_KEY || '',
});

const openrouterClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: appConfig.llm.openrouterKey || '',
    defaultHeaders: {
        'HTTP-Referer': 'https://geoos.app',
        'X-Title': 'Geo OS Router'
    }
});

// ─── 4. Constantes ────────────────────────────────────────────────────────────

const PROVIDER_TIMEOUT_MS = 8000;

const ROUTING: Record<TaskType, ProviderName[]> = {
  voice:      ['groq', 'deepseek', 'gemini', 'openrouter', 'zai'],
  chat:       ['groq', 'deepseek', 'gemini', 'openrouter', 'zai'],
  code:       ['zai', 'deepseek', 'openrouter', 'groq', 'gemini'],
  reasoning:  ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
  math:       ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
  tools:      ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
  summary:    ['groq', 'gemini', 'deepseek', 'openrouter', 'zai'],
  multimodal: ['gemini', 'openrouter', 'deepseek', 'groq', 'zai'],
};

const MODEL_TO_PROVIDER: Record<string, ProviderName> = {
  'llama-3.1-8b-instant':       'groq',
  'llama-3.3-70b-versatile':    'groq',
  'deepseek-chat':              'deepseek',
  'glm-4.7':                    'zai',
  'gemini-2.5-flash-lite':      'gemini',
  'gemini-2.5-flash':           'gemini',
  'openrouter/free':            'openrouter',
};

// ─── 5. detectTaskType ────────────────────────────────────────────────────────

function detectTaskType(messages: any[], operation: string): TaskType {
  const explicitOps: Record<string, TaskType> = {
    'voice': 'voice', 'voice_process': 'voice',
    'code': 'code', 'coding': 'code',
    'reasoning': 'reasoning', 'razonamiento': 'reasoning',
    'summary': 'summary', 'resumen': 'summary',
    'multimodal': 'multimodal',
    'tools': 'tools',
    'math': 'math',
    'chat': 'chat',
  };
  
  if (operation && explicitOps[operation.toLowerCase()]) {
    return explicitOps[operation.toLowerCase()];
  }
  
  const userMsgs = messages.filter(m => m.role === 'user');
  const lastMsg  = userMsgs[userMsgs.length - 1]?.content || '';
  const userText = userMsgs.map(m => m.content).join(' ').toLowerCase();

  if (/```|function|class|import|return|console\.log/.test(lastMsg) ||
      /código|programa|script|función|api|endpoint/.test(userText)) {
    return 'code';
  }
  if (/calcular|matemática|ecuación|suma|resta|multiplicar|dividir|resolver/.test(userText)) {
    return 'math';
  }
  if (/resume|resumen|sintetiza|abrevia/.test(userText)) {
    return 'summary';
  }
  return 'chat';
}

// ─── 6. extractHttpStatus ─────────────────────────────────────────────────────

function extractHttpStatus(err: any): number | null {
  return err?.status ?? err?.response?.status ?? err?.statusCode ?? null;
}

// ─── 7. callWithRetry ─────────────────────────────────────────────────────────

async function callWithRetry<T>(
  fn: () => Promise<T>, 
  providerName: string,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = extractHttpStatus(err);
      
      // ERRORES PERMANENTES → no retry, fallar inmediato
      if (status === 401 || status === 403 || status === 404) {
        throw err;
      }
      
      // RATE LIMIT → backoff exponencial 1s, 2s, 4s
      if (status === 429 && attempt < maxAttempts - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[ROUTER] ${providerName} 429, retry en ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      
      // SERVER ERROR (5xx) → retry corto 500ms una vez
      if (status && status >= 500 && attempt < 1) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      
      // TIMEOUT/RED → retry rápido 300ms una vez
      if (!status && attempt < 1) {
        await new Promise(r => setTimeout(r, 300));
        continue;
      }
      
      throw err;
    }
  }
  throw new Error('Unreachable');
}

// ─── 8. withTimeout ───────────────────────────────────────────────────────────

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms)
    ),
  ]);
}

// ─── 9. trackUsage ────────────────────────────────────────────────────────────

function trackUsage(userId: string, model: string, operation: string, usage: any) {
    if (!usage) return;
    registrarTokens({
        userId,
        model,
        operation,
        promptTokens:     usage.prompt_tokens     ?? usage.promptTokenCount     ?? usage.input_tokens  ?? 0,
        completionTokens: usage.completion_tokens ?? usage.candidatesTokenCount ?? usage.output_tokens ?? 0,
    });
    const adminId = process.env.ADMIN_TELEGRAM_ID || '';
    if (appConfig.telegram.token && adminId) {
        verificarPresupuestoYAlertar(appConfig.telegram.token, adminId).catch(() => {});
    }
}

// ─── 10. sanitizarMensajes ────────────────────────────────────────────────────

function sanitizarMensajes(mensajes: any[]): any[] {
    const toolCallIds = new Set<string>();
    for (const m of mensajes) {
        if (m.role === 'assistant' && m.tool_calls) {
            for (const tc of m.tool_calls) toolCallIds.add(tc.id);
        }
    }
    return mensajes.filter(m => {
        // Descartar mensajes assistant que son puro JSON de tool_call sin tool_calls estructurado
        if (m.role === 'assistant' && !m.tool_calls && m.tool_call_id) return false;
        // Descartar tool responses sin assistant previo que las invocó
        if (m.role === 'tool') return m.tool_call_id && toolCallIds.has(m.tool_call_id);
        return true;
    });
}

// ─── 11-15. PROVIDERS ─────────────────────────────────────────────────────────

async function callProviderGroq(mensajes: any[], modelo: string, herramientas: any[] | null) {
    const res = await groqClient.chat.completions.create({
        model: modelo,
        messages: mensajes as any,
        tools: herramientas && herramientas.length > 0 ? (herramientas as any) : undefined,
        tool_choice: herramientas && herramientas.length > 0 ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) throw new Error(`Respuesta vacía o inválida de Groq (${modelo})`);
    return { msg, usage: res.usage };
}

async function callProviderGemini(mensajes: any[], modelo: string, herramientas: any[] | null) {
    const res = await geminiClient.chat.completions.create({
        model: modelo,
        messages: mensajes as any,
        tools: herramientas && herramientas.length > 0 ? (herramientas as any) : undefined,
        tool_choice: herramientas && herramientas.length > 0 ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) throw new Error(`Respuesta vacía o inválida de Gemini (${modelo})`);
    return { msg, usage: res.usage };
}

async function callProviderDeepSeek(mensajes: any[], modelo: string, herramientas: any[] | null) {
    const res = await deepseekClient.chat.completions.create({
        model: modelo,
        messages: mensajes as any,
        tools: herramientas && herramientas.length > 0 ? (herramientas as any) : undefined,
        tool_choice: herramientas && herramientas.length > 0 ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) throw new Error(`Respuesta vacía o inválida de DeepSeek (${modelo})`);
    return { msg, usage: res.usage };
}

async function callProviderZai(mensajes: any[], modelo: string, herramientas: any[] | null) {
    const res = await zaiClient.chat.completions.create({
        model: modelo,
        messages: mensajes as any,
        tools: herramientas && herramientas.length > 0 ? (herramientas as any) : undefined,
        tool_choice: herramientas && herramientas.length > 0 ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) throw new Error(`Respuesta vacía o inválida de Zai (${modelo})`);
    return { msg, usage: res.usage };
}

async function callProviderOpenRouter(mensajes: any[], modelo: string, herramientas: any[] | null) {
    const res = await openrouterClient.chat.completions.create({
        model: modelo,
        messages: mensajes as any,
        tools: herramientas && herramientas.length > 0 ? (herramientas as any) : undefined,
        tool_choice: herramientas && herramientas.length > 0 ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) throw new Error(`Respuesta vacía o inválida de OpenRouter (${modelo})`);
    return { msg, usage: res.usage };
}

// ─── 16. generarRespuesta ─────────────────────────────────────────────────────

export async function generarRespuesta(
  mensajes: any[],
  modelo: string = 'llama-3.1-8b-instant',
  herramientas: any[] | null = null,
  userId: string = 'system',
  operation: string = 'chat'
): Promise<any> {
  const startTs = Date.now();
  
  const task = detectTaskType(mensajes, operation);
  let primaryProvider: ProviderName;
  let providerChain: ProviderName[];
  let modelOverride = false;

  if (MODEL_TO_PROVIDER[modelo]) {
    modelOverride = true;
    primaryProvider = MODEL_TO_PROVIDER[modelo];
    providerChain = [primaryProvider];
  } else {
    providerChain = ROUTING[task] || ROUTING['chat'];
    primaryProvider = providerChain[0];
  }

  const providersAttempted: ProviderName[] = [];
  let totalRetries = 0;
  let finalError: any = null;

  for (let i = 0; i < providerChain.length; i++) {
    const currentProvider = providerChain[i];
    providersAttempted.push(currentProvider);

    try {
      const msgsParaProvider = sanitizarMensajes(mensajes);
      const targetModel = modelOverride ? modelo : 
          currentProvider === 'groq' ? 'llama-3.3-70b-versatile' :
          currentProvider === 'deepseek' ? (process.env.DEEPSEEK_MODEL || 'deepseek-chat') :
          currentProvider === 'gemini' ? 'gemini-2.5-flash-lite' :
          currentProvider === 'openrouter' ? 'openrouter/free' :
          currentProvider === 'zai' ? 'glm-4.7' : 'llama-3.1-8b-instant';

      const callOp = async () => {
        totalRetries++; // Contar todos los intentos reales
        switch (currentProvider) {
          case 'groq': return await callProviderGroq(msgsParaProvider, targetModel, herramientas);
          case 'gemini': return await callProviderGemini(msgsParaProvider, targetModel, herramientas);
          case 'deepseek': return await callProviderDeepSeek(msgsParaProvider, targetModel, herramientas);
          case 'zai': return await callProviderZai(msgsParaProvider, targetModel, herramientas);
          case 'openrouter': return await callProviderOpenRouter(msgsParaProvider, targetModel, herramientas);
          default: throw new Error(`Provider desconocido: ${currentProvider}`);
        }
      };

      const { msg, usage } = await callWithRetry(
        () => withTimeout(callOp(), PROVIDER_TIMEOUT_MS),
        currentProvider,
        3
      );

      console.log('[ROUTER]', JSON.stringify({
        ts: new Date().toISOString(),
        userId,
        operation,
        task,
        modelOverride,
        primary: primaryProvider,
        attempted: providersAttempted,
        successProvider: currentProvider,
        successModel: targetModel,
        totalLatencyMs: Date.now() - startTs,
        retries: totalRetries - 1, // Restamos 1 para solo contar "re-intentos" extra
      }));

      trackUsage(userId, targetModel, operation, usage);
      return msg;
      
    } catch (err: any) {
      finalError = err;
      const status = extractHttpStatus(err);
      
      if (status === 401 || status === 403 || status === 404) {
        console.warn(`[ROUTER] Skipping ${currentProvider} due to permanent error ${status}`);
      } else {
        console.warn(`[ROUTER] Provider ${currentProvider} failed: ${err.message}`);
      }
    }
  }

  // Fallback final
  console.log('[ROUTER]', JSON.stringify({
    ts: new Date().toISOString(),
    userId,
    operation,
    task,
    modelOverride,
    primary: primaryProvider,
    attempted: providersAttempted,
    successProvider: null,
    successModel: null,
    totalLatencyMs: Date.now() - startTs,
    retries: totalRetries,
    error: finalError?.message || 'All providers failed'
  }));

  console.error('[LLM] Todos los modelos fallaron');
  return {
    role: 'assistant',
    content: "⚠️ Lo siento, todos los sistemas de IA están temporalmente agotados. Por favor, repite tu mensaje en unos segundos.",
    tool_calls: undefined
  };
}

/**
 * agent/llm.ts
 * Geo OS — Router Inteligente de Modelos LLM
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { recordTokenUsage, type TokenUsage } from '../middleware/tokenTracker.js';

loadEnv({ path: resolve(process.cwd(), '.env') });

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

export type TaskType = 'chat' | 'voice' | 'code' | 'reasoning' | 'math' | 'summary' | 'multimodal' | 'tools';
export type ProviderName = 'groq' | 'deepseek' | 'gemini' | 'openrouter' | 'zai';

export interface ProviderConfig {
  name: ProviderName;
  baseUrl: string;
  defaultModel: string;
  apiKey: string | undefined;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PROVIDER_TIMEOUT_MS = 8000;

const PROVIDER_CONFIGS: Record<ProviderName, ProviderConfig> = {
  groq: {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY?.trim(),
  },
  deepseek: {
    name: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY?.trim(),
  },
  gemini: {
    name: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY?.trim(),
  },
  openrouter: {
    name: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openrouter/free',
    apiKey: process.env.OPENROUTER_API_KEY?.trim(),
  },
  zai: {
    name: 'zai',
    baseUrl: 'https://api.z.ai/api/coding/paas/v4',
    defaultModel: 'glm-4.7',
    apiKey: process.env.ZAI_API_KEY?.trim(),
  },
};

const ROUTING: Record<TaskType, ProviderName[]> = {
  chat:       ['groq', 'deepseek', 'gemini', 'openrouter', 'zai'],
  voice:      ['groq', 'deepseek', 'gemini', 'openrouter', 'zai'],
  code:       ['zai', 'deepseek', 'openrouter', 'groq', 'gemini'],
  reasoning:  ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
  math:       ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
  summary:    ['groq', 'gemini', 'deepseek', 'openrouter', 'zai'],
  multimodal: ['gemini', 'openrouter', 'deepseek', 'groq', 'zai'],
  tools:      ['deepseek', 'zai', 'openrouter', 'groq', 'gemini'],
};

const MODEL_TO_PROVIDER: Record<string, ProviderName> = {
  'llama-3.3-70b-versatile': 'groq',
  'deepseek-chat':           'deepseek',
  'glm-4.7':                 'zai',
  'gemini-2.5-flash-lite':   'gemini',
  'openrouter/free':         'openrouter',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function extractHttpStatus(err: any): number | null {
  if (err?.status) return err.status;
  if (err?.response?.status) return err.response.status;
  if (err?.statusCode) return err.statusCode;
  const match = err?.message?.match(/(?:status code|HTTP)\s*(\d{3})/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function detectTaskType(mensajes: Message[], operation: string): TaskType {
  const op = operation.toLowerCase();
  if (op === 'chat') return 'chat';
  if (op.includes('voice')) return 'voice';
  if (op.includes('code') || op.includes('coding')) return 'code';
  if (op === 'reasoning') return 'reasoning';
  if (op === 'summary') return 'summary';
  if (op === 'multimodal') return 'multimodal';
  if (op === 'tools') return 'tools';

  // Fallback heuristics
  const lastMsg = mensajes[mensajes.length - 1]?.content?.toLowerCase() || '';
  if (lastMsg.includes('```') || lastMsg.includes('function') || lastMsg.includes('script') || lastMsg.includes('api')) return 'code';
  if (lastMsg.includes('resumen') || lastMsg.includes('resume') || lastMsg.includes('sintetiza')) return 'summary';
  if (lastMsg.match(/[+\-*/=]/) && /\d/.test(lastMsg) && (lastMsg.includes('calcula') || lastMsg.includes('matemátic'))) return 'math';
  if (lastMsg.includes('piensa') || lastMsg.includes('analiza') || lastMsg.includes('lógica')) return 'reasoning';

  return 'chat';
}

function logRouterCall(metadata: any) {
  console.log(`[ROUTER] ${JSON.stringify({ ts: new Date().toISOString(), ...metadata })}`);
}

// ─── CORE ─────────────────────────────────────────────────────────────────────

async function callProvider(
  providerName: ProviderName,
  mensajes: Message[],
  modeloFuerza: string | null,
  herramientas: Tool[] | null
): Promise<{ message: Message; usage: any }> {
  const conf = PROVIDER_CONFIGS[providerName];
  if (!conf.apiKey) {
    const error: any = new Error(`API key missing for ${providerName}`);
    error.status = 401;
    throw error;
  }

  const model = modeloFuerza || conf.defaultModel;

  const promise = (async () => {
    if (providerName === 'groq') {
      const groq = new Groq({ apiKey: conf.apiKey });
      const res = await groq.chat.completions.create({
        model,
        messages: mensajes as any,
        tools: herramientas as any || undefined,
        temperature: 0,
      });
      const msg = res.choices[0].message;
      return { message: msg as any, usage: res.usage };
    } else {
      const client = new OpenAI({ 
        baseURL: conf.baseUrl, 
        apiKey: conf.apiKey,
        defaultHeaders: providerName === 'openrouter' ? { 'HTTP-Referer': 'https://geoos.app', 'X-Title': 'Geo OS Router' } : undefined
      });
      const res = await client.chat.completions.create({
        model,
        messages: mensajes as any,
        tools: herramientas as any || undefined,
        temperature: 0,
      });
      const msg = res.choices[0].message;
      return { message: msg as any, usage: res.usage };
    }
  })();

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout at ${providerName} (${PROVIDER_TIMEOUT_MS}ms)`)), PROVIDER_TIMEOUT_MS))
  ]);
}

async function callWithRetry(
  providerFn: () => Promise<{ message: Message; usage: any }>,
  maxAttempts: number = 3,
  onRetry?: () => void
): Promise<{ message: Message; usage: any }> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await providerFn();
    } catch (err: any) {
      const status = extractHttpStatus(err);
      
      // PERMANENTES → no retry, fallar al fallback
      if (status === 401 || status === 403 || status === 404) throw err;
      
      // RATE LIMIT → retry con backoff exponencial (1s, 2s, 4s)
      if (status === 429) {
        if (attempt < maxAttempts - 1) {
          await sleep(2 ** attempt * 1000);
          attempt++;
          if (onRetry) onRetry();
          continue;
        }
      }
      
      // SERVER ERROR → retry una vez con backoff corto
      if (status && status >= 500) {
        if (attempt < 1) {
          await sleep(500);
          attempt++;
          if (onRetry) onRetry();
          continue;
        }
      }
      
      // TIMEOUT/NETWORK → retry una vez rápido
      if (!status && attempt < 1) {
        await sleep(300);
        attempt++;
        if (onRetry) onRetry();
        continue;
      }
      
      throw err;
    }
  }
  throw new Error("Exceeded max retries");
}

export async function generarRespuesta(
  mensajes: Message[],
  modelo: string = 'auto',
  herramientas: Tool[] | null = null,
  userId: string = 'system',
  operation: string = 'chat'
): Promise<Message> {
  const startTs = Date.now();
  let taskType: TaskType = 'chat';
  let modelOverride = false;
  let providerChain: ProviderName[] = [];
  let overrideModel: string | null = null;
  let primaryProvider: ProviderName = 'groq';

  if (modelo !== 'auto' && MODEL_TO_PROVIDER[modelo]) {
    modelOverride = true;
    primaryProvider = MODEL_TO_PROVIDER[modelo];
    providerChain = [primaryProvider];
    overrideModel = modelo;
  } else {
    taskType = detectTaskType(mensajes, operation);
    providerChain = ROUTING[taskType] || ROUTING['chat'];
    primaryProvider = providerChain[0];
  }

  const fallbacksAttempted: ProviderName[] = [];
  let totalRetries = 0;

  for (const provider of providerChain) {
    if (provider !== primaryProvider) {
      fallbacksAttempted.push(provider);
    }
    try {
      const { message, usage } = await callWithRetry(
        () => callProvider(provider, mensajes, overrideModel, herramientas),
        3,
        () => { totalRetries++; }
      );
      
      logRouterCall({
        userId,
        operation,
        taskType,
        modelOverride,
        primary: primaryProvider,
        fallbacksAttempted,
        successProvider: provider,
        successModel: overrideModel || PROVIDER_CONFIGS[provider].defaultModel,
        totalLatencyMs: Date.now() - startTs,
        retries: totalRetries,
      });

      if (usage) {
        try {
          const modeloBase = overrideModel || PROVIDER_CONFIGS[provider].defaultModel;
          recordTokenUsage({
            userId,
            model: modeloBase,
            operation,
            inputTokens: usage?.prompt_tokens ?? 0,
            outputTokens: usage?.completion_tokens ?? 0,
            totalTokens: usage?.total_tokens ?? ((usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0)),
            costUSD: computeCostUSD(modeloBase, usage),
            timestamp: Date.now(),
          });
        } catch (trackErr) {
          console.warn(`[ROUTER] Failed to track usage: ${trackErr}`);
        }
      }

      return message;
    } catch (err: any) {
      const status = extractHttpStatus(err);
      if (status === 401 || status === 403 || status === 404) {
        console.warn(`[ROUTER] Skipping ${provider} due to permanent error ${status}`);
      } else {
        console.warn(`[ROUTER] Provider ${provider} failed: ${err.message}`);
      }
    }
  }

  const finalErrorMsg = `All providers in chain failed for task: ${taskType}`;
  logRouterCall({
    userId,
    operation,
    taskType,
    modelOverride,
    primary: primaryProvider,
    fallbacksAttempted,
    successProvider: null,
    successModel: null,
    totalLatencyMs: Date.now() - startTs,
    retries: totalRetries,
    error: finalErrorMsg
  });

  throw new Error(finalErrorMsg);
}

// ─── PRICING & COST HELPER ────────────────────────────────────────────────────

const MODEL_PRICING_PER_M: Record<string, { in: number; out: number }> = {
  // Gemini
  'gemini-2.5-flash-lite':       { in: 0.10, out: 0.40 },
  'gemini-2.5-flash':            { in: 0.30, out: 2.50 },
  'gemini-1.5-pro':              { in: 1.25, out: 5.00 },
  // DeepSeek (pagado)
  'deepseek-chat':               { in: 0.14, out: 0.28 },
  // Groq (free tier - costo 0)
  'llama-3.3-70b-versatile':     { in: 0.00, out: 0.00 },
  'llama-3.1-8b-instant':        { in: 0.00, out: 0.00 },
  // Z.ai Coding Plan (pagado vía suscripción, costo flat)
  'glm-4.7':                     { in: 0.00, out: 0.00 }, // suscripción
  // OpenRouter free
  'openrouter/free':             { in: 0.00, out: 0.00 },
  // Default fallback
  'default':                     { in: 0.50, out: 1.50 },
};

function computeCostUSD(
  modelo: string,
  usage?: { prompt_tokens?: number; completion_tokens?: number }
): number {
  const pricing = MODEL_PRICING_PER_M[modelo] ?? MODEL_PRICING_PER_M['default'];
  const inTokens  = usage?.prompt_tokens     ?? 0;
  const outTokens = usage?.completion_tokens ?? 0;
  const cost = (inTokens / 1_000_000) * pricing.in
             + (outTokens / 1_000_000) * pricing.out;
  return parseFloat(cost.toFixed(8)); // 8 decimales = sub-centavo
}

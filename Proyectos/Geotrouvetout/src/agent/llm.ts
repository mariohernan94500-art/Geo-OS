/**
 * Motor LLM de Geo OS v2 - Con selección dinámica de modelos
 * Proveedores: Groq, Gemini, Together AI, Fireworks AI, OpenRouter (dinámico), Claude (pago opcional)
 * Fallback automático + selección inteligente de modelo según tarea
 */

import Anthropic from '@anthropic-ai/sdk';
import { Groq } from 'groq-sdk';
import OpenAI from 'openai';
import { appConfig } from '../config.js';
import { registrarTokens, verificarPresupuestoYAlertar } from '../security/tokenTracker.js';

// ─── Clientes ─────────────────────────────────────────────────────────────

// Groq
const groq = new Groq({ apiKey: appConfig.llm.groqKey });

// Gemini (OpenAI-compatible)
let geminiClient: OpenAI | null = null;
if (appConfig.llm.geminiKey) {
    geminiClient = new OpenAI({
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: appConfig.llm.geminiKey,
    });
}

// Together AI
let togetherClient: OpenAI | null = null;
if (appConfig.llm.togetherKey) {
    togetherClient = new OpenAI({
        baseURL: 'https://api.together.xyz/v1',
        apiKey: appConfig.llm.togetherKey,
    });
}

// Fireworks AI
let fireworksClient: OpenAI | null = null;
if (appConfig.llm.fireworksKey) {
    fireworksClient = new OpenAI({
        baseURL: 'https://api.fireworks.ai/inference/v1',
        apiKey: appConfig.llm.fireworksKey,
    });
}

// OpenRouter (dinámico)
let openrouterClient: OpenAI | null = null;
if (appConfig.llm.openrouterKey) {
    openrouterClient = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: appConfig.llm.openrouterKey,
        defaultHeaders: {
            'HTTP-Referer': 'https://geoos.app',
            'X-Title': 'Geo OS'
        }
    });
}

// Claude (pago opcional)
let claudeClient: Anthropic | null = null;
if (appConfig.llm.claudeKey && appConfig.llm.claudePaid === true) {
    claudeClient = new Anthropic({ apiKey: appConfig.llm.claudeKey });
}

// ─── Detección de tarea para OpenRouter ───────────────────────────────────

type TaskType = 'code' | 'math' | 'tools' | 'summary' | 'chat';

function detectTaskType(messages: any[]): TaskType {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const fullText = messages.map(m => m.content).join(' ').toLowerCase();

    if (/```|function|class|import|return|console\.log|const|let|var/.test(lastMsg) ||
        /código|programa|script|función|api|endpoint/.test(fullText)) {
        return 'code';
    }
    if (/calcular|matemática|ecuación|suma|resta|multiplicar|dividir|resolver|raíz|logaritmo/.test(fullText)) {
        return 'math';
    }
    if (/herramienta|tool|función|llamar|ejecutar|automatizar/.test(fullText)) {
        return 'tools';
    }
    if (/resume|resumen|sintetiza|abrevia|extrae lo importante/.test(fullText)) {
        return 'summary';
    }
    return 'chat';
}

function getOpenRouterModel(task: TaskType): string {
    const models = {
        code:    'qwen/qwen-2.5-coder-32b-instruct:free',
        math:    'google/gemma-2-9b-it:free',
        tools:   'mistralai/mistral-7b-instruct:free',
        summary: 'qwen/qwen-2.5-72b-instruct:free',
        chat:    'meta/llama-3.3-70b-instruct:free',
    };

    return models[task];
}

// ─── Tracking de tokens ───────────────────────────────────────────────────

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

// ─── Normalizadores de respuesta ──────────────────────────────────────────

function toAnthropicTools(tools: any[]): Anthropic.Tool[] {
    return tools.map(t => ({
        name:        t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters as Anthropic.Tool.InputSchema,
    }));
}

function normalizarRespuestaClaude(msg: Anthropic.Message): any {
    const textBlock = msg.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const text = textBlock?.text ?? '';
    const toolUseBlocks = msg.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    const tool_calls = toolUseBlocks.map(b => ({
        id:       b.id,
        type:     'function',
        function: { name: b.name, arguments: JSON.stringify(b.input) },
    }));
    return {
        role:       'assistant',
        content:    text || null,
        tool_calls: tool_calls.length > 0 ? tool_calls : undefined,
    };
}

// ─── Función de llamada genérica para cualquier cliente OpenAI ────────────

async function callOpenAICompatible(
    client: OpenAI,
    model: string,
    messages: any[],
    tools: any[] | null = null
): Promise<any> {
    const res = await client.chat.completions.create({
        model,
        messages,
        tools: tools || undefined,
        tool_choice: tools ? 'auto' : undefined,
        temperature: 0.5,
        max_tokens: 2000,
    });
    const msg = res.choices?.[0]?.message;
    if (!msg || (!msg.content && !msg.tool_calls)) {
        throw new Error(`Respuesta vacía o inválida de ${model}`);
    }
    return msg;
}

// ─── Generador principal con cadena de fallback + selección dinámica ───────

export async function generarRespuesta(
    mensajes: any[],
    modelo: string = 'llama-3.3-70b-versatile', // solo usado por Groq
    herramientas: any[] | null = null,
    userId: string = 'system',
    operation: string = 'chat'
): Promise<any> {
    const task = detectTaskType(mensajes);
    console.log(`[LLM] Tarea detectada: ${task}`);

    // ── 1. Groq (principal) ──────────────────────────────────────────────
    try {
        console.log(`[LLM] ⚡ Groq (${modelo})...`);
        const res = await groq.chat.completions.create({
            model: modelo,
            messages: mensajes,
            tools: herramientas || undefined,
            tool_choice: herramientas ? 'auto' : undefined,
            temperature: 0.5,
            max_tokens: 2000,
        });
        trackUsage(userId, modelo, operation, res.usage);
        const msg = res.choices?.[0]?.message;
        if (msg && (msg.content || msg.tool_calls)) return msg;
        throw new Error("Respuesta vacía de Groq");
    } catch (err: any) {
        console.warn(`[LLM] Groq falló: ${err.message}`);
    }

    // ── 2. Gemini (contexto largo) ───────────────────────────────────────
    if (geminiClient) {
        try {
            console.log(`[LLM] 🧠 Gemini 1.5 Flash...`);
            const msg = await callOpenAICompatible(geminiClient, 'gemini-1.5-flash', mensajes, herramientas);
            trackUsage(userId, 'gemini-1.5-flash', operation, { prompt_tokens: 0, completion_tokens: 0 });

            return msg;
        } catch (err: any) {
            console.warn(`[LLM] Gemini falló: ${err.message}`);
        }
    }

    // ── 3. Together AI ───────────────────────────────────────────────────
    if (togetherClient) {
        try {
            console.log(`[LLM] 🤝 Together AI (Llama 3.3 70B)...`);
            const msg = await callOpenAICompatible(togetherClient, 'meta-llama/Llama-3.3-70B-Instruct-Turbo', mensajes, herramientas);
            trackUsage(userId, 'together-llama-3.3-70b', operation, {});
            return msg;
        } catch (err: any) {
            console.warn(`[LLM] Together falló: ${err.message}`);
        }
    }

    // ── 4. Fireworks AI ──────────────────────────────────────────────────
    if (fireworksClient) {
        try {
            console.log(`[LLM] 🔥 Fireworks AI (Llama 3.3 70B)...`);
            const msg = await callOpenAICompatible(fireworksClient, 'accounts/fireworks/models/llama-v3p3-70b-instruct', mensajes, herramientas);
            trackUsage(userId, 'fireworks-llama-3.3-70b', operation, {});
            return msg;
        } catch (err: any) {
            console.warn(`[LLM] Fireworks falló: ${err.message}`);
        }
    }

    // ── 5. OpenRouter con selección dinámica ──────────────────────────────
    if (openrouterClient) {
        const openrouterModel = getOpenRouterModel(task);
        console.log(`[LLM] 🔄 OpenRouter (${openrouterModel}) para tarea: ${task}`);
        try {
            const msg = await callOpenAICompatible(openrouterClient, openrouterModel, mensajes, herramientas);
            trackUsage(userId, `openrouter-${openrouterModel}`, operation, {});
            return msg;
        } catch (err: any) {
            console.warn(`[LLM] OpenRouter falló: ${err.message}`);
        }
    }

    // ── 6. Claude (solo si es de pago y está configurado) ─────────────────
    if (claudeClient && appConfig.llm.claudePaid) {
        try {
            console.log(`[LLM] 🧬 Claude (pago) - calidad extrema...`);
            const systemMsg = mensajes.find(m => m.role === 'system');
            const otrosMsgs = mensajes.filter(m => m.role !== 'system').map(m => {
                if (m.role === 'tool') {
                    return { role: 'user' as const, content: [{ type: 'tool_result' as const, tool_use_id: m.tool_call_id, content: m.content }] };
                }
                if (m.role === 'assistant' && m.tool_calls) {
                    return { role: 'assistant' as const, content: m.tool_calls.map((tc: any) => ({ type: 'tool_use' as const, id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments) })) };
                }
                return { role: m.role as 'user' | 'assistant', content: m.content };
            });
            const params: Anthropic.MessageCreateParams = {
                model: appConfig.llm.claudeModel || 'claude-3-opus-20240229',
                max_tokens: 2048,
                system: systemMsg?.content,
                messages: otrosMsgs as Anthropic.MessageParam[],
            };
            if (herramientas && herramientas.length > 0) {
                params.tools = toAnthropicTools(herramientas);
            }
            const res = await claudeClient.messages.create(params);
            trackUsage(userId, appConfig.llm.claudeModel || 'claude-3-opus', operation, res.usage);
            return normalizarRespuestaClaude(res);
        } catch (err: any) {
            console.warn(`[LLM] Claude falló: ${err.message}`);
        }
    }

    // ── 7. Último recurso (nunca silencio) ────────────────────────────────
    console.error('[LLM] Todos los modelos fallaron');
    return {
        role: 'assistant',
        content: "⚠️ Lo siento, todos los sistemas de IA están temporalmente agotados. Por favor, repite tu mensaje en unos segundos.",
        tool_calls: undefined
    };
}

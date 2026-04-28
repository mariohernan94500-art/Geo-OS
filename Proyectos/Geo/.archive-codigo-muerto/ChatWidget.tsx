/**
 * ChatWidget — Widget flotante de chat para ecoorigenchile.com
 * 
 * Conecta al SalesAgent via /api/public/chat
 * Se embebe en cualquier página VITRA.
 * 
 * USO en App.tsx:
 *   import { ChatWidget } from './components/ChatWidget';
 *   // Dentro del JSX, después de <Routes>:
 *   <ChatWidget />
 */
import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_GEOCORE_API_URL || 'https://agent.ecoorigenchile.com';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [msgs, open]);

    const send = async (text?: string) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');

        const updated = [...msgs, { role: 'user' as const, content: msg }];
        setMsgs(updated);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/public/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
                },
                body: JSON.stringify({ mensaje: msg }),
            });
            const data = await res.json();
            if (data.sessionId) setSessionId(data.sessionId);
            setMsgs([...updated, { role: 'assistant', content: data.respuesta || 'Error al procesar.' }]);
        } catch {
            setMsgs([...updated, {
                role: 'assistant',
                content: '¡Ups! Error de conexión. Escríbenos por WhatsApp: +56 9 XXXX XXXX'
            }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Bubble */}
            {!open && (
                <button onClick={() => setOpen(true)} style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    width: 60, height: 60, borderRadius: '50%',
                    background: '#0F3D2E', color: '#F6F3EE',
                    border: 'none', cursor: 'pointer', fontSize: 26,
                    boxShadow: '0 4px 20px rgba(15,61,46,.35)',
                    transition: 'transform .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    width: 380, maxWidth: 'calc(100vw - 32px)',
                    height: 520, maxHeight: 'calc(100vh - 48px)',
                    borderRadius: 16, overflow: 'hidden',
                    background: '#F6F3EE',
                    border: '1px solid rgba(15,61,46,.12)',
                    boxShadow: '0 12px 40px rgba(0,0,0,.15)',
                    display: 'flex', flexDirection: 'column',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#0F3D2E', color: '#F6F3EE',
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(246,243,238,.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                        }}>🥃</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Playfair Display', serif" }}>VITRA</div>
                            <div style={{ fontSize: 11, opacity: .7 }}>Asistente de ventas · En línea</div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{
                            background: 'none', border: 'none', color: '#F6F3EE',
                            fontSize: 18, cursor: 'pointer', opacity: .7,
                        }}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                        {msgs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🥃</div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#0F3D2E', fontWeight: 700, marginBottom: 6 }}>
                                    ¡Hola! Soy del equipo VITRA
                                </div>
                                <div style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 16 }}>
                                    Pregúntame sobre nuestros vasos de vidrio reciclado, precios, envíos o personalización.
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                                    {['¿Qué vasos tienen?', 'Retrato de mascota 🐾', 'Vasos para boda', '¿Hacen envíos?'].map(q => (
                                        <button key={q} onClick={() => send(q)} style={{
                                            padding: '7px 12px', borderRadius: 100, fontSize: 12,
                                            background: '#fff', border: '1px solid rgba(15,61,46,.12)',
                                            color: '#1C1C1A', cursor: 'pointer', fontFamily: 'inherit',
                                        }}>{q}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {msgs.map((m, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: 10,
                            }}>
                                <div style={{
                                    maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                                    fontSize: 13, lineHeight: 1.6,
                                    ...(m.role === 'user'
                                        ? { background: '#0F3D2E', color: '#F6F3EE', borderBottomRightRadius: 4 }
                                        : { background: '#fff', border: '1px solid rgba(15,61,46,.08)', borderBottomLeftRadius: 4 }),
                                }}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 7, height: 7, borderRadius: '50%', background: '#0F3D2E',
                                        animation: `chatPulse 1.2s ease-in-out ${i * .15}s infinite`,
                                    }} />
                                ))}
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '10px 12px', borderTop: '1px solid rgba(15,61,46,.08)',
                        display: 'flex', gap: 8, background: '#fff',
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Escribe tu pregunta..."
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: 8,
                                border: '1px solid rgba(15,61,46,.1)', fontSize: 13,
                                fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => send()}
                            disabled={loading || !input.trim()}
                            style={{
                                padding: '0 16px', borderRadius: 8, border: 'none',
                                background: input.trim() ? '#0F3D2E' : 'rgba(15,61,46,.06)',
                                color: input.trim() ? '#F6F3EE' : '#6B6860',
                                fontSize: 16, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default',
                            }}
                        >→</button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes chatPulse {
                    0%, 100% { opacity: .2; transform: scale(.7); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </>
    );
}

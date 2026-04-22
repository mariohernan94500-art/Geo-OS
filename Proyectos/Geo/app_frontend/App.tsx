import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, LogBox, Pressable, Animated,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

LogBox.ignoreLogs([
  'Expo AV has been deprecated',
  'SafeAreaView has been deprecated',
]);

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c3JfZGV2XzEyMyIsInJvbGUiOiJPV05FUiIsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NzUxMDQwOTMsImV4cCI6MTgwNjY2MTY5M30.OXz1CULxLJMnrSTElvVt1uPARdIsydZDKmSu489VShg';
const BASE_URL = 'http://192.168.1.15:3000';

// ─── VAD CONFIG ───────────────────────────────────────────────────────────────
const VAD_SPEECH_THRESHOLD_DB = -35;
const VAD_INTERRUPT_THRESHOLD_DB = -30;
const VAD_PERSISTENCE_MS = 250;
const VAD_SILENCE_ACTIVE_MS = 850;
const VAD_SILENCE_WAITING_MS = 2200;
const VAD_COOLDOWN_MS = 2000;
const VAD_MIN_RECORDING_MS = 600;
const VAD_MAX_RECORDING_MS = 15000;
const VAD_POLL_INTERVAL_MS = 50;
const VAD_BARGE_FADE_STEPS = 6;

// ─── TYPES ───────────────────────────────────────────────────────────────────
enum ConversationState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SPEAKING = 'SPEAKING',
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface InteractionTask {
  id: number;
  audioUri?: string;
  text?: string;
  timestamp?: number;
}

// ─── MENSAJE BURBUJA ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && (
        <View style={styles.avatarGeo}>
          <Text style={styles.avatarText}>G</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
          {msg.text}
        </Text>
      </View>
    </View>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Estado UI ──────────────────────────────────────────────────────────────
  const [convState, setConvState] = useState<ConversationState>(ConversationState.IDLE);
  const convStateRef = useRef<ConversationState>(ConversationState.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConvMode, setIsConvMode] = useState(false);
  const [vadLevel, setVadLevel] = useState(-160);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', text: 'Hola, soy Géo. Escríbeme o activa el modo conversación 🎙️' }
  ]);

  // ── Refs (no reactivos — para lógica interna de loops) ────────────────────
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Refs espejo de estado (para closures en setInterval / callbacks)
  const isListeningRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isConvModeRef = useRef(false);

  // Refs de control de interacción (Barge-in / Cancelación)
  const abortControllerRef = useRef<AbortController | null>(null);
  const interactionIdRef = useRef<number>(0);
  const lastRequestTimeRef = useRef<number>(0);

  // Refs de control VAD
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechDetectedRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const vadPersistenceStartRef = useRef<number | null>(null);

  // Animación del indicador de onda de voz
  const waveAnim = useRef(new Animated.Value(1)).current;

  // ── Sincronizar refs con estado ───────────────────────────────────────────
  useEffect(() => { convStateRef.current = convState; }, [convState]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isConvModeRef.current = isConvMode; }, [isConvMode]);

  // ── Scroll al fondo ───────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatHistory]);

  // ── Permisos al arrancar ──────────────────────────────────────────────────
  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  // ── Animación de onda mientras graba ─────────────────────────────────────
  useEffect(() => {
    if (isListening && speechDetectedRef.current) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.25, duration: 300, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(1);
    }
  }, [isListening]);

  // ── Activar/desactivar modo conversación ─────────────────────────────────
  useEffect(() => {
    if (isConvMode) {
      console.log('[CONV] 🟢 Modo conversación ACTIVADO');
      iniciarCicloConversacion();
    } else {
      console.log('[CONV] 🔴 Modo conversación DESACTIVADO');
      detenerVAD();
      detenerGrabacion();
    }
  }, [isConvMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VAD — VOICE ACTIVITY DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        addMessage('assistant', '⚠️ Necesito acceso al micrófono.');
        return;
      }

      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch (_) { }
        recordingRef.current = null;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      recordingRef.current = recording;
      setIsListening(true);
      isListeningRef.current = true;

      if (isConvModeRef.current) {
        // ── FIX 3: Reiniciar VAD limpio siempre (sin guard que bloquee) ──
        detenerVAD();
        iniciarVAD();
      }

    } catch (err) {
      console.error('[REC] ❌ Error al iniciar grabación:', err);
    }
  };

  const iniciarCicloConversacion = async () => {
    setConvState(ConversationState.LISTENING);
    await startRecording();
  };

  const iniciarVAD = () => {
    // ── FIX 3: Limpiar interval existente en lugar de salir con return ──
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    speechDetectedRef.current = false;
    silenceStartRef.current = null;
    recordingStartRef.current = Date.now();

    vadIntervalRef.current = setInterval(async () => {
      if (!recordingRef.current || !isListeningRef.current) return;

      // ── FIX 1: No analizar audio mientras Géo habla — evita eco ──
      if (convStateRef.current === ConversationState.SPEAKING) return;

      try {
        const status = await recordingRef.current.getStatusAsync();
        if (!status.isRecording) return;

        const db = status.metering ?? -160;
        setVadLevel(db);

        const elapsed = Date.now() - recordingStartRef.current;

        const threshold = convStateRef.current === ConversationState.PROCESSING
          ? VAD_INTERRUPT_THRESHOLD_DB
          : VAD_SPEECH_THRESHOLD_DB;

        const detectaVoz = db > threshold;

        // Barge-in: solo aplica durante PROCESSING (SPEAKING ya está bloqueado arriba)
        if (detectaVoz && convStateRef.current === ConversationState.PROCESSING) {
          if (!vadPersistenceStartRef.current) {
            vadPersistenceStartRef.current = Date.now();
          }
          const persistenceDuration = Date.now() - vadPersistenceStartRef.current;

          if (persistenceDuration >= VAD_PERSISTENCE_MS) {
            vadPersistenceStartRef.current = null;
            await bargeIn();
          }
        } else if (!detectaVoz) {
          vadPersistenceStartRef.current = null;
        }

        const esSilencio = db < VAD_SPEECH_THRESHOLD_DB;
        const silenceTarget = speechDetectedRef.current ? VAD_SILENCE_ACTIVE_MS : VAD_SILENCE_WAITING_MS;

        if (!esSilencio && convStateRef.current === ConversationState.LISTENING) {
          if (!speechDetectedRef.current) {
            speechDetectedRef.current = true;
          }
          silenceStartRef.current = null;

        } else if (speechDetectedRef.current && convStateRef.current === ConversationState.LISTENING) {
          if (!silenceStartRef.current) {
            silenceStartRef.current = Date.now();
          }
          const silenceDuration = Date.now() - silenceStartRef.current;

          // Caso A: Usuario habló y se calló (fin de frase)
          if (elapsed >= VAD_MIN_RECORDING_MS && silenceDuration >= silenceTarget) {
            detenerVAD();
            const uri = await stopRecordingAndGetUri();

            // CONTINUIDAD ININTERRUMPIDA: reiniciar micrófono AL INSTANTE
            if (isConvModeRef.current) {
              startRecording();
            } else {
              setIsListening(false);
              isListeningRef.current = false;
            }

            if (uri) {
              setConvState(ConversationState.PROCESSING);
              interactionIdRef.current += 1;
              procesarInteraccion({ id: interactionIdRef.current, audioUri: uri });
            }
            return;
          }
        } else if (elapsed >= VAD_MAX_RECORDING_MS && !speechDetectedRef.current) {
          // Caso B: Ruido de fondo continuo sin voz detectada (auto-reset)
          detenerVAD();
          if (isConvModeRef.current) {
            startRecording();
          } else {
            await detenerGrabacion();
          }
        }

      } catch (_) { }
    }, VAD_POLL_INTERVAL_MS);
  };

  const detenerVAD = () => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
  };

  const bargeIn = async () => {
    console.log('[CONV] ⛔ BARGE-IN activado');

    interactionIdRef.current += 1;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Detener VAD antes del todo para no procesar más audio durante la transición
    detenerVAD();

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) { }
      soundRef.current = null;
    }

    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsLoading(false);
    isLoadingRef.current = false;

    if (isConvModeRef.current) {
      setConvState(ConversationState.LISTENING);
      // FIX: NO forzamos speechDetectedRef=true aquí.
      // Dejamos que el VAD nuevo detecte la voz del usuario de forma natural.
      // Forzarlo causaba que el VAD enviara clips de ruido vacíos inmediatamente.
      speechDetectedRef.current = false;
      silenceStartRef.current = null;
      // Abrir micrófono limpio para capturar la frase de interrupción
      await startRecording();
    } else {
      await detenerGrabacion();
      setConvState(ConversationState.IDLE);
    }
  };

  const detenerGrabacion = async () => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch (_) { }
      recordingRef.current = null;
    }
  };

  const stopRecordingAndGetUri = async () => {
    if (!recordingRef.current) return null;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      return uri;
    } catch (e) { return null; }
  };

  const isStaleInteraction = (id: number) => {
    return id !== interactionIdRef.current;
  };

  const procesarInteraccion = async (task: InteractionTask) => {
    const interactionId = interactionIdRef.current;
    if (isStaleInteraction(interactionId)) return;

    try {
      setIsLoading(true);
      isLoadingRef.current = true;
      setConvState(ConversationState.PROCESSING);

      const placeholderId = task.id.toString();
      setChatHistory(prev => [...prev, { id: placeholderId, role: 'user', text: task.text || '🎙️ ...' }]);

      const formData = new FormData();
      if (task.audioUri) {
        formData.append('audio', { uri: task.audioUri, name: 'voice_memo.m4a', type: 'audio/m4a' } as any);
      } else {
        formData.append('text', task.text || '');
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const apiRes = await fetch(`${BASE_URL}/api/voice/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DEV_TOKEN}` },
        body: formData,
        signal: controller.signal,
      });

      if (isStaleInteraction(interactionId)) return;

      if (!apiRes.ok) {
        if (apiRes.status === 429) {
          setChatHistory(prev => prev.filter(m => m.id !== placeholderId));
          console.warn('[VOZ] ⚠️  429 Rate Limit — backoff automático');
          await new Promise(r => setTimeout(r, 4000));
          if (isStaleInteraction(interactionId)) return;
          setIsLoading(false);
          isLoadingRef.current = false;
          setConvState(ConversationState.IDLE);
          if (isConvModeRef.current) iniciarCicloConversacion();
          return;
        }
        throw new Error(`HTTP ${apiRes.status}`);
      }

      const transcript = decodeURIComponent(apiRes.headers.get('x-transcript') || '');
      const reply = decodeURIComponent(apiRes.headers.get('x-reply-text') || '');

      setChatHistory((prev: ChatMessage[]) => prev.map((m: ChatMessage) =>
        m.id === placeholderId ? { ...m, text: task.text ? task.text : `🎙️ ${transcript || '[audio]'}` } : m
      ));
      if (reply) addMessage('assistant', reply);

      const ct = apiRes.headers.get('content-type') || '';
      if (ct.includes('audio') || ct.includes('mpeg')) {
        const arrayBuffer = await apiRes.arrayBuffer();

        if (isStaleInteraction(interactionId)) return;

        // Convertir a base64
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        }
        const base64 = btoa(binary);

        const tempPath = FileSystem.cacheDirectory + `geo_${Date.now()}.mp3`;

        await FileSystem.writeAsStringAsync(tempPath, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (isStaleInteraction(interactionId)) {
          await FileSystem.deleteAsync(tempPath, { idempotent: true });
          return;
        }

        // Preparar modo reproducción (NO grabar mientras Géo habla)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        // Limpiar anterior
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch (e) { }
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: tempPath },
          { shouldPlay: false }
        );

        if (isStaleInteraction(interactionId)) {
          await sound.unloadAsync();
          await FileSystem.deleteAsync(tempPath, { idempotent: true });
          return;
        }

        soundRef.current = sound;

        setIsSpeaking(true);
        isSpeakingRef.current = true;

        setIsLoading(false);
        isLoadingRef.current = false;

        setConvState(ConversationState.SPEAKING);

        const playbackStartTime = Date.now(); // ⏱️ Registrar inicio para calcular duración
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate(async (status: any) => {
          if (!status.isLoaded) return;

          if (status.didJustFinish) {
            const playbackDuration = Date.now() - playbackStartTime;

            setIsSpeaking(false);
            isSpeakingRef.current = false;

            // FIX: Matar el VAD ANTES del await para que ningún intervalo
            // dispare barge-in durante la ventana anti-eco.
            detenerVAD();
            if (recordingRef.current) {
              try { await recordingRef.current.stopAndUnloadAsync(); } catch (_) { }
              recordingRef.current = null;
            }

            await sound.unloadAsync();
            soundRef.current = null;
            FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => { });

            if (isConvModeRef.current && !isStaleInteraction(interactionId)) {
              const echoDecayMs = Math.min(2500, Math.max(1000, playbackDuration * 0.2 + 800));
              console.log(`[ANTI-ECO] ⏳ Silencio ${echoDecayMs}ms (audio: ${Math.round(playbackDuration / 1000)}s)`);
              await new Promise(r => setTimeout(r, echoDecayMs));

              if (isStaleInteraction(interactionId)) return;

              // Volver a modo grabación con buffer 100% limpio
              await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
              });
              setConvState(ConversationState.LISTENING);
              startRecording();
            } else if (!isConvModeRef.current) {
              setConvState(ConversationState.IDLE);
            }
          }
        });

      } else {
        try {
          const jsonData = await apiRes.json();
          if (jsonData.transcripcion && transcript === '[audio]') {
            setChatHistory((prev: ChatMessage[]) => prev.map((m: ChatMessage) =>
              m.id === placeholderId ? { ...m, text: `🎙️ ${jsonData.transcripcion}` } : m
            ));
          }
          if (jsonData.respuesta && !reply) {
            addMessage('assistant', jsonData.respuesta);
          }
        } catch (e) { }

        setIsLoading(false); // 🚀 FIX: Apagar spinner si retorna solo texto
        isLoadingRef.current = false;

        if (isConvModeRef.current && !isStaleInteraction(interactionId)) {
          setTimeout(iniciarCicloConversacion, 1000);
        }
      }
    } catch (error: any) {
      console.error('[ERROR PIPELINE]', error);

      if (error.name !== 'AbortError' && !isStaleInteraction(interactionId)) {
        addMessage('assistant', `⚠️ ${error.message || 'Error desconocido'}`);
      }

      setIsLoading(false);
      isLoadingRef.current = false;

      setIsSpeaking(false);
      isSpeakingRef.current = false;

      setConvState(ConversationState.IDLE);

      if (isConvModeRef.current && !isStaleInteraction(interactionId)) {
        setTimeout(iniciarCicloConversacion, 2000);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXTO
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    addMessage('user', text);
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEV_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto: text }),
      });
      const data = await res.json();
      addMessage('assistant', data.respuesta || '...');
    } catch (e) {
      addMessage('assistant', '⚠️ No pude conectarme. ¿Está el servidor activo?');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    setChatHistory((prev: ChatMessage[]) => [...prev, { id: Math.random().toString(), role, text }]);
  };

  const handleMicPress = () => {
    if (isListening) {
      detenerVAD();
      const doStopAndSend = async () => {
        const uri = await stopRecordingAndGetUri();

        if (isConvModeRef.current) {
          startRecording();
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }

        if (uri) {
          setConvState(ConversationState.PROCESSING);
          interactionIdRef.current += 1;
          procesarInteraccion({ id: interactionIdRef.current, audioUri: uri });
        }
      };
      doStopAndSend();
    } else {
      setConvState(ConversationState.LISTENING);
      startRecording();
    }
  };

  const toggleConvMode = () => {
    setIsConvMode((prev: boolean) => !prev);
  };

  // ── Indicador de nivel VAD (eje 0-1 para UI) ──────────────────────────────
  const vadNormalized = Math.max(0, Math.min(1, (vadLevel + 60) / 60));

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Géo</Text>
          <View style={styles.headerStatus}>
            {isConvMode && (
              <View style={[styles.statusDot, { backgroundColor: isSpeaking ? '#f59e0b' : isListening ? '#22c55e' : isLoading ? '#3b82f6' : '#22c55e' }]} />
            )}
            <Text style={styles.headerStatusText}>
              {isSpeaking ? 'Hablando...' : isListening ? (speechDetectedRef.current ? '🗣️ Escuchando...' : '🎧 En espera...') : isLoading ? 'Procesando...' : isConvMode ? 'Modo conversación' : 'Listo'}
            </Text>
          </View>
        </View>

        {/* ── CHAT ───────────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {chatHistory.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {isLoading && (
            <View style={styles.bubbleRow}>
              <View style={styles.avatarGeo}><Text style={styles.avatarText}>G</Text></View>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#666" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── INPUT BAR ──────────────────────────────────────────────────── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Pill de modo conversación */}
          <Pressable style={[styles.convPill, isConvMode && styles.convPillActive]} onPress={toggleConvMode}>
            {isConvMode && isListening && (
              <Animated.View
                style={[styles.convPillPulse, { transform: [{ scale: waveAnim }] }]}
              />
            )}
            <Text style={[styles.convPillText, isConvMode && styles.convPillTextActive]}>
              {isConvMode ? '🔴 Conversación activa' : '💬 Modo conversación'}
            </Text>
          </Pressable>

          {/* Barra de input */}
          <View style={[styles.inputBar, isListening && !isConvMode && styles.inputBarRecording]}>
            {/* Placeholder para adjuntos */}
            <View style={styles.attachPlaceholder} />

            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={isConvMode ? 'Modo conversación activo...' : 'Escribe un mensaje...'}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendText}
              multiline
              maxLength={2000}
              editable={!isLoading}
            />

            {/* Botón enviar o micrófono */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={[styles.sendBtn, isLoading && styles.btnDisabled]}
                onPress={handleSendText}
                disabled={isLoading}
              >
                <Text style={styles.sendBtnText}>↑</Text>
              </TouchableOpacity>
            ) : (
              !isConvMode && (
                <TouchableOpacity
                  style={[
                    styles.micBtn,
                    isListening && styles.micBtnActive,
                    isLoading && styles.btnDisabled,
                  ]}
                  onPress={handleMicPress}
                  disabled={isLoading}
                >
                  <Text style={styles.micBtnText}>{isListening ? '■' : '🎙️'}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Barra de nivel de audio (VAD visual) */}
          {isListening && isConvMode && (
            <View style={styles.vadBar}>
              <View style={[
                styles.vadFill,
                {
                  width: `${vadNormalized * 100}%`,
                  backgroundColor: vadNormalized > 0.4 ? '#22c55e' : '#94a3b8',
                }
              ]} />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerStatusText: { fontSize: 13, color: '#666' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  chatArea: { flex: 1 },
  chatContent: { padding: 16, gap: 8, paddingBottom: 8 },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 3 },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  bubbleRowBot: { flexDirection: 'row' },

  avatarGeo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: { backgroundColor: '#111', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextBot: { color: '#111' },
  typingBubble: { paddingHorizontal: 16, paddingVertical: 12 },

  convPill: { alignSelf: 'center', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' },
  convPillActive: { backgroundColor: '#111' },
  convPillText: { fontSize: 13, fontWeight: '600', color: '#555' },
  convPillTextActive: { color: '#fff' },
  convPillPulse: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  inputBarRecording: { borderTopColor: '#ef4444' },
  attachPlaceholder: { width: 4 },

  textInput: { flex: 1, fontSize: 15, color: '#111', maxHeight: 120, backgroundColor: '#f3f4f6', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },

  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  micBtnActive: { backgroundColor: '#ef4444' },
  micBtnText: { fontSize: 18 },
  btnDisabled: { opacity: 0.4 },

  vadBar: { height: 3, backgroundColor: '#f0f0f0', marginHorizontal: 12, marginBottom: 4, borderRadius: 2, overflow: 'hidden' },
  vadFill: { height: 3, borderRadius: 2, transition: 'width 0.1s' } as any,
});

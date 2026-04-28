/**
 * LoginScreen.tsx — Pantalla de login placeholder
 *
 * Estado actual: permite pegar un token temporalmente en un input para
 * continuar el desarrollo antes del launch. NO es el flujo de login real.
 *
 * PENDIENTE POST-LAUNCH:
 * - Implementar login real con email + password contra /api/auth/login.
 * - Agregar recuperación de contraseña.
 * - Agregar OAuth si aplica (Google Sign-In).
 * - Reemplazar este componente por el flujo real antes de publicar en
 *   una versión pública (hoy solo accede Mario → token privado es suficiente).
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { setToken } from '../auth/session';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export default function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveToken = async () => {
    const cleaned = tokenInput.trim();
    if (!cleaned) {
      Alert.alert('Campo vacío', 'Pega el token de acceso.');
      return;
    }
    setLoading(true);
    try {
      await setToken(cleaned);
      onAuthenticated();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el token. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Géo</Text>
      <Text style={styles.subtitle}>Acceso privado</Text>

      <TextInput
        style={styles.input}
        placeholder="Pega tu token de acceso"
        placeholderTextColor="#999"
        value={tokenInput}
        onChangeText={setTokenInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={false} // token visible para verificar que es correcto
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSaveToken}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Entrar</Text>
        }
      </TouchableOpacity>

      <Text style={styles.hint}>
        {'Este token es privado.\nNunca lo compartas.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: '#fff',
  },
  title: { fontSize: 36, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, fontSize: 13, color: '#111', backgroundColor: '#fafafa',
    marginBottom: 16, minHeight: 80, textAlignVertical: 'top',
  },
  btn: {
    width: '100%', backgroundColor: '#111', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, color: '#bbb', textAlign: 'center', lineHeight: 18 },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
  StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('خطا', 'لطفاً نام کاربری و رمز را وارد کنید');
      return;
    }
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('خطای ورود', result.error || 'اطلاعات اشتباه است');
    }
  }

  return (
    <LinearGradient colors={['#1a1f3c', '#2d2b6b', '#4c3899']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#4338ca', '#7c3aed']} style={styles.logoBox}>
            <Text style={styles.logoIcon}>📶</Text>
          </LinearGradient>
          <Text style={styles.appName}>HotSpot Manager</Text>
          <Text style={styles.appSub}>مدیریت فروش اینترنت</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ورود به حساب</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام کاربری</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رمز عبور</Text>
            <View style={styles.passWrap}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>ورود</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>HotSpot Manager v1.0</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  logoIcon: { fontSize: 38 },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  appSub: { fontSize: 13, color: '#a5b4fc', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3, shadowRadius: 30, elevation: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 20, textAlign: 'right' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, textAlign: 'right' },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#1e293b',
    backgroundColor: '#f8fafc', textAlign: 'right',
  },
  passWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  eyeIcon: { fontSize: 18 },
  loginBtn: {
    backgroundColor: '#4f46e5', borderRadius: 12,
    padding: 15, alignItems: 'center', marginTop: 8,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 },
});

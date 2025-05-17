import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Text, Snackbar, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithPassword, signUp } = useAuth();

  // デバッグ用
  useEffect(() => {
    console.log('LoginScreen mounted');
    return () => {
      console.log('LoginScreen unmounted');
    };
  }, []);

  const handle = async () => {
    if (!email || !password) {
      setErr('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setLoading(true);
    setErr('');
    try {
      if (mode === 'login') {
        console.log('Attempting login with:', email);
        await signInWithPassword(email, password);
      } else {
        console.log('Attempting signup with:', email);
        await signUp(email, password);
        // 登録成功後、ログインモードに切り替えて入力をクリア
        setMode('login');
        setEmail('');
        setPassword('');
        setErr('登録が完了しました。メールアドレスの確認が必要な場合があります。ログインしてください。');
      }
    } catch (e: any) {
      console.error('Auth error:', e);
      if (e?.message?.includes('Invalid login credentials')) {
        setErr('メールアドレスまたはパスワードが正しくありません');
      } else if (e?.message?.includes('Email not confirmed')) {
        setErr('メールアドレスの確認が必要です。確認メールをご確認ください。');
      } else {
        setErr(e?.message ?? 'エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text variant="headlineMedium" style={styles.title}>
          {mode === 'login' ? 'ログイン' : '新規登録'}
        </Text>

        <TextInput
          label="メールアドレス"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="パスワード"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handle}
          loading={loading}
          disabled={loading}
          style={styles.btn}
          buttonColor={colors.primary}
        >
          {mode === 'login' ? 'ログイン' : '登録'}
        </Button>

        {loading && <ActivityIndicator animating style={styles.spinner} />}

        <Text
          style={styles.link}
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setEmail('');
            setPassword('');
            setErr('');
          }}
        >
          {mode === 'login'
            ? 'アカウントをお持ちでない方はこちら'
            : 'すでにアカウントをお持ちの方はこちら'}
        </Text>
      </View>

      <Snackbar visible={!!err} onDismiss={() => setErr('')} duration={5000}>
        {err}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '88%',
    padding: 28,
    borderRadius: 16,
    backgroundColor: '#FFF',
    elevation: 6,
  },
  title: { textAlign: 'center', marginBottom: 18 },
  input: { marginBottom: 12 },
  btn: { marginTop: 4, borderRadius: 24 },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#006400',
    textDecorationLine: 'underline',
  },
  spinner: { marginVertical: 8 },
});
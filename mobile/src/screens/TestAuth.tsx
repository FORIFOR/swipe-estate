import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testSignUp = async () => {
    if (!email || !password) {
      addResult('エラー: メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      addResult('テスト: サインアップ開始...');
      addResult(`メール: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: undefined,
        }
      });
      
      if (error) {
        addResult(`エラー: ${error.message}`);
        addResult(`エラーコード: ${error.code}`);
        addResult(`詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        addResult(`成功: ユーザー登録完了`);
        if (data.user) {
          addResult(`ユーザーID: ${data.user.id}`);
          addResult(`メール: ${data.user.email}`);
          addResult(`メール確認済み: ${data.user.email_confirmed_at || '未確認'}`);
        }
        if (data.session) {
          addResult('セッション: 自動ログイン成功');
        } else {
          addResult('セッション: なし（メール確認が必要な可能性があります）');
        }
      }
    } catch (error) {
      addResult(`予期せぬエラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    if (!email || !password) {
      addResult('エラー: メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      addResult('テスト: サインイン開始...');
      addResult(`メール: ${email}`);
      addResult(`パスワード長: ${password.length}文字`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),  // 小文字に変換
        password: password,
      });
      
      if (error) {
        addResult(`エラー: ${error.message}`);
        addResult(`エラーコード: ${error.code}`);
        addResult(`詳細: ${JSON.stringify(error, null, 2)}`);
        
        // さらなるデバッグ情報
        if (error.message === 'Invalid login credentials') {
          addResult('デバッグ: パスワードが間違っているか、メール確認が必要な可能性があります');
          addResult('デバッグ: Supabaseダッシュボードでメール確認の設定を確認してください');
        }
      } else {
        addResult(`成功: ログイン完了`);
        if (data.session) {
          addResult(`セッションタイプ: ${data.session.token_type}`);
          addResult(`ユーザーID: ${data.session.user.id}`);
          addResult(`メール: ${data.session.user.email}`);
          addResult(`メール確認済み: ${data.session.user.email_confirmed_at || '未確認'}`);
        }
      }
    } catch (error) {
      addResult(`予期せぬエラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    try {
      addResult('テスト: セッション確認...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addResult(`エラー: ${error.message}`);
      } else {
        addResult(`セッション: ${session ? 'アクティブ' : 'なし'}`);
        if (session) {
          addResult(`ユーザーメール: ${session.user.email}`);
        }
      }
    } catch (error) {
      addResult(`予期せぬエラー: ${error}`);
    }
  };

  const forceConfirmEmail = async () => {
    setIsLoading(true);
    try {
      addResult('テスト: メール確認を強制...');
      addResult('注意: この機能はSupabaseダッシュボードで実行する必要があります');
      addResult('手順:');
      addResult('1. Supabaseダッシュボード > Authentication > Users');
      addResult('2. 該当ユーザーの編集ボタンをクリック');
      addResult('3. "Confirm email"をオンに設定');
      addResult('4. 保存してから再度ログインを試してください');
    } catch (error) {
      addResult(`エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text>メールアドレス:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="your.email@gmail.com"
          autoCorrect={false}
        />
        <Text>パスワード (6文字以上):</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="パスワード"
        />
        <Text style={styles.note}>
          注: Supabaseの設定によっては特定のメールドメインのみ許可されている場合があります。
          実際のメールアドレスを使用してください。
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testSession}>
          <Text style={styles.buttonText}>Check Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={forceConfirmEmail}>
          <Text style={styles.buttonText}>メール確認の方法</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Results:</Text>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  infoButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

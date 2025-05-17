import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  const sendVerificationCode = async () => {
    // TODO: Supabaseの電話番号認証を実装
    setStep('verify');
  };

  const verifyCode = async () => {
    // TODO: 検証コードの確認を実装
  };

  return (
    <View style={styles.container}>
      {step === 'phone' ? (
        <>
          <TextInput
            label="電話番号"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="+81 90-1234-5678"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={sendVerificationCode}
            style={styles.button}
          >
            認証コードを送信
          </Button>
        </>
      ) : (
        <>
          <TextInput
            label="認証コード"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={verifyCode}
            style={styles.button}
          >
            確認
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});

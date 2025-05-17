// mobile/src/screens/Profile.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  return (
    <View style={styles.container}>
      {user ? (
        <Text style={styles.text}>ようこそ {user.email}</Text>
      ) : (
        <Button title="Googleでログイン" onPress={login} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16 },
});
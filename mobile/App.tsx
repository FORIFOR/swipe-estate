import React from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { FeedProvider } from './src/contexts/FeedContext';
import { RealEstateProvider } from './src/contexts/RealEstateContext';
import LoginScreen from './src/screens/LoginScreen';
import TestAuth from './src/screens/TestAuth';
import { Provider as PaperProvider } from 'react-native-paper';
import { JRTheme as theme } from './src/theme';
import RootNavigator from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';

function Root() {
  const { session, loading: authLoading } = useAuth();
  
  // 読み込み中は何も表示しない
  if (authLoading) return null;
  
  return session ? <RootNavigator /> : <LoginScreen />;
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <FeedProvider>
            <RealEstateProvider>
              <Root />
            </RealEstateProvider>
          </FeedProvider>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
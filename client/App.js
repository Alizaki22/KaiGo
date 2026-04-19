// App.js — Root of the React Native application
// Decides whether to show Auth or User/Driver tabs based on login state
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator   from './src/navigation/AuthNavigator';
import UserNavigator   from './src/navigation/UserNavigator';
import DriverNavigator from './src/navigation/DriverNavigator';
import colors from './src/constants/colors';

// Inner component has access to useAuth()
const RootNavigator = () => {
  const { isLoggedIn, isDriver, isLoading } = useAuth();

  // Show a loading spinner while checking stored tokens
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isLoggedIn) return <AuthNavigator />;
  if (isDriver)    return <DriverNavigator />;
  return <UserNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary:      colors.primary,
            background:   colors.bg,
            card:         colors.bgCard,
            text:         colors.textPrimary,
            border:       colors.border,
            notification: colors.primary,
          },
        }}
      >
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: colors.bg,
  },
});

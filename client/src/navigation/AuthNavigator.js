// src/navigation/AuthNavigator.js
// Stack navigator for Login / Register screens (unauthenticated users)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import colors from '../constants/colors';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle:        { backgroundColor: colors.bg },
      headerTintColor:    colors.textPrimary,
      headerTitleStyle:   { fontWeight: '700' },
      contentStyle:       { backgroundColor: colors.bg },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;

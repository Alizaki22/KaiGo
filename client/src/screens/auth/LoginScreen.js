// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input  from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required.';
    if (!form.password)        e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      // Navigation happens automatically via RootNavigator watching auth state
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Branding */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🚗</Text>
          <Text style={styles.appName}>KaiGo</Text>
          <Text style={styles.tagline}>Your ride, on demand.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Welcome Back</Text>

          <Input
            label="Email"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          <Button title="Log In" onPress={handleLogin} loading={loading} style={styles.btn} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Sign Up
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero:      { alignItems: 'center', marginBottom: 40 },
  logo:      { fontSize: 60, marginBottom: 8 },
  appName: {
    fontSize: 36, fontWeight: '800',
    color: colors.primary, letterSpacing: 1,
  },
  tagline:  { color: colors.textSecondary, fontSize: 15, marginTop: 4 },
  form:     { backgroundColor: colors.bgCard, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  heading:  { color: colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 20 },
  btn:      { marginTop: 8 },
  footer:   { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.textSecondary },
  link:       { color: colors.primary, fontWeight: '700' },
});

export default LoginScreen;

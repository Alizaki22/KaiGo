// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input  from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../constants/colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [role,    setRole]    = useState('user'); // 'user' or 'driver'
  const [form,    setForm]    = useState({
    name: '', email: '', phone: '', password: '',
    vehicleMake: '', vehicleModel: '', vehiclePlate: '', vehicleColor: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.email.trim())    e.email    = 'Email is required.';
    if (!form.phone.trim())    e.phone    = 'Phone is required.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (role === 'driver') {
      if (!form.vehicleMake.trim())  e.vehicleMake  = 'Vehicle make is required.';
      if (!form.vehicleModel.trim()) e.vehicleModel = 'Vehicle model is required.';
      if (!form.vehiclePlate.trim()) e.vehiclePlate = 'Plate number is required.';
      if (!form.vehicleColor.trim()) e.vehicleColor = 'Vehicle color is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase(), role });
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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
        <Text style={styles.heading}>Create Account</Text>

        {/* Role Selector */}
        <View style={styles.roleRow}>
          {['user', 'driver'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'user' ? '🧑 Rider' : '🚗 Driver'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Basic Info */}
        <Input label="Full Name"   value={form.name}  onChangeText={set('name')}  placeholder="Alex Rider"   error={errors.name} />
        <Input label="Email"       value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Phone"       value={form.phone} onChangeText={set('phone')} placeholder="+1-555-0100"   keyboardType="phone-pad" error={errors.phone} />
        <Input label="Password"    value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry error={errors.password} />

        {/* Driver-only vehicle fields */}
        {role === 'driver' && (
          <View style={styles.vehicleSection}>
            <Text style={styles.sectionLabel}>Vehicle Details</Text>
            <Input label="Make"   value={form.vehicleMake}  onChangeText={set('vehicleMake')}  placeholder="Toyota"    error={errors.vehicleMake} />
            <Input label="Model"  value={form.vehicleModel} onChangeText={set('vehicleModel')} placeholder="Camry"     error={errors.vehicleModel} />
            <Input label="Plate"  value={form.vehiclePlate} onChangeText={set('vehiclePlate')} placeholder="KAI-2024"  autoCapitalize="characters" error={errors.vehiclePlate} />
            <Input label="Color"  value={form.vehicleColor} onChangeText={set('vehicleColor')} placeholder="Silver"    error={errors.vehicleColor} />
          </View>
        )}

        <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Log In</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  scroll:       { flexGrow: 1, padding: 24, paddingTop: 60 },
  heading:      { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 24 },
  roleRow:      { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.bgCard,
  },
  roleBtnActive:     { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
  roleBtnText:       { color: colors.textSecondary, fontWeight: '600', fontSize: 15 },
  roleBtnTextActive: { color: colors.primary },
  vehicleSection:    { marginTop: 8 },
  sectionLabel:      { color: colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  btn:               { marginTop: 8 },
  footer:            { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText:        { color: colors.textSecondary },
  link:              { color: colors.primary, fontWeight: '700' },
});

export default RegisterScreen;

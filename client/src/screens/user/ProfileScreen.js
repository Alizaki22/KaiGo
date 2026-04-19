// src/screens/user/ProfileScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button  from '../../components/Button';
import Card    from '../../components/Card';
import colors  from '../../constants/colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role === 'driver' ? '🚗 Driver' : '🧑 Rider'}</Text>
        </View>

        {/* Profile details */}
        <Card title="Account Info" style={styles.card}>
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={user?.phone} />
          <Row label="Member Since" value={new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
        </Card>

        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name:       { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  role:       { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  card:       { marginBottom: 16 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label:      { color: colors.textSecondary, fontSize: 14 },
  value:      { color: colors.textPrimary,   fontSize: 14, fontWeight: '600' },
  logoutBtn:  { marginTop: 12 },
});

export default ProfileScreen;

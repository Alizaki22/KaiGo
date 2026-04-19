// src/screens/driver/DashboardScreen.js
// Driver's main hub: toggle availability, quick stats
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, Switch, Alert,
} from 'react-native';
import api    from '../../api/api';
import Card   from '../../components/Card';
import colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen = () => {
  const { user } = useAuth();
  const [isOnline,   setIsOnline]   = useState(false);
  const [stats,      setStats]      = useState({ totalRides: 0, rating: 5.00, earned: 0 });
  const [toggling,   setToggling]   = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.driverProfile) {
        setIsOnline(data.driverProfile.is_available);
        setStats({
          totalRides: data.driverProfile.total_rides || 0,
          rating:     data.driverProfile.rating       || 5.00,
          earned:     (data.driverProfile.total_rides || 0) * 14.5, // avg estimate
        });
      }
    } catch (err) {
      console.warn('Profile fetch error:', err.message);
    }
  };

  const toggleAvailability = async (val) => {
    setToggling(true);
    try {
      await api.patch('/driver/availability', { isAvailable: val });
      setIsOnline(val);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setToggling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Greeting */}
        <View style={styles.greet}>
          <Text style={styles.hello}>Hey, {user?.name?.split(' ')[0]} 🚗</Text>
          <Text style={styles.subtitle}>Driver Dashboard</Text>
        </View>

        {/* Online/Offline Toggle */}
        <View style={[styles.toggleCard, isOnline && styles.toggleCardOnline]}>
          <View>
            <Text style={styles.toggleTitle}>
              {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
            </Text>
            <Text style={styles.toggleSubtext}>
              {isOnline
                ? 'You can receive ride requests'
                : 'Go online to start accepting rides'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleAvailability}
            disabled={toggling}
            trackColor={{ false: colors.border, true: `${colors.success}80` }}
            thumbColor={isOnline ? colors.success : colors.textMuted}
            ios_backgroundColor={colors.border}
          />
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <StatCard emoji="🏁" label="Total Rides" value={stats.totalRides} />
          <StatCard emoji="⭐" label="Rating"       value={Number(stats.rating).toFixed(2)} />
          <StatCard emoji="💵" label="Est. Earned"  value={`$${stats.earned.toFixed(0)}`} />
        </View>

        {/* Tips */}
        <Card title="💡 Tips" style={styles.tips}>
          <Text style={styles.tip}>• Go online to see available ride requests</Text>
          <Text style={styles.tip}>• Accept a ride to start navigating</Text>
          <Text style={styles.tip}>• Complete rides to increase your earnings</Text>
          <Text style={styles.tip}>• Maintain a high rating for priority requests</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ emoji, label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 20 },
  greet:  { marginBottom: 20, marginTop: 12 },
  hello:  { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginTop: 4 },
  toggleCard: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: colors.bgCard,
    borderRadius:    16,
    padding:         20,
    marginBottom:    24,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  toggleCardOnline: { borderColor: colors.success },
  toggleTitle:   { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toggleSubtext: { color: colors.textSecondary, fontSize: 13, maxWidth: 200 },
  sectionTitle:  { color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius:    14,
    padding:         14,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
  tips:      { marginBottom: 20 },
  tip:       { color: colors.textSecondary, fontSize: 14, marginBottom: 6 },
});

export default DashboardScreen;

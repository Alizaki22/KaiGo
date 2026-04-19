// src/screens/driver/ActiveRideScreen.js
// Manage an in-progress ride: start it, then mark as complete
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import api         from '../../api/api';
import Button      from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import colors      from '../../constants/colors';

const ActiveRideScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const [ride,    setRide]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchRide = async () => {
    try {
      const data = await api.get(`/rides/${rideId}`);
      setRide(data.ride);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRide(); }, [rideId]);

  const updateStatus = async (status, extras = {}) => {
    setUpdating(true);
    try {
      await api.patch(`/driver/rides/${rideId}/status`, { status, ...extras });
      await fetchRide();

      if (status === 'completed') {
        Alert.alert('🏁 Ride Completed!', `Fare: $${ride?.fare || '—'}`, [
          { text: 'Back to Dashboard', onPress: () => navigation.navigate('Dashboard') },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No',  style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => updateStatus('cancelled', { reason: 'Cancelled by driver' }),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ride not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Active Ride</Text>

        <View style={styles.badgeRow}>
          <StatusBadge status={ride.status} />
        </View>

        {/* Route card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Route</Text>
          <Row label="📍 Pickup"  value={ride.pickup_address}  />
          <Row label="🏁 Dropoff" value={ride.dropoff_address} />
        </View>

        {/* Rider info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rider Info</Text>
          <Row label="Name"  value={ride.user_name} />
          <Row label="Phone" value={ride.user_phone} />
        </View>

        {/* Fare (after completion) */}
        {ride.fare && (
          <View style={styles.fareCard}>
            <Text style={styles.fareLabel}>Ride Earned</Text>
            <Text style={styles.fare}>${Number(ride.fare).toFixed(2)}</Text>
          </View>
        )}

        {/* Action buttons by status */}
        {ride.status === 'accepted' && (
          <View style={styles.actions}>
            <Button
              title="🚗 Start Ride (Picked Up Rider)"
              onPress={() => updateStatus('in_progress')}
              loading={updating}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              loading={updating}
              style={styles.secondaryBtn}
            />
          </View>
        )}

        {ride.status === 'in_progress' && (
          <View style={styles.actions}>
            <Button
              title="🏁 Complete Ride (Arrived at Destination)"
              onPress={() => updateStatus('completed', { durationMinutes: 20 })}
              loading={updating}
              style={styles.completeBtn}
            />
          </View>
        )}

        {['completed', 'cancelled'].includes(ride.status) && (
          <Button
            title="Back to Dashboard"
            onPress={() => navigation.navigate('Dashboard')}
            variant="secondary"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flexGrow: 1, padding: 20 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 16, marginTop: 12 },
  badgeRow: { marginBottom: 16 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    14,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  cardTitle:  { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel:   { color: colors.textSecondary, fontSize: 13 },
  rowValue:   { color: colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  fareCard: {
    backgroundColor: `${colors.success}15`,
    borderRadius:    14,
    padding:         20,
    alignItems:      'center',
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     `${colors.success}40`,
  },
  fareLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 4 },
  fare:      { color: colors.success, fontSize: 36, fontWeight: '800' },
  actions:      { gap: 10 },
  secondaryBtn: { marginTop: 0 },
  completeBtn:  { backgroundColor: colors.success },
  errorText:    { color: colors.danger, fontSize: 16 },
});

export default ActiveRideScreen;

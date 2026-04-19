// src/screens/user/RideStatusScreen.js
// Polls the API every 5 seconds to show live ride status
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import api          from '../../api/api';
import Button       from '../../components/Button';
import StatusBadge  from '../../components/StatusBadge';
import colors       from '../../constants/colors';

const STEPS = ['requested', 'accepted', 'in_progress', 'completed'];

const RideStatusScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const [ride,    setRide]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const intervalRef = useRef(null);

  const fetchRide = async () => {
    try {
      const data = await api.get(`/rides/${rideId}`);
      setRide(data.ride);
    } catch (err) {
      console.warn('Poll error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    // Poll every 5 seconds for status updates
    intervalRef.current = setInterval(fetchRide, 5000);
    return () => clearInterval(intervalRef.current);
  }, [rideId]);

  // Stop polling once ride is in a terminal state
  useEffect(() => {
    if (ride && ['completed', 'cancelled'].includes(ride.status)) {
      clearInterval(intervalRef.current);
    }
  }, [ride?.status]);

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No',  style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api.patch(`/rides/${rideId}/cancel`, { reason: 'User changed their mind' });
            fetchRide();
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setCancelling(false);
          }
        },
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

  const stepIndex = STEPS.indexOf(ride.status);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Ride Status</Text>

        {/* Status badge */}
        <View style={styles.badgeRow}>
          <StatusBadge status={ride.status} />
        </View>

        {/* Progress bar */}
        {ride.status !== 'cancelled' && (
          <View style={styles.progress}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={[styles.step, i <= stepIndex && styles.stepActive]} />
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Route details */}
        <View style={styles.card}>
          <Row label="📍 Pickup"  value={ride.pickup_address}  />
          <Row label="🏁 Dropoff" value={ride.dropoff_address} />
        </View>

        {/* Driver details (once accepted) */}
        {ride.driver_name && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Driver</Text>
            <Row label="Name"    value={ride.driver_name} />
            <Row label="Phone"   value={ride.driver_phone} />
            <Row label="Vehicle" value={`${ride.vehicle_color} ${ride.vehicle_make} ${ride.vehicle_model}`} />
            <Row label="Plate"   value={ride.vehicle_plate} />
          </View>
        )}

        {/* Fare (once completed) */}
        {ride.fare && (
          <View style={styles.fareCard}>
            <Text style={styles.fareLabel}>Total Fare</Text>
            <Text style={styles.fare}>${Number(ride.fare).toFixed(2)}</Text>
            {ride.duration_minutes && (
              <Text style={styles.fareTime}>{ride.duration_minutes} min ride</Text>
            )}
          </View>
        )}

        {/* Cancel button (only when cancellable) */}
        {['requested', 'accepted'].includes(ride.status) && (
          <Button
            title="Cancel Ride"
            onPress={handleCancel}
            variant="danger"
            loading={cancelling}
            style={styles.cancelBtn}
          />
        )}

        {/* Done button after completion */}
        {['completed', 'cancelled'].includes(ride.status) && (
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Home')}
            style={styles.doneBtn}
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
  badgeRow: { marginBottom: 20 },
  progress: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  24,
  },
  step: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.border,
  },
  stepActive: { backgroundColor: colors.primary },
  stepLine:   { flex: 1, height: 3, backgroundColor: colors.border },
  stepLineActive: { backgroundColor: colors.primary },
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
  fareTime:  { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  cancelBtn: { marginTop: 8 },
  doneBtn:   { marginTop: 8 },
  errorText: { color: colors.danger, fontSize: 16 },
});

export default RideStatusScreen;

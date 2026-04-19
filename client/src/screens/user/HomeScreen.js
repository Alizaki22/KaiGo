// src/screens/user/HomeScreen.js
// Main screen for riders: enter pickup/dropoff and request a ride
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, SafeAreaView,
} from 'react-native';
import api    from '../../api/api';
import Input  from '../../components/Input';
import Button from '../../components/Button';
import Card   from '../../components/Card';
import colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pickup,  setPickup]  = useState('');
  const [dropoff, setDropoff] = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Estimated fare preview (mirrors backend formula)
  const estimatedFare = (pickup && dropoff)
    ? '$' + (3.00 + 1.50 * 15).toFixed(2) + ' – $' + (3.00 + 1.50 * 30).toFixed(2)
    : null;

  const validate = () => {
    const e = {};
    if (!pickup.trim())  e.pickup  = 'Please enter a pickup location.';
    if (!dropoff.trim()) e.dropoff = 'Please enter a dropoff location.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequest = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post('/rides', {
        pickupAddress:  pickup.trim(),
        dropoffAddress: dropoff.trim(),
      });
      // Navigate to the ride status screen
      navigation.navigate('RideStatus', { rideId: data.ride.id });
    } catch (err) {
      Alert.alert('Could Not Request Ride', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Greeting */}
        <View style={styles.greet}>
          <Text style={styles.hello}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Where are you going?</Text>
        </View>

        {/* Ride Request Card */}
        <Card style={styles.card}>
          <Input
            label="📍 Pickup Location"
            value={pickup}
            onChangeText={setPickup}
            placeholder="e.g. 123 Main St, Downtown"
            error={errors.pickup}
          />
          <Input
            label="🏁 Dropoff Location"
            value={dropoff}
            onChangeText={setDropoff}
            placeholder="e.g. 456 Oak Ave, Uptown"
            error={errors.dropoff}
          />

          {estimatedFare && (
            <View style={styles.farePreview}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>{estimatedFare}</Text>
            </View>
          )}

          <Button
            title="🚗  Request a Ride"
            onPress={handleRequest}
            loading={loading}
            style={styles.btn}
          />
        </Card>

        {/* Info blurb */}
        <View style={styles.tips}>
          <Text style={styles.tipTitle}>How it works</Text>
          <Text style={styles.tipItem}>1. Enter your pickup & dropoff</Text>
          <Text style={styles.tipItem}>2. We match you with a nearby driver</Text>
          <Text style={styles.tipItem}>3. Track your ride in real time</Text>
          <Text style={styles.tipItem}>4. Pay when you arrive</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 20 },
  greet:  { marginBottom: 24, marginTop: 12 },
  hello: {
    color: colors.textPrimary, fontSize: 26, fontWeight: '800',
  },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginTop: 4 },
  card:     { marginBottom: 20 },
  farePreview: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    backgroundColor:  `${colors.success}15`,
    padding:          12,
    borderRadius:     10,
    marginBottom:     12,
    borderWidth:      1,
    borderColor:      `${colors.success}40`,
  },
  fareLabel:  { color: colors.textSecondary, fontSize: 13 },
  fareAmount: { color: colors.success, fontSize: 16, fontWeight: '700' },
  btn:        { marginTop: 4 },
  tips: {
    backgroundColor: colors.bgCard,
    borderRadius:    14,
    padding:         16,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  tipTitle: { color: colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  tipItem:  { color: colors.textSecondary, fontSize: 14, marginBottom: 6 },
});

export default HomeScreen;

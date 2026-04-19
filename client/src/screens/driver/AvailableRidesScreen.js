// src/screens/driver/AvailableRidesScreen.js
// Shows all pending ride requests the driver can accept
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator, Alert,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api    from '../../api/api';
import colors from '../../constants/colors';

const AvailableRidesScreen = ({ navigation }) => {
  const [rides,      setRides]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting,  setAccepting]  = useState(null); // rideId being accepted

  const fetchRides = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.get('/driver/rides/available');
      setRides(data.rides);
    } catch (err) {
      console.warn(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchRides();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchRides, 10000);
    return () => clearInterval(interval);
  }, []));

  const handleAccept = async (rideId) => {
    setAccepting(rideId);
    try {
      await api.patch(`/driver/rides/${rideId}/accept`);
      Alert.alert('✅ Ride Accepted!', 'Head to the pickup location now.', [
        {
          text: 'View Ride',
          onPress: () => navigation.navigate('ActiveRide', { rideId }),
        },
      ]);
      fetchRides();
    } catch (err) {
      Alert.alert('Could Not Accept', err.message);
    } finally {
      setAccepting(null);
    }
  };

  const RideRequestCard = ({ item }) => {
    const isAccepting = accepting === item.id;
    return (
      <View style={styles.card}>
        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotPickup]} />
            <View style={styles.dotLine} />
            <View style={[styles.dot, styles.dotDropoff]} />
          </View>
          <View style={styles.addresses}>
            <Text style={styles.address} numberOfLines={1}>{item.pickup_address}</Text>
            <Text style={styles.addressDivider}>to</Text>
            <Text style={styles.address} numberOfLines={1}>{item.dropoff_address}</Text>
          </View>
        </View>

        {/* Rider info + fare estimate */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>Rider: {item.user_name}</Text>
          <Text style={styles.estFare}>~$25</Text>
        </View>

        {/* Accept button */}
        <TouchableOpacity
          style={[styles.acceptBtn, isAccepting && styles.acceptBtnLoading]}
          onPress={() => handleAccept(item.id)}
          disabled={!!accepting}
        >
          <Text style={styles.acceptBtnText}>
            {isAccepting ? 'Accepting...' : 'Accept Ride →'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideRequestCard item={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Available Rides</Text>
            <Text style={styles.count}>{rides.length} request{rides.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No rides available</Text>
            <Text style={styles.emptySubtext}>Check back in a moment — new requests refresh automatically.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRides(true)}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list:   { padding: 20, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 12 },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  count:   { color: colors.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    16,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  routeRow:    { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dots:        { alignItems: 'center', paddingTop: 2 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  dotPickup:   { backgroundColor: colors.primary },
  dotDropoff:  { backgroundColor: colors.success },
  dotLine:     { width: 1.5, flex: 1, backgroundColor: colors.border, marginVertical: 3 },
  addresses:   { flex: 1, justifyContent: 'space-between' },
  address:     { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  addressDivider: { color: colors.textMuted, fontSize: 12, marginVertical: 4 },
  meta:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metaText:     { color: colors.textSecondary, fontSize: 13 },
  estFare:      { color: colors.success, fontSize: 15, fontWeight: '700' },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius:    10,
    paddingVertical: 12,
    alignItems:      'center',
  },
  acceptBtnLoading: { opacity: 0.6 },
  acceptBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty:      { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyIcon:  { fontSize: 56, marginBottom: 12 },
  emptyText:  { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtext: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});

export default AvailableRidesScreen;

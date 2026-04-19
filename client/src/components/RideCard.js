// src/components/RideCard.js
// Compact ride summary card used in history lists
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import StatusBadge from './StatusBadge';

const RideCard = ({ ride, showDriver = false, showUser = false }) => {
  const date = new Date(ride.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <StatusBadge status={ride.status} />
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.dotPickup]} />
          <Text style={styles.address} numberOfLines={1}>{ride.pickup_address}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.dotDropoff]} />
          <Text style={styles.address} numberOfLines={1}>{ride.dropoff_address}</Text>
        </View>
      </View>

      {/* Footer row — fare + driver/user info */}
      <View style={styles.footer}>
        {ride.fare && (
          <Text style={styles.fare}>${Number(ride.fare).toFixed(2)}</Text>
        )}
        {showDriver && ride.driver_name && (
          <Text style={styles.meta}>Driver: {ride.driver_name}</Text>
        )}
        {showUser && ride.user_name && (
          <Text style={styles.meta}>Rider: {ride.user_name}</Text>
        )}
        {ride.duration_minutes && (
          <Text style={styles.meta}>{ride.duration_minutes} min</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    14,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  date:    { color: colors.textMuted, fontSize: 12 },
  route:   { marginBottom: 12 },
  routeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            8,
  },
  routeLine: {
    width:           1,
    height:          12,
    backgroundColor: colors.border,
    marginLeft:      6,
    marginVertical:  2,
  },
  dot: {
    width:        12,
    height:       12,
    borderRadius: 6,
  },
  dotPickup:  { backgroundColor: colors.primary },
  dotDropoff: { backgroundColor: colors.success },
  address:    { flex: 1, color: colors.textPrimary, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:    'center',
    flexWrap:      'wrap',
    gap:            4,
  },
  fare: { color: colors.success, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 12 },
});

export default RideCard;

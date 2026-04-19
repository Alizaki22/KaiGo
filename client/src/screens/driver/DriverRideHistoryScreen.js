// src/screens/driver/DriverRideHistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api      from '../../api/api';
import RideCard from '../../components/RideCard';
import colors   from '../../constants/colors';

const DriverRideHistoryScreen = () => {
  const [rides,      setRides]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.get('/driver/rides/history');
      setRides(data.rides);
    } catch (err) {
      console.warn(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  // Calculate totals
  const totalEarned = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + parseFloat(r.fare || 0), 0);

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
        renderItem={({ item }) => <RideCard ride={item} showUser />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Trip History</Text>
            {rides.length > 0 && (
              <View style={styles.earningsBanner}>
                <Text style={styles.earningsLabel}>Total Earned</Text>
                <Text style={styles.earningsAmount}>${totalEarned.toFixed(2)}</Text>
                <Text style={styles.earningsCount}>{rides.filter(r => r.status === 'completed').length} trips</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏁</Text>
            <Text style={styles.emptyText}>No trips yet.</Text>
            <Text style={styles.emptySubtext}>Accepted rides will appear here after completion.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(true)}
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
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 16, marginTop: 12 },
  earningsBanner: {
    backgroundColor: `${colors.success}15`,
    borderRadius:    14,
    padding:         16,
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     `${colors.success}40`,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
  },
  earningsLabel:  { color: colors.textSecondary, fontSize: 13 },
  earningsAmount: { color: colors.success, fontSize: 24, fontWeight: '800' },
  earningsCount:  { color: colors.textSecondary, fontSize: 13 },
  empty:          { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyIcon:      { fontSize: 56, marginBottom: 12 },
  emptyText:      { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtext:   { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});

export default DriverRideHistoryScreen;

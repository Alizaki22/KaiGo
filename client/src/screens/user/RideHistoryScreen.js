// src/screens/user/RideHistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api      from '../../api/api';
import RideCard from '../../components/RideCard';
import colors   from '../../constants/colors';

const RideHistoryScreen = ({ navigation }) => {
  const [rides,      setRides]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.get('/rides/user/history');
      setRides(data.rides);
    } catch (err) {
      console.warn(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

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
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            showDriver
            onPress={() => navigation.navigate('RideStatus', { rideId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.heading}>Ride History</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No rides yet.</Text>
            <Text style={styles.emptySubtext}>Your past rides will appear here.</Text>
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
  safe:        { flex: 1, backgroundColor: colors.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list:        { padding: 20, paddingTop: 12 },
  heading:     { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 16, marginTop: 12 },
  empty:       { alignItems: 'center', marginTop: 60 },
  emptyIcon:   { fontSize: 56, marginBottom: 12 },
  emptyText:   { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
});

export default RideHistoryScreen;

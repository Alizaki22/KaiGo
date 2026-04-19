// src/components/StatusBadge.js
// Pill badge that displays the ride status with color coding
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const LABELS = {
  requested:   '🔍 Looking for Driver',
  accepted:    '✅ Driver Accepted',
  in_progress: '🚗 In Progress',
  completed:   '🏁 Completed',
  cancelled:   '❌ Cancelled',
};

const StatusBadge = ({ status, style }) => {
  const theme = colors.statusColors[status] || { bg: colors.bgCard, text: colors.textSecondary };

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }, style]}>
      <Text style={[styles.text, { color: theme.text }]}>
        {LABELS[status] || status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical:    5,
    borderRadius:      20,
    alignSelf:         'flex-start',
  },
  text: {
    fontSize:   12,
    fontWeight: '700',
  },
});

export default StatusBadge;

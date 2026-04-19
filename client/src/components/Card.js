// src/components/Card.js
// Generic surface card with optional title and subtle shadow
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const Card = ({ title, children, style, titleStyle }) => (
  <View style={[styles.card, style]}>
    {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     colors.border,
    marginBottom:    12,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       4,
  },
  title: {
    color:        colors.textPrimary,
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 12,
  },
});

export default Card;

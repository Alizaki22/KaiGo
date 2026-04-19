// src/navigation/UserNavigator.js
// Bottom tab + stack navigator for the Rider app experience
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen        from '../screens/user/HomeScreen';
import RideStatusScreen  from '../screens/user/RideStatusScreen';
import RideHistoryScreen from '../screens/user/RideHistoryScreen';
import ProfileScreen     from '../screens/user/ProfileScreen';
import colors from '../constants/colors';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack wrapping Home so we can push RideStatus on top
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle:        { backgroundColor: colors.bg },
      headerTintColor:    colors.textPrimary,
      headerTitleStyle:   { fontWeight: '700' },
      contentStyle:       { backgroundColor: colors.bg },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="Home"       component={HomeScreen}       options={{ title: '🚗 KaiGo' }} />
    <Stack.Screen name="RideStatus" component={RideStatusScreen} options={{ title: 'Ride Status' }} />
  </Stack.Navigator>
);

const tabIcon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

const UserNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor:  colors.bgCard,
        borderTopColor:   colors.border,
        borderTopWidth:   1,
        paddingBottom:    8,
        paddingTop:       6,
        height:           62,
      },
      tabBarActiveTintColor:   colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle:        { fontSize: 11, fontWeight: '600', marginTop: 2 },
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStack}
      options={{ title: 'Ride', tabBarIcon: tabIcon('🚗') }}
    />
    <Tab.Screen
      name="History"
      component={RideHistoryScreen}
      options={{ title: 'History', tabBarIcon: tabIcon('🕐') }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile', tabBarIcon: tabIcon('👤') }}
    />
  </Tab.Navigator>
);

export default UserNavigator;

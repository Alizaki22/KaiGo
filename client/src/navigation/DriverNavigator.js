// src/navigation/DriverNavigator.js
// Bottom tab + stack navigator for the Driver app experience
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import DashboardScreen         from '../screens/driver/DashboardScreen';
import AvailableRidesScreen    from '../screens/driver/AvailableRidesScreen';
import ActiveRideScreen        from '../screens/driver/ActiveRideScreen';
import DriverRideHistoryScreen from '../screens/driver/DriverRideHistoryScreen';
import ProfileScreen           from '../screens/user/ProfileScreen'; // reused
import colors from '../constants/colors';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const sharedHeaderOptions = {
  headerStyle:        { backgroundColor: colors.bg },
  headerTintColor:    colors.textPrimary,
  headerTitleStyle:   { fontWeight: '700' },
  contentStyle:       { backgroundColor: colors.bg },
  headerShadowVisible: false,
};

// Stack so we can navigate from AvailableRides → ActiveRide
const RidesStack = () => (
  <Stack.Navigator screenOptions={sharedHeaderOptions}>
    <Stack.Screen name="AvailableRides" component={AvailableRidesScreen} options={{ title: 'Available Rides' }} />
    <Stack.Screen name="ActiveRide"     component={ActiveRideScreen}     options={{ title: 'Active Ride' }} />
  </Stack.Navigator>
);

const tabIcon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

const DriverNavigator = () => (
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
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Dashboard', tabBarIcon: tabIcon('📊') }}
    />
    <Tab.Screen
      name="RidesTab"
      component={RidesStack}
      options={{ title: 'Rides', tabBarIcon: tabIcon('🗺️') }}
    />
    <Tab.Screen
      name="TripHistory"
      component={DriverRideHistoryScreen}
      options={{ title: 'Earnings', tabBarIcon: tabIcon('💵') }}
    />
    <Tab.Screen
      name="DriverProfile"
      component={ProfileScreen}
      options={{ title: 'Profile', tabBarIcon: tabIcon('👤') }}
    />
  </Tab.Navigator>
);

export default DriverNavigator;

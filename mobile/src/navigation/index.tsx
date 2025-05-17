// mobile/src/navigation/index.tsx
import React from 'react';
// New screens for additional tabs
import InsightsScreen from '../screens/InsightsScreen';
import MapScreen from '../screens/MapScreen';
import AlertsScreen from '../screens/AlertsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { JRTheme as theme } from '../theme';
import Home from '../screens/Home';
import Saved from '../screens/Saved';
import Profile from '../screens/Profile';
import PropertySearchScreen from '../screens/PropertySearchScreen';
import PropertySwipeScreen from '../screens/PropertySwipeScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';

// Stack Navigator for the Home flow (検索 → スワイプ)
const HomeStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={Home} />
      <HomeStack.Screen name="PropertySwipe" component={PropertySwipeScreen} />
      <HomeStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </HomeStack.Navigator>
  );
}

// Stack Navigator for the Discover flow (物件発見)
const DiscoverStack = createStackNavigator();

function DiscoverStackNavigator() {
  return (
    <DiscoverStack.Navigator
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <DiscoverStack.Screen name="PropertySearchForm" component={PropertySearchScreen} />
      <DiscoverStack.Screen name="PropertySwipe" component={PropertySwipeScreen} />
      <DiscoverStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </DiscoverStack.Navigator>
  );
}

// Stack Navigator for the Saved flow (お気に入り)
const SavedStack = createStackNavigator();

function SavedStackNavigator() {
  return (
    <SavedStack.Navigator
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <SavedStack.Screen name="SavedScreen" component={Saved} />
      <SavedStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </SavedStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const icon = { 
  Home: 'home', 
  Saved: 'favorite',
  Insights: 'bar-chart',
  Map: 'map',
  Alerts: 'notifications',
  Profile: 'person'
} as const;

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { height: 64, borderTopWidth: 0.5, borderTopColor: theme.colors.outline },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={icon[route.name as keyof typeof icon]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator} 
        options={{ title: 'ホーム' }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedStackNavigator} 
        options={{ title: 'お気に入り' }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ title: 'インサイト' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: '地図' }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{ title: '通知' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{ title: '設定' }}
      />
    </Tab.Navigator>
  );
}
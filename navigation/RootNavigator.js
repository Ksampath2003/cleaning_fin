// Root navigator: a bottom tab bar with a native stack inside each tab.
// Modal forms (job, payment, client) are pushed onto each stack.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import JobFormScreen from '../screens/JobFormScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PaymentFormScreen from '../screens/PaymentFormScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import ClientFormScreen from '../screens/ClientFormScreen';
import EmployeesScreen from '../screens/EmployeesScreen';

const Tab = createBottomTabNavigator();
const DashboardStackNav = createNativeStackNavigator();
const ScheduleStackNav = createNativeStackNavigator();
const PaymentsStackNav = createNativeStackNavigator();
const ClientsStackNav = createNativeStackNavigator();

const commonScreenOptions = {
  headerStyle: { backgroundColor: theme.bg },
  headerTintColor: theme.text,
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: theme.bg },
};

function DashboardStack() {
  return (
    <DashboardStackNav.Navigator screenOptions={commonScreenOptions}>
      <DashboardStackNav.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashboardStackNav.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job' }}
      />
    </DashboardStackNav.Navigator>
  );
}

function ScheduleStack() {
  return (
    <ScheduleStackNav.Navigator screenOptions={commonScreenOptions}>
      <ScheduleStackNav.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <ScheduleStackNav.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job' }}
      />
      <ScheduleStackNav.Screen
        name="JobForm"
        component={JobFormScreen}
        options={{ presentation: 'modal', title: 'New Job' }}
      />
    </ScheduleStackNav.Navigator>
  );
}

function PaymentsStack() {
  return (
    <PaymentsStackNav.Navigator screenOptions={commonScreenOptions}>
      <PaymentsStackNav.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <PaymentsStackNav.Screen
        name="PaymentForm"
        component={PaymentFormScreen}
        options={{ presentation: 'modal', title: 'New Payment' }}
      />
    </PaymentsStackNav.Navigator>
  );
}

function ClientsStack() {
  return (
    <ClientsStackNav.Navigator screenOptions={commonScreenOptions}>
      <ClientsStackNav.Screen
        name="Clients"
        component={ClientsScreen}
        options={{ title: 'Clients' }}
      />
      <ClientsStackNav.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Client' }}
      />
      <ClientsStackNav.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={{ presentation: 'modal', title: 'Client' }}
      />
      <ClientsStackNav.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{ title: 'Manage Employees' }}
      />
    </ClientsStackNav.Navigator>
  );
}

const iconFor = (routeName, focused) => {
  const map = {
    DashboardTab: focused ? 'home' : 'home-outline',
    ScheduleTab: focused ? 'calendar' : 'calendar-outline',
    PaymentsTab: focused ? 'card' : 'card-outline',
    ClientsTab: focused ? 'people' : 'people-outline',
  };
  return map[routeName] || 'ellipse-outline';
};

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={iconFor(route.name, focused)} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStack}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen
          name="ScheduleTab"
          component={ScheduleStack}
          options={{ title: 'Schedule' }}
        />
        <Tab.Screen
          name="PaymentsTab"
          component={PaymentsStack}
          options={{ title: 'Payments' }}
        />
        <Tab.Screen
          name="ClientsTab"
          component={ClientsStack}
          options={{ title: 'Clients' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

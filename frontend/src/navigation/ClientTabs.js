import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ProfileScreen from '../screens/client/ProfileScreen';
import AppointmentsScreen from '../screens/client/AppointmentsScreen';
import NewAppointmentScreen from '../screens/client/NewAppointmentScreen';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();

function LogoutButton() {
  const { logout } = useApp();
  return (
    <Pressable onPress={logout} style={styles.logout}>
      <Text style={styles.logoutText}>Выйти</Text>
    </Pressable>
  );
}

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Profile: 'person-outline',
            Appointments: 'list-outline',
            NewAppointment: 'add-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Личный кабинет', tabBarLabel: 'Кабинет' }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Мои заявки', tabBarLabel: 'Заявки' }}
      />
      <Tab.Screen
        name="NewAppointment"
        component={NewAppointmentScreen}
        options={{ title: 'Новая заявка', tabBarLabel: 'Запись' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logout: { marginRight: 16 },
  logoutText: { color: colors.primary, fontWeight: '600' },
});

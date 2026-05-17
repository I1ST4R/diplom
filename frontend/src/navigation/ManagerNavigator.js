import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import ManagerAppointmentsScreen from '../screens/manager/ManagerAppointmentsScreen';
import ProcessAppointmentScreen from '../screens/manager/ProcessAppointmentScreen';

const Stack = createNativeStackNavigator();

function LogoutButton() {
  const { logout } = useApp();
  return (
    <Pressable onPress={logout} style={styles.logout}>
      <Text style={styles.logoutText}>Выйти</Text>
    </Pressable>
  );
}

export default function ManagerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => <LogoutButton />,
      }}
    >
      <Stack.Screen
        name="ManagerAppointments"
        component={ManagerAppointmentsScreen}
        options={{ title: 'Рабочее место менеджера' }}
      />
      <Stack.Screen
        name="ProcessAppointment"
        component={ProcessAppointmentScreen}
        options={{ title: 'Обработка заявки' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  logout: { marginRight: 16 },
  logoutText: { color: colors.primary, fontWeight: '600' },
});

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import AuthScreen from '../screens/auth/AuthScreen';
import ClientTabs from './ClientTabs';
import ManagerNavigator from './ManagerNavigator';
import RoleHomeScreen from '../screens/roles/RoleHomeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (currentUser.role === 'client') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClientMain" component={ClientTabs} />
      </Stack.Navigator>
    );
  }

  if (currentUser.role === 'manager') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ManagerMain" component={ManagerNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoleHome"
        options={{ title: currentUser.role }}
      >
        {() => <RoleHomeScreen role={currentUser.role} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

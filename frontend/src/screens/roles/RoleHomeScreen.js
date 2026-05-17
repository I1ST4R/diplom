import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

const TITLES = {
  manager: 'Интерфейс менеджера',
  doctor: 'Интерфейс врача',
  admin: 'Интерфейс главврача',
};

/** Заглушка для ролей, кроме клиента (диплом — фокус на клиенте) */
export default function RoleHomeScreen({ role }) {
  const { logout, currentUser } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{TITLES[role] || 'Кабинет'}</Text>
      <Text style={styles.sub}>Пользователь: {currentUser?.login}</Text>
      <Text style={styles.info}>
        Экран-заглушка. Полный функционал реализован для роли «Клиент» (логин client).
      </Text>
      <Pressable style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Выйти</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary },
  sub: { fontSize: 16, color: colors.text, marginTop: 8 },
  info: { fontSize: 14, color: colors.textMuted, marginTop: 16, lineHeight: 22 },
  btn: {
    marginTop: 32,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

export default function AuthScreen() {
  const { login } = useApp();
  const [tab, setTab] = useState('login');
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [password2, setPassword2] = useState('');

  const onLogin = () => {
    const ok = login(loginVal.trim(), password);
    if (!ok) Alert.alert('Ошибка', 'Неверный логин или пароль');
  };

  const onRegister = () => {
    if (password !== password2) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    Alert.alert('Успех', 'Регистрация прошла успешно');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>МедРасписание</Text>
        <Text style={styles.sub}>Управление расписанием медперсонала</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'login' && styles.tabActive]}
            onPress={() => setTab('login')}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Вход</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'register' && styles.tabActive]}
            onPress={() => setTab('register')}
          >
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
              Регистрация
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {tab === 'login' ? (
            <>
              <Text style={styles.label}>Логин</Text>
              <TextInput
                style={styles.input}
                value={loginVal}
                onChangeText={setLoginVal}
                autoCapitalize="none"
                placeholder="client / manager / doctor / admin"
              />
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="123"
              />
              <Pressable style={styles.btn} onPress={onLogin}>
                <Text style={styles.btnText}>Войти</Text>
              </Pressable>
              <Text style={styles.hint}>Тест: client/manager/doctor/admin, пароль 123</Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>Телефон</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Text style={styles.label}>Логин</Text>
              <TextInput style={styles.input} value={loginVal} onChangeText={setLoginVal} autoCapitalize="none" />
              <Text style={styles.label}>Пароль</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
              <Text style={styles.label}>Подтверждение пароля</Text>
              <TextInput style={styles.input} value={password2} onChangeText={setPassword2} secureTextEntry />
              <Pressable style={styles.btn} onPress={onRegister}>
                <Text style={styles.btnText}>Зарегистрироваться</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingTop: 56 },
  header: { fontSize: 26, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 12, textAlign: 'center' },
});

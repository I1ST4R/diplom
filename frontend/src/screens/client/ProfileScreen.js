import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { formatClientName } from '../../utils/time';

const FIELDS = [
  { key: 'lastName', label: 'Фамилия' },
  { key: 'firstName', label: 'Имя' },
  { key: 'middleName', label: 'Отчество' },
  { key: 'phone', label: 'Телефон' },
  { key: 'birthDate', label: 'Дата рождения' },
  { key: 'address', label: 'Адрес' },
  { key: 'email', label: 'Email' },
  { key: 'snils', label: 'СНИЛС' },
  { key: 'policyNumber', label: 'Полис ОМС' },
];

export default function ProfileScreen() {
  const { currentUser, clients, updateClient } = useApp();
  const client = clients.find((c) => c.id === currentUser?.clientId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(client || {});

  useEffect(() => {
    if (client) setForm({ ...client });
  }, [client]);

  if (!client) {
    return (
      <View style={styles.center}>
        <Text>Клиент не найден</Text>
      </View>
    );
  }

  const onSave = () => {
    const { id, login, password, ...data } = form;
    updateClient(client.id, data);
    setEditing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      <Text style={styles.title}>{formatClientName(client)}</Text>
      <Text style={styles.sub}>Личный кабинет</Text>

      {FIELDS.map(({ key, label }) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={String(form[key] ?? '')}
              onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
            />
          ) : (
            <Text style={styles.value}>{form[key] || '—'}</Text>
          )}
        </View>
      ))}

      {editing ? (
        <View style={styles.rowBtns}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => { setForm({ ...client }); setEditing(false); }}>
            <Text style={styles.btnTextSecondary}>Отмена</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={onSave}>
            <Text style={styles.btnText}>Сохранить</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.btn} onPress={() => setEditing(true)}>
          <Text style={styles.btnText}>Редактировать</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  row: { marginBottom: 14 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  value: { fontSize: 16, color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnText: { color: '#fff', fontWeight: '600' },
  btnTextSecondary: { color: colors.text, fontWeight: '600' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
});

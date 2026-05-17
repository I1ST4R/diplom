import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';

export default function ManagerAppointmentCard({
  clientName,
  doctorName,
  department,
  date,
  timeLabel,
  complaint,
  extraLines,
  critical,
  transferBadge,
  onPress,
}) {
  const bg = critical ? colors.dangerBg : transferBadge ? colors.warningBg : colors.surface;

  return (
    <Pressable style={[styles.card, { backgroundColor: bg }]} onPress={onPress}>
      {critical && <Text style={styles.criticalBadge}>Критичный перенос</Text>}
      {transferBadge && !critical && <Text style={styles.transferBadge}>К переносу</Text>}
      <Text style={styles.client}>{clientName}</Text>
      <Text style={styles.meta}>Врач: {doctorName}</Text>
      <Text style={styles.meta}>{department}</Text>
      <Text style={styles.meta}>Дата: {date}</Text>
      <Text style={styles.time}>{timeLabel}</Text>
      <Text style={styles.complaint}>{complaint}</Text>
      {extraLines?.map((line, i) => (
        <Text key={i} style={styles.extra}>
          {line}
        </Text>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  criticalBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 6,
  },
  transferBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 6,
  },
  client: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  time: { fontSize: 14, color: colors.primary, marginTop: 6, fontWeight: '600' },
  complaint: { fontSize: 14, color: colors.text, marginTop: 6 },
  extra: { fontSize: 13, color: colors.text, marginTop: 4, fontWeight: '500' },
});

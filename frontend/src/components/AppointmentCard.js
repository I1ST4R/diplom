import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { formatTimeRange } from '../utils/time';

export default function AppointmentCard({
  title,
  department,
  complaint,
  timeLabel,
  highlight,
  critical,
  onPress,
  onCancel,
  showCancel,
}) {
  const bg =
    critical ? colors.dangerBg : highlight === 'transfer' ? colors.warningBg : colors.surface;

  return (
    <Pressable style={[styles.card, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{department}</Text>
      <Text style={styles.complaint}>{complaint}</Text>
      <Text style={styles.time}>{timeLabel}</Text>
      {critical && (
        <Text style={styles.critical}>
          Приём сегодня невозможен, менеджер свяжется с вами
        </Text>
      )}
      {highlight === 'transfer' && !critical && (
        <Text style={styles.transfer}>К переносу</Text>
      )}
      {showCancel && onCancel && (
        <Pressable style={styles.cancelBtn} onPress={(e) => { e?.stopPropagation?.(); onCancel(); }}>
          <Text style={styles.cancelText}>Отменить заявку</Text>
        </Pressable>
      )}
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
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  complaint: { fontSize: 14, color: colors.text, marginTop: 6 },
  time: { fontSize: 13, color: colors.primary, marginTop: 6, fontWeight: '500' },
  transfer: { fontSize: 12, color: colors.warning, marginTop: 4, fontWeight: '600' },
  critical: { fontSize: 12, color: colors.danger, marginTop: 6, fontWeight: '600' },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  cancelText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});

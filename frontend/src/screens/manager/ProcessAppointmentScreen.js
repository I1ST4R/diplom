import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import DoctorDaySchedule from '../../components/DoctorDaySchedule';
import { formatClientName, formatDoctorName, formatTimeRange } from '../../utils/time';

export default function ProcessAppointmentScreen({ route, navigation }) {
  const { appointmentId, fromTransfer } = route.params || {};
  const { appointments, clients, doctors, breaks, updateAppointment } = useApp();
  const [confirmSlot, setConfirmSlot] = useState(null);

  const appointment = appointments.find((a) => a.id === appointmentId);
  const client = clients.find((c) => c.id === appointment?.clientId);
  const doctor = doctors.find((d) => d.id === appointment?.doctorId);

  if (!appointment || !client || !doctor) {
    return (
      <View style={styles.center}>
        <Text>Заявка не найдена</Text>
      </View>
    );
  }

  const hasPresetTime = appointment.timeStart && appointment.timeEnd;

  const activateWithSlot = (date, timeStart, timeEnd) => {
    updateAppointment(appointment.id, {
      status: 'active',
      date,
      timeStart,
      timeEnd,
      proposedTransferDate: null,
      proposedTransferStart: null,
      proposedTransferEnd: null,
      isCriticalTransfer: false,
    });
    Alert.alert('Готово', 'Заявка активирована');
    navigation.goBack();
  };

  const onConfirmSlot = () => {
    if (!confirmSlot) return;
    activateWithSlot(confirmSlot.date, confirmSlot.start, confirmSlot.end);
    setConfirmSlot(null);
  };

  const onConfirmPreset = () => {
    activateWithSlot(appointment.date, appointment.timeStart, appointment.timeEnd);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Клиент</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{formatClientName(client)}</Text>
        <Text style={styles.row}>Телефон: {client.phone}</Text>
        <Text style={styles.row}>Дата рождения: {client.birthDate}</Text>
        <Text style={styles.row}>Адрес: {client.address}</Text>
        <Text style={styles.row}>Email: {client.email || '—'}</Text>
        <Text style={styles.row}>СНИЛС: {client.snils || '—'}</Text>
        <Text style={styles.row}>Полис ОМС: {client.policyNumber || '—'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Заявка</Text>
      <View style={styles.card}>
        <Text style={styles.row}>Врач: {formatDoctorName(doctor)}</Text>
        <Text style={styles.row}>Отделение: {appointment.department}</Text>
        <Text style={styles.row}>Дата: {appointment.date}</Text>
        <Text style={styles.row}>Жалобы: {appointment.complaint}</Text>
      </View>

      {hasPresetTime && (
        <View style={styles.presetBox}>
          <Text style={styles.presetTitle}>Назначенное время</Text>
          <Text style={styles.presetTime}>
            {formatTimeRange(appointment.timeStart, appointment.timeEnd)}
          </Text>
          <Pressable style={styles.presetBtn} onPress={onConfirmPreset}>
            <Text style={styles.presetBtnText}>Подтвердить это время</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {fromTransfer ? 'Выберите новое время' : 'Выберите интервал'}
      </Text>
      <DoctorDaySchedule
        doctor={doctor}
        date={appointment.date}
        appointments={appointments}
        breaks={breaks}
        onSelectSlot={(slot) => setConfirmSlot({ ...slot, date: appointment.date })}
      />

      <Modal visible={!!confirmSlot} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Подтвердить время?</Text>
            <Text style={styles.modalBody}>
              {formatDoctorName(doctor)}
              {'\n'}
              {appointment.date} {confirmSlot?.start} – {confirmSlot?.end}
            </Text>
            <View style={styles.modalRow}>
              <Pressable style={styles.modalSec} onPress={() => setConfirmSlot(null)}>
                <Text>Отмена</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={onConfirmSlot}>
                <Text style={styles.modalBtnText}>Подтвердить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 12, marginBottom: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  row: { fontSize: 14, color: colors.text, marginTop: 4 },
  presetBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  presetTitle: { fontSize: 14, fontWeight: '600', color: colors.primary },
  presetTime: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 },
  presetBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: { backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalBody: { fontSize: 14, color: colors.textMuted, marginTop: 12, lineHeight: 22 },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalSec: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});

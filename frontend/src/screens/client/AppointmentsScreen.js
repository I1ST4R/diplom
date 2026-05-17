import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import AppointmentCard from '../../components/AppointmentCard';
import { formatDoctorName, formatTimeRange } from '../../utils/time';

const FILTERS = [
  { key: 'registered', label: 'Зарегистрированные' },
  { key: 'active', label: 'Активные' },
  { key: 'cancelled', label: 'Отменённые' },
];

export default function AppointmentsScreen() {
  const {
    currentUser,
    appointments,
    doctors,
    cancelAppointment,
    acceptTransfer,
    updateAppointment,
  } = useApp();
  const [filter, setFilter] = useState('registered');
  const [transferModal, setTransferModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  const clientId = currentUser?.clientId;

  const list = useMemo(() => {
    return appointments.filter((a) => {
      if (a.clientId !== clientId) return false;
      if (filter === 'registered') return a.status === 'registered';
      if (filter === 'cancelled') return a.status === 'cancelled';
      if (filter === 'active') return a.status === 'active' || a.status === 'transfer';
      return false;
    });
  }, [appointments, clientId, filter]);

  const getDoctor = (id) => doctors.find((d) => d.id === id);

  const openCard = (apt) => {
    if (apt.status !== 'transfer') return;
    if (apt.isCriticalTransfer) {
      Alert.alert(
        'Приём невозможен',
        'Приём невозможен, пожалуйста, свяжитесь с клиникой',
        [{ text: 'ОК' }]
      );
      return;
    }
    setTransferModal(apt);
  };

  const confirmCancel = () => {
    if (cancelModal) cancelAppointment(cancelModal.id);
    setCancelModal(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {list.length === 0 ? (
          <Text style={styles.empty}>Нет заявок в этой категории</Text>
        ) : (
          list.map((apt) => {
            const doc = getDoctor(apt.doctorId);
            const isTransfer = apt.status === 'transfer';
            const canCancel =
              apt.status === 'registered' || apt.status === 'active' || apt.status === 'transfer';

            return (
              <AppointmentCard
                key={apt.id}
                title={doc ? formatDoctorName(doc) : 'Врач'}
                department={apt.department}
                complaint={apt.complaint}
                timeLabel={formatTimeRange(apt.timeStart, apt.timeEnd)}
                highlight={isTransfer ? 'transfer' : null}
                critical={isTransfer && apt.isCriticalTransfer}
                onPress={() => openCard(apt)}
                showCancel={canCancel}
                onCancel={() => setCancelModal(apt)}
              />
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!cancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Отменить заявку?</Text>
            <Text style={styles.modalBody}>
              {cancelModal?.complaint}
              {'\n'}
              {formatTimeRange(cancelModal?.timeStart, cancelModal?.timeEnd)}
            </Text>
            <View style={styles.modalRow}>
              <Pressable style={styles.modalBtnSec} onPress={() => setCancelModal(null)}>
                <Text>Нет</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={confirmCancel}>
                <Text style={styles.modalBtnText}>Да, отменить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!transferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Предложение переноса</Text>
            <Text style={styles.modalBody}>
              Текущее время: {formatTimeRange(transferModal?.timeStart, transferModal?.timeEnd)}
              {'\n\n'}
              Предложено:{' '}
              {transferModal?.proposedTransferDate}{' '}
              {formatTimeRange(transferModal?.proposedTransferStart, transferModal?.proposedTransferEnd)}
            </Text>
            <View style={styles.modalRow}>
              <Pressable
                style={styles.modalBtnSec}
                onPress={() => {
                  if (transferModal) {
                    updateAppointment(transferModal.id, { status: 'cancelled' });
                  }
                  setTransferModal(null);
                }}
              >
                <Text>Отказаться</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  if (transferModal) acceptTransfer(transferModal.id);
                  setTransferModal(null);
                }}
              >
                <Text style={styles.modalBtnText}>Согласиться</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 6,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, color: colors.textMuted },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalBody: { fontSize: 14, color: colors.textMuted, marginTop: 12, lineHeight: 22 },
  modalRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnSec: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});

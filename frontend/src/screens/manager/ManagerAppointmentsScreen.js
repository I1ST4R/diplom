import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import ManagerAppointmentCard from '../../components/ManagerAppointmentCard';
import { formatClientName, formatDoctorName, formatTimeRange } from '../../utils/time';

const FILTERS = [
  { key: 'registered', label: 'Зарегистрированные' },
  { key: 'active', label: 'Активные' },
  { key: 'transfer', label: 'К переносу' },
  { key: 'cancelled', label: 'Завершённые/Отменённые' },
];

export default function ManagerAppointmentsScreen({ navigation }) {
  const { appointments, clients, doctors, cancelAppointment, acceptTransfer } = useApp();
  const [filter, setFilter] = useState('registered');
  const [detailModal, setDetailModal] = useState(null);
  const [transferModal, setTransferModal] = useState(null);

  const getClient = (id) => clients.find((c) => c.id === id);
  const getDoctor = (id) => doctors.find((d) => d.id === id);

  const list = useMemo(() => {
    return appointments.filter((a) => {
      if (filter === 'registered') return a.status === 'registered';
      if (filter === 'active') return a.status === 'active';
      if (filter === 'transfer') return a.status === 'transfer';
      if (filter === 'cancelled') return a.status === 'cancelled';
      return false;
    });
  }, [appointments, filter]);

  const onCardPress = (apt) => {
    if (filter === 'registered') {
      navigation.navigate('ProcessAppointment', { appointmentId: apt.id });
      return;
    }
    if (filter === 'active' || filter === 'cancelled') {
      setDetailModal(apt);
      return;
    }
    if (filter === 'transfer') {
      setTransferModal(apt);
    }
  };

  const callClient = (client) => {
    Alert.alert('Звонок клиенту', client.phone);
  };

  const renderCard = (apt) => {
    const client = getClient(apt.clientId);
    const doctor = getDoctor(apt.doctorId);
    if (!client || !doctor) return null;

    const extraLines = [];
    if (filter === 'transfer' && apt.proposedTransferStart) {
      extraLines.push(
        `Предложено: ${apt.proposedTransferDate} ${formatTimeRange(apt.proposedTransferStart, apt.proposedTransferEnd)}`
      );
    }

    return (
      <ManagerAppointmentCard
        key={apt.id}
        clientName={formatClientName(client)}
        doctorName={formatDoctorName(doctor)}
        department={apt.department}
        date={apt.date}
        timeLabel={formatTimeRange(apt.timeStart, apt.timeEnd)}
        complaint={apt.complaint}
        extraLines={extraLines}
        critical={filter === 'transfer' && apt.isCriticalTransfer}
        transferBadge={filter === 'transfer'}
        onPress={() => onCardPress(apt)}
      />
    );
  };

  const detailClient = detailModal ? getClient(detailModal.clientId) : null;
  const detailDoctor = detailModal ? getDoctor(detailModal.doctorId) : null;
  const transferClient = transferModal ? getClient(transferModal.clientId) : null;
  const transferDoctor = transferModal ? getDoctor(transferModal.doctorId) : null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
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
      </ScrollView>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {list.length === 0 ? (
          <Text style={styles.empty}>Нет заявок</Text>
        ) : (
          list.map(renderCard)
        )}
      </ScrollView>

      <Modal visible={!!detailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {detailModal && detailClient && detailDoctor && (
              <>
                <Text style={styles.modalTitle}>
                  {filter === 'cancelled' ? 'Отменённая заявка' : 'Активная заявка'}
                </Text>
                <Text style={styles.modalLine}>Пациент: {formatClientName(detailClient)}</Text>
                <Text style={styles.modalLine}>Телефон: {detailClient.phone}</Text>
                <Text style={styles.modalLine}>Врач: {formatDoctorName(detailDoctor)}</Text>
                <Text style={styles.modalLine}>Отделение: {detailModal.department}</Text>
                <Text style={styles.modalLine}>Дата: {detailModal.date}</Text>
                <Text style={styles.modalLine}>
                  Время: {formatTimeRange(detailModal.timeStart, detailModal.timeEnd)}
                </Text>
                <Text style={styles.modalLine}>Жалобы: {detailModal.complaint}</Text>
              </>
            )}
            <View style={styles.modalActions}>
              {filter === 'active' && detailModal && (
                <Pressable
                  style={styles.dangerBtn}
                  onPress={() => {
                    cancelAppointment(detailModal.id);
                    setDetailModal(null);
                  }}
                >
                  <Text style={styles.dangerBtnText}>Отменить</Text>
                </Pressable>
              )}
              <Pressable style={styles.closeBtn} onPress={() => setDetailModal(null)}>
                <Text style={styles.closeBtnText}>Закрыть</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!transferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              {transferModal && transferClient && transferDoctor && (
                <>
                  {transferModal.isCriticalTransfer ? (
                    <View style={styles.criticalBanner}>
                      <Text style={styles.criticalBannerText}>Критичный перенос</Text>
                      <Text style={styles.criticalSub}>
                        Приём невозможен в указанное время
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.modalTitle}>Перенос заявки</Text>
                  <Text style={styles.modalLine}>
                    {formatClientName(transferClient)}
                  </Text>
                  <Text style={styles.modalLine}>Телефон: {transferClient.phone}</Text>
                  <Text style={styles.modalLine}>Врач: {formatDoctorName(transferDoctor)}</Text>
                  <Text style={styles.modalLine}>
                    Текущее: {transferModal.date}{' '}
                    {formatTimeRange(transferModal.timeStart, transferModal.timeEnd)}
                  </Text>
                  {!transferModal.isCriticalTransfer && transferModal.proposedTransferStart && (
                    <Text style={styles.proposed}>
                      Предложено: {transferModal.proposedTransferDate}{' '}
                      {formatTimeRange(
                        transferModal.proposedTransferStart,
                        transferModal.proposedTransferEnd
                      )}
                    </Text>
                  )}
                </>
              )}
              <View style={styles.modalActionsCol}>
                {!transferModal?.isCriticalTransfer && (
                  <Pressable
                    style={styles.modalBtn}
                    onPress={() => {
                      acceptTransfer(transferModal.id);
                      setTransferModal(null);
                    }}
                  >
                    <Text style={styles.modalBtnText}>Подтвердить перенос</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.modalBtnOutline}
                  onPress={() => {
                    const id = transferModal.id;
                    setTransferModal(null);
                    navigation.navigate('ProcessAppointment', {
                      appointmentId: id,
                      fromTransfer: true,
                    });
                  }}
                >
                  <Text style={styles.modalBtnOutlineText}>Выбрать другое время</Text>
                </Pressable>
                <Pressable
                  style={styles.modalBtnOutline}
                  onPress={() => callClient(transferClient)}
                >
                  <Text style={styles.modalBtnOutlineText}>Позвонить клиенту</Text>
                </Pressable>
                <Pressable style={styles.closeBtn} onPress={() => setTransferModal(null)}>
                  <Text style={styles.closeBtnText}>Закрыть</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterScroll: { maxHeight: 52, flexGrow: 0 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textMuted },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  listScroll: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalLine: { fontSize: 14, color: colors.text, marginTop: 8 },
  proposed: { fontSize: 14, color: colors.warning, marginTop: 10, fontWeight: '600' },
  criticalBanner: {
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  criticalBannerText: { fontSize: 16, fontWeight: '700', color: colors.danger },
  criticalSub: { fontSize: 13, color: colors.danger, marginTop: 4 },
  modalActions: { marginTop: 20, gap: 10 },
  modalActionsCol: { marginTop: 16, gap: 10 },
  modalBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '600' },
  modalBtnOutline: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalBtnOutlineText: { color: colors.primary, fontWeight: '600' },
  dangerBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#fff', fontWeight: '600' },
  closeBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  closeBtnText: { color: colors.textMuted, fontWeight: '600' },
});

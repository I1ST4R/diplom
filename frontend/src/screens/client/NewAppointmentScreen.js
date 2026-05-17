import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import FilterPicker from '../../components/FilterPicker';
import DoctorDaySchedule from '../../components/DoctorDaySchedule';
import { scheduleDates } from '../../mock/data';
import { formatDoctorName } from '../../utils/time';

const ALL = '__all__';

const SCROLL_PROPS = {
  nestedScrollEnabled: true,
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: true,
  overScrollMode: 'never',
  bounces: true,
  decelerationRate: 'normal',
};

export default function NewAppointmentScreen() {
  const { currentUser, doctors, appointments, breaks, addAppointment } = useApp();
  const [department, setDepartment] = useState(ALL);
  const [doctorId, setDoctorId] = useState(ALL);
  const [date, setDate] = useState('');
  const [bookModal, setBookModal] = useState(null);
  const [complaint, setComplaint] = useState('');

  const departments = useMemo(() => {
    const set = new Set(doctors.map((d) => d.department));
    return [{ label: 'Все', value: ALL }, ...[...set].map((d) => ({ label: d, value: d }))];
  }, [doctors]);

  const doctorItems = useMemo(() => {
    let list = doctors;
    if (department !== ALL) list = list.filter((d) => d.department === department);
    return [
      { label: 'Все', value: ALL },
      ...list.map((d) => ({ label: formatDoctorName(d), value: d.id })),
    ];
  }, [doctors, department]);

  const dateItems = [{ label: 'Не выбрано', value: '' }, ...scheduleDates.map((d) => ({ label: d, value: d }))];

  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (department !== ALL) list = list.filter((d) => d.department === department);
    if (doctorId !== ALL) list = list.filter((d) => d.id === doctorId);
    return list;
  }, [doctors, department, doctorId]);

  const hasAnyFilter = department !== ALL || doctorId !== ALL || date !== '';
  const showEmptyHint = !hasAnyFilter;

  const groupedByDepartment = useMemo(() => {
    if (!date || doctorId !== ALL) return null;
    const map = {};
    filteredDoctors.forEach((d) => {
      if (!map[d.department]) map[d.department] = [];
      map[d.department].push(d);
    });
    return map;
  }, [date, doctorId, filteredDoctors]);

  const onBook = () => {
    if (!bookModal) return;
    const id = `apt_${Date.now()}`;
    addAppointment({
      id,
      clientId: currentUser.clientId,
      doctorId: bookModal.doctor.id,
      department: bookModal.doctor.department,
      complaint: complaint.trim() || 'Без указания',
      status: 'registered',
      date: bookModal.date,
      timeStart: bookModal.start,
      timeEnd: bookModal.end,
      isCriticalTransfer: false,
      proposedTransferDate: null,
      proposedTransferStart: null,
      proposedTransferEnd: null,
    });
    setBookModal(null);
    setComplaint('');
    Alert.alert('Готово', 'Заявка создана (статус: зарегистрирована)');
  };

  const renderDoctorBlock = (doctor) => {
    const day = doctor._renderDate || date;
    return (
      <View key={`${doctor.id}-${day}`} style={styles.doctorBlock}>
        <Text style={styles.doctorName}>{formatDoctorName(doctor)}</Text>
        <Text style={styles.spec}>{doctor.specialization}</Text>
        <DoctorDaySchedule
          doctor={doctor}
          date={day}
          appointments={appointments}
          breaks={breaks}
          onSelectSlot={(slot) => setBookModal(slot)}
        />
      </View>
    );
  };

  const scheduleContent = (
    <>
      {showEmptyHint && <Text style={styles.hint}>Выберите параметры для поиска</Text>}

      {!showEmptyHint && !date && doctorId === ALL && department !== ALL && (
        <Text style={styles.hint}>Выберите дату для расписания отделения</Text>
      )}

      {!showEmptyHint && !date && doctorId !== ALL && (
        <>
          <Text style={styles.sectionHint}>Расписание врача по дням</Text>
          {filteredDoctors.map((doctor) =>
            scheduleDates.map((d) => (
              <View key={`${doctor.id}-${d}`}>
                <Text style={styles.dateLabel}>{d}</Text>
                {renderDoctorBlock({ ...doctor, _renderDate: d })}
              </View>
            ))
          )}
        </>
      )}

      {date && doctorId !== ALL && filteredDoctors.map((doctor) => renderDoctorBlock(doctor))}

      {date &&
        doctorId === ALL &&
        groupedByDepartment &&
        Object.entries(groupedByDepartment).map(([dept, docs]) => (
          <View key={dept} style={styles.deptSection}>
            <Text style={styles.deptTitle}>{dept}</Text>
            {docs.map(renderDoctorBlock)}
          </View>
        ))}
    </>
  );

  return (
    <View style={styles.container}>
      {/* Фильтры закреплены сверху — Picker не мешает скроллу расписания */}
      <View style={styles.filters}>
        <FilterPicker label="Отделение" value={department} onChange={setDepartment} items={departments} />
        <FilterPicker label="Врач" value={doctorId} onChange={setDoctorId} items={doctorItems} />
        <FilterPicker label="Дата" value={date} onChange={setDate} items={dateItems} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        {...SCROLL_PROPS}
      >
        {scheduleContent}
      </ScrollView>

      <Modal visible={!!bookModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Запись на приём</Text>
            {bookModal && (
              <>
                <Text style={styles.modalLine}>Врач: {formatDoctorName(bookModal.doctor)}</Text>
                <Text style={styles.modalLine}>Отделение: {bookModal.doctor.department}</Text>
                <Text style={styles.modalLine}>Дата: {bookModal.date}</Text>
                <Text style={styles.modalLine}>
                  Время: {bookModal.start} – {bookModal.end}
                </Text>
                <Text style={styles.label}>Жалобы (необязательно)</Text>
                <TextInput
                  style={styles.textArea}
                  value={complaint}
                  onChangeText={setComplaint}
                  multiline
                  placeholder="Опишите жалобы"
                />
              </>
            )}
            <View style={styles.modalRow}>
              <Pressable style={styles.modalBtnSec} onPress={() => { setBookModal(null); setComplaint(''); }}>
                <Text>Отмена</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={onBook}>
                <Text style={styles.modalBtnText}>Записаться</Text>
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
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: 32, fontSize: 15 },
  sectionHint: { fontSize: 15, color: colors.text, fontWeight: '600', marginTop: 8 },
  dateLabel: { fontSize: 14, color: colors.primary, marginTop: 12, fontWeight: '600' },
  deptSection: { marginTop: 16 },
  deptTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  doctorBlock: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doctorName: { fontSize: 16, fontWeight: '600', color: colors.text },
  spec: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalLine: { fontSize: 14, color: colors.text, marginTop: 8 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 16, marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnSec: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});

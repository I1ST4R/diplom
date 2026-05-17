/** Преобразование "HH:mm" в минуты от полуночи */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** День недели для date-fns: mon..sun */
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function getDayKeyFromDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_KEYS[d.getDay()];
}

export function formatDoctorName(doctor) {
  return `${doctor.lastName} ${doctor.firstName} ${doctor.middleName}`;
}

export function formatClientName(client) {
  return `${client.lastName} ${client.firstName} ${client.middleName}`;
}

export function formatTimeRange(start, end) {
  if (!start || !end) return 'Время не назначено';
  return `${start} – ${end}`;
}

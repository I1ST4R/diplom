import { timeToMinutes, minutesToTime } from './time';

/**
 * Объединение интервалов и вычитание занятого времени.
 * Возвращает свободные интервалы с нарезкой по правилам (час / >=30 мин).
 */
export function computeFreeSlots(workStart, workEnd, blockedIntervals) {
  const start = timeToMinutes(workStart);
  const end = timeToMinutes(workEnd);
  const blocked = blockedIntervals
    .map((b) => ({ start: timeToMinutes(b.start), end: timeToMinutes(b.end) }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const b of blocked) {
    if (!merged.length || b.start > merged[merged.length - 1].end) {
      merged.push({ ...b });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, b.end);
    }
  }

  const gaps = [];
  let cursor = start;
  for (const b of merged) {
    if (b.start > cursor) gaps.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < end) gaps.push({ start: cursor, end });

  const slots = [];
  for (const gap of gaps) {
    let s = gap.start;
    while (s < gap.end) {
      const hourEnd = Math.min(s + 60, gap.end);
      const len = hourEnd - s;
      if (len >= 60) {
        slots.push({ start: minutesToTime(s), end: minutesToTime(hourEnd) });
        s = hourEnd;
      } else if (len >= 30) {
        slots.push({ start: minutesToTime(s), end: minutesToTime(gap.end) });
        break;
      } else {
        break;
      }
    }
  }
  return slots;
}

/** Занятые и перерывы для врача на дату */
export function getDoctorDayBlocks(doctorId, date, appointments, breaks) {
  const busy = appointments
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        (a.status === 'active' || a.status === 'transfer') &&
        a.timeStart &&
        a.timeEnd
    )
    .map((a) => ({ start: a.timeStart, end: a.timeEnd, type: 'busy' }));

  const br = breaks
    .filter((b) => b.doctorId === doctorId && b.date === date)
    .map((b) => ({ start: b.timeStart, end: b.timeEnd, type: 'break' }));

  return { busy, breaks: br };
}

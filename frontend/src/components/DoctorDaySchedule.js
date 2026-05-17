import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { getDayKeyFromDate, timeToMinutes, minutesToTime } from '../utils/time';
import { computeFreeSlots, getDoctorDayBlocks } from '../utils/schedule';

const PIXELS_PER_HOUR = 72;
const MIN_BLOCK_HEIGHT = 48;

export default function DoctorDaySchedule({
  doctor,
  date,
  appointments,
  breaks,
  onSelectSlot,
}) {
  const dayKey = getDayKeyFromDate(date);
  const daySchedule = doctor.workSchedule[dayKey];
  if (!daySchedule) {
    return <Text style={styles.off}>Выходной</Text>;
  }

  const { busy, breaks: dayBreaks } = getDoctorDayBlocks(doctor.id, date, appointments, breaks);
  const blocked = [
    ...busy.map((b) => ({ start: b.start, end: b.end })),
    ...dayBreaks.map((b) => ({ start: b.start, end: b.end })),
  ];
  const freeSlots = computeFreeSlots(daySchedule.start, daySchedule.end, blocked);

  const startMin = timeToMinutes(daySchedule.start);
  const endMin = timeToMinutes(daySchedule.end);
  const totalMin = endMin - startMin;
  const timelineHeight = (totalMin / 60) * PIXELS_PER_HOUR;

  const toTop = (time) => ((timeToMinutes(time) - startMin) / totalMin) * timelineHeight;
  const blockHeight = (timeStart, timeEnd, withMin = false) => {
    const h = toTop(timeEnd) - toTop(timeStart);
    return withMin ? Math.max(h, MIN_BLOCK_HEIGHT) : h;
  };

  const hourMarks = [];
  for (let m = startMin; m <= endMin; m += 60) {
    hourMarks.push(minutesToTime(m));
  }

  return (
    <View style={styles.container}>
      <View style={[styles.scale, { height: timelineHeight }]}>
        {hourMarks.map((h) => (
          <Text key={h} style={styles.scaleLabel}>
            {h}
          </Text>
        ))}
      </View>
      <View style={[styles.timeline, { height: timelineHeight }]}>
        {hourMarks.slice(0, -1).map((h) => {
          const top = toTop(h);
          const halfTop = top + PIXELS_PER_HOUR / 2;
          return (
            <React.Fragment key={`ticks-${h}`}>
              <View style={[styles.tick, { top }]} />
              <View style={[styles.tickHalf, { top: halfTop }]} />
            </React.Fragment>
          );
        })}
        {busy.map((b, i) => (
          <View
            key={`busy-${i}`}
            style={[
              styles.block,
              styles.busy,
              {
                top: toTop(b.start),
                height: blockHeight(b.start, b.end),
              },
            ]}
          />
        ))}
        {dayBreaks.map((b, i) => {
          const h = blockHeight(b.start, b.end, true);
          return (
            <View
              key={`br-${i}`}
              style={[
                styles.block,
                styles.breakBlock,
                { top: toTop(b.start), height: h },
              ]}
            >
              <Text style={styles.breakText} numberOfLines={1}>
                Перерыв
              </Text>
            </View>
          );
        })}
        {freeSlots.map((slot, i) => {
          const h = blockHeight(slot.start, slot.end, true);
          return (
            <Pressable
              key={`free-${i}`}
              style={[
                styles.block,
                styles.free,
                { top: toTop(slot.start), height: h },
              ]}
              onPress={() => onSelectSlot?.({ doctor, date, ...slot })}
            >
              <Text style={styles.freeText} numberOfLines={2} adjustsFontSizeToFit>
                {slot.start}–{slot.end}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: 8 },
  scale: {
    width: 48,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  scaleLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  timeline: {
    flex: 1,
    backgroundColor: colors.free,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.freeBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  tick: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  tickHalf: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  block: {
    position: 'absolute',
    left: 6,
    right: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  busy: { backgroundColor: colors.busy, opacity: 0.9 },
  breakBlock: { backgroundColor: colors.break },
  breakText: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  free: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  freeText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  off: { color: colors.textMuted, fontStyle: 'italic', padding: 8 },
});

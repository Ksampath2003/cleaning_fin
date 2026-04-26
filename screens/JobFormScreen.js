// Add / Edit Job form. Used as a modal inside the Schedule stack.

import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addMinutes } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import EmployeeChip from '../components/EmployeeChip';
import { formatDateLong, formatTime } from '../utils/format';

const STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function JobFormScreen({ navigation, route }) {
  const existingJobId = route.params?.jobId || null;
  const prefilledClientId = route.params?.clientId || null;
  const { clients, employees, jobs, addJob, updateJob } = useStore();
  const existingJob = existingJobId ? jobs.find((j) => j.id === existingJobId) : null;

  const visibleClients = useMemo(
    () => clients.filter((c) => !c.deleted).sort((a, b) => a.name.localeCompare(b.name)),
    [clients],
  );
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.active),
    [employees],
  );

  const [clientId, setClientId] = useState(
    existingJob?.clientId || prefilledClientId || (visibleClients[0]?.id ?? ''),
  );
  const [startAt, setStartAt] = useState(
    existingJob?.startAt || addMinutes(new Date(), 60).getTime(),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    existingJob?.durationMinutes || 120,
  );
  const [employeeIds, setEmployeeIds] = useState(existingJob?.employeeIds || []);
  const [status, setStatus] = useState(existingJob?.status || 'scheduled');
  const [notes, setNotes] = useState(existingJob?.notes || '');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);

  const toggleEmployee = (id) => {
    setEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const bumpDuration = (delta) =>
    setDurationMinutes((v) => Math.max(15, Math.min(600, v + delta)));

  const onSave = async () => {
    if (!clientId) return Alert.alert('Client required', 'Pick a client first.');
    if (employeeIds.length === 0)
      return Alert.alert('Employees required', 'Assign at least one employee.');

    if (!existingJob && startAt <= Date.now()) {
      return Alert.alert('Start time is in the past', 'Pick a future start time.');
    }
    if (existingJob && startAt <= Date.now()) {
      Alert.alert('Heads up', 'This job is in the past — saving anyway.');
    }

    const payload = { clientId, startAt, durationMinutes, employeeIds, status, notes };
    if (existingJob) {
      await updateJob(existingJob.id, payload);
    } else {
      await addJob(payload);
    }
    navigation.goBack();
  };

  const selectedClient = visibleClients.find((c) => c.id === clientId);

  const onDateChange = (_, date) => {
    setShowDate(Platform.OS === 'ios');
    if (date) {
      const d = new Date(startAt);
      d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setStartAt(d.getTime());
    }
  };

  const onTimeChange = (_, date) => {
    setShowTime(Platform.OS === 'ios');
    if (date) {
      const d = new Date(startAt);
      d.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setStartAt(d.getTime());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Client</Text>
        <Pressable style={styles.field} onPress={() => setShowClientPicker(true)}>
          <Text style={styles.fieldValue}>
            {selectedClient?.name || 'Pick a client'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.muted} />
        </Pressable>
        <Pressable
          onPress={() => {
            setShowClientPicker(false);
            navigation.navigate('ClientsTab', {
              screen: 'ClientForm',
              params: {},
            });
          }}
        >
          <Text style={styles.link}>+ New client</Text>
        </Pressable>

        <Text style={styles.label}>Date</Text>
        <Pressable style={styles.field} onPress={() => setShowDate(true)}>
          <Text style={styles.fieldValue}>{formatDateLong(startAt)}</Text>
          <Ionicons name="calendar-outline" size={18} color={theme.muted} />
        </Pressable>
        {showDate ? (
          <DateTimePicker
            value={new Date(startAt)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
          />
        ) : null}

        <Text style={styles.label}>Start time</Text>
        <Pressable style={styles.field} onPress={() => setShowTime(true)}>
          <Text style={styles.fieldValue}>{formatTime(startAt)}</Text>
          <Ionicons name="time-outline" size={18} color={theme.muted} />
        </Pressable>
        {showTime ? (
          <DateTimePicker
            value={new Date(startAt)}
            mode="time"
            minuteInterval={15}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        ) : null}

        <Text style={styles.label}>Duration</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => bumpDuration(-15)}>
            <Ionicons name="remove" size={20} color={theme.text} />
          </Pressable>
          <Text style={styles.stepperValue}>{durationMinutes} min</Text>
          <Pressable style={styles.stepBtn} onPress={() => bumpDuration(15)}>
            <Ionicons name="add" size={20} color={theme.text} />
          </Pressable>
        </View>

        <Text style={styles.label}>Employees</Text>
        <View style={styles.chipWrap}>
          {activeEmployees.map((e) => (
            <EmployeeChip
              key={e.id}
              employee={e}
              selected={employeeIds.includes(e.id)}
              onPress={() => toggleEmployee(e.id)}
              size={40}
              showName
            />
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <SegmentedControl
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          multiline
          value={notes}
          onChangeText={setNotes}
          style={styles.textarea}
          placeholder="Anything the crew should know"
          placeholderTextColor={theme.muted}
        />

        <View style={styles.actions}>
          <PrimaryButton
            label="Cancel"
            kind="secondary"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <View style={{ width: theme.space(3) }} />
          <PrimaryButton
            label={existingJob ? 'Save Changes' : 'Add Job'}
            onPress={onSave}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showClientPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowClientPicker(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowClientPicker(false)}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Pick a client</Text>
            <ScrollView>
              {visibleClients.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.pickerRow}
                  onPress={() => {
                    setClientId(c.id);
                    setShowClientPicker(false);
                  }}
                >
                  <Text style={styles.pickerName}>{c.name}</Text>
                  {c.id === clientId ? (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  ) : null}
                </Pressable>
              ))}
              {visibleClients.length === 0 ? (
                <Text style={styles.emptyText}>No clients yet. Add one first.</Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: theme.space(4), paddingBottom: theme.space(12) },
  label: {
    ...theme.font.label,
    color: theme.muted,
    marginTop: theme.space(3),
    marginBottom: theme.space(2),
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    paddingHorizontal: theme.space(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: { ...theme.font.body, color: theme.text, flex: 1 },
  link: {
    color: theme.primary,
    marginTop: theme.space(2),
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    paddingHorizontal: theme.space(2),
    minHeight: 48,
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { ...theme.font.body, color: theme.text, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  textarea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    padding: theme.space(3),
    ...theme.font.body,
    color: theme.text,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', marginTop: theme.space(5) },
  backdrop: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: theme.card,
    borderTopLeftRadius: theme.radius * 1.5,
    borderTopRightRadius: theme.radius * 1.5,
    padding: theme.space(4),
  },
  sheetTitle: {
    ...theme.font.h2,
    color: theme.text,
    marginBottom: theme.space(3),
  },
  pickerRow: {
    paddingVertical: theme.space(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerName: { ...theme.font.body, color: theme.text },
  emptyText: {
    ...theme.font.body,
    color: theme.muted,
    padding: theme.space(4),
    textAlign: 'center',
  },
});

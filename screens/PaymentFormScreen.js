// New payment form. Modal inside the Payments stack.

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
import { startOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import { formatDateLong } from '../utils/format';

export default function PaymentFormScreen({ navigation, route }) {
  const prefilledClientId = route.params?.clientId || null;
  const { clients, jobs, addPayment } = useStore();
  const visibleClients = useMemo(
    () => clients.filter((c) => !c.deleted).sort((a, b) => a.name.localeCompare(b.name)),
    [clients],
  );

  const [clientId, setClientId] = useState(
    prefilledClientId || visibleClients[0]?.id || '',
  );
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(startOfDay(new Date()).getTime());
  const [note, setNote] = useState('');
  const [jobId, setJobId] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);

  const selectedClient = visibleClients.find((c) => c.id === clientId);
  const clientJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.clientId === clientId)
        .sort((a, b) => b.startAt - a.startAt),
    [jobs, clientId],
  );
  const selectedJob = clientJobs.find((j) => j.id === jobId);

  const parsedAmount = Number.parseFloat(amount.replace(/[^0-9.]/g, ''));

  const onSave = async () => {
    if (!clientId) return Alert.alert('Client required', 'Pick a client first.');
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
      return Alert.alert('Amount required', 'Enter a dollar amount greater than zero.');

    await addPayment({
      clientId,
      jobId,
      amount: parsedAmount,
      dueDate: startOfDay(new Date(dueDate)).getTime(),
      note,
    });
    navigation.goBack();
  };

  const onDateChange = (_, date) => {
    setShowDate(Platform.OS === 'ios');
    if (date) setDueDate(date.getTime());
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

        <Text style={styles.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={theme.muted}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Due date</Text>
        <Pressable style={styles.field} onPress={() => setShowDate(true)}>
          <Text style={styles.fieldValue}>{formatDateLong(dueDate)}</Text>
          <Ionicons name="calendar-outline" size={18} color={theme.muted} />
        </Pressable>
        {showDate ? (
          <DateTimePicker
            value={new Date(dueDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
          />
        ) : null}

        <Text style={styles.label}>Linked job (optional)</Text>
        <Pressable
          style={styles.field}
          onPress={() => clientJobs.length > 0 && setShowJobPicker(true)}
        >
          <Text style={styles.fieldValue}>
            {selectedJob
              ? `Job on ${new Date(selectedJob.startAt).toLocaleDateString()}`
              : clientJobs.length === 0
                ? 'No jobs for this client'
                : 'None'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.muted} />
        </Pressable>

        <Text style={styles.label}>Note</Text>
        <TextInput
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Optional note"
          placeholderTextColor={theme.muted}
          style={styles.textarea}
        />

        <View style={styles.actions}>
          <PrimaryButton
            label="Cancel"
            kind="secondary"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <View style={{ width: theme.space(3) }} />
          <PrimaryButton label="Add Payment" onPress={onSave} style={{ flex: 1 }} />
        </View>
      </ScrollView>

      <PickerSheet
        visible={showClientPicker}
        title="Pick a client"
        options={visibleClients.map((c) => ({ id: c.id, label: c.name }))}
        selectedId={clientId}
        onSelect={(id) => {
          setClientId(id);
          setJobId(null);
          setShowClientPicker(false);
        }}
        onClose={() => setShowClientPicker(false)}
      />
      <PickerSheet
        visible={showJobPicker}
        title="Link a job"
        options={[
          { id: null, label: 'None' },
          ...clientJobs.map((j) => ({
            id: j.id,
            label: `Job on ${new Date(j.startAt).toLocaleString()}`,
          })),
        ]}
        selectedId={jobId}
        onSelect={(id) => {
          setJobId(id);
          setShowJobPicker(false);
        }}
        onClose={() => setShowJobPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

function PickerSheet({ visible, title, options, selectedId, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <ScrollView>
            {options.map((opt) => (
              <Pressable
                key={String(opt.id)}
                style={styles.pickerRow}
                onPress={() => onSelect(opt.id)}
              >
                <Text style={styles.pickerName}>{opt.label}</Text>
                {opt.id === selectedId ? (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                ) : null}
              </Pressable>
            ))}
            {options.length === 0 ? (
              <Text style={styles.emptyText}>Nothing to pick.</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    paddingHorizontal: theme.space(3),
    ...theme.font.body,
    color: theme.text,
  },
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

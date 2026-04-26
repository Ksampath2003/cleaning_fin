// Employee chip: initials in a colored circle plus optional name. Selectable variant toggles a ring.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { chipColor, employeeInitials } from '../utils/format';
import { theme } from '../theme';

export default function EmployeeChip({
  employee,
  selected,
  onPress,
  showName = false,
  size = 28,
}) {
  const bg = chipColor(employee.id);
  const content = (
    <View style={styles.row}>
      <View
        style={[
          styles.circle,
          { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 },
          selected && styles.selected,
        ]}
      >
        <Text style={[styles.initials, { fontSize: Math.max(11, size * 0.42) }]}>
          {employeeInitials(employee.name)}
        </Text>
      </View>
      {showName ? <Text style={styles.name}>{employee.name}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.7 }]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  pressable: { marginRight: theme.space(2), marginBottom: theme.space(2) },
  row: { flexDirection: 'row', alignItems: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  selected: { borderWidth: 2, borderColor: theme.text },
  initials: { color: '#fff', fontWeight: '700' },
  name: {
    ...theme.font.body,
    marginLeft: theme.space(2),
    color: theme.text,
  },
});

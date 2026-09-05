import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ShoppingItem } from '../types';
import { colors, formatEuro, sizes, spacing, typography } from '../theme';

interface Props {
  item: ShoppingItem;
  onPress: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
}

function ItemRow({ item, onPress, onDelete, onEdit }: Props) {
  const lineTotal = (item.price ?? 0) * (item.quantity ?? 0);

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={48}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.actionsRow}>
          <Pressable style={styles.editAction} onPress={() => onEdit(item)}>
            <Text style={styles.actionText}>Editar</Text>
          </Pressable>
          <Pressable style={styles.deleteAction} onPress={() => onDelete(item.id)}>
            <Text style={styles.actionText}>Apagar</Text>
          </Pressable>
        </View>
      )}
    >
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityState={{ checked: item.checked }}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.body}>
          <Text style={[styles.name, item.checked && styles.nameChecked]} numberOfLines={2}>
            {item.name}
          </Text>
          {item.checked && (
            <Text style={styles.meta}>
              {item.quantity} × {formatEuro(item.price ?? 0)} = {formatEuro(lineTotal)}
            </Text>
          )}
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

export default React.memo(ItemRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.rowMinHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: { backgroundColor: colors.surface },
  checkbox: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: sizes.checkbox / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checkmark: { color: colors.onPrimary, fontSize: 14, fontWeight: '700', lineHeight: 16 },
  body: { flex: 1 },
  name: { ...typography.item, color: colors.text },
  nameChecked: { textDecorationLine: 'line-through', color: colors.strike },
  meta: { ...typography.meta, marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row' },
  editAction: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 96,
  },
  actionText: { color: colors.onPrimary, fontWeight: '600', fontSize: 15 },
});

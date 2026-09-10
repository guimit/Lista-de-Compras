import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, formatEuro, sizes, spacing, typography } from '../theme';

interface Props {
  total: number;
  itemCount: number;
  onNewList: () => void;
  onConcluir?: () => void;
  canConcluir?: boolean;
  bottomInset?: number;
}

export default function CartSummary({
  total,
  itemCount,
  onNewList,
  onConcluir,
  canConcluir = false,
  bottomInset = 0,
}: Props) {
  const confirmNewList = () => {
    Alert.alert('Nova lista', 'Apagar todos os itens da lista atual? O histórico é mantido.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: onNewList },
    ]);
  };

  const countLabel = itemCount === 1 ? '1 item' : `${itemCount} itens`;

  return (
    <View style={[styles.container, { paddingBottom: spacing.md + bottomInset }]}>
      <View style={styles.row}>
        <Text style={styles.total} accessibilityRole="summary">
          Total: <Text style={styles.amount}>{formatEuro(total)}</Text>
          {'  '}
          <Text style={styles.count}>({countLabel})</Text>
        </Text>
        <Pressable
          onPress={confirmNewList}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Nova lista</Text>
        </Pressable>
      </View>

      {canConcluir && (
        <Pressable
          onPress={onConcluir}
          style={({ pressed }) => [styles.concluir, pressed && styles.concluirPressed]}
        >
          <Text style={styles.concluirText}>Concluir compra</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  total: { ...typography.total, color: colors.text, flexShrink: 1 },
  amount: { color: colors.accent },
  count: { ...typography.meta, fontWeight: '500' },
  button: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: sizes.radius,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: colors.surface },
  buttonText: { ...typography.item, color: colors.primary },
  concluir: {
    height: 48,
    borderRadius: sizes.radius,
    backgroundColor: colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concluirPressed: { opacity: 0.6 },
  concluirText: { ...typography.item, color: colors.onPrimary, fontWeight: '700' },
});

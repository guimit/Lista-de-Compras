import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sizes, spacing, typography } from '../theme';
import { Mercado } from '../types';
import CenteredDialog from './CenteredDialog';
import { dialogFormStyles } from './dialogFormStyles';

const MERCADOS: Mercado[] = ['Intermarché', 'Pingo Doce', 'Continente', 'Lidl', 'Aldi'];

interface Props {
  visible: boolean;
  onConfirm: (mercado: Mercado) => void;
  onDismiss: () => void;
}

export default function MercadoModal({ visible, onConfirm, onDismiss }: Props) {
  return (
    <CenteredDialog visible={visible} onDismiss={onDismiss}>
      <Text style={dialogFormStyles.title}>Onde compraste?</Text>

      <View style={styles.list}>
        {MERCADOS.map((mercado) => (
          <Pressable
            key={mercado}
            onPress={() => onConfirm(mercado)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Ionicons name="storefront-outline" size={22} color={colors.action} />
            <Text style={styles.nome}>{mercado}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onDismiss}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </CenteredDialog>
  );
}

const styles = StyleSheet.create({
  list: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.rowMinHeight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: { backgroundColor: colors.surface },
  nome: { ...typography.item, color: colors.text, flex: 1 },
  cancel: {
    height: 48,
    borderRadius: sizes.radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.divider,
    marginTop: spacing.lg,
  },
  pressed: { opacity: 0.6 },
  cancelText: { ...typography.item, color: colors.text },
});

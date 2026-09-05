import { StyleSheet } from 'react-native';
import { colors, sizes, spacing, typography } from '../theme';

// Estilos de formulário partilhados pelos diálogos de checkout e de edição de item.
export const dialogFormStyles = StyleSheet.create({
  title: { ...typography.total, color: colors.text, marginBottom: spacing.lg },
  fields: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1 },
  fieldSpaced: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  input: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 18,
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  button: {
    flex: 1,
    height: 52,
    borderRadius: sizes.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: colors.divider },
  confirmButton: { backgroundColor: colors.accent },
  pressed: { opacity: 0.6 },
  cancelText: { ...typography.item, color: colors.text },
  confirmText: { ...typography.item, color: colors.onPrimary },
});

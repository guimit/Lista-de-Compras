import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingItem } from '../types';
import { colors, sizes, spacing, typography } from '../theme';

interface Props {
  item: ShoppingItem | null;
  onConfirm: (id: string, price: number, quantity: number) => void;
  onCancel: () => void;
}

function parsePrice(raw: string): number | null {
  const value = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function parseQuantity(raw: string): number | null {
  const value = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export default function CheckoutModal({ item, onConfirm, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (item) {
      setPrice('');
      setQuantity('1');
    }
  }, [item]);

  // Substitui o botão "voltar" do Android pelo cancelar, como fazia o onRequestClose do Modal nativo.
  useEffect(() => {
    if (!item) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => subscription.remove();
  }, [item, onCancel]);

  const parsedPrice = parsePrice(price);
  const parsedQuantity = parseQuantity(quantity);
  const canConfirm = item !== null && parsedPrice !== null && parsedQuantity !== null;

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm(item.id, parsedPrice, parsedQuantity);
  };

  if (!item) return null;

  // Nota: propositalmente não usamos o componente <Modal> nativo aqui. No Android, o Modal
  // abre numa janela separada que não acompanha o redimensionamento do teclado (diferente do
  // resto do ecrã, que já funciona bem com o windowSoftInputMode padrão do Expo), fazendo o
  // teclado tapar por completo os campos de preço/quantidade. Ao renderizar como uma
  // sobreposição normal dentro do próprio ecrã, ela passa a beneficiar do mesmo comportamento.
  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        style={styles.backdropContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>Preço unitário (€)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={colors.textSecondary}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={confirm}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={confirm}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={confirm}
              disabled={!canConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                (pressed || !canConfirm) && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, elevation: 10, zIndex: 10 },
  backdropContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: spacing.lg,
  },
  title: { ...typography.total, color: colors.text, marginBottom: spacing.lg },
  fields: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1 },
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

import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ShoppingItem } from '../types';
import { colors } from '../theme';
import { parsePrice, parseQuantity } from '../utils/parse';
import CenteredDialog from './CenteredDialog';
import { dialogFormStyles as styles } from './dialogFormStyles';

interface Props {
  item: ShoppingItem | null;
  onConfirm: (id: string, price: number, quantity: number) => void;
  onCancel: () => void;
}

export default function CheckoutModal({ item, onConfirm, onCancel }: Props) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (item) {
      setPrice('');
      setQuantity('1');
    }
  }, [item]);

  const parsedPrice = parsePrice(price);
  const parsedQuantity = parseQuantity(quantity);
  const canConfirm = item !== null && parsedPrice !== null && parsedQuantity !== null;

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm(item.id, parsedPrice, parsedQuantity);
  };

  return (
    <CenteredDialog visible={item !== null} onDismiss={onCancel}>
      {item && (
        <>
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
        </>
      )}
    </CenteredDialog>
  );
}

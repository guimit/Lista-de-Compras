import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ShoppingItem } from '../types';
import { colors } from '../theme';
import { parsePrice, parseQuantity } from '../utils/parse';
import CenteredDialog from './CenteredDialog';
import { dialogFormStyles as styles } from './dialogFormStyles';

export interface EditItemUpdates {
  name: string;
  price?: number;
  quantity?: number;
}

interface Props {
  item: ShoppingItem | null;
  onSave: (id: string, updates: EditItemUpdates) => void;
  onCancel: () => void;
}

export default function EditItemModal({ item, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.checked ? String(item.price ?? 0).replace('.', ',') : '');
      setQuantity(item.checked ? String(item.quantity ?? 1).replace('.', ',') : '');
    }
  }, [item]);

  const trimmedName = name.trim();
  const isPurchased = item?.checked ?? false;
  const parsedPrice = isPurchased ? parsePrice(price) : null;
  const parsedQuantity = isPurchased ? parseQuantity(quantity) : null;
  const canSave = item !== null && trimmedName.length > 0 && (!isPurchased || (parsedPrice !== null && parsedQuantity !== null));

  const save = () => {
    if (!canSave || !item) return;
    onSave(item.id, {
      name: trimmedName,
      ...(isPurchased ? { price: parsedPrice ?? undefined, quantity: parsedQuantity ?? undefined } : {}),
    });
  };

  return (
    <CenteredDialog visible={item !== null} onDismiss={onCancel}>
      {item && (
        <>
          <Text style={styles.title}>Editar item</Text>

          <View style={styles.fieldSpaced}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do item"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              selectTextOnFocus
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType={isPurchased ? 'next' : 'done'}
              onSubmitEditing={isPurchased ? undefined : save}
            />
          </View>

          {isPurchased && (
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
                  selectTextOnFocus
                  returnKeyType="done"
                  onSubmitEditing={save}
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
                  onSubmitEditing={save}
                />
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={save}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                (pressed || !canSave) && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>Guardar</Text>
            </Pressable>
          </View>
        </>
      )}
    </CenteredDialog>
  );
}

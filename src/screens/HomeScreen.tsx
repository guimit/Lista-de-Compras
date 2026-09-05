import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddItemInput from '../components/AddItemInput';
import CartSummary from '../components/CartSummary';
import CheckoutModal from '../components/CheckoutModal';
import EditItemModal, { EditItemUpdates } from '../components/EditItemModal';
import ItemRow from '../components/ItemRow';
import { useShoppingList } from '../hooks/useShoppingList';
import { FOLD_BREAKPOINT, colors, spacing, typography } from '../theme';
import { RootStackParamList, ShoppingItem } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isUnfolded = width >= FOLD_BREAKPOINT;
  const insets = useSafeAreaInsets();
  const list = useShoppingList();
  const [checkoutItem, setCheckoutItem] = useState<ShoppingItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('History')} hitSlop={8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Histórico</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const handlePress = useCallback(
    (item: ShoppingItem) => {
      if (item.checked) list.uncheckItem(item.id);
      else setCheckoutItem(item);
    },
    [list.uncheckItem],
  );

  const handleConfirm = (id: string, price: number, quantity: number) => {
    list.checkItem(id, price, quantity);
    setCheckoutItem(null);
  };

  const handleSaveEdit = (id: string, updates: EditItemUpdates) => {
    list.editItem(id, updates);
    setEditingItem(null);
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <ItemRow item={item} onPress={handlePress} onDelete={list.removeItem} onEdit={setEditingItem} />
  );
  const keyExtractor = (item: ShoppingItem) => item.id;

  const input = <AddItemInput onAdd={list.addItem} getSuggestions={list.getSuggestions} />;
  const summary = (
    <CartSummary
      total={list.total}
      itemCount={list.checkedCount}
      onNewList={list.clearList}
      bottomInset={insets.bottom}
    />
  );
  const modal = <CheckoutModal item={checkoutItem} onConfirm={handleConfirm} onCancel={() => setCheckoutItem(null)} />;
  const editModal = (
    <EditItemModal item={editingItem} onSave={handleSaveEdit} onCancel={() => setEditingItem(null)} />
  );

  if (!list.loaded) return <View style={styles.screen} />;

  if (isUnfolded) {
    return (
      <View style={[styles.screen, styles.split]}>
        <View style={styles.leftColumn}>
          {input}
          <FlatList
            data={list.unchecked}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<EmptyHint text="Lista vazia. Adiciona itens acima." />}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
          />
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.rightColumn}>
          <Text style={styles.columnTitle}>Comprados</Text>
          <FlatList
            data={list.checked}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={<EmptyHint text="Toca num item para o marcar como comprado." />}
          />
          {summary}
        </View>
        {modal}
        {editModal}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        {input}
        <FlatList
          data={[...list.unchecked, ...list.checked]}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<EmptyHint text="Lista vazia. Adiciona itens acima." />}
        />
        {summary}
      </KeyboardAvoidingView>
      {modal}
      {editModal}
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flexFill: { flex: 1 },
  split: { flexDirection: 'row' },
  leftColumn: { flex: 45 },
  rightColumn: { flex: 55 },
  dividerLine: { width: 1, backgroundColor: colors.divider },
  columnTitle: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerButton: { paddingHorizontal: spacing.sm },
  headerButtonText: { ...typography.item, color: colors.primary },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.meta, textAlign: 'center' },
});

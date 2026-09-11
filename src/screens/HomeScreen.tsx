import { Ionicons } from '@expo/vector-icons';
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
import MercadoModal from '../components/MercadoModal';
import NovaListaModal from '../components/NovaListaModal';
import TabBar from '../components/TabBar';
import { useListas } from '../hooks/useListas';
import { useShoppingList } from '../hooks/useShoppingList';
import { FOLD_BREAKPOINT, colors, spacing, typography } from '../theme';
import { Mercado, RootStackParamList, ShoppingItem } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isUnfolded = width >= FOLD_BREAKPOINT;
  const insets = useSafeAreaInsets();
  const list = useShoppingList();
  const { listas, listaAtivaId, listaAtiva, setListaAtiva, criarLista, apagarLista } = useListas();
  const [checkoutItem, setCheckoutItem] = useState<ShoppingItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [mercadoOpen, setMercadoOpen] = useState(false);
  const [novaListaOpen, setNovaListaOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate('History')}
            hitSlop={8}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Frequentes</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Historico')}
            hitSlop={8}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Histórico de compras"
          >
            <Ionicons name="time-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
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

  const handleConcluir = (mercado: Mercado) => {
    list.concluirCompra(mercado);
    setMercadoOpen(false);
  };

  const handleConcluirPress = () => {
    if (listaAtiva.lojas.length === 1) {
      list.concluirCompra(listaAtiva.lojas[0]);
    } else {
      setMercadoOpen(true);
    }
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <ItemRow item={item} onPress={handlePress} onDelete={list.removeItem} onEdit={setEditingItem} />
  );
  const keyExtractor = (item: ShoppingItem) => item.id;

  const input = <AddItemInput onAdd={list.addItem} getSuggestions={list.getSuggestions} />;
  const tabBar = (
    <TabBar
      listas={listas}
      listaAtiva={listaAtivaId}
      onSelect={setListaAtiva}
      onNova={() => setNovaListaOpen(true)}
      onApagar={apagarLista}
    />
  );
  const summary = (
    <CartSummary
      total={list.total}
      itemCount={list.checkedCount}
      onNewList={list.clearList}
      onConcluir={handleConcluirPress}
      canConcluir={list.checked.length > 0}
      bottomInset={insets.bottom}
    />
  );
  const modal = <CheckoutModal item={checkoutItem} onConfirm={handleConfirm} onCancel={() => setCheckoutItem(null)} />;
  const editModal = (
    <EditItemModal item={editingItem} onSave={handleSaveEdit} onCancel={() => setEditingItem(null)} />
  );
  const mercadoModal = (
    <MercadoModal
      visible={mercadoOpen}
      lojas={listaAtiva.lojas}
      onConfirm={handleConcluir}
      onDismiss={() => setMercadoOpen(false)}
    />
  );
  const novaListaModal = (
    <NovaListaModal
      visible={novaListaOpen}
      listas={listas}
      onCriar={criarLista}
      onDismiss={() => setNovaListaOpen(false)}
    />
  );

  if (!list.loaded) return <View style={styles.screen} />;

  if (isUnfolded) {
    return (
      <View style={[styles.screen, styles.split]}>
        <View style={styles.leftColumn}>
          {tabBar}
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
        {mercadoModal}
        {novaListaModal}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {tabBar}
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
      {mercadoModal}
      {novaListaModal}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerButton: { paddingHorizontal: spacing.sm },
  headerButtonText: { ...typography.item, color: colors.primary },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.meta, textAlign: 'center' },
});

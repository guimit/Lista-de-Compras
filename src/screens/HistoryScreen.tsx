import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistorico } from '../hooks/useHistorico';
import { useShoppingList } from '../hooks/useShoppingList';
import { colors, formatEuro, sizes, spacing, typography } from '../theme';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { history, items, addItem } = useShoppingList();
  const { loaded: precosLoaded, getPrecoStats } = useHistorico();
  const inList = new Set(items.map((item) => item.name.toLowerCase()));
  const data = [...history].reverse();

  const add = (name: string) => {
    addItem(name);
    navigation.goBack();
  };

  return (
    <FlatList
      style={styles.screen}
      data={data}
      keyExtractor={(name) => name}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      ListHeaderComponent={
        data.length > 0 ? <Text style={styles.hint}>Toca num item para o adicionar à lista.</Text> : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ainda sem histórico. Marca itens como comprados para aparecerem aqui.</Text>
        </View>
      }
      renderItem={({ item: name }) => {
        const alreadyInList = inList.has(name.toLowerCase());
        const stats = precosLoaded ? getPrecoStats(name) : null;
        return (
          <Pressable
            onPress={() => add(name)}
            disabled={alreadyInList}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.info}>
              <Text style={[styles.name, alreadyInList && styles.nameDim]}>{name}</Text>
              {stats && <Text style={styles.price}>Preço médio: {formatEuro(stats.geral)}</Text>}
            </View>
            <Text style={styles.action}>{alreadyInList ? 'Na lista' : '+ Adicionar'}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hint: { ...typography.meta, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: sizes.rowMinHeight,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: { backgroundColor: colors.surface },
  info: { flex: 1, paddingVertical: spacing.sm, marginRight: spacing.sm },
  name: { ...typography.item, color: colors.text },
  nameDim: { color: colors.textSecondary },
  price: { ...typography.meta, marginTop: 2 },
  action: { ...typography.meta, color: colors.accent, fontWeight: '500' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.meta, textAlign: 'center' },
});

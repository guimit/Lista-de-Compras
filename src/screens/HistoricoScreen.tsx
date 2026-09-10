import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistorico } from '../hooks/useHistorico';
import { colors, formatData, formatEuro, sizes, spacing, typography } from '../theme';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Historico'>;

export default function HistoricoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { loaded, compras } = useHistorico();
  const data = useMemo(() => [...compras].sort((a, b) => b.data - a.data), [compras]);

  if (!loaded) return <View style={styles.screen} />;

  return (
    <FlatList
      style={styles.screen}
      data={data}
      keyExtractor={(compra) => compra.id}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ainda não concluíste nenhuma compra.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const n = item.itens.length;
        return (
          <Pressable
            onPress={() => navigation.navigate('DetalheCompra', { compraId: item.id })}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.body}>
              <Text style={styles.title}>
                {item.mercado} — {formatData(item.data)}
              </Text>
              <Text style={styles.meta}>{n === 1 ? '1 item' : `${n} itens`}</Text>
            </View>
            <Text style={styles.amount}>{formatEuro(item.total)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.rowMinHeight,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: { backgroundColor: colors.surface },
  body: { flex: 1 },
  title: { ...typography.item, color: colors.text },
  meta: { ...typography.meta, marginTop: 2 },
  amount: { ...typography.item, color: colors.accent, fontWeight: '700' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.meta, textAlign: 'center' },
});

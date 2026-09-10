import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistorico } from '../hooks/useHistorico';
import { colors, formatData, formatEuro, sizes, spacing, typography } from '../theme';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'DetalheCompra'>;

export default function DetalheCompraScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { compraId } = route.params;
  const { loaded, getCompra } = useHistorico();
  const compra = getCompra(compraId);

  useLayoutEffect(() => {
    if (compra) {
      navigation.setOptions({ title: `${compra.mercado} — ${formatData(compra.data)}` });
    }
  }, [navigation, compra]);

  if (!loaded) return <View style={styles.screen} />;

  if (!compra) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Compra não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={compra.itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        renderItem={({ item }) => {
          const linha = (item.price ?? 0) * (item.quantity ?? 0);
          return (
            <View style={styles.row}>
              <Ionicons name="checkmark" size={18} color={colors.accent} style={styles.check} />
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.qty}>{item.quantity ?? 0}x</Text>
              <Text style={styles.linePrice}>{formatEuro(linha)}</Text>
            </View>
          );
        }}
      />
      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <Text style={styles.footerTotal}>
          Total: <Text style={styles.footerAmount}>{formatEuro(compra.total)}</Text>
        </Text>
      </View>
    </View>
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
  check: { marginRight: spacing.xs },
  name: { ...typography.item, color: colors.text, flex: 1 },
  qty: { ...typography.meta },
  linePrice: { ...typography.item, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  footerTotal: { ...typography.total, color: colors.text },
  footerAmount: { color: colors.accent },
  empty: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.meta, textAlign: 'center' },
});

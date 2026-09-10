import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useHistorico } from '../hooks/useHistorico';
import { colors, formatEuro, spacing } from '../theme';

interface Props {
  name: string;
}

export default function PrecoSugestao({ name }: Props) {
  const { loaded, getPrecoStats } = useHistorico();
  const stats = useMemo(
    () => (loaded ? getPrecoStats(name) : null),
    [loaded, name, getPrecoStats],
  );

  if (!stats) return null;

  const partes = [
    `Geral: ${formatEuro(stats.geral)}`,
    ...stats.mercados.map((m) => `${m.mercado}: ${formatEuro(m.media)}`),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Preço médio:  {partes.join('  |  ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  text: { fontSize: 13, color: colors.textSecondary },
});

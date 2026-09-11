import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Lista } from '../types';

interface TabBarProps {
  listas: Lista[];
  listaAtiva: string;
  onSelect: (id: string) => void;
  onNova: () => void;
  onApagar: (id: string) => void;
}

export default function TabBar({ listas, listaAtiva, onSelect, onNova, onApagar }: TabBarProps) {
  const confirmarApagar = (lista: Lista) => {
    if (listas.length <= 1) return;
    Alert.alert(
      'Apagar lista',
      `Apagar lista '${lista.nome}'? Todos os itens e histórico serão apagados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => onApagar(lista.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {listas.map((lista) => {
          const ativa = lista.id === listaAtiva;
          return (
            <Pressable
              key={lista.id}
              onPress={() => onSelect(lista.id)}
              onLongPress={listas.length > 1 ? () => confirmarApagar(lista) : undefined}
              style={[styles.tab, ativa && styles.tabAtiva]}
            >
              <Text style={[styles.tabText, ativa && styles.tabTextAtiva]}>{lista.nome}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={onNova}
          hitSlop={8}
          style={styles.novaButton}
          accessibilityRole="button"
          accessibilityLabel="Nova lista"
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scrollContent: { flexDirection: 'row', alignItems: 'center' },
  tab: {
    paddingHorizontal: spacing.lg,
    height: 44,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabAtiva: { borderBottomColor: colors.action },
  tabText: { ...typography.item, fontSize: 14, color: colors.textSecondary },
  tabTextAtiva: { color: colors.text },
  novaButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, sizes, spacing, typography } from '../theme';
import { Lista } from '../types';
import CenteredDialog from './CenteredDialog';
import { dialogFormStyles as styles } from './dialogFormStyles';

const NOME_MIN = 2;
const NOME_MAX = 20;
const LOJA_MIN = 2;
const LOJA_MAX = 30;

interface Props {
  visible: boolean;
  listas: Lista[];
  onCriar: (nome: string, lojas: string[]) => Promise<void>;
  onDismiss: () => void;
}

export default function NovaListaModal({ visible, listas, onCriar, onDismiss }: Props) {
  const [step, setStep] = useState<'nome' | 'lojas'>('nome');
  const [nome, setNome] = useState('');
  const [lojaInput, setLojaInput] = useState('');
  const [lojas, setLojas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep('nome');
      setNome('');
      setLojaInput('');
      setLojas([]);
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const nomeTrim = nome.trim();
  const nomeValido = nomeTrim.length >= NOME_MIN && nomeTrim.length <= NOME_MAX;
  const nomeDuplicado = listas.some((l) => l.nome.trim().toLowerCase() === nomeTrim.toLowerCase());
  const canAvancar = nomeValido && !nomeDuplicado;

  const lojaInputTrim = lojaInput.trim();
  const lojaInputValida =
    lojaInputTrim.length >= LOJA_MIN &&
    lojaInputTrim.length <= LOJA_MAX &&
    !lojas.some((l) => l.toLowerCase() === lojaInputTrim.toLowerCase());
  const canCriar = lojas.length >= 1 && !submitting;

  const adicionarLoja = () => {
    if (!lojaInputValida) return;
    setLojas((prev) => [...prev, lojaInputTrim]);
    setLojaInput('');
  };

  const removerLoja = (loja: string) => {
    setLojas((prev) => prev.filter((l) => l !== loja));
  };

  const criar = () => {
    if (!canCriar) return;
    setSubmitting(true);
    setError(null);
    onCriar(nomeTrim, lojas)
      .then(onDismiss)
      .catch((e: Error) => setError(e.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <CenteredDialog visible={visible} onDismiss={onDismiss}>
      {step === 'nome' ? (
        <>
          <Text style={styles.title}>Nova lista</Text>
          <View style={styles.fieldSpaced}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: Farmácia"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => canAvancar && setStep('lojas')}
            />
            {nome.length > 0 && !nomeValido && (
              <Text style={ownStyles.errorText}>Nome deve ter 2-20 caracteres</Text>
            )}
            {nomeValido && nomeDuplicado && (
              <Text style={ownStyles.errorText}>Já existe uma lista com este nome</Text>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => canAvancar && setStep('lojas')}
              disabled={!canAvancar}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                (pressed || !canAvancar) && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>Seguinte</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Lojas de "{nomeTrim}"</Text>

          <View style={ownStyles.addRow}>
            <TextInput
              style={[styles.input, ownStyles.addInput]}
              value={lojaInput}
              onChangeText={setLojaInput}
              placeholder="Nome da loja"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={adicionarLoja}
            />
            <Pressable
              onPress={adicionarLoja}
              disabled={!lojaInputValida}
              style={({ pressed }) => [
                ownStyles.addButton,
                (pressed || !lojaInputValida) && styles.pressed,
              ]}
            >
              <Ionicons name="add" size={22} color={colors.onPrimary} />
            </Pressable>
          </View>
          {lojaInput.length > 0 && !lojaInputValida && (
            <Text style={ownStyles.errorText}>Nome da loja deve ter 2-30 caracteres</Text>
          )}

          <View style={ownStyles.lojasList}>
            {lojas.map((loja) => (
              <View key={loja} style={ownStyles.lojaRow}>
                <Text style={ownStyles.lojaNome}>{loja}</Text>
                <Pressable onPress={() => removerLoja(loja)} hitSlop={8}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>

          {error && <Text style={ownStyles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable
              onPress={() => setStep('nome')}
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Voltar</Text>
            </Pressable>
            <Pressable
              onPress={criar}
              disabled={!canCriar}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                (pressed || !canCriar) && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>Criar lista</Text>
            </Pressable>
          </View>
        </>
      )}
    </CenteredDialog>
  );
}

const ownStyles = StyleSheet.create({
  errorText: { ...typography.meta, color: colors.danger, marginTop: spacing.xs },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addInput: { flex: 1 },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: sizes.radius,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lojasList: { marginTop: spacing.md, gap: spacing.xs },
  lojaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: sizes.radius,
    backgroundColor: colors.surface,
  },
  lojaNome: { ...typography.item, color: colors.text },
});

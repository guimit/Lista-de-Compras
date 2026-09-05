import React, { useEffect } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

// Base partilhada por todos os diálogos centrados da app (checkout, edição, …).
//
// Nota: propositalmente não usamos o componente <Modal> nativo aqui. No Android, o Modal
// abre numa janela separada que não acompanha o redimensionamento do teclado (diferente do
// resto do ecrã, que já funciona bem com o windowSoftInputMode padrão do Expo). Renderizar
// como uma sobreposição normal dentro do próprio ecrã evita esse problema. O diálogo fica
// centrado (em vez de colado ao fundo) e o KeyboardAvoidingView usa "height" também no
// Android, para garantir que ele sobe acima do teclado mesmo que a janela não redimensione.
export default function CenteredDialog({ visible, onDismiss, children }: Props) {
  useEffect(() => {
    if (!visible) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        style={styles.backdropContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={styles.sheet}>{children}</View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, elevation: 10, zIndex: 10 },
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.xl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
  },
});

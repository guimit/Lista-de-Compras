import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, sizes, spacing, typography } from '../theme';

interface Props {
  onAdd: (name: string) => void;
  getSuggestions: (query: string) => string[];
}

export default function AddItemInput({ onAdd, getSuggestions }: Props) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const suggestions = focused ? getSuggestions(text) : [];

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  const pickSuggestion = (name: string) => {
    setText(name);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Adicionar item…"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          submitBehavior="submit"
          autoCapitalize="sentences"
          autoCorrect={false}
        />
        <Pressable
          onPress={submit}
          disabled={!text.trim()}
          style={({ pressed }) => [styles.addButton, (pressed || !text.trim()) && styles.addButtonDim]}
          accessibilityLabel="Adicionar"
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((name) => (
            <Pressable
              key={name}
              onPress={() => pickSuggestion(name)}
              style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: typography.item.fontSize,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: sizes.radius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDim: { opacity: 0.4 },
  addButtonText: { color: colors.onPrimary, fontSize: 26, lineHeight: 28, fontWeight: '500' },
  suggestions: {
    marginTop: spacing.sm,
    borderRadius: sizes.radius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  suggestionPressed: { backgroundColor: colors.divider },
  suggestionText: { ...typography.item, color: colors.text },
});

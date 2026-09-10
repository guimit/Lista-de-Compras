import { TextStyle } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  primary: '#1A1A2E',
  accent: '#4CAF50',
  action: '#FF6B2B',
  text: '#1A1A1A',
  textSecondary: '#757575',
  strike: '#BDBDBD',
  divider: '#E0E0E0',
  danger: '#E53935',
  onPrimary: '#FFFFFF',
} as const;

export const typography = {
  item: { fontSize: 16, fontWeight: '500' } satisfies TextStyle,
  meta: { fontSize: 14, fontWeight: '400', color: colors.textSecondary } satisfies TextStyle,
  total: { fontSize: 20, fontWeight: '700' } satisfies TextStyle,
  label: { fontSize: 13, fontWeight: '500', color: colors.textSecondary } satisfies TextStyle,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const sizes = {
  rowMinHeight: 64,
  radius: 12,
  checkbox: 24,
} as const;

// Largura (dp) a partir da qual consideramos o Fold aberto (ecrã interior).
export const FOLD_BREAKPOINT = 600;

export function formatEuro(value: number): string {
  return `€${value.toFixed(2).replace('.', ',')}`;
}

// Formatação manual (à semelhança de formatEuro) para evitar as abreviaturas de mês
// inconsistentes do Intl/Hermes no Android. Resultado: "05 Set 2026".
const MESES_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

export function formatData(ts: number): string {
  const d = new Date(ts);
  const dia = String(d.getDate()).padStart(2, '0');
  return `${dia} ${MESES_PT[d.getMonth()]} ${d.getFullYear()}`;
}

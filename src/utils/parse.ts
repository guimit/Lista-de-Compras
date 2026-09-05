export function parsePrice(raw: string): number | null {
  const value = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function parseQuantity(raw: string): number | null {
  const value = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

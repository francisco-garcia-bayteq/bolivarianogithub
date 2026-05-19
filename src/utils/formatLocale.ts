/**
 * Fecha corta es-EC para strings ISO (con o sin hora).
 */
export function formatIsoDateShortEsEc(iso: string): string {
  const normalized = iso.includes('T') ? iso : `${iso}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPercentEsMx(
  value: number,
  maximumFractionDigits: 1 | 2,
): string {
  return `${value.toLocaleString('es-MX', {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  })}%`;
}

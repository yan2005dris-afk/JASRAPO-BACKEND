export const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const UNITS = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
  'treinta',
  'treinta y uno',
];

const TENS = [
  '',
  '',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

const HUNDREDS = [
  '',
  'cien',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
];

export function numberToWords(n: number): string {
  if (n === 0) return 'cero';
  if (n < 0) return 'menos ' + numberToWords(-n);
  if (n <= 31) return UNITS[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    return unit === 0 ? TENS[tens] : TENS[tens] + ' y ' + UNITS[unit];
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    if (remainder === 0) return HUNDREDS[hundreds];
    return (
      (hundreds === 1 ? 'ciento' : HUNDREDS[hundreds]) +
      ' ' +
      numberToWords(remainder)
    );
  }
  if (n < 2000)
    return `mil${n % 1000 === 0 ? '' : ' ' + numberToWords(n % 1000)}`;
  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;
  const prefix = numberToWords(thousands) + ' mil';
  return remainder === 0 ? prefix : prefix + ' ' + numberToWords(remainder);
}

export function formatDateInWords(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getUTCDate();
  const month = MONTHS_ES[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const dayWords = UNITS[day] ?? numberToWords(day);
  const yearWords = numberToWords(year);
  return `${dayWords} días del mes de ${month} del ${yearWords}`;
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

export function formatMonthYear(isoDate: string): string {
  const d = new Date(isoDate);
  return `${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function formatCurrency(value: number): string {
  return value.toFixed(2);
}

export function currentDateLabel(): string {
  return new Date().toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function resolveClientName(cliente: {
  razonSocial?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
}): string {
  return cliente.razonSocial
    ? cliente.razonSocial
    : `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim();
}

export function buildRangoFechas(
  desde: string | null,
  hasta: string | null,
  fallback = 'Todos los registros',
): string {
  if (!desde && !hasta) return fallback;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  if (desde && hasta) return `Del ${fmt(desde)} al ${fmt(hasta)}`;
  if (desde) return `Desde ${fmt(desde)}`;
  return `Hasta ${fmt(hasta!)}`;
}

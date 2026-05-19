import type {FrequentPayment} from '../../domain/entities/ContractBalance';

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    const cp = s.codePointAt(i) ?? 0;
    h = (h * 31 + cp) % 2147483647;
  }
  return Math.abs(h);
}

export interface HistoryChartPoint {
  monthLabel: string;
  amountLabel: string;
  /** Valor numérico para posicionar en el gráfico. */
  value: number;
}

export interface RecentFrequentActivityRow {
  day: string;
  monthLabel: string;
  amountLabel: string;
  referenceLabel: string;
}

export interface FrequentPaymentScreenMock {
  beneficiaryDisplayName: string;
  serviceProvider: string;
  identifierLine: string;
  ciLine: string;
  nextPaymentLine: string;
  historyTitle: string;
  chartPoints: HistoryChartPoint[];
  recentActivities: RecentFrequentActivityRow[];
}

/**
 * Datos de detalle, historial y actividades: mock determinista a partir del ítem
 * seleccionado (nombre + tipo de beneficiario).
 */
export function getFrequentPaymentScreenMock(
  selected: FrequentPayment,
): FrequentPaymentScreenMock {
  const h = hash(`${selected.beneficiaryName}|${selected.beneficiaryType}`);
  const ref = 40000 + (h % 50000);

  return {
    beneficiaryDisplayName: 'Cristian Santiago Ramos Grefa',
    serviceProvider: 'EMMAPS',
    identifierLine: `Identificador Nº ${ref}`,
    ciLine: `CI. ${1700000000 + (h % 100000000)}`,
    nextPaymentLine: 'Próximo pago hasta el 12 may 2026',
    historyTitle: 'Historial',
    chartPoints: [
      {monthLabel: 'Ene', amountLabel: '$33.00', value: 33},
      {monthLabel: 'Feb', amountLabel: '$35.80', value: 35.8},
      {monthLabel: 'Mar', amountLabel: '$59.80', value: 59.8},
    ],
    recentActivities: [
      {
        day: '20',
        monthLabel: 'FEB',
        amountLabel: '-$91.02',
        referenceLabel: `Nº Referencia ${ref}`,
      },
      {
        day: '20',
        monthLabel: 'ENE',
        amountLabel: '-$116.87',
        referenceLabel: `Nº Referencia ${ref}`,
      },
      {
        day: '20',
        monthLabel: 'DIC',
        amountLabel: '-$91.02',
        referenceLabel: `Nº Referencia ${ref}`,
      },
      {
        day: '20',
        monthLabel: 'NOV',
        amountLabel: '-$91.02',
        referenceLabel: `Nº Referencia ${ref}`,
      },
    ],
  };
}

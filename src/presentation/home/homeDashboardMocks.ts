import type {FrequentPayment, HomeBanner} from '../../domain/entities/ContractBalance';

/** Datos de ejemplo cuando el API aún no envía banners. */
export const FALLBACK_HOME_BANNERS: HomeBanner[] = [
  {
    text: 'Tienes un préstamo\npreaprobado de **$15,000**',
    buttonText: 'Ver más',
    buttonLink: '',
    landscape: 'car',
  },
];

/** Datos de ejemplo cuando el API aún no envía iconos del dashboard. */
export const FALLBACK_HOME_FREQUENT_PAYMENTS: FrequentPayment[] = [
  {beneficiaryName: 'Agua casa', beneficiaryType: 'water'},
  {beneficiaryName: 'Pago luz', beneficiaryType: 'bulb'},
  {beneficiaryName: 'Jannet Ruiz', beneficiaryType: 'user'},
  {beneficiaryName: 'Centro Educativo', beneficiaryType: 'school'},
];

export interface UpcomingPaymentsSummary {
  summaryLine: string;
  linkLabel: string;
  amountLabel: string;
}

export const MOCK_UPCOMING_PAYMENTS_SUMMARY: UpcomingPaymentsSummary = {
  summaryLine: '3 pagos próximos',
  linkLabel: 'Ver pagos',
  amountLabel: '$47.50',
};

export interface RecentActivityItem {
  /** Presente cuando el ítem viene de `recentTransactions` (API). */
  id?: string;
  day: string;
  monthLabel: string;
  description: string;
  amountLabel: string;
}

/** Ejemplo de UI cuando el API aún no devuelve `recentTransactions`. */
export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    day: '12',
    monthLabel: 'ABR',
    description: 'Transferencia a María López',
    amountLabel: '$120.00',
  },
  {
    day: '10',
    monthLabel: 'ABR',
    description: 'Pago de servicios',
    amountLabel: '$45.50',
  },
  {
    day: '08',
    monthLabel: 'ABR',
    description: 'Depósito ATM',
    amountLabel: '$200.00',
  },
];


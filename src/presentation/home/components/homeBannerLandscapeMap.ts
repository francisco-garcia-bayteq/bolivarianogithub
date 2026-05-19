import type {ImageSourcePropType} from 'react-native';

/**
 * Valores de `landscape` en `home.banners[]` que apuntan a assets locales.
 * El API puede enviar el nombre sin extensión (p. ej. `car`) o `car.png`.
 * Si es `https://...`, se usa como imagen remota.
 */
const CAR = require('../../../../assets/images/home_banner/car.png');
const HOUSE = require('../../../../assets/images/home_banner/house.png');
const SURE = require('../../../../assets/images/home_banner/sure.png');
const CASHBACK = require('../../../../assets/images/home_banner/cashback.png');
const CARDCREDIT = require('../../../../assets/images/home_banner/cardcredit.png');

const LANDSCAPE_BY_CODE: Record<string, ImageSourcePropType> = {
  car: CAR,
  house: HOUSE,
  sure: SURE,
  cashback: CASHBACK,
  cardcredit: CARDCREDIT,
};

export type ResolvedBannerLandscape =
  | {kind: 'remote'; uri: string}
  | {kind: 'local'; source: ImageSourcePropType}
  | {kind: 'none'};

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function resolveBannerLandscape(landscape: string): ResolvedBannerLandscape {
  const raw = landscape.trim();
  if (!raw) {
    return {kind: 'none'};
  }
  if (isHttpUrl(raw)) {
    return {kind: 'remote', uri: raw};
  }
  const key = raw.toLowerCase().replace(/\.png$/i, '');
  const source = LANDSCAPE_BY_CODE[key];
  if (source) {
    return {kind: 'local', source};
  }
  return {kind: 'none'};
}

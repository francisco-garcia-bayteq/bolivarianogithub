import React from 'react';
import {Image, type ImageSourcePropType} from 'react-native';

/** Códigos que envía el API en `homeDashboardIcons[].iconCode` → asset en `assets/images/frequent_payments/`. */
const BANK = require('../../../../assets/images/frequent_payments/bank.png');
const USER = require('../../../../assets/images/frequent_payments/user.png');
const BULB = require('../../../../assets/images/frequent_payments/bulb.png');
const PHONE = require('../../../../assets/images/frequent_payments/phone.png');
const SCHOOL = require('../../../../assets/images/frequent_payments/school.png');
const WATER = require('../../../../assets/images/frequent_payments/water.png');

const ICON_BY_CODE: Record<string, ImageSourcePropType> = {
  bank: BANK,
  user: USER,
  bulb: BULB,
  phone: PHONE,
  school: SCHOOL,
  water: WATER,
};

/** Alias por compatibilidad con códigos antiguos. */
const ALIAS_TO_CODE: Record<string, keyof typeof ICON_BY_CODE> = {
  person: 'user',
  lightbulb: 'bulb',
};

const DEFAULT_CODE: keyof typeof ICON_BY_CODE = 'user';

export function resolveHomeDashboardIconSource(
  iconCode: string,
): ImageSourcePropType {
  const raw = iconCode.trim().toLowerCase();
  const direct = ICON_BY_CODE[raw];
  if (direct) {
    return direct;
  }
  const aliased = ALIAS_TO_CODE[raw];
  if (aliased) {
    return ICON_BY_CODE[aliased];
  }
  return ICON_BY_CODE[DEFAULT_CODE];
}

export function renderHomeDashboardIcon(
  iconCode: string,
  _color: string,
  size: number,
): React.ReactNode {
  const source = resolveHomeDashboardIconSource(iconCode);
  return (
    <Image
      source={source}
      style={{width: size, height: size}}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

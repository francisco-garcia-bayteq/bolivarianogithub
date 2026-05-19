import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';

const ARROW_RIGHT_BLACK = require('../../../../assets/images/arrow_right_black.png');
const BANK_PNG = require('../../../../assets/images/frequent_payments/bank.png');

type IconProps = {color: string; size?: number};

export function BellIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512">
      <Path
        fill={color}
        d="M224 0c-17.7 0-32 14.3-32 32v19.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416h384c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H160c0 17 6.7 33.3 18.7 45.3S206.1 512 224 512s33.3-6.7 45.3-18.7z"
      />
    </Svg>
  );
}

export function LogoutIcon({color, size = 20}: Readonly<Readonly<IconProps>>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <G transform="scale(-1,1) translate(-512,0)">
        <Path
          fill={color}
          d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
        />
      </G>
    </Svg>
  );
}

export function UserAvatarIcon({color, size = 16}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512">
      <Path
        fill={color}
        d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
      />
    </Svg>
  );
}

export function TransferArrowsIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path
        fill={color}
        d="M438.6 150.6c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 96 32 96C14.3 96 0 110.3 0 128s14.3 32 32 32l306.7 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96zm-381.2 256l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L157.3 416 480 416c17.7 0 32-14.3 32-32s-14.3-32-32-32l-322.7 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3z"
      />
    </Svg>
  );
}

export function LightbulbServiceIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 384 512">
      <Path
        fill={color}
        d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80H112c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"
      />
    </Svg>
  );
}

export function QrCodeIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512">
      <Path
        fill={color}
        d="M0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM64 96v64h64V96H64zM0 336c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V336zm64 16v64h64V352H64zM304 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48zm16 64v64h64V96H320zM256 304c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H320v32h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H320v32h96c8.8 0 16 7.2 16 16s-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V304z"
      />
    </Svg>
  );
}

export function CalendarIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19 20">
      <Path
        fill={color}
        d="M7.58698 3.21031V4.1121H11.1941V3.21031C11.1941 2.71236 11.5971 2.30853 12.0959 2.30853C12.5947 2.30853 12.9977 2.71236 12.9977 3.21031V4.1121H14.3503C15.0971 4.1121 15.703 4.7177 15.703 5.46477V6.81744H3.07806V5.46477C3.07806 4.7177 3.68367 4.1121 4.43074 4.1121H5.78341V3.21031C5.78341 2.71236 6.18639 2.30853 6.68519 2.30853C7.18399 2.30853 7.58698 2.71236 7.58698 3.21031ZM3.07806 7.71923H15.703V15.3844C15.703 16.1312 15.0971 16.737 14.3503 16.737H4.43074C3.68367 16.737 3.07806 16.1312 3.07806 15.3844V7.71923ZM5.33252 9.52279C5.0834 9.52279 4.88163 9.72569 4.88163 9.97368V11.7772C4.88163 12.0252 5.0834 12.2281 5.33252 12.2281H13.4486C13.6965 12.2281 13.8995 12.0252 13.8995 11.7772V9.97368C13.8995 9.72569 13.6965 9.52279 13.4486 9.52279H5.33252Z"
      />
    </Svg>
  );
}

export function ChevronRightIcon({color, size = 16}: Readonly<IconProps>) {
  return (
    <Image
      source={ARROW_RIGHT_BLACK}

    
      accessibilityIgnoresInvertColors
    />
  );
}

/**
 * Círculo con fondo (`color`) e icono `bank.png`.
 * `size` es el diámetro del círculo (p. ej. 44).
 */
export function BankBuildingIcon({color, size = 44}: Readonly<IconProps>) {
  const inner = Math.round(size * 0.6);
  return (
    <View
      style={[
        bankBuildingStyles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}>
      <Image
        source={BANK_PNG}
        style={{width: inner, height: inner}}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const bankBuildingStyles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Tarjeta — resumen de pagos próximos. */
export function CreditCardOutlineIcon({color, size = 22}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
      />
    </Svg>
  );
}

/** Lista con viñetas — cabecera actividad reciente. */
export function ListBulletsIcon({color, size = 20}: Readonly<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zM8 7h12v2H8V7zm0 5h12v2H8v-2zm0 5h12v2H8v-2z"
      />
    </Svg>
  );
}

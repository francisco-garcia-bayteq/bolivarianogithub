import React from 'react';
import {Image, StyleSheet} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

const home = require('../../assets/images/house.png');
const transfer = require('../../assets/images/arrow-right-arrow-left.png');
const withdraw = require('../../assets/images/money-from-bracket.png');
const bulb = require('../../assets/images/lightbulb.png');

type TabIconProps = {
  color: string;
  size?: number;
};

export function TabHomeIcon({color, size = 24}: Readonly<TabIconProps>) {
  return (
    <Image
      source={home}
      style={[styles.icon, {width: size, height: size, tintColor: color}]}
      resizeMode="contain"
      accessibilityLabel="Inicio"
    />
  );
}

export function TabTransferIcon({color, size = 24}: Readonly<TabIconProps>) {
  return (
    <Image
      source={transfer}
      style={[styles.icon, {width: size, height: size, tintColor: color}]}
      resizeMode="contain"
      accessibilityLabel="Transferir"
    />
  );
}

/** Icono tipo cajero / retiro (silueta acorde al tab bar de la app). */
export function TabWithdrawIcon({color, size = 24}: Readonly<TabIconProps>) {
  return (
    <Image
      source={withdraw}
      style={[styles.icon, {width: size, height: size, tintColor: color}]}
      resizeMode="contain"
      accessibilityLabel="Transferir"
    />
  );
}

export function TabPaymentsIcon({color, size = 24}: Readonly<TabIconProps>) {
  return (
    <Image
      source={bulb}
      style={[styles.icon, {width: size, height: size, tintColor: color}]}
      resizeMode="contain"
      accessibilityLabel="Pagos"
    />
  );
}

export function TabOthersIcon({color, size = 24}: Readonly<TabIconProps>) {
  const cell = 7;
  const gap = 3;
  const o = (24 - cell * 2 - gap) / 2;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityRole="image"
      accessibilityLabel="Otros">
      <Rect x={o} y={o} width={cell} height={cell} rx={1.25} fill={color} />
      <Rect
        x={o + cell + gap}
        y={o}
        width={cell}
        height={cell}
        rx={1.25}
        fill={color}
      />
      <Rect
        x={o}
        y={o + cell + gap}
        width={cell}
        height={cell}
        rx={1.25}
        fill={color}
      />
      <Rect
        x={o + cell + gap}
        y={o + cell + gap}
        width={cell}
        height={cell}
        rx={1.25}
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});

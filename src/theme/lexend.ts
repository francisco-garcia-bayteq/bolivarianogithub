import {Platform} from 'react-native';

/**
 * Lexend after native linking (`assets/fonts` + `react-native.config.js`).
 * Android: nombre según el `.ttf` sin extensión (`react-native link` / autolinking).
 * iOS: debe ser el PostScript name dentro del TTF (no el nombre del archivo).
 * Verificado en assets: Regular → Lexend-Regular, SemiBold → Lexend-SemiBold, Bold → Lexend-Bold.
 */
export const Lexend = {
  regular: Platform.select({
    ios: 'Lexend-Regular',
    android: 'Lexend_400Regular',
    default: 'Lexend-Regular',
  }) as string,
  semiBold: Platform.select({
    ios: 'Lexend-SemiBold',
    android: 'Lexend_600SemiBold',
    default: 'Lexend-SemiBold',
  }) as string,
  bold: Platform.select({
    ios: 'Lexend-Bold',
    android: 'Lexend_700Bold',
    default: 'Lexend-Bold',
  }) as string,
};

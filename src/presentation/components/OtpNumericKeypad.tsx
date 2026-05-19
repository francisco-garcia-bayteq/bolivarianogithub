import React, {useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';

export type OtpKeypadKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'backspace';

type Cell = OtpKeypadKey | 'empty';

interface OtpNumericKeypadProps {
  onKeyPress: (key: OtpKeypadKey) => void;
  disabled?: boolean;
  deleteIconSource: ImageSourcePropType;
}

const KEY_SIZE = 58;
const KEY_RADIUS = 12;

/** Fila inferior: vacío | 0 | retroceso. */
const GRID: Cell[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['empty', '0', 'backspace'],
];

export function OtpNumericKeypad({
  onKeyPress,
  disabled = false,
  deleteIconSource,
}: Readonly<OtpNumericKeypadProps>) {
  const {colors} = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.wrap} accessibilityLabel="Teclado numérico">
      {GRID.map((row, rowIndex) => (
        <View key={`row-${rowIndex}-${row.join('')}`} style={styles.row}>
          {row.map((cell, colIndex) => {
            if (cell === 'empty') {
              return (
                <View
                  key={`e-${rowIndex}-${colIndex}`}
                  style={styles.cellSlot}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              );
            }
            if (cell === 'backspace') {
              return (
                <View key={`bs-${rowIndex}-${colIndex}`} style={styles.cellSlot}>
                  <TouchableOpacity
                    style={[styles.key, disabled && styles.keyDisabled]}
                    onPress={() => onKeyPress('backspace')}
                    disabled={disabled}
                    activeOpacity={0.75}
                    accessibilityLabel="Borrar"
                    accessibilityRole="button">
                    <Image
                      source={deleteIconSource}
                      style={[
                        styles.deleteIcon,
                        {tintColor: colors.iconPrimary},
                      ]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View key={cell} style={styles.cellSlot}>
                <TouchableOpacity
                  style={[styles.key, disabled && styles.keyDisabled]}
                  onPress={() => onKeyPress(cell)}
                  disabled={disabled}
                  activeOpacity={0.75}
                  accessibilityLabel={`Digito ${cell}`}
                  accessibilityRole="button">
                  <Text style={styles.digit}>{cell}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: '100%',
          maxWidth: 340,
          alignSelf: 'center',
          gap: 34,
        },
        row: {
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        cellSlot: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: KEY_SIZE,
        },
        key: {
          width: KEY_SIZE,
          height: KEY_SIZE,
          borderRadius: KEY_RADIUS,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.white,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.12,
          shadowRadius: 3,
          elevation: 2,
        },
        keyDisabled: {
          opacity: 0.5,
        },
        digit: {
          fontFamily: Lexend.bold,
          fontSize: 22,
          lineHeight: 28,
          color: colors.textPrimary,
        },
        deleteIcon: {
          width: 24,
          height: 24,
        },
      }),
    [colors],
  );
}

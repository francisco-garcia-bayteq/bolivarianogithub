import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CalendarList, LocaleConfig} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars';

type PeriodMarkedDates = Record<
  string,
  {
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
    textColor?: string;
  }
>;
import {useTheme, type ThemeColors} from '../../../providers/theme';
import {Lexend} from '../../../theme/lexend';
import {TransferIconClose, TransferIconCalendar} from '../../../features/transfer/presentation/components/transferIcons.tsx';
import type {AppliedDateRange} from '../useAccountMovementsViewModel';
import {
  localDateKey,
  parseLocalDateKey,
} from '../useAccountMovementsViewModel';

LocaleConfig.locales.es = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene.',
    'Feb.',
    'Mar.',
    'Abr.',
    'May.',
    'Jun.',
    'Jul.',
    'Ago.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dic.',
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

export type MovementsDateFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  initialRange: AppliedDateRange | null;
  onApply: (from: Date, to: Date) => void;
};

function buildMarkedDates(
  fromKey: string | null,
  toKey: string | null,
  colors: ThemeColors,
): PeriodMarkedDates {
  if (!fromKey) {
    return {};
  }
  if (!toKey) {
    return {
      [fromKey]: {
        startingDay: true,
        endingDay: true,
        color: colors.primary,
        textColor: colors.white,
      },
    };
  }
  const marked: PeriodMarkedDates = {};
  const start = parseLocalDateKey(fromKey);
  const end = parseLocalDateKey(toKey);
  const cur = new Date(start);
  while (cur <= end) {
    const key = localDateKey(cur);
    const isStart = key === fromKey;
    const isEnd = key === toKey;
    if (isStart || isEnd) {
      marked[key] = {
        startingDay: isStart,
        endingDay: isEnd,
        color: colors.primary,
        textColor: colors.white,
      };
    } else {
      marked[key] = {
        color: colors.primaryLight,
        textColor: colors.textPrimary,
      };
    }
    cur.setDate(cur.getDate() + 1);
  }
  return marked;
}

export function MovementsDateFilterModal({
  visible,
  onClose,
  initialRange,
  onApply,
}: Readonly<MovementsDateFilterModalProps>) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors);
  const [draft, setDraft] = useState<{
    from: string | null;
    to: string | null;
  }>({from: null, to: null});

  const initialKey = useMemo(
    () =>
      initialRange
        ? `${localDateKey(initialRange.from)}|${localDateKey(initialRange.to)}`
        : 'none',
    [initialRange],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (initialRange) {
      setDraft({
        from: localDateKey(initialRange.from),
        to: localDateKey(initialRange.to),
      });
    } else {
      setDraft({from: null, to: null});
    }
  }, [visible, initialKey, initialRange]);

  const markedDates = useMemo(
    () => buildMarkedDates(draft.from, draft.to, colors),
    [draft.from, draft.to, colors],
  );

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: colors.surface,
      backgroundColor: colors.surface,
      monthTextColor: colors.textSecondary,
      textMonthFontFamily: Lexend.semiBold,
      textMonthFontSize: 15,
      textSectionTitleColor: colors.textTertiary,
      textDayHeaderFontFamily: Lexend.regular,
      textDayFontFamily: Lexend.regular,
      textDayFontSize: 14,
      dayTextColor: colors.textPrimary,
      textDisabledColor: colors.textTertiary,
      textInactiveColor: colors.textTertiary,
      todayTextColor: colors.primary,
    }),
    [colors],
  );

  const handleDayPress = useCallback((day: DateData) => {
    const pressed = day.dateString;
    setDraft(prev => {
      if (!prev.from || (prev.from && prev.to)) {
        return {from: pressed, to: null};
      }
      if (pressed < prev.from) {
        return {from: pressed, to: prev.from};
      }
      return {from: prev.from, to: pressed};
    });
  }, []);

  const windowHeight = Dimensions.get('window').height;
  const listMaxHeight = Math.min(windowHeight * 0.48, 380);

  const currentMonth = useMemo(() => {
    const base = draft.from
      ? parseLocalDateKey(draft.from)
      : new Date();
    return localDateKey(
      new Date(base.getFullYear(), base.getMonth(), 1),
    );
  }, [draft.from]);

  const canApply = Boolean(draft.from && draft.to);

  const handleApply = useCallback(() => {
    if (!draft.from || !draft.to) {
      return;
    }
    onApply(parseLocalDateKey(draft.from), parseLocalDateKey(draft.to));
    onClose();
  }, [draft.from, draft.to, onApply, onClose]);

  return (
    <Modal
      testID="movements-date-filter-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <View
        style={[
          styles.root,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar filtro"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Filtro por fecha</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel="Cerrar">
              <TransferIconClose color={colors.iconPrimary} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Selecciona una fecha de inicio y fin
          </Text>

          <View style={[styles.calendarWrap, {maxHeight: listMaxHeight}]}>
            <CalendarList
              testID="movements-date-filter-calendar"
              current={currentMonth}
              horizontal={false}
              pagingEnabled={false}
              scrollEnabled
              nestedScrollEnabled
              pastScrollRange={24}
              futureScrollRange={12}
              markingType="period"
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={calendarTheme}
              firstDay={1}
              calendarHeight={listMaxHeight}
              showScrollIndicator
            />
          </View>

          <TouchableOpacity
            testID="movements-date-filter-apply"
            style={[styles.primaryBtn, !canApply && styles.primaryBtnDisabled]}
            onPress={handleApply}
            disabled={!canApply}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver movimientos">
            <Text style={styles.primaryBtnText}>Ver movimientos</Text>
            <TransferIconCalendar color={colors.white} size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          maxHeight: Dimensions.get('window').height * 0.92,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        headerSpacer: {width: 24},
        title: {
          fontFamily: Lexend.bold,
          fontSize: 17,
          color: colors.textPrimary,
          textAlign: 'center',
          flex: 1,
        },
        subtitle: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textTertiary,
          textAlign: 'left',
          marginBottom: 8,
        },
        calendarWrap: {
          marginHorizontal: -8,
          marginBottom: 16,
        },
        primaryBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          paddingHorizontal: 20,
        },
        primaryBtnDisabled: {
          opacity: 0.45,
        },
        primaryBtnText: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          color: colors.white,
        },
      }),
    [colors],
  );
}

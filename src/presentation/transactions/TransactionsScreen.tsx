import React, {useMemo, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, } from 'react-native-svg';
import type {MainTabParamList} from '../../navigation/MainTabNavigator';
import type {MovementsStackParamList} from '../../navigation/MovementsStackNavigator';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import type {AccountKind} from '../../domain/entities/ContractBalance';
import type {AccountMovement} from '../../domain/entities/AccountMovement';
import {useAccountMovementsViewModel} from './useAccountMovementsViewModel';
import {formatCurrency} from './TransactionItem';
import {MovementsDateFilterModal} from './components/MovementsDateFilterModal';
import {MovementsAmountFilterModal} from './components/MovementsAmountFilterModal';
import {MovementsTypeFilterModal} from './components/MovementsTypeFilterModal';
import {Button, EmptyState, ErrorMessage, DevelopmentNoticeModal} from '../components';

// ─── helpers ────────────────────────────────────────────────────────────────

function accountShortLabel(kind: AccountKind): string {
  if (kind === 'savings') return 'Ahorros';
  if (kind === 'checking') return 'Corriente';
  return 'Cuenta';
}

function accountKindText(kind: AccountKind): string {
  if (kind === 'savings') return 'ahorros';
  if (kind === 'checking') return 'corriente';
  return 'cuenta';
}

function monthAbbr(date: Date): string {
  return date
    .toLocaleDateString('es-EC', {month: 'short'})
    .toUpperCase()
    .replaceAll('.', '')
    .slice(0, 3);
}

// ─── SVG icons ───────────────────────────────────────────────────────────────

function BackIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      />
    </Svg>
  );
}

function ShareIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M15 3.18415C15 4.98884 13.5603 6.39844 11.7857 6.39844C10.9185 6.39844 10.1317 6.08705 9.5558 5.5279L6.40513 7.10156C6.42187 7.23214 6.39844 7.33594 6.39844 7.5C6.39844 7.63393 6.42187 7.73772 6.40513 7.89844L9.5558 9.4721C10.1317 8.91295 10.9185 8.57143 11.7857 8.57143C13.5603 8.57143 15 9.98103 15 11.7857C15 13.5603 13.5603 15 11.7857 15C9.98103 15 8.57143 13.5603 8.57143 11.7857C8.57143 11.6217 8.57813 11.5179 8.59487 11.3873L5.4442 9.81362C4.8683 10.3728 4.08147 10.7143 3.21429 10.7143C1.43906 10.7143 0 9.27455 0 7.5C0 5.69531 1.43906 4.28571 3.21429 4.28571C4.08147 4.28571 4.8683 4.62723 5.4442 5.18638L8.59487 3.61272C8.57813 3.45201 8.57143 3.34821 8.57143 3.21429C8.57143 1.43906 9.98103 0 11.7857 0C13.5603 0 15 1.43906 15 3.21429V3.18415ZM3.18415 8.54129C3.80692 8.54129 4.25558 8.09263 4.25558 7.46987C4.25558 6.90737 3.80692 6.39844 3.18415 6.39844C2.62266 6.39844 2.11272 6.90737 2.11272 7.46987C2.11272 8.09263 2.62266 8.54129 3.18415 8.54129ZM11.7857 2.11272C11.1931 2.11272 10.7143 2.62165 10.7143 3.18415C10.7143 3.80692 11.1931 4.25558 11.7857 4.25558C12.3783 4.25558 12.8571 3.80692 12.8571 3.18415C12.8571 2.62165 12.3783 2.11272 11.7857 2.11272ZM11.7857 12.8571C12.3783 12.8571 12.8571 12.3783 12.8571 11.7857C12.8571 11.1931 12.3783 10.7143 11.7857 10.7143C11.1931 10.7143 10.7143 11.1931 10.7143 11.7857C10.7143 12.3783 11.1931 12.8571 11.7857 12.8571Z"
      />
    </Svg>
  );
}

function EyeIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      />
    </Svg>
  );
}

function EyeSlashIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-2.76-2.24-5-5-5l-.17.01z"
      />
    </Svg>
  );
}

function ChevronDownIcon({color, width, height}: Readonly<{color: string, width: number, height: number}>) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M17.2428 7.40683L10.6075 13.7644C10.3853 13.9519 10.177 14.0283 9.99988 14.0283C9.8228 14.0283 9.58426 13.9512 9.42384 13.796L2.75726 7.40683C2.42407 7.09086 2.41324 6.53184 2.73226 6.22976C3.0491 5.89556 3.57878 5.88469 3.90968 6.20481L9.99988 12.0422L16.0901 6.20893C16.4199 5.88883 16.9505 5.89969 17.2675 6.23388C17.5866 6.53184 17.5762 7.09086 17.2428 7.40683Z"
      />
    </Svg>
  );
}

function ChevronRightIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={28} height={26} viewBox="0 0 24 24">
      <Path fill={color} d="M11.7487 5.74915L7.4628 10.0351C7.29672 10.2038 7.07706 10.2869 6.85741 10.2869C6.63776 10.2869 6.41864 10.2031 6.25149 10.0357C5.91665 9.70089 5.91665 9.15845 6.25149 8.82361L9.07537 6.00094H0.857139C0.383814 6.00094 0 5.61789 0 5.14376C0 4.66963 0.383814 4.28658 0.857139 4.28658H9.07537L6.25203 1.46324C5.91719 1.1284 5.91719 0.585964 6.25203 0.251127C6.58686 -0.0837092 7.1293 -0.0837092 7.46414 0.251127L11.75 4.53704C12.0835 4.87321 12.0835 5.41431 11.7487 5.74915Z" />
    </Svg>
  );
}

function TransferIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M3.4375 7.65625H14.3008L12.6197 9.33731C12.2535 9.70352 12.2535 10.2968 12.6197 10.663C12.8008 10.8467 13.041 10.9375 13.2812 10.9375C13.5215 10.9375 13.7611 10.8459 13.9439 10.6628L17.2252 7.38159C17.5914 7.01538 17.5914 6.42212 17.2252 6.05591L13.9439 2.77466C13.5777 2.40845 12.9845 2.40845 12.6183 2.77466C12.2521 3.14087 12.2521 3.73413 12.6183 4.10034L14.3008 5.78125H3.4375C2.91924 5.78125 2.5 6.20049 2.5 6.71875C2.5 7.23701 2.91924 7.65625 3.4375 7.65625ZM16.5625 12.3438H5.70215L7.3832 10.6627C7.74941 10.2965 7.74941 9.70322 7.3832 9.33701C7.01699 8.9708 6.42373 8.9708 6.05752 9.33701L2.77627 12.6183C2.41006 12.9845 2.41006 13.5777 2.77627 13.9439L6.05752 17.2252C6.23828 17.4092 6.47852 17.5 6.71875 17.5C6.95898 17.5 7.19863 17.4084 7.38144 17.2253C7.74766 16.8591 7.74766 16.2659 7.38144 15.8997L5.70215 14.2188H16.5625C17.0808 14.2188 17.5 13.7995 17.5 13.2812C17.5 12.763 17.0811 12.3438 16.5625 12.3438Z"
      />
    </Svg>
  );
}

function LightbulbIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
      />
    </Svg>
  );
}

function FileIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      />
    </Svg>
  );
}

function CreditCardIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
      />
    </Svg>
  );
}

function SearchIcon({color}: Readonly<{color: string}>) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </Svg>
  );
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

interface ExpenseSegment {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function TransactionsScreen() {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<MovementsStackParamList, 'MovementsList'>
    >();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MovementsStackParamList, 'MovementsList'>>();
  const accountGuid = route.params?.accountGuid;
  const resetFiltersToken = route.params?.resetFilters;

  const [balanceVisible, setBalanceVisible] = React.useState(true);
  const [devModalVisible, setDevModalVisible] = React.useState(false);
  const [dateFilterModalVisible, setDateFilterModalVisible] =
    React.useState(false);
  const [amountFilterModalVisible, setAmountFilterModalVisible] =
    React.useState(false);
  const [typeFilterModalVisible, setTypeFilterModalVisible] =
    React.useState(false);

  const vm = useAccountMovementsViewModel(accountGuid);
  const {refresh: refreshMovements, clearAllFilters, hasActiveFilters} = vm;

  const prevAccountGuidRef = React.useRef<string | undefined>(undefined);
  useEffect(() => {
    if (resetFiltersToken === undefined) return;
    clearAllFilters();
  }, [resetFiltersToken, clearAllFilters]);

  useEffect(() => {
    if (
      prevAccountGuidRef.current !== undefined &&
      prevAccountGuidRef.current !== accountGuid
    ) {
      clearAllFilters();
    }
    prevAccountGuidRef.current = accountGuid;
  }, [accountGuid, clearAllFilters]);

  const isFirstListFocus = React.useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstListFocus.current) {
        isFirstListFocus.current = false;
        return;
      }
      refreshMovements().catch(() => {});
    }, [refreshMovements]),
  );

  const styles = useStyles(colors);

  // Compute expense categories from current month's outgoing transactions
  const chartSegments: ExpenseSegment[] = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const outgoing = vm.items.filter(item => {
      const d = new Date(item.transferDate);
      return (
        item.amount < 0 &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
    const totals = new Map<string, number>();
    for (const item of outgoing) {
      const label = item.transactionTypeLabel || 'Otros';
      totals.set(label, (totals.get(label) ?? 0) + Math.abs(item.amount));
    }
    const totalAmount = [...totals.values()].reduce((a, b) => a + b, 0);
    if (totalAmount === 0) return [];
    const segColors = [
      colors.homePrimaryHover,
      colors.homeAvatarCircle,
      colors.chartAccent,
    ];
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, amount], i) => ({
        label,
        amount,
        percentage: Math.round((amount / totalAmount) * 100),
        color: segColors[i % segColors.length],
      }));
  }, [vm.items, colors]);

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    tabNavigation?.navigate('Home', {screen: 'HomeMain'});
  }, [navigation, tabNavigation]);

  const totalItems = vm.items.length;

  const renderItem = useCallback(
    ({item, index}: Readonly<{item: AccountMovement; index: number}>) => {
      const d = new Date(item.transferDate);
      const day = d.getDate().toString();
      const month = monthAbbr(d);
      const isFirst = index === 0;
      const isLast = index === totalItems - 1;
      const incoming = item.amount > 0;
      const amountColor = incoming ? colors.success : colors.textSecondary;
      const displayAbs = formatCurrency(Math.abs(item.amount));
      const prefix = incoming ? '' : '-';

      return (
        <Pressable
          testID="movement-row"
          style={({pressed}) => [
            styles.movRow,
            isFirst && styles.movRowFirst,
            isLast && styles.movRowLast,
            !isLast && styles.movRowDivider,
            pressed && styles.movRowPressed,
          ]}
          onPress={() =>
            navigation.navigate('MovementDetail', {movement: item})
          }
          accessibilityRole="button"
          accessibilityLabel={`Movimiento ${item.beneficiaryName}`}>
          <View style={styles.movDateCol}>
            <Text style={styles.movDay}>{day}</Text>
            <Text style={styles.movMonth}>{month}</Text>
          </View>
          <View style={styles.movCenter}>
            <Text style={styles.movName} numberOfLines={1}>
              {item.beneficiaryName}
            </Text>
            <Text style={styles.movSub} numberOfLines={1}>
              {item.transactionTypeLabel}
            </Text>
          </View>
          <View style={styles.movRight}>
            <Text style={[styles.movAmount, {color: amountColor}]}>
              {prefix}
              {displayAbs}
            </Text>
            <Text style={styles.movBalance}>
              {formatCurrency(item.balanceAfterTransaction)}
            </Text>
          </View>
          <ChevronRightIcon color={colors.textBlack} />
        </Pressable>
      );
    },
    [totalItems, colors, styles, navigation],
  );

  const listHeader = useMemo(() => {
    if (!vm.selectedAccount) return null;
    const acc = vm.selectedAccount;
    const maskedLabel = `${acc.maskedAccountNumber} `;

    return (
      <View>
        {/* Account overview card */}
        <View style={styles.accountCard}>
          <View style={styles.accountCardRow}>
            <View style={styles.accountInfoBlockRow}> 
            <View style={styles.accountInfoBlock}>
              <View style={styles.accountLabelRow}>
                <Text style={styles.accountShortLabel}>
                  {acc.accountTypeLabel}
                </Text>
                
              </View>
              <Text style={styles.accountMaskText}>{maskedLabel}</Text>
              
            </View>
            <TouchableOpacity
                  onPress={() => setDevModalVisible(true)}
                  hitSlop={8}
                  accessibilityLabel="Compartir">
                  <ShareIcon color={colors.primary} />
                </TouchableOpacity>
                </View>
            <TouchableOpacity
              onPress={() => {}}
              hitSlop={8}
              accessibilityLabel="Cambiar cuenta">
              <ChevronDownIcon color={colors.primary} width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.accountBalanceRow}>
            <View>
              <Text style={styles.balanceBig}>
                {balanceVisible
                  ? formatCurrency(acc.balance)
                  : '$**.**'}
              </Text>
              <Text style={styles.balanceSubLabel}>
                {`Saldo contable: ${balanceVisible ? formatCurrency(acc.balance) : '$**.**'}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setBalanceVisible(v => !v)}
              accessibilityLabel={
                balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'
              }>
              {balanceVisible ? (
                <EyeIcon color={colors.primary} />
              ) : (
                <EyeSlashIcon color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => tabNavigation?.navigate('Transfer')}
            accessibilityRole="button"
            accessibilityLabel="Transferir">
            <TransferIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Transferir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setDevModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Pagar servicios">
            <LightbulbIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Pagar servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setDevModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Estado de cuenta">
            <FileIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Estado de cuenta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setDevModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Retirar sin tarjeta">
            <CreditCardIcon color={colors.primary} />
            <Text style={styles.quickLabel}>Retirar sin tarjeta</Text>
          </TouchableOpacity>
        </View>

        {/* Movements section header */}
        <Text style={styles.sectionHeading}>Movimientos</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchIcon color={colors.textTertiary} />
          <TextInput
            testID="movements-search-input"
            style={styles.searchInput}
            placeholder="Buscar por nombre"
            placeholderTextColor={colors.textTertiary}
            value={vm.searchQuery}
            onChangeText={vm.setSearchQuery}
          />
        </View>

        {/* Filter chips — single row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            testID="movements-date-filter-chip"
            style={styles.chip}
            onPress={() => setDateFilterModalVisible(true)}
            accessibilityRole="button">
            <Text style={styles.chipText} numberOfLines={1}>
              {vm.dateFilterLabel}
            </Text>
            <ChevronDownIcon color={colors.textSecondary} width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="movements-type-filter-chip"
            style={styles.chip}
            onPress={() => setTypeFilterModalVisible(true)}
            accessibilityRole="button">
            <Text style={styles.chipText} numberOfLines={1}>
              {vm.typeFilterLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="movements-amount-filter-chip"
            style={styles.chip}
            onPress={() => setAmountFilterModalVisible(true)}
            accessibilityRole="button">
            <Text style={styles.chipText} numberOfLines={1}>
              {vm.amountFilterLabel}
            </Text>
          </TouchableOpacity>
          {hasActiveFilters ? (
            <Pressable
              testID="movements-clear-all-filters"
              onPress={clearAllFilters}
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
              style={styles.clearFiltersBtn}>
              <Text style={styles.clearFiltersText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }, [
    vm.selectedAccount,
    vm.searchQuery,
    vm.setSearchQuery,
    vm.dateFilterLabel,
    vm.typeFilterLabel,
    vm.amountFilterLabel,
    balanceVisible,
    hasActiveFilters,
    clearAllFilters,
    colors,
    styles,
    tabNavigation,
  ]);

  const listFooter = useMemo(() => {
    if (vm.isLoadingMore) {
      return (
        <ActivityIndicator
          style={styles.footerLoader}
          color={colors.primary}
        />
      );
    }
  
  }, [vm.isLoadingMore, chartSegments, colors, styles]);

  const listEmptyComponent = useMemo(() => {
    if (vm.isLoadingMovements) {
      return (
        <View style={styles.emptyPad}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (vm.movementsError) {
      return (
        <View style={styles.emptyPad}>
          <ErrorMessage message={vm.movementsError} />
          <Button
            title="Reintentar"
            onPress={() => {
              vm.refresh().catch(() => {});
            }}
            style={styles.retryBtn}
          />
        </View>
      );
    }
    return <EmptyState message="No hay movimientos" />;
  }, [
    vm.isLoadingMovements,
    vm.movementsError,
    vm.refresh,
    colors.primary,
    styles,
  ]);

  if (vm.isLoadingAccount) {
    return (
      <View
        testID="transactions-screen"
        style={[styles.root, {paddingTop: insets.top + 64}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (vm.accountError) {
    return (
      <View
        testID="transactions-screen"
        style={[styles.root, {paddingTop: insets.top + 64}]}>
        <ErrorMessage message={vm.accountError} />
        <Button
          title="Reintentar"
          onPress={() => {
            vm.refresh().catch(() => {});
          }}
        />
      </View>
    );
  }

  return (
    <View testID="transactions-screen" style={styles.root}>
      {/* Fixed white top bar */}
      <View style={[styles.topBar, {paddingTop: insets.top, height: insets.top + 64}]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio">
          <BackIcon color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>MOVIMIENTOS</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <FlatList
        data={vm.items}
        keyExtractor={(item, index) => {
          const id =
            item.transactionGuid?.trim() ||
            `${item.transactionIdentifier}|${item.transferDate}`;
          return `${id}|${index}`;
        }}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          vm.loadMore().catch(() => {});
        }}
        refreshControl={
          <RefreshControl
            refreshing={vm.isRefreshing}
            onRefresh={() => {
              vm.refresh().catch(() => {});
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }

        ListEmptyComponent={listEmptyComponent}
      />

      <DevelopmentNoticeModal
        visible={devModalVisible}
        onClose={() => setDevModalVisible(false)}
      />
      <MovementsDateFilterModal
        visible={dateFilterModalVisible}
        onClose={() => setDateFilterModalVisible(false)}
        initialRange={vm.appliedDateRange}
        onApply={(from, to) => {
          vm.applyDateRange(from, to);
        }}
      />
      <MovementsAmountFilterModal
        visible={amountFilterModalVisible}
        onClose={() => setAmountFilterModalVisible(false)}
        initialRange={vm.appliedAmountRange}
        onApply={(min, max) => {
          vm.applyAmountRange(min, max);
        }}
      />
      <MovementsTypeFilterModal
        visible={typeFilterModalVisible}
        onClose={() => setTypeFilterModalVisible(false)}
        initialEnumType={vm.appliedEnumType}
        onApply={value => {
          vm.applyTransactionEnumType(value);
        }}
      />
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        // ─── Top bar ───────────────────────────────
        topBar: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          backgroundColor: colors.white,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        topBarTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          letterSpacing: 1,
          color: colors.textPrimary,
        },
        topBarSpacer: {
          width: 22,
        },
        // ─── Account card ──────────────────────────
        accountCard: {
          backgroundColor: colors.homeProductCardSurface,
          paddingHorizontal: 24,
          paddingVertical: 20,
          gap: 16,
        },
        accountCardRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        },
        accountInfoBlock: {
          gap: 4,
        },
        accountLabelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        accountShortLabel: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.primary,
          opacity: 0.85,
        },
        accountMaskText: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textSecondary,
        },
        accountBalanceRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        },
        balanceBig: {
          fontFamily: Lexend.bold,
          fontSize: 30,
          lineHeight: 40,
          color: colors.textPrimary,
        },
        balanceSubLabel: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.primary,
          opacity: 0.85,
          marginTop: 2,
        },
        eyeBtn: {
          backgroundColor: colors.homeBalanceToggleBg,
          borderRadius: 6,
          padding: 6,
        },
        accountInfoBlockRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        },
        // ─── Quick actions ─────────────────────────
        quickRow: {
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
          backgroundColor: colors.background,
        },
        quickCard: {
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 4,
          alignItems: 'center',
          gap: 4,
        },
        quickLabel: {
          fontFamily: Lexend.regular,
          fontSize: 9,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        // ─── Movements heading & search ────────────
        sectionHeading: {
          fontFamily: Lexend.regular,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
        },
        searchWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          marginHorizontal: 24,
          borderRadius: 48,
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.white,
        },
        searchInput: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textPrimary,
          paddingVertical: 0,
        },
        // ─── Filter chips ──────────────────────────
        filtersRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingBottom: 16,
          gap: 8,
          flexWrap: 'nowrap',
        },
        chip: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.buttonSecondaryBg,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          gap: 4,
        },
        chipText: {
          flexShrink: 1,
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        clearFiltersBtn: {
          backgroundColor: colors.buttonSecondaryBg,
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        clearFiltersText: {
          fontFamily: Lexend.semiBold,
          fontSize: 12,
          color: colors.textSecondary,
        },
        // ─── Transaction rows ──────────────────────
        movRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          marginHorizontal: 24,
          paddingHorizontal: 8,
          paddingVertical: 12,
          gap: 8,
        },
        movRowFirst: {
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        movRowLast: {
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          marginBottom: 8,
        },
        movRowDivider: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        movRowPressed: {
          opacity: 0.88,
        },
        movDateCol: {
          width: 34,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 4,
        },
        movDay: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.primary,
          textAlign: 'right',
        },
        movMonth: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
          textAlign: 'center',
        },
        movCenter: {
          flex: 1,
          minWidth: 0,
          gap: 2,
        },
        movName: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        movSub: {
          fontFamily: Lexend.regular,
          fontSize: 13,
          lineHeight: 18,
          color: colors.textTertiary,
        },
        movRight: {
          alignItems: 'flex-end',
          gap: 2,
        },
        movAmount: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          textAlign: 'right',
        },
        movBalance: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        // ─── Chart footer card ─────────────────────
        chartCard: {
          backgroundColor: colors.white,
          marginHorizontal: 24,
          marginTop: 16,
          marginBottom: 8,
          borderRadius: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
        },
        chartTitle: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textPrimary,
        },
        chartDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.borderLight,
          marginTop: 12,
          marginBottom: 16,
        },
        chartCenter: {
          alignItems: 'center',
          marginBottom: 16,
        },
        chartLegend: {
          gap: 10,
        },
        legendRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        legendDot: {
          width: 9,
          height: 9,
          borderRadius: 5,
          flexShrink: 0,
        },
        legendLabel: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        legendAmount: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
          textAlign: 'right',
        },
        // ─── Misc ──────────────────────────────────
        listContent: {
          paddingBottom: 32,
        },
        emptyPad: {
          paddingVertical: 40,
          paddingHorizontal: 24,
        },
        retryBtn: {
          marginTop: 12,
        },
        footerLoader: {
          paddingVertical: 16,
        },
      }),
    [colors],
  );
}

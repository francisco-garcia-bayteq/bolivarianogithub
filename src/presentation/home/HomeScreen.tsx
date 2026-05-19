import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  ImageBackground,
  useWindowDimensions,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../providers';
import type {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {useTheme, type ThemeColors} from '../../providers';
import type {
  AccountBalance,
  AccountKind,
  ContractBalance,
  CreditCardBalance,
  FrequentPayment,
  InvestmentBalance,
  LoanBalance,
} from '../../domain/entities/ContractBalance';
import {HomeHeader} from './components/HomeHeader';
import {ProductFilterTabs} from './components/ProductFilterTabs';
import {
  SavingsAccountCard,
  CheckingAccountCard,
  CreditCardPreview,
  LoanCard,
  InvestmentCard,
} from './components/ProductCarouselCards';
import {RequestProductRow} from './components/RequestProductRow';
import {HomeBannersCarousel} from './components/HomeBannersCarousel';
import {FrequentActionsSection} from './components/FrequentActionsSection';
import {UpcomingPaymentsRow} from './components/UpcomingPaymentsRow';
import {RecentActivitySection} from './components/RecentActivitySection';
import {useHomeViewModel} from './useHomeViewModel';
import {DevelopmentNoticeModal} from '../components';

const HEADER_BG = require('../../../assets/images/home/header-container.png');

const PRODUCT_FILTERS = [
  'Todos',
  'Cuentas',
  'Tarjetas',
  'Inversiones',
  'Préstamos',
] as const;

function accountTitle(kind: AccountKind): string {
  if (kind === 'savings') {
    return 'Cta. ahorros';
  }
  if (kind === 'checking') {
    return 'Cta. corriente';
  }
  return 'Cuenta';
}

/** Ancho de cada card del carousel como fracción del ancho de pantalla. */
const CARD_WIDTH_SCREEN_FRACTION = 0.6;
const CARD_HEIGHT = 130;
/** Separación horizontal entre cards del carousel. */
const CARD_GAP = 6;
const MAIN_COLUMN_PADDING = 24;

/** Altura base de la imagen de cabecera (sin el extra iOS por safe area / solapamiento con cards). */
const HERO_IMAGE_SECTION_HEIGHT = 150;

type HomeProductItem = {key: string; node: React.ReactNode};

type HomeMainNavigation = NativeStackNavigationProp<
  HomeStackParamList,
  'HomeMain'
>;

type HomeProductCarouselStyles = {
  productCard: object;
  cardFill: object;
};

function pushAccountProductItems(
  items: HomeProductItem[],
  accounts: AccountBalance[],
  navigation: HomeMainNavigation,
  styles: HomeProductCarouselStyles,
): void {
  for (const acc of accounts) {
    const k = `acc-${acc.accountGuid}`;
    const isFirst = items.length === 0;
    if (acc.accountKind === 'checking') {
      items.push({
        key: k,
        node: (
          <TouchableOpacity
            key={k}
            activeOpacity={0.92}
            style={styles.productCard}
            onPress={() =>
              navigation.navigate('MovementsList', {
                accountGuid: acc.accountGuid,
                resetFilters: Date.now(),
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Ver movimientos de cuenta corriente">
            <CheckingAccountCard
              style={styles.cardFill}
              maskedAccountNumber={acc.maskedAccountNumber}
              balance={acc.balance}
              isFirst={isFirst}
            />
          </TouchableOpacity>
        ),
      });
      continue;
    }
    items.push({
      key: k,
      node: (
        <TouchableOpacity
          key={k}
          activeOpacity={0.92}
          style={styles.productCard}
          onPress={() =>
            navigation.navigate('MovementsList', {
              accountGuid: acc.accountGuid,
              resetFilters: Date.now(),
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Ver movimientos de ${acc.maskedAccountNumber}`}>
          <SavingsAccountCard
            style={styles.cardFill}
            title={acc.accountTypeLabel}
            maskedAccountNumber={acc.maskedAccountNumber}
            balance={acc.balance}
            isFirst={isFirst}
          />
        </TouchableOpacity>
      ),
    });
  }
}

function pushCreditCardProductItems(
  items: HomeProductItem[],
  cards: CreditCardBalance[],
  navigation: HomeMainNavigation,
  styles: HomeProductCarouselStyles,
): void {
  for (const card of cards) {
    const k = `cc-${card.maskedCardNumber}-${card.maxPaymentDate}`;
    items.push({
      key: k,
      node: (
        <TouchableOpacity
          key={k}
          activeOpacity={0.92}
          style={styles.productCard}
          onPress={() =>
            navigation.navigate('CardDetail', {
              maskedCardNumber: card.maskedCardNumber,
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Ver detalle de tarjeta">
          <CreditCardPreview
            style={styles.cardFill}
            maskedCardNumber={card.maskedCardNumber}
            totalDue={card.totalDue}
            maxPaymentDate={card.maxPaymentDate}
          />
        </TouchableOpacity>
      ),
    });
  }
}

function pushInvestmentProductItems(
  items: HomeProductItem[],
  investments: InvestmentBalance[],
  navigation: HomeMainNavigation,
  styles: HomeProductCarouselStyles,
): void {
  for (const inv of investments) {
    const k = `inv-${inv.investmentGuid}`;
    items.push({
      key: k,
      node: (
        <TouchableOpacity
          key={k}
          activeOpacity={0.92}
          style={styles.productCard}
          onPress={() =>
            navigation.navigate('InvestmentDetail', {
              investmentGuid: inv.investmentGuid,
              investmentBalance: inv,
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Ver detalle de inversión">
          <InvestmentCard
            style={styles.cardFill}
            investmentGuid={inv.investmentGuid}
            productName={inv.productName}
            currentValue={inv.currentValue}
            currency={inv.currency}
          />
        </TouchableOpacity>
      ),
    });
  }
}

function pushLoanProductItems(
  items: HomeProductItem[],
  loans: LoanBalance[],
  navigation: HomeMainNavigation,
  styles: HomeProductCarouselStyles,
): void {
  for (const loan of loans) {
    const k = `loan-${loan.loanGuid}`;
    items.push({
      key: k,
      node: (
        <TouchableOpacity
          key={k}
          activeOpacity={0.92}
          style={styles.productCard}
          onPress={() =>
            navigation.navigate('LoanDetail', {
              loanGuid: loan.loanGuid,
              loanBalance: loan,
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Ver detalle de préstamo">
          <LoanCard
            style={styles.cardFill}
            loanGuid={loan.loanGuid}
            nextInstallmentAmount={loan.nextInstallmentAmount}
            nextInstallmentDate={loan.nextInstallmentDate}
          />
        </TouchableOpacity>
      ),
    });
  }
}

function buildHomeProductItems(
  data: ContractBalance,
  filter: string,
  navigation: HomeMainNavigation,
  styles: HomeProductCarouselStyles,
): HomeProductItem[] {
  const all = filter === 'Todos';
  const showAccounts = all || filter === 'Cuentas';
  const showCards = all || filter === 'Tarjetas';
  const showInvestments = all || filter === 'Inversiones';
  const showLoans = all || filter === 'Préstamos';

  const items: HomeProductItem[] = [];
  if (showAccounts) {
    pushAccountProductItems(items, data.accounts, navigation, styles);
  }
  if (showCards) {
    pushCreditCardProductItems(items, data.creditCards, navigation, styles);
  }
  if (showInvestments) {
    pushInvestmentProductItems(
      items,
      data.investments,
      navigation,
      styles,
    );
  }
  if (showLoans) {
    pushLoanProductItems(items, data.loans, navigation, styles);
  }
  return items;
}

export function HomeScreen() {
  const {user, logout} = useAuth();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {width: windowWidth} = useWindowDimensions();
  /** iOS: el contenido queda más abajo por el notch; sin esto el corte teal/gris cae en el borde superior de las cards. */
  const iosHeroExtra = useMemo(
    () =>
      Platform.OS === 'ios'
        ? Math.round(insets.top + (CARD_HEIGHT - CARD_HEIGHT * 1.02))
        : 0,
    [insets.top],
  );

  const [filter, setFilter] = useState<string>('Todos');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [devModalVisible, setDevModalVisible] = useState(false);
  const route = useRoute<RouteProp<HomeStackParamList, 'HomeMain'>>();
  const navigation = useNavigation<HomeMainNavigation>();

  const {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    retry,
    bannersForHome,
    frequentPaymentsForHome,
    upcomingPaymentsSummary,
    recentActivityItems,
  } = useHomeViewModel();

  const cardLayout = useMemo(
    () => ({
      cardWidth: Math.round(windowWidth * CARD_WIDTH_SCREEN_FRACTION),
      cardHeight: CARD_HEIGHT,
    }),
    [windowWidth],
  );

  const cardSnapInterval = cardLayout.cardWidth + CARD_GAP;
  const styles = useStyles(colors, cardLayout, iosHeroExtra);

  const carouselRef = useRef<ScrollView>(null);
  const scaleAnims = useRef<Animated.Value[]>([]).current;

  useFocusEffect(
    useCallback(() => {
      const token = route.params?.refreshHome;
      if (token === undefined) {
        return;
      }
      refresh().catch();
      navigation.setParams({refreshHome: undefined});
    }, [navigation, refresh, route.params?.refreshHome]),
  );

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      setFilter(newFilter);
      setSelectedIdx(0);
      carouselRef.current?.scrollTo({x: 0, animated: false});
      scaleAnims.length = 0;
    },
    [scaleAnims],
  );

  const productItems = useMemo((): HomeProductItem[] => {
    if (!data) {
      return [];
    }
    return buildHomeProductItems(data, filter, navigation, {
      cardFill: styles.cardFill,
      productCard: styles.productCard,
    });
  }, [data, filter, navigation, styles.cardFill, styles.productCard]);

  if (scaleAnims.length !== productItems.length) {
    scaleAnims.length = 0;
    productItems.forEach((_, i) => {
      scaleAnims.push(new Animated.Value(i === 0 ? 1 : 0.92));
    });
  }

  const animateSelection = (idx: number) => {
    if (idx === selectedIdx) {
      return;
    }
    const animations = scaleAnims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: i === idx ? 1 : 0.92,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6,
      }),
    );
    setSelectedIdx(idx);
    Animated.parallel(animations).start();
  };

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / cardSnapInterval);
    if (idx >= 0 && idx < productItems.length) {
      animateSelection(idx);
    }
  };

  const handleLogout = async () => {
    await logout({suppressCompactLoginAutoBiometricOnce: true});
  };

  const openDevelopmentModal = () => {
    setDevModalVisible(true);
  };

  const openFrequentPayments = useCallback(
    (_item: FrequentPayment, index: number) => {
      navigation.navigate('FrequentPayments', {
        items: frequentPaymentsForHome,
        initialIndex: index,
      });
    },
    [navigation, frequentPaymentsForHome],
  );

  return (
    <View testID="home-screen" style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.white}
            colors={[colors.primary]}
          />
        }>
        <View style={styles.stackRoot}>
          {/* Capa inferior: solo fondos (imagen + colores). No interacción. */}
          <View style={styles.heroStack} pointerEvents="none">
            <ImageBackground
              source={HEADER_BG}
              style={styles.heroImageSection}
              imageStyle={styles.headerBackgroundImage}
              resizeMode="cover"
            />
            <View
              style={[
                styles.heroTealBand,
                {backgroundColor: colors.homeHeaderBackground},
              ]}
            />
            <View
              style={[
                styles.heroBodyFill,
                {backgroundColor: colors.background},
              ]}
            />
          </View>

          {/* Capa superior: interacción desde chips hasta pagos frecuentes */}
          <View style={styles.contentLayer}>
            <SafeAreaView edges={['top']} />
            <HomeHeader
              userName={user?.firstName?.trim() || user?.name}
              onLogout={handleLogout}
              onNotifications={openDevelopmentModal}
            />

            <View style={styles.mainColumn}>
              <ProductFilterTabs
                
                filters={PRODUCT_FILTERS}
                selectedFilter={filter}
                onFilterChange={handleFilterChange}
              />
              {!isLoading && productItems.length > 0 ? (
              <View style={styles.carouselLayer} pointerEvents="box-none">
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardSnapInterval}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onCarouselScroll}
                  contentContainerStyle={styles.carouselRow}>
                  {productItems.map((item, i) => (
                    <Animated.View
                      key={item.key}
                      style={[
                        styles.carouselItem,
                        {
                          transform: [
                            {scale: scaleAnims[i] ?? new Animated.Value(1)},
                          ],
                        },
                      ]}>
                      {item.node}
                    </Animated.View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            </View>

            {error ? (
              <View style={styles.inlineMessage}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={retry} accessibilityRole="button">
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {isLoading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            )}
            {!isLoading && !productItems.length && (
              <Text style={styles.emptyProductsInline}>
                No hay productos en esta categoría.
              </Text>
            )}            

            {data ? (
              <View style={[styles.mainColumn, styles.contentArea]}>
                <View style={styles.dashboardColumn}>
                  <RequestProductRow onPress={openDevelopmentModal} />
                  <HomeBannersCarousel banners={bannersForHome} />
                  <FrequentActionsSection
                    items={frequentPaymentsForHome}
                    onItemPress={openFrequentPayments}
                  />
                  <UpcomingPaymentsRow
                    summary={upcomingPaymentsSummary}
                    onPress={openDevelopmentModal}
                  />
                  <RecentActivitySection
                    items={recentActivityItems}
                    onPressListIcon={openDevelopmentModal}
                    onPressCalendarIcon={openDevelopmentModal}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <DevelopmentNoticeModal
        visible={devModalVisible}
        onClose={() => setDevModalVisible(false)}
      />
    </View>
  );
}

function useStyles(
  colors: ThemeColors,
  layout: {cardWidth: number; cardHeight: number},
  iosHeroExtra: number,
) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scroll: {
          flex: 1,
        },
        stackRoot: {
          position: 'relative',
          width: '100%',
          overflow: 'visible',
        },
        heroStack: {
          ...StyleSheet.absoluteFill,
          zIndex: 0,
          flexDirection: 'column',
        },
        heroImageSection: {
          width: '100%',
          height: HERO_IMAGE_SECTION_HEIGHT + iosHeroExtra,
          backgroundColor: colors.homeHeaderBackground,
        },
        headerBackgroundImage: {
          opacity: 1,
        },
        heroTealBand: {
          width: '100%',
          height: 72,

        },
        heroBodyFill: {
          flex: 1,
          minHeight: 480,
        },
        contentLayer: {
          position: 'relative',
          zIndex: 1,
          width: '100%',
        },
        mainColumn: {
          //paddingHorizontal: MAIN_COLUMN_PADDING,
          width: '100%',
          alignSelf: 'center',
          maxWidth: '100%',
        },
        carouselLayer: {        
          zIndex: 2,
  
        },
        contentArea: {
          paddingTop: 16,
          paddingBottom: 32,
          paddingHorizontal: MAIN_COLUMN_PADDING,
          backgroundColor: colors.background,
        },
        dashboardColumn: {
          gap: 20,
        },
        carouselRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 4,
          paddingHorizontal: MAIN_COLUMN_PADDING,
          paddingBottom: 4,
          gap: CARD_GAP,
        },
        carouselItem: {
          width: layout.cardWidth,
          height: layout.cardHeight,
        },
        productCard: {
          width: layout.cardWidth,
          height: layout.cardHeight,
        },
        cardFill: {
          flex: 1,
        },
        loadingBox: {
          paddingVertical: 24,
          alignItems: 'center',
        },
        inlineMessage: {
          gap: 8,
          marginHorizontal: MAIN_COLUMN_PADDING,
        },
        errorText: {
          color: colors.errorBg,
          fontSize: 13,
        },
        retryText: {
          color: colors.white,
          fontSize: 14,
          fontWeight: '600',
        },
        emptyProductsInline: {
          color: colors.textSecondary,
          fontSize: 14,
          paddingVertical: 16,
          paddingHorizontal: MAIN_COLUMN_PADDING,
        },
        emptyProducts: {
          color: colors.textSecondary,
          fontSize: 14,
          paddingVertical: 16,
        },
      }),
    [colors, layout.cardWidth, layout.cardHeight, iosHeroExtra],
  );
}

import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  type SectionListRenderItemInfo,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type ThemeColors} from '../../providers/theme';
import {Lexend} from '../../theme/lexend';
import type {AccountBalance} from '../../domain/entities/ContractBalance';
import {accountProductTitle} from '../../utils/accountDisplay';
import {formatMoneyEc} from '../../utils/formatMoneyEc';
import {useHomeViewModel} from '../home/useHomeViewModel';
import {
  beneficiaryContactToTemplate,
  groupContactsByLetter,
  ownAccountToBeneficiary,
  templateToBeneficiary,
  type ContactTemplate,
} from './beneficiaryData.ts';
import {useBeneficiaryContactsViewModel} from './useBeneficiaryContactsViewModel';
import type {BeneficiaryOption} from './transferTypes.ts';
import {
  TransferIconArrowLeft,
  TransferIconEllipsisVertical,
  TransferIconSearch,
  TransferIconUserPlus,
  TransferIconWallet,
} from '../../features/transfer/presentation/components/transferIcons.tsx';
import {DevelopmentNoticeModal} from '../components/DevelopmentNoticeModal';

const HERO_BG = '#0B515C';
const ICON_CHIP_BG = '#D0F0F6';

type Section = {
  title: string;
  data: ContactTemplate[];
};

type ContactsListEmptyStyles = {
  contactsListEmpty: ViewStyle;
  emptyHint: TextStyle;
};

interface ContactsListEmptyProps {
  contactsLoading: boolean;
  contactsError: string | null;
  allContactsLength: number;
  styles: ContactsListEmptyStyles;
  colors: ThemeColors;
}

function ContactsListEmpty({
  contactsLoading,
  contactsError,
  allContactsLength,
  styles,
  colors,
}: Readonly<ContactsListEmptyProps>) {
  if (contactsLoading) {
    return (
      <View style={styles.contactsListEmpty}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }
  if (contactsError) {
    return (
      <Text style={styles.emptyHint}>
        No se pudieron cargar los contactos.
      </Text>
    );
  }
  if (allContactsLength === 0) {
    return (
      <Text style={styles.emptyHint}>No tienes contactos guardados.</Text>
    );
  }
  return (
    <Text style={styles.emptyHint}>
      No hay contactos que coincidan con la búsqueda.
    </Text>
  );
}

export type BeneficiarySelectModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  onSelect: (beneficiary: BeneficiaryOption) => void;
};

export function BeneficiarySelectModal({
  visible,
  onRequestClose,
  onSelect,
}: Readonly<BeneficiarySelectModalProps>) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useStyles(colors);

  const {data, isLoading, error, retry} = useHomeViewModel();

  const {
    contacts: beneficiaryContacts,
    isLoading: contactsLoading,
    error: contactsError,
    retry: retryContacts,
  } = useBeneficiaryContactsViewModel();

  const [query, setQuery] = useState('');
  const [devNotice, setDevNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts]);

  const allContacts = useMemo(() => {
    return [...beneficiaryContacts]
      .map(beneficiaryContactToTemplate)
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'es', {sensitivity: 'base'}),
      );
  }, [beneficiaryContacts]);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return accounts;
    }
    return accounts.filter(
      a =>
        accountProductTitle(a).toLowerCase().includes(q) ||
        a.maskedAccountNumber.toLowerCase().includes(q),
    );
  }, [accounts, query]);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allContacts;
    }
    return allContacts.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.bankName.toLowerCase().includes(q),
    );
  }, [allContacts, query]);

  const sections = useMemo(
    () => groupContactsByLetter(filteredContacts),
    [filteredContacts],
  );

  function pickBeneficiary(b: BeneficiaryOption) {
    onSelect(b);
  }

  function onPickAccount(account: AccountBalance) {
    pickBeneficiary(ownAccountToBeneficiary(account));
  }

  function onPickContact(t: ContactTemplate) {
    pickBeneficiary(templateToBeneficiary(t));
  }

  const headerTop = (
    <View style={[styles.header, {paddingTop: insets.top}]}>
      <TouchableOpacity
        onPress={onRequestClose}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Volver">
        <TransferIconArrowLeft color={colors.iconPrimary} size={20} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>BENEFICIARIOS</Text>
      <View style={styles.headerRightSpacer} />
    </View>
  );

  const searchBlock = (
    <View style={styles.searchWrap}>
      <View style={styles.searchInner}>
        <TransferIconSearch color={colors.textTertiary} size={16} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre"
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
        />
      </View>
    </View>
  );

  const misCuentasBlock = (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeading}>Mis cuentas</Text>
      {filteredAccounts.length === 0 ? (
        <Text style={styles.emptyHint}>Sin cuentas que coincidan.</Text>
      ) : (
        filteredAccounts.map((account, accountIndex) => (
          <TouchableOpacity
            key={account.accountGuid}
            style={styles.accountCard}
            onPress={() => onPickAccount(account)}
            activeOpacity={0.9}
            testID={
              accountIndex === 0
                ? 'beneficiary-first-own-account'
                : undefined
            }>
            <View style={styles.iconChip}>
              <TransferIconWallet color={HERO_BG} size={16} />
            </View>
            <View style={styles.accountBody}>
              <Text style={styles.accountTitle}>
                {accountProductTitle(account)}
              </Text>
              <Text style={styles.accountMeta}>{account.maskedAccountNumber}</Text>
              <Text style={styles.accountMeta}>
                {formatMoneyEc(account.balance)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const contactosTitle = (
    <Text style={[styles.sectionHeading, styles.contactosHeading]}>
      Contactos
    </Text>
  );

  const contactosStatus =
    contactsError && !contactsLoading ? (
      <View style={styles.contactsErrorBanner}>
        <Text style={styles.errorText}>{contactsError}</Text>
        <TouchableOpacity onPress={retryContacts}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  const listHeader = (
    <>
      {searchBlock}
      {misCuentasBlock}
      {contactosTitle}
      {contactosStatus}
    </>
  );

  function renderContactRow({
    item,
    index,
    section,
  }: Readonly<SectionListRenderItemInfo<ContactTemplate, Section>>) {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;
    return (
      <View
        style={[
          styles.contactRow,
          isFirst && styles.contactRowFirst,
          isLast && styles.contactRowLast,
        ]}>
        <TouchableOpacity
          style={styles.contactRowMain}
          onPress={() => onPickContact(item)}
          activeOpacity={0.85}>
          <View style={styles.contactTextCol}>
            <Text style={styles.contactName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.contactBank}>{item.bankName}</Text>
            <Text style={styles.contactHint}>{item.accountHint}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            setDevNotice({
              title: 'Próximamente',
              message: 'Las opciones de contacto no están disponibles aún.',
            })
          }
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <TransferIconEllipsisVertical color={colors.iconPrimary} size={16} />
        </TouchableOpacity>
      </View>
    );
  }

  let body: React.ReactElement;
  if (error) {
    body = (
      <View style={styles.root}>
        {headerTop}
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => retry()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else if (isLoading && !data) {
    body = (
      <View style={styles.root}>
        {headerTop}
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  } else {
    body = (
      <View style={styles.root}>
        {headerTop}
        <SectionList
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            {paddingBottom: Math.max(insets.bottom, 24) + 80},
          ]}
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderContactRow}
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.letterHeader}>{title}</Text>
          )}
          ListHeaderComponent={listHeader}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <ContactsListEmpty
              contactsLoading={contactsLoading}
              contactsError={contactsError}
              allContactsLength={allContacts.length}
              styles={styles}
              colors={colors}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          style={[
            styles.fab,
            {bottom: Math.max(insets.bottom, 16) + 8},
          ]}
          onPress={() =>
            setDevNotice({
              title: 'Próximamente',
              message: 'Agregar contacto no está disponible aún.',
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Agregar contacto">
          <TransferIconUserPlus color={colors.white} size={22} />
        </TouchableOpacity>

        <DevelopmentNoticeModal
          visible={devNotice !== null}
          onClose={() => setDevNotice(null)}
          title={devNotice?.title}
          message={devNotice?.message}
        />
      </View>
    );
  }

  return (
    <Modal
      testID="beneficiary-select-modal"
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}>
      {body}
    </Modal>
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
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          paddingHorizontal: 16,
          backgroundColor: colors.white,
        },
        backBtn: {
          width: 44,
          height: 44,
          alignItems: 'flex-start',
          justifyContent: 'center',
        },
        headerTitle: {
          flex: 1,
          textAlign: 'center',
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
        },
        headerRightSpacer: {
          width: 44,
        },
        list: {
          flex: 1,
        },
        listContent: {
          paddingHorizontal: 24,
          paddingTop: 8,
        },
        searchWrap: {
          marginBottom: 16,
        },
        searchInner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 14,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.06,
              shadowRadius: 4,
            },
            android: {elevation: 2},
            default: {},
          }),
        },
        searchInput: {
          flex: 1,
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textPrimary,
          paddingVertical: 0,
        },
        sectionBlock: {
          gap: 8,
          marginBottom: 8,
        },
        sectionHeading: {
          fontFamily: Lexend.semiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textPrimary,
        },
        contactosHeading: {
          marginTop: 8,
          marginBottom: 4,
        },
        contactsErrorBanner: {
          marginBottom: 8,
          gap: 6,
        },
        contactsListEmpty: {
          paddingVertical: 24,
          alignItems: 'center',
        },
        accountCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          backgroundColor: colors.white,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 16,
          marginBottom: 0,
        },
        iconChip: {
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: ICON_CHIP_BG,
          alignItems: 'center',
          justifyContent: 'center',
        },
        accountBody: {
          flex: 1,
          minWidth: 0,
        },
        accountTitle: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
        },
        accountMeta: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: '#3E494B',
        },
        letterHeader: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
          marginTop: 8,
          marginBottom: 4,
        },
        contactRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 12,
          paddingBottom: 13,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: '#D6D6D6',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.02,
              shadowRadius: 16,
            },
            android: {elevation: 1},
            default: {},
          }),
        },
        contactRowMain: {
          flex: 1,
          minWidth: 0,
        },
        contactRowFirst: {
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        contactRowLast: {
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderBottomWidth: 0,
        },
        contactTextCol: {
          flex: 1,
          marginRight: 8,
          maxWidth: '82%',
        },
        contactName: {
          fontFamily: Lexend.semiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.textPrimary,
        },
        contactBank: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        contactHint: {
          fontFamily: Lexend.regular,
          fontSize: 12,
          lineHeight: 20,
          color: colors.textTertiary,
        },
        emptyHint: {
          fontFamily: Lexend.regular,
          fontSize: 14,
          color: colors.textSecondary,
          paddingVertical: 12,
        },
        loadingWrap: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        errorBanner: {
          padding: 24,
          gap: 8,
        },
        errorText: {
          color: colors.error,
          fontSize: 13,
        },
        retryText: {
          color: colors.primary,
          fontFamily: Lexend.semiBold,
          fontSize: 14,
        },
        fab: {
          position: 'absolute',
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.2,
              shadowRadius: 8,
            },
            android: {elevation: 6},
            default: {},
          }),
        },
      }),
    [colors],
  );
}

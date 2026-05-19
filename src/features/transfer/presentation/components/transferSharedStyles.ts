import type {TextStyle, ViewStyle} from 'react-native';
import type {ThemeColors} from '../../../../providers';
import {Lexend} from '../../../../theme/lexend';

export type TransferSharedStyleSheet = {
  root: ViewStyle;
  loadingWrap: ViewStyle;
  scroll: ViewStyle;
  iconChip: ViewStyle;
  cardBody: ViewStyle;
  cardSub: TextStyle;
  bottomSection: ViewStyle;
  conceptBlock: ViewStyle;
  conceptLabel: TextStyle;
  conceptLabelStrong: TextStyle;
  conceptLabelMuted: TextStyle;
  validationText: TextStyle;
  detailRowLayout: ViewStyle;
  detailLabel: TextStyle;
  detailValue: TextStyle;
  detailRowLast: ViewStyle;
  conceptValue: TextStyle;
  primaryCtaText: TextStyle;
  backBtn: ViewStyle;
  headerTitle: TextStyle;
  headerRightSpacer: ViewStyle;
  errorText: TextStyle;
  retryText: TextStyle;
};

export function buildTransferSharedStyles(
  colors: ThemeColors,
): TransferSharedStyleSheet {
  return {
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    iconChip: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primaryIconContainerBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
    },
    cardSub: {
      fontFamily: Lexend.regular,
      fontSize: 12,
      lineHeight: 20,
      color: colors.textTertiary,
      marginTop: 2,
    },
    bottomSection: {
      paddingHorizontal: 24,
      paddingTop: 24,
      gap: 16,
      backgroundColor: colors.background,
    },
    conceptBlock: {
      gap: 8,
    },
    conceptLabel: {
      fontSize: 12,
      lineHeight: 20,
    },
    conceptLabelStrong: {
      fontFamily: Lexend.semiBold,
      color: colors.textSecondary,
    },
    conceptLabelMuted: {
      fontFamily: Lexend.regular,
      color: colors.textTertiary,
    },
    validationText: {
      fontFamily: Lexend.regular,
      fontSize: 13,
      color: colors.error,
    },
    detailRowLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      paddingTop: 12,
      paddingBottom: 13,
      gap: 12,
    },
    detailLabel: {
      fontFamily: Lexend.regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      flexShrink: 0,
    },
    detailValue: {
      fontFamily: Lexend.regular,
      fontSize: 12,
      lineHeight: 20,
      color: colors.primary,
      textAlign: 'right',
      flex: 1,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    conceptValue: {
      flexShrink: 1,
    },
    primaryCtaText: {
      fontFamily: Lexend.semiBold,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
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
    errorText: {
      color: colors.error,
      fontSize: 13,
    },
    retryText: {
      color: colors.primary,
      fontFamily: Lexend.semiBold,
      fontSize: 14,
    },
  };
}

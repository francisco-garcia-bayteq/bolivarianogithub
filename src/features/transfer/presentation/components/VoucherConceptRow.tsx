import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {ThemeColors, useTheme} from '../../../../providers';
import {buildTransferSharedStyles} from './transferSharedStyles';

type VoucherConceptRowProps = {
    concept: string;
};

export function VoucherConceptRow({concept}: Readonly<VoucherConceptRowProps>) {
    const {colors} = useTheme();
    const styles = useStyles(colors);

    return (
        <View style={styles.row}>
            <Text style={styles.detailLabel}>Concepto</Text>
            <Text style={styles.detailValue} numberOfLines={3}>
                {concept}
            </Text>
        </View>
    );
}

export function VoucherTaxRow({concept}: Readonly<VoucherConceptRowProps>) {
    const {colors} = useTheme();
    const styles = useStyles(colors);

    return (
        <View style={styles.row}>
            <Text style={styles.detailLabel}>Comisión</Text>
            <Text style={styles.detailValue} numberOfLines={3}>
                {concept}
            </Text>
        </View>
    );
}


function useStyles(colors: ThemeColors) {
    return useMemo(
        () =>
            StyleSheet.create({
                ...buildTransferSharedStyles(colors),
                row: {
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    paddingHorizontal: 12,
                    borderTopColor: colors.buttonSecondaryBg,
                },
                dividerItems: {
                    backgroundColor: colors.primary,
                    height: 1,
                },
            }),
        [colors],
    );
}

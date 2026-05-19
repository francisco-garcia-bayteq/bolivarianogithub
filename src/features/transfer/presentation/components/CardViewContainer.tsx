import {Image, StyleSheet, View} from 'react-native';
import {ThemeColors, useTheme} from '../../../../providers';
import React, {useMemo} from 'react';

type CardViewContainerProps = {
    children: React.ReactNode;
};

export function CardViewContainer({children}: Readonly<CardViewContainerProps>) {
    const {colors} = useTheme();
    const styles = useStyles(colors);

    return (
        <View style={styles.cardInfoContainer}>
            <View style={styles.watermarkLayer} pointerEvents="none">
               <Image
               source={require('../../../../../assets/images/voucher_background.png')}
               />
            </View>
            <View style={styles.foreground}>{children}</View>
        </View>
    );
}

function useStyles(colors: ThemeColors) {
    return useMemo(
        () =>
            StyleSheet.create({
                cardInfoContainer: {
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    alignSelf: 'center',
                    width: '100%',
                    padding:8,
                    overflow: 'hidden',
                },
                watermarkLayer: {
                    ...StyleSheet.absoluteFill,
                },
                watermarkImg: {
                    position: 'absolute',
                    opacity: 0.35,
                    transform: [{rotate: '-30deg'}],
                },
                foreground: {

                    width: '100%',
                    zIndex: 1,
                },
            }),
        [colors],
    );
}

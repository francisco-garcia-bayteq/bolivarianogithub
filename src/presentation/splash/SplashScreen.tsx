import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, type ThemeColors} from '../../providers';
import SplashBackground from '../../../assets/images/svg/splasn_background.svg';

const FIGMA_LOGO_URI =
  'https://www.figma.com/api/mcp/asset/d202396e-2cbe-4dff-b7eb-77b2627080b8';

export function SplashScreen() {
  const {colors} = useTheme();
  const styles = useStyles(colors);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.root}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <SplashBackground
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.centerWrapper,
            {
              opacity,
              transform: [{scale}],
            },
          ]}>
          <View style={styles.decorativeRing}>
            <Image source={{uri: FIGMA_LOGO_URI}} style={styles.logo} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
        },
        backgroundLayer: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        safe: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        centerWrapper: {
          width: 172.8,
          height: 172.8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        decorativeRing: {
          width: 172.8,
          height: 172.8,
          borderRadius: 86.4,
          borderWidth: 1,
          borderColor: colors.homeBorderSoft,
          justifyContent: 'center',
          alignItems: 'center',
        },
        logo: {
          width: 96,
          height: 96,
          borderRadius: 11,
        },
      }),
    [colors],
  );
}

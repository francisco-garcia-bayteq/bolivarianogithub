import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import {useTheme, type ThemeColors} from '../../providers';

const ROTATE_MS = 4500;
const FADE_MS = 700;

export interface LoginHeroImageCarouselProps {
  sourceA: ImageSourcePropType;
  sourceB: ImageSourcePropType;
  /** Altura del contenedor; las imágenes usan `resizeMode="contain"` para caber sin recortes. */
  height?: number;
}

export function LoginHeroImageCarousel({
  sourceA,
  sourceB,
  height = 180,
}: Readonly<LoginHeroImageCarouselProps>) {
  const {colors} = useTheme();
  const styles = useCarouselStyles(colors, height);
  const opacity0 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);

  const runCrossfade = useCallback(() => {
    const next = indexRef.current === 0 ? 1 : 0;
    indexRef.current = next;
    setActiveIndex(next);
    Animated.parallel([
      Animated.timing(next === 0 ? opacity0 : opacity1, {
        toValue: 1,
        duration: FADE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(next === 0 ? opacity1 : opacity0, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity0, opacity1]);

  useEffect(() => {
    const id = setInterval(() => {
      runCrossfade();
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [runCrossfade]);

  const a11yLabel = useMemo(
    () => `Ilustración ${activeIndex + 1} de 2`,
    [activeIndex],
  );

  return (
    <View
      style={styles.root}
      accessibilityRole="image"
      accessibilityLabel={a11yLabel}
      accessibilityLiveRegion="polite">
      <Animated.Image
        source={sourceA}
        style={[styles.image, {opacity: opacity0}]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Animated.Image
        source={sourceB}
        style={[styles.image, {opacity: opacity1}]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

function useCarouselStyles(colors: ThemeColors, height: number) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignSelf: 'stretch',
          width: '100%',
          height,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.background,
        },
        image: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      }),
    [colors.background, height],
  );
}

import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

const bannerImage = require('../../../../assets/images/promotions_home.png');

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 94,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export function PromotionalBanner() {
  return (
    <View style={styles.container}>
      <Image
        source={bannerImage}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="Promoción Banco Bolivariano"
      />
    </View>
  );
}

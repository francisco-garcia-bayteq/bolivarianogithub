import {resolveBannerLandscape} from '../homeBannerLandscapeMap';

const CAR = require('../../../../../assets/images/home_banner/car.png');

describe('resolveBannerLandscape', () => {
  test('cadena vacía o solo espacios → none', () => {
    expect(resolveBannerLandscape('')).toEqual({kind: 'none'});
    expect(resolveBannerLandscape('   ')).toEqual({kind: 'none'});
  });

  test('URL http y https → remote', () => {
    expect(resolveBannerLandscape('https://cdn.example.com/b.png')).toEqual({
      kind: 'remote',
      uri: 'https://cdn.example.com/b.png',
    });
    expect(resolveBannerLandscape('http://local/x')).toEqual({
      kind: 'remote',
      uri: 'http://local/x',
    });
    expect(resolveBannerLandscape('  HTTPS://a  ')).toEqual({
      kind: 'remote',
      uri: 'HTTPS://a',
    });
  });

  test('código local conocido (case y .png)', () => {
    expect(resolveBannerLandscape('car')).toEqual({
      kind: 'local',
      source: CAR,
    });
    expect(resolveBannerLandscape('CAR.png')).toEqual({
      kind: 'local',
      source: CAR,
    });
    expect(resolveBannerLandscape(' House.PNG ')).toEqual({
      kind: 'local',
      source: require('../../../../../assets/images/home_banner/house.png'),
    });
  });

  test('código desconocido → none', () => {
    expect(resolveBannerLandscape('no-existe')).toEqual({kind: 'none'});
    expect(resolveBannerLandscape('carro')).toEqual({kind: 'none'});
  });
});

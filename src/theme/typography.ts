import { Platform } from 'react-native';

export const typography = {
  regular: Platform.select({ ios: 'AvenirNext-Regular', android: 'sans-serif' }) ?? 'sans-serif',
  medium: Platform.select({ ios: 'AvenirNext-Medium', android: 'sans-serif-medium' }) ?? 'sans-serif-medium',
  demi: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' }) ?? 'sans-serif-medium',
  bold: Platform.select({ ios: 'AvenirNext-Bold', android: 'sans-serif-bold' }) ?? 'sans-serif-bold',
};

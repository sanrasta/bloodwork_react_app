/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#dc2626';
const tintColorDark = '#dc2626';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Extended tokens to support app theming
    card: '#f5f5f5',
    muted: '#6B7280',
    border: '#E5E7EB',
    accentBlue: '#1D4ED8',
    accentRed: '#DC2626',
    accentAmber: '#F59E0B',
  },
  dark: {
    text: '#E5E5E5',
    background: '#0a0a0a',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    // Extended tokens to support app theming
    card: '#1a1a1a',
    muted: '#9CA3AF',
    border: '#2a2a2a',
    accentBlue: '#1E3A8A',
    accentRed: '#DC2626',
    accentAmber: '#F59E0B',
  },
};

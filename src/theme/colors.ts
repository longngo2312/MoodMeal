export interface ColorPalette {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryVariant: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  tabBar: string;
  header: string;
  cardBackground: string;
  inputBorder: string;
  placeholder: string;
  gradientStart: string;
  gradientEnd: string;
}

export const darkColors: ColorPalette = {
  background: '#111111',
  surface: '#2c2c2c',
  surfaceVariant: '#3a3a3a',
  primary: '#3d1bf9',
  primaryVariant: '#826ef5',
  accent: '#00e6ff',
  text: '#eeeeee',
  textSecondary: '#bbbbbb',
  textMuted: '#999999',
  border: '#444444',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  tabBar: '#1a1a1a',
  header: '#4037df',
  cardBackground: '#111111',
  inputBorder: '#555555',
  placeholder: '#606060',
  gradientStart: '#3d1bf9',
  gradientEnd: '#826ef5',
};

export const lightColors: ColorPalette = {
  background: '#f5f5f7',
  surface: '#ffffff',
  surfaceVariant: '#f0f0f0',
  primary: '#3d1bf9',
  primaryVariant: '#826ef5',
  accent: '#0099cc',
  text: '#1a1a1a',
  textSecondary: '#555555',
  textMuted: '#999999',
  border: '#e0e0e0',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  info: '#1976d2',
  tabBar: '#ffffff',
  header: '#4037df',
  cardBackground: '#ffffff',
  inputBorder: '#d1d5db',
  placeholder: '#9ca3af',
  gradientStart: '#3d1bf9',
  gradientEnd: '#826ef5',
};

// TODO: [Phase 1.2] Add new glass/glow token fields to this interface:
//   glass: string           — frosted glass card background  rgba(255,255,255,0.06)
//   glassBorder: string     — glass edge highlight           rgba(255,255,255,0.12)
//   glassHighlight: string  — glass inner shine              rgba(255,255,255,0.18)
//   glow: string            — primary violet glow            rgba(130,110,245,0.4)
//   accentGlow: string      — cyan glow                      rgba(0,230,255,0.3)
//   backgroundDeep: string  — deeper space background        #060614
// RESOURCE: TypeScript interfaces — https://www.typescriptlang.org/docs/handbook/2/objects.html
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

// TODO: [Phase 1.2] After adding fields to ColorPalette above, add matching values
//   to BOTH darkColors and lightColors below.
//   darkColors:  backgroundDeep: '#060614', glass: 'rgba(255,255,255,0.06)', etc.
//   lightColors: backgroundDeep: '#e8e8f0', glass: 'rgba(0,0,0,0.04)', etc.
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

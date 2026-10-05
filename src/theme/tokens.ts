/** Design tokens from screens_src/_tokens.css — iraqi-bold v4 */
export const colors = {
  brand: '#063A46',
  brandSoft: '#0A4D5C',
  brandMuted: '#0E5C6E',
  money: '#F5A623',
  moneyBright: '#FFB020',
  moneySoft: '#FFF4E0',
  moneyDark: '#B8770A',
  bg: '#F7F3EC',
  surface: '#FFFFFF',
  border: '#E8E0D4',
  text: '#1A1A1A',
  muted: '#6B6560',
  danger: '#D64545',
  dangerSoft: '#FDECEC',
  warn: '#F5A623',
  warnSoft: '#FFF4E0',
  success: '#0A4D5C',
  successSoft: '#E6F2F4',
  successBorder: '#B8D4DA',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  jumbo: 36,
} as const;

export const tapMin = 64;

export const shadow = {
  sm: {
    shadowColor: '#063A46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  md: {
    shadowColor: '#063A46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  money: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
} as const;

export const fonts = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extraBold: 'Cairo_800ExtraBold',
} as const;

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

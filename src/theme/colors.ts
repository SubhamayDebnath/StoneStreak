export const lightColors = {
  background: '#FAFAFA', // Tailwind neutral-50 / zinc-50
  card: '#FFFFFF',
  cardSubtle: '#F4F4F5', // Tailwind zinc-100
  text: '#09090B', // Tailwind zinc-950
  textSecondary: '#71717A', // Tailwind zinc-500
  border: '#EAEAEB', // Soft, very close to card #FFFFFF
  borderSubtle: '#EAEAEB',
  primary: '#6366F1', // Soft pastel indigo accent
  primaryLight: '#EEF2FF', // Pastel indigo-50
  onPrimary: '#FFFFFF',
  streak: '#FB923C', // Soft pastel flame
  success: '#34D399', // Pastel mint / sage
  successLight: '#ECFDF5',
  warning: '#FBBF24', // Pastel honey
  warningLight: '#FFFBEB',
  danger: '#F87171', // Pastel coral rose
  dangerLight: '#FEF2F2',
  dangerSolid: '#EF4444',
  heat0: '#EAEAEB',
  heat1: '#C7D2FE',
  heat2: '#A5B4FC',
  heat3: '#818CF8',
  heat4: '#6366F1',
};

export type AppColors = typeof lightColors;

export const darkColors: AppColors = {
  background: '#09090B', // Pure rich neutral zinc (NOT bluish black)
  card: '#18181B', // Tailwind zinc-900 neutral card
  cardSubtle: '#27272A', // Tailwind zinc-800
  text: '#FAFAFA', // Tailwind zinc-50
  textSecondary: '#A1A1AA', // Tailwind zinc-400
  border: '#262629', // Very close to card #18181B (subtle, soft, low-contrast)
  borderSubtle: '#262629',
  primary: '#818CF8', // Soft pastel periwinkle indigo
  primaryLight: '#1E2038',
  onPrimary: '#FFFFFF',
  streak: '#FB923C', // Soft pastel flame
  success: '#34D399', // Pastel mint / sage
  successLight: '#064E3B',
  warning: '#FBBF24', // Pastel honey
  warningLight: '#451A03',
  danger: '#F87171', // Pastel coral rose
  dangerLight: '#450A0A',
  dangerSolid: '#EF4444',
  heat0: '#262629', // neutral zinc dark cell
  heat1: '#312E81',
  heat2: '#3730A3',
  heat3: '#4F46E5',
  heat4: '#818CF8',
};

// Curated pastel palette for modern aesthetic habit tracking
export const habitPalette = [
  '#6366F1', // Pastel Indigo
  '#34D399', // Pastel Mint / Sage
  '#FB923C', // Pastel Tangerine / Peach
  '#F472B6', // Pastel Blossom Pink
  '#A78BFA', // Pastel Lavender
  '#38BDF8', // Pastel Sky Cyan
  '#FBBF24', // Pastel Warm Honey
  '#F87171', // Pastel Coral Rose
  '#2DD4BF', // Pastel Seafoam Teal
  '#C084FC', // Pastel Soft Lilac
  '#A3E635', // Pastel Soft Lime
  '#FB7185', // Pastel Soft Berry
  '#60A5FA', // Pastel Soft Denim
  '#FDBA74', // Pastel Soft Apricot
];

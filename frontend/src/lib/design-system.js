/**
 * Japanese Minimalist Design System Configuration
 * Centralized design tokens and component variants for Student AI Toolkit
 * Inspired by Japanese 90s minimalist design principles
 */

export const colors = {
  // Japanese-inspired color palette
  primary: {
    50: 'oklch(0.98 0.01 240)',   // Very light slate
    100: 'oklch(0.95 0.02 240)',  // Light slate
    200: 'oklch(0.9 0.03 240)',   // Pale slate
    300: 'oklch(0.8 0.05 240)',   // Soft slate
    400: 'oklch(0.6 0.08 240)',   // Medium slate
    500: 'oklch(0.4 0.12 240)',   // Deep slate
    600: 'oklch(0.35 0.15 240)',  // Rich slate
    700: 'oklch(0.3 0.18 240)',   // Dark slate
    800: 'oklch(0.25 0.2 240)',   // Deep dark slate
    900: 'oklch(0.2 0.22 240)',   // Charcoal
  },
  
  // Japanese paper and ink colors
  paper: {
    50: 'oklch(0.99 0.005 60)',   // Pure white
    100: 'oklch(0.98 0.01 60)',   // Warm white
    200: 'oklch(0.96 0.015 60)',  // Cream
    300: 'oklch(0.94 0.02 60)',   // Light cream
    400: 'oklch(0.92 0.025 60)',  // Warm cream
  },
  
  ink: {
    50: 'oklch(0.95 0.01 240)',   // Very light gray
    100: 'oklch(0.9 0.015 240)',  // Light gray
    200: 'oklch(0.8 0.02 240)',   // Medium light gray
    300: 'oklch(0.7 0.025 240)',  // Medium gray
    400: 'oklch(0.6 0.03 240)',   // Dark gray
    500: 'oklch(0.5 0.035 240)',  // Charcoal
    600: 'oklch(0.4 0.04 240)',   // Deep charcoal
    700: 'oklch(0.3 0.045 240)',  // Almost black
    800: 'oklch(0.2 0.05 240)',   // Rich black
    900: 'oklch(0.1 0.055 240)',  // Pure black
  },
  
  // Japanese accent colors
  accent: {
    red: {
      50: 'oklch(0.98 0.02 27)',   // Soft red
      100: 'oklch(0.95 0.03 27)',  // Light red
      500: 'oklch(0.6 0.15 27)',   // Traditional red
      600: 'oklch(0.5 0.18 27)',   // Deep red
    },
    green: {
      50: 'oklch(0.95 0.02 140)',  // Soft green
      100: 'oklch(0.9 0.03 140)',  // Light green
      500: 'oklch(0.6 0.15 140)',  // Traditional green
      600: 'oklch(0.5 0.18 140)',  // Deep green
    },
    blue: {
      50: 'oklch(0.95 0.02 240)',  // Soft blue
      100: 'oklch(0.9 0.03 240)',  // Light blue
      500: 'oklch(0.6 0.15 240)',  // Traditional blue
      600: 'oklch(0.5 0.18 240)',  // Deep blue
    },
    purple: {
      50: 'oklch(0.98 0.02 280)',  // Soft purple
      100: 'oklch(0.95 0.03 280)', // Light purple
      500: 'oklch(0.6 0.15 280)',  // Traditional purple
      600: 'oklch(0.5 0.18 280)',  // Deep purple
    },
    yellow: {
      50: 'oklch(0.98 0.02 60)',   // Soft yellow
      100: 'oklch(0.95 0.03 60)',  // Light yellow
      500: 'oklch(0.7 0.15 60)',   // Traditional yellow
      600: 'oklch(0.6 0.18 60)',   // Deep yellow
    },
    cyan: {
      50: 'oklch(0.98 0.02 180)',  // Soft cyan
      100: 'oklch(0.95 0.03 180)', // Light cyan
      500: 'oklch(0.6 0.15 180)',  // Traditional cyan
      600: 'oklch(0.5 0.18 180)',  // Deep cyan
    },
  },
  
  // Semantic colors with Japanese aesthetic
  success: {
    50: 'oklch(0.95 0.02 140)',
    100: 'oklch(0.9 0.03 140)',
    500: 'oklch(0.6 0.15 140)',
    600: 'oklch(0.5 0.18 140)',
  },
  
  warning: {
    50: 'oklch(0.98 0.02 60)',
    100: 'oklch(0.95 0.03 60)',
    500: 'oklch(0.7 0.15 60)',
    600: 'oklch(0.6 0.18 60)',
  },
  
  error: {
    50: 'oklch(0.98 0.02 27)',
    100: 'oklch(0.95 0.03 27)',
    500: 'oklch(0.6 0.15 27)',
    600: 'oklch(0.5 0.18 27)',
  },
  
  // Action-specific colors with Japanese inspiration
  actions: {
    summarize: {
      light: 'oklch(0.95 0.02 240)',
      main: 'oklch(0.4 0.15 240)',
      dark: 'oklch(0.3 0.2 240)',
    },
    questions: {
      light: 'oklch(0.95 0.02 140)',
      main: 'oklch(0.6 0.15 140)',
      dark: 'oklch(0.5 0.18 140)',
    },
    study: {
      light: 'oklch(0.95 0.02 280)',
      main: 'oklch(0.6 0.15 280)',
      dark: 'oklch(0.5 0.18 280)',
    },
    flashcards: {
      light: 'oklch(0.98 0.02 30)',
      main: 'oklch(0.7 0.15 30)',
      dark: 'oklch(0.6 0.18 30)',
    },
  },
}

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  // Japanese-inspired spacing
  '1/2': '0.125rem', // 2px - minimal spacing
  '3/4': '0.375rem', // 6px - subtle spacing
  '5/4': '1.25rem',  // 20px - comfortable spacing
  '3/2': '1.5rem',   // 24px - breathing room
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
  // Japanese-inspired border radius
  '1/2': '0.0625rem', // 1px - minimal rounding
  '3/4': '0.1875rem', // 3px - subtle rounding
  '5/4': '0.625rem',  // 10px - comfortable rounding
}

export const typography = {
  fontFamily: {
    // Japanese-inspired font stack
    sans: ['Inter', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'system-ui', 'sans-serif'],
    mono: ['Roboto Mono', 'Noto Sans Mono CJK JP', 'monospace'],
    serif: ['Noto Serif JP', 'Yu Mincho', 'serif'],
    // Japanese calligraphy-inspired
    display: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    // Japanese-inspired sizes
    '5/4': '1.25rem',   // 20px - comfortable reading
    '3/2': '1.5rem',    // 24px - emphasis
    '2/1': '2rem',      // 32px - strong emphasis
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    // Japanese-inspired weights
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    // Japanese-inspired line heights
    compact: '1.2',
    comfortable: '1.6',
    spacious: '1.8',
  },
  
  // Japanese typography principles
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

export const shadows = {
  // Japanese-inspired subtle shadows
  sm: '0 1px 2px 0 oklch(0 0 0 / 0.03)',
  md: '0 2px 4px -1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.04)',
  lg: '0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -1px oklch(0 0 0 / 0.05)',
  xl: '0 8px 12px -2px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.06)',
  '2xl': '0 12px 16px -4px oklch(0 0 0 / 0.12), 0 6px 8px -4px oklch(0 0 0 / 0.08)',
  inner: 'inset 0 1px 2px 0 oklch(0 0 0 / 0.04)',
  // Japanese paper-like shadows
  paper: '0 1px 3px 0 oklch(0 0 0 / 0.02), 0 1px 2px 0 oklch(0 0 0 / 0.01)',
  'paper-elevated': '0 2px 4px 0 oklch(0 0 0 / 0.04), 0 1px 2px 0 oklch(0 0 0 / 0.02)',
}

export const transitions = {
  fast: '120ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
  bounce: '200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Japanese-inspired smooth transitions
  smooth: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  gentle: '300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Japanese-inspired component variants
export const buttonVariants = {
  primary: {
    base: 'bg-ink-600 text-paper-50 hover:bg-ink-700 focus:ring-ink-500 transition-colors',
    disabled: 'bg-ink-300 text-paper-200 cursor-not-allowed',
  },
  secondary: {
    base: 'bg-paper-100 text-ink-700 hover:bg-paper-200 focus:ring-ink-500 transition-colors',
    disabled: 'bg-paper-50 text-ink-300 cursor-not-allowed',
  },
  outline: {
    base: 'border border-ink-200 bg-paper-50 hover:bg-paper-100 hover:border-ink-300 focus:ring-ink-500 transition-colors',
    disabled: 'border-ink-100 bg-paper-50 text-ink-300 cursor-not-allowed',
  },
  ghost: {
    base: 'hover:bg-paper-100 hover:text-ink-700 focus:ring-ink-500 transition-colors',
    disabled: 'text-ink-300 cursor-not-allowed',
  },
  // Japanese-inspired button variants
  minimal: {
    base: 'bg-transparent text-ink-600 hover:bg-paper-50 hover:text-ink-700 focus:ring-ink-500 transition-colors',
    disabled: 'text-ink-300 cursor-not-allowed',
  },
  subtle: {
    base: 'bg-paper-50 text-ink-600 hover:bg-paper-100 hover:text-ink-700 focus:ring-ink-500 transition-colors',
    disabled: 'bg-paper-50 text-ink-300 cursor-not-allowed',
  },
}

export const cardVariants = {
  default: 'bg-paper-50 text-ink-900 shadow-paper',
  elevated: 'bg-paper-50 text-ink-900 shadow-paper-elevated hover:shadow-lg transition-shadow',
  interactive: 'bg-paper-50 text-ink-900 shadow-paper hover:shadow-paper-elevated hover:-translate-y-0.5 transition-all cursor-pointer',
  // Japanese-inspired card variants
  minimal: 'bg-transparent text-ink-900 border border-ink-100',
  paper: 'bg-paper-50 text-ink-900 shadow-paper border border-paper-200',
  ink: 'bg-ink-900 text-paper-50 shadow-lg',
}

export const inputVariants = {
  default: 'flex h-10 w-full rounded-md border border-ink-200 bg-paper-50 px-3 py-2 text-sm ring-offset-paper-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  error: 'flex h-10 w-full rounded-md border border-accent-red-500 bg-paper-50 px-3 py-2 text-sm ring-offset-paper-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red-500 focus-visible:ring-offset-2',
  // Japanese-inspired input variants
  minimal: 'flex h-10 w-full border-b border-ink-200 bg-transparent px-3 py-2 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:border-ink-500 transition-colors',
  subtle: 'flex h-10 w-full rounded-md border border-paper-200 bg-paper-50 px-3 py-2 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 transition-colors',
}

// Japanese-inspired animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  // Japanese-inspired animations
  gentleFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  smoothSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  paperLift: {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

// Japanese design principles
export const japaneseDesign = {
  // Ma (間) - The concept of space and intervals
  spacing: {
    minimal: '0.125rem',    // 2px - minimal space
    subtle: '0.375rem',     // 6px - subtle space
    comfortable: '1.25rem', // 20px - comfortable space
    breathing: '2rem',      // 32px - breathing room
    spacious: '3rem',       // 48px - spacious area
  },
  
  // Wabi-sabi - Finding beauty in imperfection
  aesthetics: {
    asymmetry: 'prefer asymmetric layouts',
    imperfection: 'embrace subtle irregularities',
    natural: 'use organic, flowing shapes',
    simplicity: 'remove unnecessary elements',
  },
  
  // Zen principles
  zen: {
    focus: 'single point of attention',
    clarity: 'clear visual hierarchy',
    harmony: 'balanced composition',
    tranquility: 'calm, peaceful atmosphere',
  },
}

// Utility functions
export const getActionColor = (actionId) => {
  return colors.actions[actionId] || colors.actions.summarize
}

export const getActionGradient = (actionId) => {
  const color = getActionColor(actionId)
  return `linear-gradient(135deg, ${color.light} 0%, ${color.main} 50%, ${color.dark} 100%)`
}

export const createStaggerAnimation = (delay = 0.1) => ({
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { staggerChildren: delay },
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
})

// Japanese-inspired utility functions
export const createJapaneseAnimation = (type = 'gentle') => {
  const animations = {
    gentle: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    paper: {
      initial: { opacity: 0, y: 10, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -10, scale: 0.98 },
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    ink: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  }
  return animations[type] || animations.gentle
}

export const getJapaneseSpacing = (size = 'comfortable') => {
  return japaneseDesign.spacing[size] || japaneseDesign.spacing.comfortable
} 
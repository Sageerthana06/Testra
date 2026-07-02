export const COLORS = {
  dark: {
    background: '#0B0F19',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textMuted: '#94A3B8',

    primary: '#D4AF37', // Metallic Gold
    primaryGlow: 'rgba(212, 175, 55, 0.2)',

    // Green
    success: '#22C55E',

    // Red
    error: '#DC2626',

    // Yellow
    warning: '#EAB308',

    info: '#3B82F6',

    glassGrad: [
      'rgba(255, 255, 255, 0.08)',
      'rgba(255, 255, 255, 0.02)'
    ],

    goldGrad: ['#F3E7C4', '#D4AF37', '#AA7C11'],
  },

  light: {
    background: '#F8FAFC',
    cardBg: 'rgba(255, 255, 255, 0.7)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',

    text: '#0F172A',
    textMuted: '#64748B',

    primary: '#AA7C11',
    primaryGlow: 'rgba(170, 124, 17, 0.1)',

    // Green
    success: '#16A34A',

    // Red
    error: '#EF4444',

    // Yellow
    warning: '#F59E0B',

    info: '#2563EB',

    glassGrad: [
      'rgba(255, 255, 255, 0.9)',
      'rgba(255, 255, 255, 0.6)'
    ],

    goldGrad: ['#D4AF37', '#AA7C11'],
  }
};

export const GLASS_PRESETS = {
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },

  button: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  }
};
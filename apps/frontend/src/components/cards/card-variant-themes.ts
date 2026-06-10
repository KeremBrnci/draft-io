import type { CardTemplateTheme, CardVariant } from '@draft-io/shared-types';

/** Default visual themes per card edition — aligns with future `CardTemplate` rows. */
export const CARD_VARIANT_THEMES: Readonly<Record<CardVariant, CardTemplateTheme>> = {
  base: {
    variant: 'base',
    label: 'Base',
    primaryColor: '#F0D27A',
    secondaryColor: '#F8E7A7',
    accentColor: '#DDB95A',
    animationKey: 'shimmer-gold',
  },
  hero: {
    variant: 'hero',
    label: 'Hero',
    primaryColor: '#c45c26',
    secondaryColor: '#ffd4b8',
    accentColor: '#8f3a12',
    animationKey: 'shimmer-hero',
  },
  icon: {
    variant: 'icon',
    label: 'Icon',
    primaryColor: '#9aabb8',
    secondaryColor: '#eef3f7',
    accentColor: '#5c6d7a',
    animationKey: 'shimmer-icon',
  },
  toty: {
    variant: 'toty',
    label: 'TOTY',
    primaryColor: '#1a9bb8',
    secondaryColor: '#c8f0fa',
    accentColor: '#0d6b82',
    animationKey: 'shimmer-toty',
  },
  event: {
    variant: 'event',
    label: 'Event',
    primaryColor: '#7b3fbf',
    secondaryColor: '#e8d4ff',
    accentColor: '#4f2480',
    animationKey: 'shimmer-event',
  },
} as const;

export const CARD_VARIANT_ORDER: readonly CardVariant[] = ['base', 'hero', 'icon', 'toty', 'event'];

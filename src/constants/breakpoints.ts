export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const

export const isMobileViewport = (width = typeof window !== 'undefined' ? window.innerWidth : 1024) =>
  width < BREAKPOINTS.MOBILE

export const isTabletViewport = (width = typeof window !== 'undefined' ? window.innerWidth : 1024) =>
  width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET

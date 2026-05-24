export type TabId =
  | 'simple-calculator'
  | 'advanced-calculator'
  | 'affordability'
  | 'compare-scenarios'
  | 'homes-by-payment'
  | 'learning-center'
  | 'partners';

export interface TabLink {
  id: TabId;
  path: string;
  label: string;
  shortLabel: string;
}

export const TAB_LINKS: TabLink[] = [
  { id: 'simple-calculator', path: '/simple-calculator', label: 'Simple Calculator', shortLabel: 'Simple' },
  { id: 'advanced-calculator', path: '/advanced-calculator', label: 'Advanced', shortLabel: 'Advanced' },
  { id: 'affordability', path: '/affordability', label: 'Affordability', shortLabel: 'Afford' },
  { id: 'compare-scenarios', path: '/compare-scenarios', label: 'Compare', shortLabel: 'Compare' },
  { id: 'homes-by-payment', path: '/homes-by-payment', label: 'Homes by Payment', shortLabel: 'Homes' },
  { id: 'learning-center', path: '/learning-center', label: 'Learn', shortLabel: 'Learn' },
  { id: 'partners', path: '/partners', label: 'Partners', shortLabel: 'Partners' },
];

export type FontVariantId = 'default' | '1' | '2' | '3' | '4' | '5';

export type FontVariant = {
  id: FontVariantId;
  label: string;
  htmlClass: string;
  path: string;
};

const base = import.meta.env.BASE_URL;

export const FONT_VARIANTS: Record<FontVariantId, FontVariant> = {
  default: {
    id: 'default',
    label: 'Times New Roman',
    htmlClass: 'font-variant-default',
    path: base,
  },
  '1': {
    id: '1',
    label: 'Open Sans',
    htmlClass: 'font-variant-1',
    path: `${base}1/`,
  },
  '2': {
    id: '2',
    label: 'Google Sans',
    htmlClass: 'font-variant-2',
    path: `${base}2/`,
  },
  '3': {
    id: '3',
    label: 'Manrope',
    htmlClass: 'font-variant-3',
    path: `${base}3/`,
  },
  '4': {
    id: '4',
    label: 'Geist Mono',
    htmlClass: 'font-variant-4',
    path: `${base}4/`,
  },
  '5': {
    id: '5',
    label: 'Wix Madefor Text',
    htmlClass: 'font-variant-5',
    path: `${base}5/`,
  },
};

export const FONT_VARIANT_LIST: FontVariant[] = [
  FONT_VARIANTS.default,
  FONT_VARIANTS['1'],
  FONT_VARIANTS['2'],
  FONT_VARIANTS['3'],
  FONT_VARIANTS['4'],
  FONT_VARIANTS['5'],
];

export function getFontVariant(id: FontVariantId): FontVariant {
  return FONT_VARIANTS[id];
}

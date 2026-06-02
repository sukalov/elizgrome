export type Lang = 'en' | 'ru';
export type Localized = Record<Lang, string>;
type LayoutPoint = { x: number; y: number };

export type CmsLanding = {
  site: {
    seo: {
      title: Localized;
      description: Localized;
    };
    promo_pack?: { url: string; label: Localized };
  };
  sections: {
    about: {
      title: Localized;
      hero: { desktop: string; mobile: string };
      text: Localized;
    };
    releases: {
      title: Localized;
      items: { title: Localized; year: string; image: string }[];
    };
    concerts: {
      title: Localized;
      items: { title: Localized; note?: Localized; url?: string }[];
    };
    merch: {
      title: Localized;
      order_label: Localized;
      groups: {
        shirts: { title: Localized; items: { image: string }[] };
        vinyl: { title: Localized; items: { image: string }[] };
        picks: { title: Localized };
      };
    };
    contacts: {
      title: Localized;
      links: {
        id: 'instagram' | 'telegram' | 'tiktok' | 'mail' | 'youtube';
        url: string;
      }[];
    };
  };
};

export type Landing = {
  site: {
    seo: CmsLanding['site']['seo'];
    navigation: {
      logo: Localized;
      menu_label: Localized;
      search_label: Localized;
      language_label: Localized;
      promo_pack: { url: string; label: Localized };
      section_links: { target: string; label: Localized }[];
    };
  };
  sections: {
    about: CmsLanding['sections']['about'];
    releases: {
      title: Localized;
      items: {
        id: string;
        title: Localized;
        year: string;
        image: string;
        layout: { desktop: LayoutPoint };
      }[];
    };
    concerts: {
      title: Localized;
      items: {
        id: string;
        title: Localized;
        note: Localized;
        url?: string;
        style: 'primary' | 'secondary';
        layout: { desktop: LayoutPoint; mobile: LayoutPoint };
      }[];
    };
    merch: {
      title: Localized;
      order_label: Localized;
      groups: {
        shirts: { title: Localized; items: { id: string; alt: Localized; image: string }[] };
        vinyl: { title: Localized; items: { id: string; alt: Localized; image: string }[] };
        picks: { title: Localized };
      };
    };
    contacts: {
      title: Localized;
      links: {
        id: 'instagram' | 'telegram' | 'tiktok' | 'mail' | 'youtube';
        label: string;
        url: string;
        layout: { desktop: LayoutPoint; mobile: LayoutPoint };
      }[];
    };
  };
};

const NAV_LOGO: Localized = { en: 'logo', ru: 'лого' };
const NAV_MENU: Localized = { en: 'Open navigation menu', ru: 'Открыть меню' };
const NAV_SEARCH: Localized = { en: 'Search', ru: 'Поиск' };
const NAV_LANGUAGE: Localized = { en: 'RU / ENG', ru: 'RU / ENG' };
const DEFAULT_PROMO: { url: string; label: Localized } = {
  url: '#contacts',
  label: { en: 'promo-pack', ru: 'промо-пак' },
};

const SECTION_TARGETS = ['about', 'releases', 'concerts', 'merch', 'contacts'] as const;

const RELEASE_IDS = ['hard-day', 'help', 'rubber-soul', 'revolver', 'last-room'] as const;
const RELEASE_LAYOUTS: { desktop: LayoutPoint }[] = [
  { desktop: { x: 7, y: 19 } },
  { desktop: { x: 56, y: 12 } },
  { desktop: { x: 63, y: 60 } },
  { desktop: { x: 31, y: 49 } },
  { desktop: { x: 10, y: 73 } },
];

const CONCERT_IDS = ['picnic-moscow', 'sunny-concert', 'omanko-day', 'spb-picnic', 'motherland'] as const;
const CONCERT_STYLES: ('primary' | 'secondary')[] = [
  'secondary',
  'secondary',
  'secondary',
  'secondary',
  'secondary',
];
const CONCERT_LAYOUTS: { desktop: LayoutPoint; mobile: LayoutPoint }[] = [
  { desktop: { x: 6, y: 16 }, mobile: { x: 6, y: 11 } },
  { desktop: { x: 67, y: 20 }, mobile: { x: 47, y: 31 } },
  { desktop: { x: 18, y: 58 }, mobile: { x: 10, y: 58 } },
  { desktop: { x: 76, y: 67 }, mobile: { x: 55, y: 72 } },
  { desktop: { x: 42, y: 82 }, mobile: { x: 26, y: 84 } },
];

const CONTACT_LABELS: Record<CmsLanding['sections']['contacts']['links'][number]['id'], string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  tiktok: 'TikTok',
  mail: 'Mail',
  youtube: 'YouTube',
};

const CONTACT_LAYOUTS: Record<
  CmsLanding['sections']['contacts']['links'][number]['id'],
  { desktop: LayoutPoint; mobile: LayoutPoint }
> = {
  instagram: { desktop: { x: 18, y: 24 }, mobile: { x: 12, y: 18 } },
  telegram: { desktop: { x: 64, y: 18 }, mobile: { x: 54, y: 17 } },
  tiktok: { desktop: { x: 42, y: 44 }, mobile: { x: 20, y: 48 } },
  mail: { desktop: { x: 92, y: 62 }, mobile: { x: 92, y: 64 } },
  youtube: { desktop: { x: 24, y: 70 }, mobile: { x: 36, y: 78 } },
};

const MERCH_ALT: Record<'shirts' | 'vinyl', Localized> = {
  shirts: { en: 'T-shirt product photo', ru: 'Фото футболки' },
  vinyl: { en: 'Vinyl product photo', ru: 'Фото винила' },
};

const EMPTY_LOCALIZED: Localized = { en: '', ru: '' };

function merchProducts(
  group: 'shirts' | 'vinyl',
  items: { image: string }[],
): { id: string; alt: Localized; image: string }[] {
  const alt = MERCH_ALT[group];
  return items.map((item, index) => ({
    id: `${group === 'shirts' ? 'shirt' : 'vinyl'}-${index + 1}`,
    alt,
    image: item.image,
  }));
}

function sectionLinks(sections: CmsLanding['sections']) {
  const titles: Record<(typeof SECTION_TARGETS)[number], Localized> = {
    about: sections.about.title,
    releases: sections.releases.title,
    concerts: sections.concerts.title,
    merch: sections.merch.title,
    contacts: sections.contacts.title,
  };

  return SECTION_TARGETS.map((target) => ({
    target,
    label: titles[target],
  }));
}

export function mergeLandingData(cms: CmsLanding): Landing {
  return {
    site: {
      seo: cms.site.seo,
      navigation: {
        logo: NAV_LOGO,
        menu_label: NAV_MENU,
        search_label: NAV_SEARCH,
        language_label: NAV_LANGUAGE,
        promo_pack: cms.site.promo_pack ?? DEFAULT_PROMO,
        section_links: sectionLinks(cms.sections),
      },
    },
    sections: {
      about: cms.sections.about,
      releases: {
        title: cms.sections.releases.title,
        items: cms.sections.releases.items.map((item, index) => ({
          ...item,
          id: RELEASE_IDS[index] ?? `release-${index + 1}`,
          layout: RELEASE_LAYOUTS[index] ?? RELEASE_LAYOUTS[0],
        })),
      },
      concerts: {
        title: cms.sections.concerts.title,
        items: cms.sections.concerts.items.map((item, index) => ({
          id: CONCERT_IDS[index] ?? `concert-${index + 1}`,
          title: item.title,
          note: item.note ?? EMPTY_LOCALIZED,
          url: item.url,
          style: CONCERT_STYLES[index] ?? 'secondary',
          layout: CONCERT_LAYOUTS[index] ?? CONCERT_LAYOUTS[0],
        })),
      },
      merch: {
        title: cms.sections.merch.title,
        order_label: cms.sections.merch.order_label,
        groups: {
          shirts: {
            title: cms.sections.merch.groups.shirts.title,
            items: merchProducts('shirts', cms.sections.merch.groups.shirts.items),
          },
          vinyl: {
            title: cms.sections.merch.groups.vinyl.title,
            items: merchProducts('vinyl', cms.sections.merch.groups.vinyl.items),
          },
          picks: cms.sections.merch.groups.picks,
        },
      },
      contacts: {
        title: cms.sections.contacts.title,
        links: cms.sections.contacts.links.map((link) => ({
          ...link,
          label: CONTACT_LABELS[link.id],
          layout: CONTACT_LAYOUTS[link.id],
        })),
      },
    },
  };
}

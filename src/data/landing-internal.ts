export type Lang = 'en' | 'ru';
export type Localized = Record<Lang, string>;
type LayoutPoint = { x: number; y: number };

export type CmsSong = {
  title: Localized;
  lyrics: string;
};

export type SearchSong = CmsSong & {
  id: string;
  releaseTitle: Localized;
  releaseYear: string;
};

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
      items: {
        title: Localized;
        year: string;
        image?: string;
        songs?: CmsSong[];
        layout: { desktop: LayoutPoint };
      }[];
    };
    concerts: {
      title: Localized;
      items: {
        title: Localized;
        note?: Localized;
        url?: string;
        layout: { desktop: LayoutPoint; mobile: LayoutPoint };
      }[];
    };
    merch: {
      title: Localized;
      order_link: { ru: string; en: string; url: string };
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
        layout: { desktop: LayoutPoint; mobile: LayoutPoint };
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
  search: {
    songs: SearchSong[];
  };
  sections: {
    about: CmsLanding['sections']['about'];
    releases: {
      title: Localized;
      items: {
        id: string;
        title: Localized;
        year: string;
        image?: string;
        songs: CmsSong[];
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
      order_link: { url: string; label: Localized };
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

const CONCERT_IDS = ['picnic-moscow', 'sunny-concert', 'omanko-day', 'spb-picnic', 'motherland'] as const;
const CONCERT_STYLES: ('primary' | 'secondary')[] = [
  'secondary',
  'secondary',
  'secondary',
  'secondary',
  'secondary',
];
const CONTACT_LABELS: Record<CmsLanding['sections']['contacts']['links'][number]['id'], string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  tiktok: 'TikTok',
  mail: 'Mail',
  youtube: 'YouTube',
};

const MERCH_ALT: Record<'shirts' | 'vinyl', Localized> = {
  shirts: { en: 'T-shirt product photo', ru: 'Фото футболки' },
  vinyl: { en: 'Vinyl product photo', ru: 'Фото винила' },
};

const EMPTY_LOCALIZED: Localized = { en: '', ru: '' };

function upperLocalized(value: Localized): Localized {
  return {
    en: value.en.toLocaleUpperCase('en'),
    ru: value.ru.toLocaleUpperCase('ru'),
  };
}

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
    about: upperLocalized(sections.about.title),
    releases: upperLocalized(sections.releases.title),
    concerts: upperLocalized(sections.concerts.title),
    merch: upperLocalized(sections.merch.title),
    contacts: upperLocalized(sections.contacts.title),
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
    search: {
      songs: cms.sections.releases.items.flatMap((release, releaseIndex) => {
        const releaseId = `release-${releaseIndex + 1}`;

        return (release.songs ?? []).map((song, songIndex) => ({
          ...song,
          id: `${releaseId}-song-${songIndex + 1}`,
          releaseTitle: release.title,
          releaseYear: release.year,
        }));
      }),
    },
    sections: {
      about: {
        ...cms.sections.about,
        title: upperLocalized(cms.sections.about.title),
      },
      releases: {
        title: upperLocalized(cms.sections.releases.title),
        items: cms.sections.releases.items.map((item, index) => ({
          ...item,
          id: `release-${index + 1}`,
          songs: item.songs ?? [],
        })),
      },
      concerts: {
        title: upperLocalized(cms.sections.concerts.title),
        items: cms.sections.concerts.items.map((item, index) => ({
          id: CONCERT_IDS[index] ?? `concert-${index + 1}`,
          title: item.title,
          note: item.note ?? EMPTY_LOCALIZED,
          url: item.url,
          style: CONCERT_STYLES[index] ?? 'secondary',
          layout: item.layout,
        })),
      },
      merch: {
        title: upperLocalized(cms.sections.merch.title),
        order_link: {
          url: cms.sections.merch.order_link.url,
          label: {
            ru: cms.sections.merch.order_link.ru,
            en: cms.sections.merch.order_link.en,
          },
        },
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
        title: upperLocalized(cms.sections.contacts.title),
        links: cms.sections.contacts.links.map((link) => ({
          ...link,
          label: CONTACT_LABELS[link.id],
        })),
      },
    },
  };
}

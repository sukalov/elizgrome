import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, SearchIcon, XIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import type { CSSProperties, MouseEvent, ReactNode} from "react"
type Lang = "en" | "ru"
type Localized = Record<Lang, string>

type SectionLink = {
  target: string
  label: Localized
}

type SearchSong = {
  id: string
  title: Localized
  releaseTitle: Localized
  releaseYear: string
  lyrics: string
}

type SearchResult = {
  id: string
  song: SearchSong
  snippet: string
  highlightStart: number
  highlightEnd: number
}

type SiteNavbarProps = {
  logo: Localized
  logoSvg: string
  menuLabel: Localized
  searchLabel: Localized
  languageLabel: Localized
  promoPack: {
    url: string
    label: Localized
  }
  sectionLinks: SectionLink[]
  searchSongs: SearchSong[]
}


/**
 * Logo shrink-on-scroll tuning.
 * progress 0 = top of page, 1 = after `scrollDistancePx` of scroll.
 *
 * Vertical position uses two knobs per breakpoint:
 * - `topStart` / `topEnd` — CSS `top` (px from viewport top)
 * - `translateYPerycentEnd` — extra upward shift at full scroll (% of logo height)
 *
 * If the logo jumps off-screen, change `topEnd` and `translateYPercentEnd` together,
 * not only `topStart`.
 */
const LOGO_ON_SCROLL = {
  scrollDistancePx: 140,
  mobile: {
    topStart: 32,
    topEnd: 22,
    heightStart: 110,
    heightEnd: 32,
    translateYPercentEnd: -50,
  },
  desktop: {
    topStart: 42,
    topEnd: 24,
    heightStart: 159,
    heightEnd: 42,
    translateYPercentEnd: -50,
  },
} as const

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function text(value: Localized, lang: Lang) {
  return value[lang] || value.en
}

function normalizeSearch(value: string) {
  let normalized = ""
  const starts: number[] = []
  const ends: number[] = []
  let index = 0
  let pendingSpace: { start: number; end: number } | null = null

  function addPendingSpace() {
    if (!pendingSpace || !normalized || normalized.endsWith(" ")) return

    normalized += " "
    starts.push(pendingSpace.start)
    ends.push(pendingSpace.end)
  }

  for (const char of value) {
    const nextIndex = index + char.length
    const folded = char.toLocaleLowerCase("ru").replaceAll("ё", "е")

    if (/^[\p{L}\p{N}]$/u.test(folded)) {
      addPendingSpace()
      normalized += folded
      starts.push(index)
      ends.push(nextIndex)
      pendingSpace = null
    } else {
      pendingSpace = pendingSpace
        ? { start: pendingSpace.start, end: nextIndex }
        : { start: index, end: nextIndex }
    }

    index = nextIndex
  }

  return { normalized, starts, ends }
}

function isWordStart(value: string, index: number) {
  return index === 0 || value[index - 1] === " "
}

function lineRanges(value: string) {
  const lines = value.split(/\r?\n/)
  let start = 0

  return lines.map((line) => {
    const range = { start, end: start + line.length }
    start = range.end + (value[range.end] === "\r" && value[range.end + 1] === "\n" ? 2 : 1)
    return range
  })
}

function snippetForMatch(lyrics: string, matchStart: number, matchEnd: number) {
  const ranges = lineRanges(lyrics)
  const firstLine = Math.max(
    ranges.findIndex((range) => matchStart >= range.start && matchStart <= range.end),
    0,
  )
  const lastLineIndex = ranges.findIndex((range) => matchEnd >= range.start && matchEnd <= range.end + 1)
  const lastLine = lastLineIndex === -1 ? firstLine : lastLineIndex
  const fromLine = Math.max(firstLine - 1, 0)
  const toLine = Math.min(lastLine + 1, ranges.length - 1)
  const snippetStart = ranges[fromLine]?.start ?? 0
  const snippetEnd = ranges[toLine]?.end ?? lyrics.length
  const snippet = lyrics.slice(snippetStart, snippetEnd).trim()
  const trimStart = lyrics.slice(snippetStart, snippetEnd).search(/\S/)
  const offset = snippetStart + (trimStart === -1 ? 0 : trimStart)

  return {
    snippet,
    highlightStart: Math.max(matchStart - offset, 0),
    highlightEnd: Math.min(matchEnd - offset, snippet.length),
  }
}

function searchLyrics(songs: SearchSong[], query: string, limit = 5): SearchResult[] {
  const normalizedQuery = normalizeSearch(query).normalized
  if (!normalizedQuery) return []

  const results: SearchResult[] = []

  for (const song of songs) {
    const lyrics = normalizeSearch(song.lyrics)
    let matchIndex = lyrics.normalized.indexOf(normalizedQuery)

    while (matchIndex !== -1 && !isWordStart(lyrics.normalized, matchIndex)) {
      matchIndex = lyrics.normalized.indexOf(normalizedQuery, matchIndex + 1)
    }

    if (matchIndex === -1) continue

    const matchStart = lyrics.starts[matchIndex]
    const matchEnd = lyrics.ends[matchIndex + normalizedQuery.length - 1]
    if (matchStart === undefined || matchEnd === undefined) continue

    const snippet = snippetForMatch(song.lyrics, matchStart, matchEnd)

    results.push({
      id: `${song.id}-${matchIndex}`,
      song,
      ...snippet,
    })

    if (results.length >= limit) break
  }

  return results
}

function highlightSnippet(result: SearchResult): ReactNode {
  return (
    <>
      {result.snippet.slice(0, result.highlightStart)}
      <strong className="font-bold text-foreground">
        {result.snippet.slice(result.highlightStart, result.highlightEnd)}
      </strong>
      {result.snippet.slice(result.highlightEnd)}
    </>
  )
}

function sectionHref(target: string) {
  return `#${target.replace(/^#/, "")}`
}

function getScrollTargetTop(hash: string) {
  const id = hash.replace(/^#/, "")
  const element = document.getElementById(id)
  if (!element) return null

  const scrollMarginTop = Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0

  return element.getBoundingClientRect().top + window.scrollY - scrollMarginTop
}

function setScrollTop(top: number) {
  const scrollingElement = document.scrollingElement || document.documentElement

  scrollingElement.scrollTop = top
  document.documentElement.scrollTop = top
  document.body.scrollTop = top
}

function smoothScrollToHash(hash: string) {
  const top = getScrollTargetTop(hash)
  if (top === null) return

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (reduceMotion) {
    setScrollTop(top)
  } else {
    window.scrollTo({ top, behavior: "smooth" })
  }

  window.history.pushState(null, "", hash)
}

export function SiteNavbar({
  logo,
  logoSvg,
  menuLabel,
  searchLabel,
  languageLabel,
  promoPack,
  sectionLinks,
  searchSongs,
}: SiteNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>("en")
  const [logoProgress, setLogoProgress] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResults = useMemo(() => searchLyrics(searchSongs, query), [searchSongs, query])

  useEffect(() => {
    setLang(localStorage.getItem("elizgrome-lang") === "ru" ? "ru" : "en")

    function handleLanguageEvent(event: Event) {
      const next = "detail" in event && event.detail === "ru" ? "ru" : "en"
      setLang(next)
    }

    window.addEventListener("elizgrome:set-language", handleLanguageEvent)

    return () => window.removeEventListener("elizgrome:set-language", handleLanguageEvent)
  }, [])

  useEffect(() => {
    function updateScrollState() {
      setLogoProgress(Math.min(window.scrollY / LOGO_ON_SCROLL.scrollDistancePx, 1))
    }

    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })

    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        openSearch()
        return
      }

      if (event.key === "Escape" && isSearchOpen) closeSearch()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) return

    searchInputRef.current?.focus()
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (isMenuOpen || !pendingTarget) return

    const target = pendingTarget
    const timer = window.setTimeout(() => {
      smoothScrollToHash(target)
      setPendingTarget(null)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isMenuOpen, pendingTarget])

  function handleMobileSectionClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    setPendingTarget(href)
    setIsMenuOpen(false)
  }

  function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    smoothScrollToHash(href)
  }

  function openSearch() {
    setIsMenuOpen(false)
    setIsSearchOpen(true)
  }

  function closeSearch() {
    setIsSearchOpen(false)
    setQuery("")
  }

  function toggleLanguage() {
    const next = lang === "ru" ? "en" : "ru"
    localStorage.setItem("elizgrome-lang", next)
    setLang(next)
    window.dispatchEvent(new CustomEvent("elizgrome:set-language", { detail: next }))
  }

  const { mobile, desktop } = LOGO_ON_SCROLL
  const logoStyle = {
    top: `${lerp(mobile.topStart, mobile.topEnd, logoProgress)}px`,
    height: `${lerp(mobile.heightStart, mobile.heightEnd, logoProgress)}px`,
    transform: `translate(-50%, ${lerp(0, mobile.translateYPercentEnd, logoProgress)}%)`,
  }
  const desktopLogoStyle = {
    top: `${lerp(desktop.topStart, desktop.topEnd, logoProgress)}px`,
    height: `${lerp(desktop.heightStart, desktop.heightEnd, logoProgress)}px`,
    transform: `translate(-50%, ${lerp(0, desktop.translateYPercentEnd, logoProgress)}%)`,
  }
  const headerStyle = {
    backgroundColor: `oklch(1 0 0 / ${logoProgress * 0.95})`,
    boxShadow: `0 6px 16px -10px oklch(0 0 0 / ${logoProgress * 0.14})`,
  } satisfies CSSProperties
  const logoColorStyle = {
    color: `oklch(${lerp(1, 0, logoProgress)} 0 0)`,
  } satisfies CSSProperties

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent"
        style={headerStyle}
        data-navbar-smooth-scroll
      >
      <div className="mx-auto flex h-11 w-full items-center justify-between px-3 lg:h-12 lg:px-6">
        <div className="relative z-20 flex flex-1 items-center lg:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="transition-colors duration-200 [&_svg]:size-7" style={logoColorStyle} aria-label={text(menuLabel, lang)}>
                <MenuIcon strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r-2 border-foreground bg-background">
              <SheetHeader className="absolute left-1/2 top-4 -translate-x-1/2 p-0">
                <SheetTitle className="font-serif tracking-normal text-foreground">
                  <span
                    aria-label={text(logo, lang)}
                    className="block h-12 w-auto text-foreground [&_svg]:h-full [&_svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: logoSvg }}
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col justify-center gap-1" aria-label={text(menuLabel, lang)}>
                {sectionLinks.map((link) => {
                  const href = sectionHref(link.target)

                  return (
                    <a
                      key={link.target}
                      href={href}
                      className="px-2 py-3 font-serif text-2xl leading-tight text-foreground no-underline hover:text-primary hover:no-underline"
                      onClick={(event) => handleMobileSectionClick(event, href)}
                    >
                      {text(link.label, lang)}
                    </a>
                  )
                })}
                <a
                  href={promoPack.url}
                  className="px-2 py-3 font-serif text-2xl leading-tight text-primary no-underline hover:underline"
                  data-i18n-en={promoPack.label.en}
                  data-i18n-ru={promoPack.label.ru}
                  onClick={(event) => handleMobileSectionClick(event, promoPack.url)}
                >
                  {text(promoPack.label, lang)}
                </a>
              </nav>
              <SheetFooter className="border-t border-border">
                <button
                  type="button"
                  className="w-fit px-2 py-3 font-serif text-base leading-tight text-primary"
                  onClick={toggleLanguage}
                  data-i18n-en={languageLabel.en}
                  data-i18n-ru={languageLabel.ru}
                >
                  {text(languageLabel, lang)}
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <a
          href="#top"
          className="absolute left-1/2 z-10 block no-underline hover:no-underline lg:hidden"
          style={logoStyle}
          aria-label={text(logo, lang)}
          onClick={(event) => handleSectionClick(event, "#top")}
        >
          <span
            aria-hidden="true"
            className="block h-full max-w-[82vw] [&_svg]:h-full [&_svg]:w-auto"
            style={logoColorStyle}
            dangerouslySetInnerHTML={{ __html: logoSvg }}
          />
        </a>
        <a
          href="#top"
          className="absolute left-1/2 z-10 hidden no-underline hover:no-underline lg:block"
          style={desktopLogoStyle}
          aria-label={text(logo, lang)}
          onClick={(event) => handleSectionClick(event, "#top")}
        >
          <span
            aria-hidden="true"
            className="block h-full max-w-[42vw] [&_svg]:h-full [&_svg]:w-auto"
            style={logoColorStyle}
            dangerouslySetInnerHTML={{ __html: logoSvg }}
          />
        </a>

        <div className="relative z-20 hidden flex-1 items-center gap-4 lg:flex">
          <Button type="button" variant="ghost" size="icon-sm" className="transition-colors duration-200 [&_svg]:size-5" style={logoColorStyle} aria-label={text(searchLabel, lang)} onClick={openSearch}>
            <SearchIcon strokeWidth={2} />
          </Button>
          <button
            type="button"
            className="border-l border-border pl-4 font-serif text-sm leading-tight text-primary"
            onClick={toggleLanguage}
            data-i18n-en={languageLabel.en}
            data-i18n-ru={languageLabel.ru}
          >
            {text(languageLabel, lang)}
          </button>
        </div>

        <nav className="relative z-20 ml-auto hidden flex-1 items-center justify-end gap-5 lg:flex" aria-label={text(menuLabel, lang)}>
          {sectionLinks.map((link) => {
            const href = sectionHref(link.target)

            return (
              <a
                key={link.target}
                href={href}
                className="font-serif text-base leading-tight no-underline transition-colors duration-200 hover:no-underline"
                style={logoColorStyle}
                onClick={(event) => handleSectionClick(event, href)}
              >
                {text(link.label, lang)}
              </a>
            )
          })}
          <a
            href={promoPack.url}
            className="font-serif text-sm leading-tight text-primary no-underline hover:underline"
            data-i18n-en={promoPack.label.en}
            data-i18n-ru={promoPack.label.ru}
            onClick={(event) => handleSectionClick(event, promoPack.url)}
          >
            {text(promoPack.label, lang)}
          </a>
        </nav>

        <div className="relative z-20 flex flex-1 justify-end lg:hidden">
          <Button type="button" variant="ghost" size="icon-sm" className="transition-colors duration-200 [&_svg]:size-7" style={logoColorStyle} aria-label={text(searchLabel, lang)} onClick={openSearch}>
            <SearchIcon strokeWidth={2.5} />
          </Button>
        </div>
        </div>
      </header>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-background/80 px-4 pt-16 backdrop-blur-sm md:pt-20"
          role="dialog"
          aria-modal="true"
          aria-label={text(searchLabel, lang)}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch()
          }}
        >
          <Button type="button" variant="ghost" size="icon-sm" className="absolute right-4 top-4 text-foreground md:right-6 md:top-6 [&_svg]:size-6" aria-label={lang === "ru" ? "Закрыть поиск" : "Close search"} onClick={closeSearch}>
            <XIcon strokeWidth={2} />
          </Button>

          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 pb-3">
              <SearchIcon className="size-6 shrink-0 text-muted-foreground opacity-40 md:size-8" strokeWidth={2} aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent font-serif text-3xl leading-none text-foreground outline-none md:text-5xl"
                type="text"
              />
            </div>

            {query.trim() && (
              <div className="mt-5 grid gap-3">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <article key={result.id} className="border border-border bg-background p-4 shadow-sm md:p-5">
                      <p className="whitespace-pre-line font-serif text-xl leading-tight text-foreground md:text-2xl">
                        {highlightSnippet(result)}
                      </p>
                      <p className="mt-3 font-serif text-sm italic leading-tight text-muted-foreground md:text-base">
                        <strong>{text(result.song.title, lang)}</strong> — {text(result.song.releaseTitle, lang)} ({result.song.releaseYear})
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="font-serif text-base leading-tight text-muted-foreground">
                    {lang === "ru" ? "ничего не найдено" : "no songs found"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react"
import { MenuIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type Lang = "en" | "ru"
type Localized = Record<Lang, string>

type SectionLink = {
  target: string
  label: Localized
}

type SiteNavbarProps = {
  logo: Localized
  logoImage: string
  menuLabel: Localized
  searchLabel: Localized
  languageLabel: Localized
  promoPack: {
    url: string
    label: Localized
  }
  sectionLinks: SectionLink[]
}

let currentScrollAnimation = 0

function text(value: Localized, lang: Lang) {
  return value[lang] || value.en
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

  const start = window.scrollY
  const distance = top - start
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (reduceMotion || Math.abs(distance) < 2) {
    setScrollTop(top)
    window.history.pushState(null, "", hash)
    return
  }

  const animationId = currentScrollAnimation + 1
  currentScrollAnimation = animationId
  const duration = Math.min(Math.max(Math.abs(distance) * 0.55, 420), 900)
  const startedAt = window.performance.now()
  const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

  function step(now: number) {
    if (currentScrollAnimation !== animationId) return

    const progress = Math.min((now - startedAt) / duration, 1)
    setScrollTop(start + distance * easeOutCubic(progress))

    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      window.history.pushState(null, "", hash)
    }
  }

  window.requestAnimationFrame(step)
}

export function SiteNavbar({
  logo,
  logoImage,
  menuLabel,
  searchLabel,
  languageLabel,
  promoPack,
  sectionLinks,
}: SiteNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>("en")
  const [logoProgress, setLogoProgress] = useState(0)

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
      setLogoProgress(Math.min(window.scrollY / 140, 1))
    }

    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })

    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])

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

  function toggleLanguage() {
    const next = lang === "ru" ? "en" : "ru"
    localStorage.setItem("elizgrome-lang", next)
    setLang(next)
    window.dispatchEvent(new CustomEvent("elizgrome:set-language", { detail: next }))
  }

  const logoTop = 88 - logoProgress * 66
  const logoHeight = 64 - logoProgress * 32
  const desktopLogoTop = 76 - logoProgress * 52
  const desktopLogoHeight = 92 - logoProgress * 50
  const logoStyle = {
    top: `${logoTop}px`,
    height: `${logoHeight}px`,
    transform: `translate(-50%, ${-50 * logoProgress}%)`,
  }
  const desktopLogoStyle = {
    top: `${desktopLogoTop}px`,
    height: `${desktopLogoHeight}px`,
    transform: `translate(-50%, ${-50 * logoProgress}%)`,
  }
  const headerStyle = {
    backgroundColor: `oklch(1 0 0 / ${logoProgress * 0.95})`,
    borderColor: `oklch(0.922 0 0 / ${logoProgress})`,
  } satisfies CSSProperties

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b"
      style={headerStyle}
      data-navbar-smooth-scroll
    >
      <div className="mx-auto flex h-11 w-full items-center justify-between px-3 lg:h-12 lg:px-6">
        <div className="flex flex-1 items-center lg:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-foreground [&_svg]:size-7" aria-label={text(menuLabel, lang)}>
                <MenuIcon strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="justify-center border-r-2 border-foreground bg-background">
              <SheetHeader className="absolute -left-4 top-4">
                <SheetTitle className="font-serif tracking-normal text-foreground">
                  <img src={logoImage} alt={text(logo, lang)} className="h-9 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1" aria-label={text(menuLabel, lang)}>
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
                <button
                  type="button"
                  className="mt-5 w-fit px-2 py-3 font-serif text-base leading-tight text-primary"
                  onClick={toggleLanguage}
                  data-i18n-en={languageLabel.en}
                  data-i18n-ru={languageLabel.ru}
                >
                  {text(languageLabel, lang)}
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <a
          href="#top"
          className="absolute left-1/2 block no-underline hover:no-underline lg:hidden"
          style={logoStyle}
          aria-label={text(logo, lang)}
          onClick={(event) => handleSectionClick(event, "#top")}
        >
          <img src={logoImage} alt="" className="h-full w-auto max-w-[82vw] object-contain" />
        </a>
        <a
          href="#top"
          className="absolute left-1/2 hidden no-underline hover:no-underline lg:block"
          style={desktopLogoStyle}
          aria-label={text(logo, lang)}
          onClick={(event) => handleSectionClick(event, "#top")}
        >
          <img src={logoImage} alt="" className="h-full w-auto max-w-[42vw] object-contain" />
        </a>

        <div className="hidden flex-1 items-center gap-4 lg:flex">
          <Button variant="ghost" size="icon-sm" className="text-foreground [&_svg]:size-5" aria-label={text(searchLabel, lang)}>
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

        <nav className="ml-auto hidden flex-1 items-center justify-end gap-5 lg:flex" aria-label={text(menuLabel, lang)}>
          {sectionLinks.map((link) => {
            const href = sectionHref(link.target)

            return (
              <a
                key={link.target}
                href={href}
                className="font-serif text-base leading-tight text-foreground no-underline hover:text-primary hover:no-underline"
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

        <div className="flex flex-1 justify-end lg:hidden">
          <Button variant="ghost" size="icon-sm" className="text-foreground [&_svg]:size-7" aria-label={text(searchLabel, lang)}>
            <SearchIcon strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </header>
  )
}

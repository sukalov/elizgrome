import { useEffect, useState, type MouseEvent } from "react"
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

type ExternalLink = {
  url: string
  label: Localized
}

type SiteNavbarProps = {
  logo: Localized
  menuLabel: Localized
  searchLabel: Localized
  sectionLinks: SectionLink[]
  externalLinks: ExternalLink[]
}

function text(value: Localized, lang: Lang) {
  return value[lang] || value.en
}

function sectionHref(target: string) {
  return `#${target.replace(/^#/, "")}`
}

export function SiteNavbar({
  logo,
  menuLabel,
  searchLabel,
  sectionLinks,
  externalLinks,
}: SiteNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    setLang(localStorage.getItem("elizgrome-lang") === "ru" ? "ru" : "en")
  }, [])

  useEffect(() => {
    if (isMenuOpen || !pendingTarget) return

    const target = pendingTarget
    const timer = window.setTimeout(() => {
      const element = document.getElementById(target.slice(1))
      if (!element) return

      window.history.pushState(null, "", target)
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 48,
        behavior: "auto",
      })
      setPendingTarget(null)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isMenuOpen, pendingTarget])

  function handleMobileSectionClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    setPendingTarget(href)
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-12 w-full items-center justify-between px-3 md:h-18 md:max-w-6xl md:px-6">
        <div className="flex flex-1 items-center md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={text(menuLabel, lang)}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background">
              <SheetHeader>
                <SheetTitle className="font-heading text-4xl tracking-wide text-foreground">
                  {text(logo, lang)}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 grid gap-1" aria-label={text(menuLabel, lang)}>
                {sectionLinks.map((link) => {
                  const href = sectionHref(link.target)

                  return (
                    <a
                      key={link.target}
                      href={href}
                      className="rounded-md px-2 py-3 font-serif text-xl text-foreground no-underline hover:bg-muted hover:no-underline"
                      onClick={(event) => handleMobileSectionClick(event, href)}
                    >
                      {text(link.label, lang)}
                    </a>
                  )
                })}
                {externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className="rounded-md px-2 py-3 font-serif text-xl text-primary no-underline hover:bg-muted hover:no-underline"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {text(link.label, lang)}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <a
          href="#top"
          className="font-heading text-3xl font-bold tracking-wide text-foreground no-underline hover:text-primary hover:no-underline md:text-5xl"
        >
          {text(logo, lang)}
        </a>

        <nav className="ml-auto hidden flex-1 items-center justify-end gap-6 md:flex" aria-label={text(menuLabel, lang)}>
          {sectionLinks.map((link) => (
            <a
              key={link.target}
              href={sectionHref(link.target)}
              className="font-serif text-base text-foreground no-underline hover:text-primary hover:no-underline"
            >
              {text(link.label, lang)}
            </a>
          ))}
          <div className="ml-6 flex items-center gap-6 border-l border-border pl-6">
            {externalLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-base text-primary no-underline hover:underline"
              >
                {text(link.label, lang)}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-1 justify-end md:hidden">
          <Button variant="ghost" size="icon-sm" aria-label={text(searchLabel, lang)}>
            <SearchIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}

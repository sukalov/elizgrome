import { useEffect, useState } from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

const slides = [
  {
    en: { title: "midnight rehearsals", text: "Fragments of piano, voice notes, and half-lit melodies." },
    ru: { title: "ночные репетиции", text: "Фрагменты пианино, голосовые заметки и мелодии в полумраке." },
  },
  {
    en: { title: "small rooms", text: "Songs built for quiet venues where every breath matters." },
    ru: { title: "малые залы", text: "Песни для камерных пространств, где важен каждый вдох." },
  },
  {
    en: { title: "new recordings", text: "Drafts, demos, and album sketches moving toward release." },
    ru: { title: "новые записи", text: "Черновики, демо и эскизы альбомов на пути к релизу." },
  },
]

type Lang = "en" | "ru"

export function FeatureCarousel() {
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const saved = localStorage.getItem("elizgrome-lang") === "ru" ? "ru" : "en"
    setLang(saved)

    function handleLanguage(event: Event) {
      const next = (event as CustomEvent<Lang>).detail
      setLang(next === "ru" ? "ru" : "en")
    }

    window.addEventListener("elizgrome:language", handleLanguage)
    return () => window.removeEventListener("elizgrome:language", handleLanguage)
  }, [])

  return (
    <Carousel className="feature-carousel" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={slide.en.title} className="md:basis-1/2 lg:basis-1/3">
            <Card className="carousel-card">
              <CardContent className="carousel-card-content">
                <span className="carousel-number">0{index + 1}</span>
                <h3>{slide[lang].title}</h3>
                <p>{slide[lang].text}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="carousel-prev" />
      <CarouselNext className="carousel-next" />
    </Carousel>
  )
}

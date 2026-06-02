import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type Lang = "en" | "ru"
type Localized = Record<Lang, string>

type Product = {
  id: string
  alt: Localized
  image: string
}

type MerchCarouselProps = {
  items: Product[]
  lang?: Lang
  className?: string
  desktopSingle?: boolean
  fillHeight?: boolean
  aspect?: "portrait" | "square"
}

export function MerchCarousel({ items, lang = "en", className, desktopSingle = false, fillHeight = false, aspect = "portrait" }: MerchCarouselProps) {
  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-[4/5]"

  return (
    <Carousel
      className={[
        className,
        fillHeight ? "md:h-full md:[&>[data-slot=carousel-content]]:h-full" : "",
      ].filter(Boolean).join(" ")}
      opts={{
        align: "start",
        containScroll: "trimSnaps",
        loop: true,
      }}
    >
      <CarouselContent className={["-ml-3", fillHeight ? "md:h-full" : ""].filter(Boolean).join(" ")}>
        {items.map((item) => (
          <CarouselItem
            key={item.id}
            className={[
              "basis-[78%] pl-3",
              desktopSingle ? "sm:basis-[46%] md:basis-full" : "sm:basis-[46%] lg:basis-[34%]",
              fillHeight ? "md:h-full" : "",
            ].join(" ")}
          >
            <figure className={["group", fillHeight ? "md:h-full" : ""].filter(Boolean).join(" ")}>
              <div className={[aspectClass, "overflow-hidden rounded-md border border-border bg-background", fillHeight ? "md:h-full md:aspect-auto" : ""].filter(Boolean).join(" ")}>
                <img
                  src={item.image}
                  alt={item.alt[lang] || item.alt.en}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 top-[45%] border border-border bg-background text-foreground hover:bg-muted" />
      <CarouselNext className="right-2 top-[45%] border border-border bg-background text-foreground hover:bg-muted" />
    </Carousel>
  )
}

import {
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa"
import { MdMailOutline } from "react-icons/md"

type LayoutPoint = { x: number; y: number }

type ContactLink = {
  id: "instagram" | "telegram" | "tiktok" | "mail" | "youtube"
  label: string
  url: string
  layout: { desktop: LayoutPoint; mobile: LayoutPoint }
}

type ContactIconCloudProps = {
  links: ContactLink[]
}

const icons = {
  instagram: FaInstagram,
  telegram: FaTelegramPlane,
  tiktok: FaTiktok,
  mail: MdMailOutline,
  youtube: FaYoutube,
}

export function ContactIconCloud({ links }: ContactIconCloudProps) {
  return (
    <>
      {links.map((link) => {
        const Icon = icons[link.id]

        return (
          <a
            key={`${link.id}-mobile`}
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"}
            aria-label={link.label}
            className="absolute flex size-8 items-center justify-center rounded-full text-white no-underline transition hover:text-white/80 hover:no-underline md:hidden"
            style={{
              left: `${link.layout.mobile.x}%`,
              top: `${link.layout.mobile.y}%`,
            }}
          >
            <Icon className="size-6" aria-hidden="true" />
            <span className="sr-only">{link.label}</span>
          </a>
        )
      })}

      {links.map((link) => {
        const Icon = icons[link.id]

        return (
          <a
            key={`${link.id}-desktop`}
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"}
            aria-label={link.label}
            className="absolute hidden size-12 items-center justify-center rounded-full text-white no-underline transition hover:text-white/80 hover:no-underline md:flex"
            style={{
              left: `${link.layout.desktop.x}%`,
              top: `${link.layout.desktop.y}%`,
            }}
          >
            <Icon className="size-7" aria-hidden="true" />
            <span className="sr-only">{link.label}</span>
          </a>
        )
      })}
    </>
  )
}

import {
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa"
import { MdMailOutline } from "react-icons/md"

type ContactLink = {
  id: "instagram" | "telegram" | "tiktok" | "mail" | "youtube"
  label: string
  url: string
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
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:gap-x-4 md:gap-y-6">
      {links.map((link, index) => {
        const Icon = icons[link.id]
        const alignOddFirstIcon = links.length % 2 === 1 && index === 0
        const startsSecondRow = links.length % 2 === 1 && index === 1

        return (
          <a
            key={link.id}
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"}
            aria-label={link.label}
            className={`flex size-12 items-center justify-center text-white no-underline transition hover:text-white/80 hover:no-underline md:size-16 ${alignOddFirstIcon ? "col-start-2 md:col-start-auto" : startsSecondRow ? "col-start-1" : ""}`}
          >
            <Icon className="size-7 md:size-9" aria-hidden="true" />
            <span className="sr-only">{link.label}</span>
          </a>
        )
      })}
    </div>
  )
}

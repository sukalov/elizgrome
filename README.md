# elizgrome

Static bilingual landing page for Eliz Grome.

## stack

- Astro 6.4 (`output: static`)
- Tailwind CSS 4 via Vite
- shadcn/ui for reusable React components
- Pages CMS (`.pages.yml`)
- Bun for package management and scripts
- GitHub Actions deploy to `gh-pages`

## development

```bash
bun install
bun run dev
bun run build
```

## ui rules

See `UI_RULES.md` before adding any page content or components.

## cms

Pages CMS reads `.pages.yml` from the repo root. Editable content lives in `src/content/landing.yaml` and images are uploaded to `src/assets/images/`.

The content model includes English and Russian values for public text, plus shared fields like links, years, and image files.

### Pages CMS setup

1. push this folder as a GitHub repo.
2. open <https://app.pagescms.org> and sign in.
3. add/select the GitHub repo and branch `main`.
4. Pages CMS should detect `.pages.yml` automatically.
5. open **Landing page** to edit `src/content/landing.yaml`.
6. invite the client from the Pages CMS UI when ready.

Images are limited in `.pages.yml` to `jpg`, `jpeg`, `png`, and `webp`. Image fields include a note asking editors to keep uploads under 1mb.

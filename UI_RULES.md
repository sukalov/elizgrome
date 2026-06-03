# UI rules

- Use shadcn/ui components as the starting point everywhere: typography wrappers, cards, lists/items, controls, navigation, and layout primitives.
- Do not hand-roll UI primitives when a shadcn component exists. Extend the local shadcn component code only when needed.
- Keep the visual style minimal: white background, black text, restrained spacing, no decorative gradients or textures.
- Use Wix Madefor Text for body copy and headings (`font-sans`, `font-serif`, `font-heading` via `--site-font-family`).
- Self-host Wix Madefor Text with latin and cyrillic weights 400 and 700.
- The only accent is deep blue/indigo.
- Define colors through shadcn variable names in `src/styles/global.css`: `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--muted`, etc.
- Use those shadcn variables/classes across the project (`bg-background`, `text-foreground`, `text-primary`, `border-border`, `bg-card`, etc.). Do not introduce parallel custom color variables.
